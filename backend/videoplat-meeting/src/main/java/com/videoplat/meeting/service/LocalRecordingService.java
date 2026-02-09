package com.videoplat.meeting.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Agora 本地服务端录制服务
 *
 * 使用 Agora RTC SDK 在服务器端进行录制，支持混流录制
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Service
@Slf4j
public class LocalRecordingService {

    @Value("${agora.app-id}")
    private String appId;

    @Value("${app.recording.storage-path:/app/recordings}")
    private String storagePath;

    @Value("${app.recording.recorder-bin-path:/app/agora_recorder/recorder_local}")
    private String recorderBinPath;

    // 存储录制进程：key=roomId, value=Process
    private final Map<String, Process> recordingProcesses = new ConcurrentHashMap<>();

    // 存储录制文件路径：key=roomId, value=filePath
    private final Map<String, String> recordingFiles = new ConcurrentHashMap<>();

    /**
     * 开始本地录制
     *
     * @param roomId 会议室 ID
     * @param token RTC Token
     * @param userId 用户 ID
     * @return 录制文件路径
     */
    public String startRecording(String roomId, String token, String userId) {
        try {
            // 检查是否已经在录制
            if (recordingProcesses.containsKey(roomId)) {
                log.warn("会议室 {} 已经在录制中", roomId);
                return recordingFiles.get(roomId);
            }

            // 创建录制目录
            File recordDir = new File(storagePath);
            if (!recordDir.exists()) {
                recordDir.mkdirs();
            }

            // 生成录制文件路径
            String timestamp = String.valueOf(System.currentTimeMillis());
            String fileName = String.format("%s_%s.mp4", roomId, timestamp);
            String filePath = storagePath + File.separator + fileName;

            // 构建录制命令
            List<String> command = buildRecordingCommand(roomId, token, userId, filePath);

            log.info("启动本地录制: roomId={}, command={}", roomId, String.join(" ", command));

            // 启动录制进程
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // 启动线程读取进程输出
            startOutputReader(process, roomId);

            // 保存进程和文件路径
            recordingProcesses.put(roomId, process);
            recordingFiles.put(roomId, filePath);

            log.info("本地录制已启动: roomId={}, filePath={}", roomId, filePath);

            return filePath;
        } catch (Exception e) {
            log.error("启动本地录制失败: roomId={}, error={}", roomId, e.getMessage(), e);
            throw new RuntimeException("启动本地录制失败: " + e.getMessage());
        }
    }

    /**
     * 停止本地录制
     *
     * @param roomId 会议室 ID
     * @return 录制文件路径
     */
    public String stopRecording(String roomId) {
        try {
            Process process = recordingProcesses.get(roomId);
            if (process == null) {
                log.warn("会议室 {} 没有正在进行的录制", roomId);
                return null;
            }

            log.info("停止本地录制: roomId={}", roomId);

            // 发送 SIGINT 信号停止录制
            process.destroy();

            // 等待进程结束（最多 10 秒）
            boolean exited = process.waitFor(10, TimeUnit.SECONDS);
            if (!exited) {
                log.warn("录制进程未在 10 秒内结束，强制终止: roomId={}", roomId);
                process.destroyForcibly();
            }

            // 获取录制文件路径
            String filePath = recordingFiles.get(roomId);

            // 清理
            recordingProcesses.remove(roomId);
            recordingFiles.remove(roomId);

            log.info("本地录制已停止: roomId={}, filePath={}", roomId, filePath);

            return filePath;
        } catch (Exception e) {
            log.error("停止本地录制失败: roomId={}, error={}", roomId, e.getMessage(), e);
            throw new RuntimeException("停止本地录制失败: " + e.getMessage());
        }
    }

    /**
     * 检查录制是否正在进行
     *
     * @param roomId 会议室 ID
     * @return 是否正在录制
     */
    public boolean isRecording(String roomId) {
        Process process = recordingProcesses.get(roomId);
        return process != null && process.isAlive();
    }

    /**
     * 获取录制文件路径
     *
     * @param roomId 会议室 ID
     * @return 录制文件路径
     */
    public String getRecordingFilePath(String roomId) {
        return recordingFiles.get(roomId);
    }

    /**
     * 构建录制命令
     */
    private List<String> buildRecordingCommand(String roomId, String token, String userId, String filePath) {
        List<String> command = new ArrayList<>();
        command.add(recorderBinPath);
        command.add("--appId");
        command.add(appId);
        command.add("--channel");
        command.add(roomId);
        command.add("--channelKey");
        command.add(token);
        command.add("--uid");
        command.add(userId);
        command.add("--isMixingEnabled");
        command.add("1");  // 启用混流
        command.add("--recordFileRootDir");
        command.add(storagePath);
        command.add("--idle");
        command.add("30");  // 30 秒无人自动停止
        command.add("--autoSubscribe");
        command.add("1");  // 自动订阅所有流

        return command;
    }

    /**
     * 启动线程读取进程输出
     */
    private void startOutputReader(Process process, String roomId) {
        new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug("[Recorder-{}] {}", roomId, line);
                }
            } catch (IOException e) {
                log.error("读取录制进程输出失败: roomId={}", roomId, e);
            }
        }, "RecorderOutput-" + roomId).start();
    }

    /**
     * 检查录制器是否已配置
     */
    public boolean isConfigured() {
        File recorderBin = new File(recorderBinPath);
        return recorderBin.exists() && recorderBin.canExecute();
    }

    /**
     * 清理所有录制进程（应用关闭时调用）
     */
    public void cleanup() {
        log.info("清理所有录制进程");
        for (Map.Entry<String, Process> entry : recordingProcesses.entrySet()) {
            try {
                String roomId = entry.getKey();
                Process process = entry.getValue();
                if (process.isAlive()) {
                    log.info("停止录制进程: roomId={}", roomId);
                    process.destroy();
                    process.waitFor(5, TimeUnit.SECONDS);
                    if (process.isAlive()) {
                        process.destroyForcibly();
                    }
                }
            } catch (Exception e) {
                log.error("清理录制进程失败", e);
            }
        }
        recordingProcesses.clear();
        recordingFiles.clear();
    }
}
