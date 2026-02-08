package com.videoplat.common.constant;

/**
 * 错误代码常量
 */
public class ErrorCode {

    // 通用错误
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
    public static final String INVALID_PARAMETER = "INVALID_PARAMETER";
    public static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";

    // 认证授权错误
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String INVALID_TOKEN = "INVALID_TOKEN";
    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";

    // 业务错误
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
    public static final String ROOM_NOT_FOUND = "ROOM_NOT_FOUND";
    public static final String ROOM_FULL = "ROOM_FULL";
    public static final String ALREADY_IN_ROOM = "ALREADY_IN_ROOM";
    public static final String NOT_IN_ROOM = "NOT_IN_ROOM";
    public static final String RECORDING_NOT_FOUND = "RECORDING_NOT_FOUND";

    private ErrorCode() {
        // 工具类，禁止实例化
    }
}
