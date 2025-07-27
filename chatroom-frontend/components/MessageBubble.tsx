'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Message } from '@/types';
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  isOwn: boolean;
}

export function MessageBubble({ message, showAvatar, isOwn }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {message.fileUrl && (
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Image'}
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
            )}
            {message.content && (
              <div className="text-sm">{message.content}</div>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg max-w-xs">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {message.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {message.fileName || 'Unknown file'}
              </p>
              <p className="text-xs text-gray-500">
                Click to download
              </p>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {message.content}
            </span>
          </div>
        );
      default:
        return <div>{message.content}</div>;
    }
  };

  // System messages are centered
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        {renderMessageContent()}
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar && !isOwn ? (
          <Avatar className="w-8 h-8">
            <img
              src={message.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.name}`}
              alt={message.sender?.name || 'User'}
            />
          </Avatar>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-lg ${isOwn ? 'flex flex-col items-end' : ''}`}>
        {/* Sender Name & Time */}
        {showAvatar && !isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {message.sender?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative group/message ${
            isOwn
              ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
              : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
          } p-3 max-w-full break-words shadow-sm`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {renderMessageContent()}
          
          {/* Message edited indicator */}
          {message.isEdited && (
            <span className={`text-xs opacity-75 ml-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              (edited)
            </span>
          )}

          {/* Time for own messages */}
          {isOwn && (
            <div className="text-xs opacity-75 mt-1 text-right">
              {formatTime(message.createdAt)}
            </div>
          )}

          {/* Message Actions */}
          {showActions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover/message:opacity-100 transition-opacity`}>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 mx-2">
                <button
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                  title="Copy message"
                  onClick={() => navigator.clipboard.writeText(message.content)}
                >
                  <Copy className="w-3 h-3" />
                </button>
                {isOwn && (
                  <>
                    <button
                      className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                      title="Edit message"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 hover:bg-red-100 rounded text-gray-600 hover:text-red-600"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button
                  className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
                  title="More options"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}