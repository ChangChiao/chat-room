'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, MessageCircle, Users, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/lib/auth-store';
import { CreateRoomDialog } from '@/components/CreateRoomDialog';

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const { rooms, roomsLoading } = useChat();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const filteredRooms = rooms.filter(room => {
    if (!searchQuery) return true;
    return room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           room.members.some(member => 
             member.user.name.toLowerCase().includes(searchQuery.toLowerCase())
           );
  });

  const formatLastMessage = (message: any) => {
    if (!message) return 'No messages yet';
    if (message.type === 'text') return message.content;
    if (message.type === 'image') return '📷 Image';
    if (message.type === 'file') return '📎 File';
    return message.content;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">ChatRoom</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateRoom(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
              />
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading conversations...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        {room.type === 'group' ? (
                          <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <img
                            src={room.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.name || room.id}`}
                            alt={room.name || 'Chat'}
                          />
                        )}
                      </Avatar>
                      {room.unreadCount && room.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {room.name || 
                            (room.type === 'private' 
                              ? room.members.find(m => m.user.id !== user?.id)?.user.name || 'Unknown'
                              : `Group ${room.members.length} members`
                            )
                          }
                        </p>
                        {room.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(room.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {room.lastMessage?.sender?.name && room.type === 'group' && (
                            <span className="font-medium">
                              {room.lastMessage.sender.id === user?.id ? 'You' : room.lastMessage.sender.name}:&nbsp;
                            </span>
                          )}
                          {formatLastMessage(room.lastMessage)}
                        </p>
                        {room.type === 'group' && (
                          <Users className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to ChatRoom
          </h2>
          <p className="text-gray-600 mb-6">
            Select a conversation to start chatting
          </p>
          <Button onClick={() => setShowCreateRoom(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Start New Conversation
          </Button>
        </div>
      </div>

      {/* Create Room Dialog */}
      <CreateRoomDialog 
        open={showCreateRoom} 
        onClose={() => setShowCreateRoom(false)} 
      />
    </div>
  );
}