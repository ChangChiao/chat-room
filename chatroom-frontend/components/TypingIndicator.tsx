'use client';

import { Avatar } from '@/components/ui/avatar';
import { User } from '@/types';

interface TypingUser {
  userId: string;
  user: User;
}

interface TypingIndicatorProps {
  users: TypingUser[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].user.name} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].user.name} and ${users[1].user.name} are typing...`;
    } else {
      return `${users[0].user.name} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex gap-3 items-center">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="w-8 h-8">
          <img
            src={users[0].user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${users[0].user.name}`}
            alt={users[0].user.name}
          />
        </Avatar>
      </div>

      {/* Typing Animation */}
      <div className="bg-gray-100 rounded-r-lg rounded-tl-lg p-3 max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{getTypingText()}</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}