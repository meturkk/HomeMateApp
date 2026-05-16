package com.homemate.api.repository;

import com.homemate.api.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // İki kullanıcı arasındaki mesajları tarihe göre sıralı getir
    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
        Long senderId1, Long receiverId1, Long senderId2, Long receiverId2
    );

    // Kullanıcının gönderdiği veya aldığı tüm mesajlar (sohbet listesi için)
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.timestamp DESC")
    List<Message> findAllByUserId(@Param("userId") Long userId);

    // Belirli bir kullanıcıya gelen okunmamış mesajlar
    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);

    // Belirli bir göndericiden belirli bir alıcıya gelen okunmamış mesajlar
    List<Message> findBySenderIdAndReceiverIdAndIsReadFalse(Long senderId, Long receiverId);
}
