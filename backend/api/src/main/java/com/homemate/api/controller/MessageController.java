package com.homemate.api.controller;

import com.homemate.api.dto.ConversationDto;
import com.homemate.api.dto.MessageDto;
import com.homemate.api.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * Mesaj gönder.
     */
    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long receiverId = Long.valueOf(body.get("receiverId").toString());
        String content = body.get("content").toString();
        return ResponseEntity.ok(messageService.sendMessage(authentication.getName(), receiverId, content));
    }

    /**
     * Sohbet listesini (inbox) getir.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(Authentication authentication) {
        return ResponseEntity.ok(messageService.getConversations(authentication.getName()));
    }

    /**
     * Belirli bir kullanıcıyla olan mesaj geçmişini getir.
     */
    @GetMapping("/{otherUserId}")
    public ResponseEntity<List<MessageDto>> getConversation(@PathVariable Long otherUserId, Authentication authentication) {
        return ResponseEntity.ok(messageService.getConversation(authentication.getName(), otherUserId));
    }

    /**
     * Mesajları okundu olarak işaretle.
     */
    @PostMapping("/{otherUserId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long otherUserId, Authentication authentication) {
        messageService.markAsRead(authentication.getName(), otherUserId);
        return ResponseEntity.ok("Mesajlar okundu olarak işaretlendi.");
    }

    /**
     * Okunmamış mesaj sayısını döndür.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(Authentication authentication) {
        int count = messageService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }
}
