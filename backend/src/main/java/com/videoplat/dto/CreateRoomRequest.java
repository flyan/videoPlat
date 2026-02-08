package com.videoplat.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRoomRequest {

    @NotBlank(message = "会议室名称不能为空")
    @Size(min = 2, max = 50, message = "会议室名称长度必须在2-50之间")
    private String roomName;

    @Size(max = 100, message = "密码长度不能超过100")
    private String password;

    @Min(value = 2, message = "最大参与人数不能少于2")
    @Max(value = 10, message = "最大参与人数不能超过10")
    private Integer maxParticipants = 10;
}
