package com.videoplat.videoreview.service;

import com.videoplat.common.exception.ResourceNotFoundException;
import com.videoplat.common.exception.UnauthorizedException;
import com.videoplat.common.util.SecurityUtils;
import com.videoplat.domain.entity.Recording;
import com.videoplat.domain.repository.RecordingRepository;
import com.videoplat.videoreview.dto.RecordingDto;
import com.videoplat.videoreview.dto.RecordingQueryRequest;
import com.videoplat.videoreview.dto.RecordingStatisticsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 录制管理服务
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VideoReviewService {

    private final RecordingRepository recordingRepository;
    private final RecordingStorageService storageService;

    /**
     * 查询录制列表（分页）
     *
     * @param queryRequest 查询请求
     * @return 录制列表
     */
    public Page<RecordingDto> getRecordings(RecordingQueryRequest queryRequest) {
        // 构建分页和排序
        Sort sort = Sort.by(
            "DESC".equalsIgnoreCase(queryRequest.getSortDirection())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC,
            queryRequest.getSortBy()
        );

        PageRequest pageRequest = PageRequest.of(
            queryRequest.getPage(),
            queryRequest.getSize(),
            sort
        );

        // 查询数据库
        Page<Recording> recordingPage;

        // 如果有筛选条件，使用自定义查询
        if (hasFilters(queryRequest)) {
            recordingPage = recordingRepository.findAll(
                new RecordingSpecification(queryRequest),
                pageRequest
            );
        } else {
            recordingPage = recordingRepository.findAll(pageRequest);
        }

        // 转换为 DTO
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();

        return recordingPage.map(recording -> convertToDto(recording, currentUserId, isAdmin));
    }

    /**
     * 获取录制详情
     *
     * @param id 录制ID
     * @return 录制详情
     */
    public RecordingDto getRecordingById(Long id) {
        Recording recording = recordingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recording", id));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();

        return convertToDto(recording, currentUserId, isAdmin);
    }

    /**
     * 删除录制
     *
     * @param id 录制ID
     */
    @Transactional
    public void deleteRecording(Long id) {
        Recording recording = recordingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recording", id));

        // 权限检查：只有创建者和管理员可以删除
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();

        if (!isAdmin && !recording.getCreatorId().equals(currentUserId)) {
            throw new UnauthorizedException("您没有权限删除此录制");
        }

        // 删除文件
        try {
            String filename = extractFilename(recording.getFilePath());
            if (storageService.exists(filename)) {
                storageService.delete(filename);
                log.info("删除录制文件: {}", filename);
            }
        } catch (Exception e) {
            log.error("删除录制文件失败: {}", recording.getFilePath(), e);
            // 继续删除数据库记录
        }

        // 删除数据库记录
        recordingRepository.delete(recording);
        log.info("删除录制记录: id={}, roomName={}", id, recording.getRoomName());
    }

    /**
     * 获取存储统计信息
     *
     * @return 统计信息
     */
    public RecordingStatisticsDto getStatistics() {
        List<Recording> allRecordings = recordingRepository.findAll();

        long totalRecordings = allRecordings.size();
        long totalFileSize = allRecordings.stream()
            .mapToLong(r -> r.getFileSize() != null ? r.getFileSize() : 0L)
            .sum();
        long totalDuration = allRecordings.stream()
            .mapToLong(r -> r.getDuration() != null ? r.getDuration() : 0L)
            .sum();

        long averageFileSize = totalRecordings > 0 ? totalFileSize / totalRecordings : 0;
        long averageDuration = totalRecordings > 0 ? totalDuration / totalRecordings : 0;

        return RecordingStatisticsDto.builder()
            .totalRecordings(totalRecordings)
            .totalFileSize(totalFileSize)
            .totalFileSizeFormatted(RecordingDto.formatFileSize(totalFileSize))
            .totalDuration(totalDuration)
            .totalDurationFormatted(RecordingDto.formatDuration((int) totalDuration))
            .averageFileSize(averageFileSize)
            .averageFileSizeFormatted(RecordingDto.formatFileSize(averageFileSize))
            .averageDuration(averageDuration)
            .averageDurationFormatted(RecordingDto.formatDuration((int) averageDuration))
            .build();
    }

    /**
     * 转换 Recording 实体为 DTO
     */
    private RecordingDto convertToDto(Recording recording, Long currentUserId, boolean isAdmin) {
        // 判断当前用户是否可以删除
        boolean canDelete = isAdmin || recording.getCreatorId().equals(currentUserId);

        return RecordingDto.builder()
            .id(recording.getId())
            .roomId(recording.getRoomId())
            .roomName(recording.getRoomName())
            .filePath(recording.getFilePath())
            .fileSize(recording.getFileSize())
            .fileSizeFormatted(RecordingDto.formatFileSize(recording.getFileSize()))
            .duration(recording.getDuration())
            .durationFormatted(RecordingDto.formatDuration(recording.getDuration()))
            .resolution(recording.getResolution())
            .startedAt(recording.getStartedAt())
            .endedAt(recording.getEndedAt())
            .creatorId(recording.getCreatorId())
            .canDelete(canDelete)
            .build();
    }

    /**
     * 检查是否有筛选条件
     */
    private boolean hasFilters(RecordingQueryRequest request) {
        return request.getRoomName() != null
            || request.getStartDate() != null
            || request.getEndDate() != null
            || request.getCreatorId() != null;
    }

    /**
     * 从文件路径中提取文件名
     */
    private String extractFilename(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "";
        }

        // 处理 Windows 和 Unix 路径
        int lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
        if (lastSlash == -1) {
            return filePath;
        }

        return filePath.substring(lastSlash + 1);
    }

    /**
     * 录制查询规范（用于动态查询）
     */
    private static class RecordingSpecification implements org.springframework.data.jpa.domain.Specification<Recording> {

        private final RecordingQueryRequest request;

        public RecordingSpecification(RecordingQueryRequest request) {
            this.request = request;
        }

        @Override
        public org.springframework.data.jpa.domain.Specification<Recording> and(
            org.springframework.data.jpa.domain.Specification<Recording> other) {
            return org.springframework.data.jpa.domain.Specification.super.and(other);
        }

        @Override
        public org.springframework.data.jpa.domain.Specification<Recording> or(
            org.springframework.data.jpa.domain.Specification<Recording> other) {
            return org.springframework.data.jpa.domain.Specification.super.or(other);
        }

        @Override
        public jakarta.persistence.criteria.Predicate toPredicate(
            jakarta.persistence.criteria.Root<Recording> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder cb) {

            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            // 会议室名称模糊匹配
            if (request.getRoomName() != null && !request.getRoomName().isEmpty()) {
                predicates.add(cb.like(
                    cb.lower(root.get("roomName")),
                    "%" + request.getRoomName().toLowerCase() + "%"
                ));
            }

            // 开始时间筛选
            if (request.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                    root.get("startedAt"),
                    request.getStartDate()
                ));
            }

            // 结束时间筛选
            if (request.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                    root.get("startedAt"),
                    request.getEndDate()
                ));
            }

            // 创建者筛选
            if (request.getCreatorId() != null) {
                predicates.add(cb.equal(
                    root.get("creatorId"),
                    request.getCreatorId()
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }
    }
}
