package com.videoplat.domain.specification;

import com.videoplat.domain.entity.Recording;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 录制记录查询规格
 */
public class RecordingSpecification {

    /**
     * 根据条件构建查询规格
     *
     * @param roomName 会议室名称（模糊匹配）
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @return 查询规格
     */
    public static Specification<Recording> withFilters(
            String roomName,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 会议室名称模糊查询
            if (roomName != null && !roomName.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    root.get("roomName"),
                    "%" + roomName + "%"
                ));
            }

            // 开始时间范围查询
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("startedAt"),
                    startDate
                ));
            }

            // 结束时间范围查询
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("startedAt"),
                    endDate
                ));
            }

            // 按开始时间倒序排列
            query.orderBy(criteriaBuilder.desc(root.get("startedAt")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
