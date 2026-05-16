package com.homemate.api.service;

import com.homemate.api.domain.Message;
import com.homemate.api.domain.User;
import com.homemate.api.dto.ConversationDto;
import com.homemate.api.dto.MessageDto;
import com.homemate.api.repository.MessageRepository;
import com.homemate.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    /**
     * Mesaj gönder.
     */
    public MessageDto sendMessage(String senderEmail, Long receiverId, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Gönderici bulunamadı"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Alıcı bulunamadı"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Kendinize mesaj gönderemezsiniz.");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        messageRepository.save(message);

        return mapToDto(message);
    }

    /**
     * İki kullanıcı arasındaki mesaj geçmişini getir.
     */
    public List<MessageDto> getConversation(String userEmail, Long otherUserId) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        List<Message> messages = messageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                        currentUser.getId(), otherUserId, currentUser.getId(), otherUserId
                );

        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Belirli bir sohbetteki mesajları okundu olarak işaretle.
     */
    public void markAsRead(String userEmail, Long otherUserId) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        List<Message> unreadMessages = messageRepository
                .findBySenderIdAndReceiverIdAndIsReadFalse(otherUserId, currentUser.getId());

        for (Message m : unreadMessages) {
            m.setRead(true);
        }
        messageRepository.saveAll(unreadMessages);
    }

    /**
     * Kullanıcının tüm sohbet listesini (inbox) getir.
     */
    public List<ConversationDto> getConversations(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        List<Message> allMessages = messageRepository.findAllByUserId(currentUser.getId());

        // Her konuşma partnerini grupla
        Map<Long, List<Message>> grouped = new LinkedHashMap<>();
        for (Message m : allMessages) {
            Long otherUserId = m.getSender().getId().equals(currentUser.getId())
                    ? m.getReceiver().getId()
                    : m.getSender().getId();
            grouped.computeIfAbsent(otherUserId, k -> new ArrayList<>()).add(m);
        }

        List<ConversationDto> conversations = new ArrayList<>();
        for (Map.Entry<Long, List<Message>> entry : grouped.entrySet()) {
            Long otherUserId = entry.getKey();
            List<Message> msgs = entry.getValue();
            Message lastMsg = msgs.get(0); // Zaten DESC sıralı

            User otherUser = userRepository.findById(otherUserId).orElse(null);
            if (otherUser == null) continue;

            long unreadCount = msgs.stream()
                    .filter(m -> m.getReceiver().getId().equals(currentUser.getId()) && !m.isRead())
                    .count();

            ConversationDto dto = new ConversationDto();
            dto.setOtherUserId(otherUserId);
            dto.setOtherUserName(otherUser.getFirstName() + " " + otherUser.getLastName());
            dto.setOtherUserProfilePicture(otherUser.getProfilePictureUrl());
            dto.setLastMessage(lastMsg.getContent());
            dto.setLastMessageTime(lastMsg.getTimestamp());
            dto.setUnreadCount((int) unreadCount);
            conversations.add(dto);
        }

        return conversations;
    }

    /**
     * Kullanıcının toplam okunmamış mesaj sayısını döndürür.
     */
    public int getUnreadCount(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return messageRepository.findByReceiverIdAndIsReadFalse(currentUser.getId()).size();
    }

    private MessageDto mapToDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());
        dto.setSenderProfilePicture(message.getSender().getProfilePictureUrl());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getFirstName() + " " + message.getReceiver().getLastName());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());
        return dto;
    }
}
