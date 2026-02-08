package com.videoplat.meeting.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Agora 云端录制服务
 *
 * 集成 Agora 云端录制 RESTful API
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Service
@Slf4j
public class AgoraCloudRecordingService {

    @Value("${agora.app-id}")
    private String appId;

    @Value("${agora.app-certificate}")
    private String appCertificate;

    @Value("${agora.cloud-recording.customer-id:}")
    private String customerId;

    @Value("${agora.cloud-recording.customer-secret:}")
    private String customerSecret;

    @Value("${agora.cloud-recording.region:cn}")
    private String region;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String BASE_URL = "https://api.agora.io/v1/apps/%s/cloud_recording";

    /**
     * 获取云端录制资源
     *
     * @param channelName 频道名称
     * @param uid 用户 ID
     * @return Resource ID
     */
    public String acquireResource(String channelName, String uid) {
        try {
            String url = String.format(BASE_URL + "/acquire", appId);

            Map<String, Object> body = new HashMap<>();
            body.put("cname", channelName);
            body.put("uid", uid);

            Map<String, Object> clientRequest = new HashMap<>();
            clientRequest.put("resourceExpiredHour", 24);
            clientRequest.put("scene", 0);
            body.put("clientRequest", clientRequest);

            HttpHeaders headers = createHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String resourceId = (String) response.getBody().get("resourceId");
                log.info("获取云端录制资源成功: resourceId={}, channel={}", resourceId, channelName);
                return resourceId;
            }

            throw new RuntimeException("获取云端录制资源失败");
        } catch (Exception e) {
            log.error("获取云端录制资源失败: channel={}, error={}", channelName, e.getMessage());
            throw new RuntimeException("获取云端录制资源失败: " + e.getMessage());
        }
    }

    /**
     * 开始云端录制
     *
     * @param resourceId 资源 ID
     * @param channelName 频道名称
     * @param uid 用户 ID
     * @param token RTC Token
     * @return Recording SID
     */
    public String startRecording(String resourceId, String channelName, String uid, String token) {
        try {
            String url = String.format(BASE_URL + "/resourceid/%s/mode/mix/start", appId, resourceId);

            Map<String, Object> recordingConfig = new HashMap<>();
            recordingConfig.put("maxIdleTime", 30);
            recordingConfig.put("streamTypes", 2);
            recordingConfig.put("channelType", 0);
            recordingConfig.put("videoStreamType", 0);
            recordingConfig.put("subscribeUidGroup", 0);

            Map<String, Object> storageConfig = new HashMap<>();
            storageConfig.put("vendor", 0);
            storageConfig.put("region", 0);
            storageConfig.put("bucket", "recordings");
            storageConfig.put("accessKey", "");
            storageConfig.put("secretKey", "");
            storageConfig.put("fileNamePrefix", Arrays.asList(channelName));

            Map<String, Object> clientRequest = new HashMap<>();
            clientRequest.put("token", token);
            clientRequest.put("recordingConfig", recordingConfig);
            clientRequest.put("storageConfig", storageConfig);

            Map<String, Object> body = new HashMap<>();
            body.put("cname", channelName);
            body.put("uid", uid);
            body.put("clientRequest", clientRequest);

            HttpHeaders headers = createHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String sid = (String) response.getBody().get("sid");
                log.info("开始云端录制成功: sid={}, resourceId={}, channel={}",
                        sid, resourceId, channelName);
                return sid;
            }

            throw new RuntimeException("开始云端录制失败");
        } catch (Exception e) {
            log.error("开始云端录制失败: resourceId={}, channel={}, error={}",
                    resourceId, channelName, e.getMessage());
            throw new RuntimeException("开始云端录制失败: " + e.getMessage());
        }
    }

    /**
     * 停止云端录制
     *
     * @param resourceId 资源 ID
     * @param sid 录制 SID
     * @param channelName 频道名称
     * @param uid 用户 ID
     * @return 录制文件信息
     */
    public Map<String, Object> stopRecording(String resourceId, String sid, String channelName, String uid) {
        try {
            String url = String.format(BASE_URL + "/resourceid/%s/sid/%s/mode/mix/stop",
                    appId, resourceId, sid);

            Map<String, Object> clientRequest = new HashMap<>();

            Map<String, Object> body = new HashMap<>();
            body.put("cname", channelName);
            body.put("uid", uid);
            body.put("clientRequest", clientRequest);

            HttpHeaders headers = createHeaders();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> serverResponse = (Map<String, Object>) response.getBody().get("serverResponse");
                log.info("停止云端录制成功: sid={}, resourceId={}, channel={}",
                        sid, resourceId, channelName);
                return serverResponse;
            }

            throw new RuntimeException("停止云端录制失败");
        } catch (Exception e) {
            log.error("停止云端录制失败: sid={}, resourceId={}, error={}",
                    sid, resourceId, e.getMessage());
            throw new RuntimeException("停止云端录制失败: " + e.getMessage());
        }
    }

    /**
     * 查询云端录制状态
     *
     * @param resourceId 资源 ID
     * @param sid 录制 SID
     * @return 录制状态
     */
    public Map<String, Object> queryRecording(String resourceId, String sid) {
        try {
            String url = String.format(BASE_URL + "/resourceid/%s/sid/%s/mode/mix/query",
                    appId, resourceId, sid);

            HttpHeaders headers = createHeaders();
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            throw new RuntimeException("查询云端录制状态失败");
        } catch (Exception e) {
            log.error("查询云端录制状态失败: sid={}, resourceId={}, error={}",
                    sid, resourceId, e.getMessage());
            throw new RuntimeException("查询云端录制状态失败: " + e.getMessage());
        }
    }

    /**
     * 创建 HTTP 请求头
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 如果配置了 Customer ID 和 Secret，使用 Basic Auth
        if (customerId != null && !customerId.isEmpty() &&
                customerSecret != null && !customerSecret.isEmpty()) {
            String auth = customerId + ":" + customerSecret;
            String encodedAuth = Base64.getEncoder()
                    .encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encodedAuth);
        }

        return headers;
    }

    /**
     * 检查云端录制配置是否完整
     */
    public boolean isConfigured() {
        return appId != null && !appId.isEmpty() &&
                appCertificate != null && !appCertificate.isEmpty();
    }
}
