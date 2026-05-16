"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { messageService } from '@/services/messageService';
import { authService } from '@/services/authService';
import { MessageDto, ConversationDto } from '@/types';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = authService.getUser();

  // Sohbet listesini yükle
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const loadConversations = async () => {
      try {
        const data = await messageService.getConversations();
        setConversations(data);
      } catch (e) {
        console.error('Sohbetler yüklenemedi:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadConversations();
  }, [router]);

  // URL parametresinden doğrudan sohbet aç
  useEffect(() => {
    const toParam = searchParams.get('to');
    if (toParam) {
      const toId = parseInt(toParam);
      if (!isNaN(toId)) {
        selectConversation(toId, searchParams.get('name') || `Kullanıcı ${toId}`);
      }
    }
  }, [searchParams]);

  // Mesajlar değiştiğinde en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setShowChat(true);
    try {
      const msgs = await messageService.getConversation(userId);
      setMessages(msgs);
      // Okundu işaretle (hata verse bile sohbet açık kalsın)
      try {
        await messageService.markAsRead(userId);
        setConversations(prev => prev.map(c => 
          c.otherUserId === userId ? { ...c, unreadCount: 0 } : c
        ));
        // Header'daki bildirim sayacını anında güncelle
        window.dispatchEvent(new Event('messagesRead'));
      } catch {
        // markAsRead başarısız olsa da sohbet devam etsin
      }
    } catch (e) {
      console.error('Mesajlar yüklenemedi:', e);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    setIsSending(true);
    try {
      const sent = await messageService.sendMessage(selectedUserId, newMessage.trim());
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      
      // Sohbet listesini güncelle
      setConversations(prev => {
        const existing = prev.find(c => c.otherUserId === selectedUserId);
        if (existing) {
          return prev.map(c => c.otherUserId === selectedUserId 
            ? { ...c, lastMessage: sent.content, lastMessageTime: sent.timestamp }
            : c
          );
        } else {
          return [{ 
            otherUserId: selectedUserId, 
            otherUserName: selectedUserName, 
            otherUserProfilePicture: undefined, 
            lastMessage: sent.content, 
            lastMessageTime: sent.timestamp, 
            unreadCount: 0 
          }, ...prev];
        }
      });
    } catch (e: any) {
      alert(e.message || 'Mesaj gönderilemedi');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Dün';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('tr-TR', { weekday: 'short' });
    }
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center p-xl">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-gutter py-lg">
      <h1 className="font-display-sm text-on-surface mb-md">Mesajlar</h1>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 ambient-shadow overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px', display: 'flex' }}>
        
        {/* Sol Panel: Sohbet Listesi */}
        <div 
          className={`border-r border-outline-variant/30 flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}
          style={{ width: '340px', minWidth: '340px', flexShrink: 0 }}
        >
          <div className="p-md border-b border-outline-variant/30">
            <h2 className="font-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">forum</span>
              Sohbetlerim
            </h2>
          </div>

          <div className="flex-grow overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-lg text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-sm">chat_bubble_outline</span>
                <p className="font-body-md text-on-surface-variant">Henüz hiç mesajınız yok.</p>
                <p className="font-body-sm text-on-surface-variant mt-xs">İlan detay sayfalarından &quot;İletişime Geç&quot; butonuyla mesajlaşmaya başlayabilirsiniz.</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.otherUserId}
                  onClick={() => selectConversation(conv.otherUserId, conv.otherUserName)}
                  className={`w-full flex items-center gap-md p-md hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant/10 ${
                    selectedUserId === conv.otherUserId ? 'bg-primary-container/30' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-lg uppercase flex-shrink-0 overflow-hidden">
                    {conv.otherUserProfilePicture ? (
                      <img src={conv.otherUserProfilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      conv.otherUserName.charAt(0)
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-label-md text-on-surface truncate">{conv.otherUserName}</p>
                      <span className="font-label-sm text-on-surface-variant flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className="font-body-sm text-on-surface-variant truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary text-on-primary rounded-full flex items-center justify-center text-[11px] font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Sağ Panel: Mesaj İçeriği */}
        <div className={`flex flex-col ${showChat ? 'flex' : 'hidden md:flex'}`} style={{ flex: '1 1 0%', minWidth: 0 }}>
          {selectedUserId ? (
            <>
              {/* Sohbet Header */}
              <div className="p-md border-b border-outline-variant/30 flex items-center gap-md bg-surface">
                <button 
                  onClick={() => setShowChat(false)}
                  className="md:hidden p-1 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md uppercase overflow-hidden">
                  {selectedUserName.charAt(0)}
                </div>
                <div>
                  <p className="font-label-lg text-on-surface">{selectedUserName}</p>
                  <p className="font-body-sm text-on-surface-variant">Çevrimiçi</p>
                </div>
              </div>

              {/* Mesajlar */}
              <div className="flex-grow overflow-y-auto p-md flex flex-col gap-sm bg-surface-container/30">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="font-body-md text-on-surface-variant">Henüz mesaj yok. İlk mesajı gönderin!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          isMine 
                            ? 'bg-primary text-on-primary rounded-br-md' 
                            : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-bl-md'
                        }`}>
                          <p className="font-body-md whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`font-label-sm mt-1 text-right ${isMine ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                            {formatTime(msg.timestamp)}
                            {isMine && (
                              <span className="material-symbols-outlined text-[14px] ml-1 align-middle" style={msg.isRead ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {msg.isRead ? 'done_all' : 'done'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Mesaj Yazma Alanı */}
              <div className="p-md border-t border-outline-variant/30 bg-surface flex items-end gap-sm">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesajınızı yazın..."
                  rows={1}
                  className="flex-grow resize-none bg-surface-container rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 border border-outline-variant/30 max-h-32"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending}
                  className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 flex-shrink-0 shadow-sm"
                >
                  {isSending ? (
                    <div className="animate-spin w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full"></div>
                  ) : (
                    <span className="material-symbols-outlined">send</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-xl" style={{ flex: '1 1 0%' }}>
              <span className="material-symbols-outlined text-outline mb-md" style={{ fontSize: '64px' }}>chat</span>
              <h3 className="font-headline-md text-on-surface mb-xs">Bir sohbet seçin</h3>
              <p className="font-body-md text-on-surface-variant" style={{ maxWidth: '360px' }}>Sol taraftaki listeden bir kişi seçerek mesajlaşmaya başlayabilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
