package com.homemate.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderProfilePicture;
    private Long receiverId;
    private String receiverName;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
}
