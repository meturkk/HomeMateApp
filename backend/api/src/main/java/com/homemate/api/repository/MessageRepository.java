package com.homemate.api.repository;

import com.homemate.api.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // İki kullanıcı arasındaki geçmiş mesajlaşmaları tarihe göre sıralı getirmek için
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
        Long senderId1, Long receiverId1, Long senderId2, Long receiverId2
    );
}
