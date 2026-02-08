package com.videoplat.common.exception;

/**
 * 资源未找到异常
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super("RESOURCE_NOT_FOUND", message);
    }

    public ResourceNotFoundException(String resourceType, Long id) {
        super("RESOURCE_NOT_FOUND", String.format("%s with id %d not found", resourceType, id));
    }
}
