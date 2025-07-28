'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Users, 
  Phone, 
  Video,
  Paperclip,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/lib/auth-store';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { user } = useAuthStore();
  const {
    currentRoom,
    messages,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    isSendingMessage,
    roomLoading,
    messagesLoading,
  } = useChat({ roomId });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing status
  const handleInputChange = (value: string) => {
    setMessageInput(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      sendTypingStatus(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 2000);
  };

  const handleSendMessage = () => {
    const content = messageInput.trim();
    if (!content || isSendingMessage) return;

    sendMessage({
      content,
      type: 'text',
    });

    setMessageInput('');
    setIsTyping(false);
    sendTypingStatus(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoomName = () => {
    if (!currentRoom) return 'Loading...';
    
    if (currentRoom.name) return currentRoom.name;
    
    if (currentRoom.type === 'private') {
      const otherMember = currentRoom.members.find(m => m.user.id !== user?.id);
      return otherMember?.user.name || 'Unknown User';
    }
    
    return `Group (${currentRoom.members.length} members)`;
  };

  const getRoomAvatar = () => {
    if (!currentRoom) return '';
    
    if (currentRoom.avatar) return currentRoom.avatar;
    
    if (currentRoom.type === 'private') {
      const otherMember = currentRoom.members.find(m => m.user.id !== user?.id);
      return otherMember?.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherMember?.user.name}`;
    }
    
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentRoom.name || currentRoom.id}`;
  };

  if (roomLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Conversation not found</p>
          <Button onClick={() => router.push('/chat')}>
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/chat')}
            className="lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <Avatar className="w-10 h-10">
            {currentRoom.type === 'group' ? (
              <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            ) : (
              <img src={getRoomAvatar()} alt={getRoomName()} />
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {getRoomName()}
            </h1>
            <p className="text-sm text-gray-500">
              {currentRoom.type === 'group' 
                ? `${currentRoom.members.length} members`
                : (() => {
                    const otherMember = currentRoom.members.find(m => m.user.id !== user?.id);
                    return otherMember?.user.isOnline ? 'Online' : 'Offline';
                  })()
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Start the conversation</p>
              <p className="text-sm text-gray-400">
                Send a message to get things started!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showAvatar = !prevMessage || 
                prevMessage.sender?.id !== message.sender?.id ||
                new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 300000; // 5 minutes
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  isOwn={message.sender?.id === user?.id}
                />
              );
            })}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <Button variant="outline" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={messageInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12"
              disabled={isSendingMessage}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSendingMessage}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}