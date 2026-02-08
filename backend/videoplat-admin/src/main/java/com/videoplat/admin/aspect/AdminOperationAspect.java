package com.videoplat.admin.aspect;

import com.videoplat.admin.service.AdminOperationLogService;
import com.videoplat.common.util.SecurityUtils;
import com.videoplat.domain.enums.AdminOperationType;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

/**
 * 管理员操作日志切面
 *
 * 使用 AOP 自动记录管理员的关键操作，包括强制下线、关闭会议室等
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AdminOperationAspect {

    private final AdminOperationLogService operationLogService;

    /**
     * 定义切点：匹配所有管理员控制器的方法
     */
    @Pointcut("execution(* com.videoplat.admin.controller..*(..))")
    public void adminControllerMethods() {
    }

    /**
     * 定义切点：匹配强制下线方法
     */
    @Pointcut("execution(* com.videoplat.admin.controller.AdminUserController.forceUserOffline(..))")
    public void forceOfflineMethod() {
    }

    /**
     * 定义切点：匹配强制关闭会议室方法
     */
    @Pointcut("execution(* com.videoplat.admin.controller.AdminRoomController.forceCloseRoom(..))")
    public void forceCloseRoomMethod() {
    }

    /**
     * 在强制下线方法执行后记录日志
     *
     * 注意：实际的日志记录已经在 Controller 中完成，这里作为备份机制
     */
    @AfterReturning("forceOfflineMethod()")
    public void logForceOffline(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            log.debug("AOP 捕获强制下线操作，参数: {}", Arrays.toString(args));
            // 实际日志记录在 Controller 中完成，这里仅作为监控点
        } catch (Exception e) {
            log.error("记录强制下线操作日志失败", e);
        }
    }

    /**
     * 在强制关闭会议室方法执行后记录日志
     *
     * 注意：实际的日志记录已经在 Controller 中完成，这里作为备份机制
     */
    @AfterReturning("forceCloseRoomMethod()")
    public void logForceCloseRoom(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            log.debug("AOP 捕获强制关闭会议室操作，参数: {}", Arrays.toString(args));
            // 实际日志记录在 Controller 中完成，这里仅作为监控点
        } catch (Exception e) {
            log.error("记录强制关闭会议室操作日志失败", e);
        }
    }

    /**
     * 记录所有管理员操作的访问日志（用于审计）
     */
    @AfterReturning("adminControllerMethods()")
    public void logAdminAccess(JoinPoint joinPoint) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();

            // 获取当前用户信息
            Long adminId = SecurityUtils.getCurrentUserId();
            String adminUsername = SecurityUtils.getCurrentUsername();

            // 获取请求信息
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String requestUri = request.getRequestURI();
                String method = request.getMethod();
                String ip = getClientIp(request);

                log.info("管理员操作: 用户={}, ID={}, 方法={}.{}, URI={} {}, IP={}",
                        adminUsername, adminId, className, methodName, method, requestUri, ip);
            }
        } catch (Exception e) {
            log.error("记录管理员访问日志失败", e);
        }
    }

    /**
     * 获取客户端 IP 地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
