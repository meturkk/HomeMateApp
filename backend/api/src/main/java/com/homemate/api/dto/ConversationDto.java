package com.homemate.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationDto {
    private Long otherUserId;
    private String otherUserName;
    private String otherUserProfilePicture;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private int unreadCount;
}
