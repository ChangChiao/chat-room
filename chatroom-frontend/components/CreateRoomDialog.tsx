'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Search, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useChat } from '@/hooks/useChat';
import { userApi } from '@/lib/api';
import { User, CreateRoomDto } from '@/types';
import { useAuthStore } from '@/lib/auth-store';

const createRoomSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['private', 'group']),
  description: z.string().optional(),
  memberIds: z.array(z.string()).min(1, 'Please select at least one member'),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomDialog({ open, onClose }: CreateRoomDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { createRoom, isCreatingRoom } = useChat();
  const { user: currentUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      type: 'private',
      memberIds: [],
    },
  });

  const watchType = watch('type');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await userApi.searchUsers(query);
      // Filter out current user and already selected users
      const filteredResults = results.filter(user => 
        user.id !== currentUser?.id && 
        !selectedUsers.some(selected => selected.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    const newSelectedUsers = [...selectedUsers, user];
    setSelectedUsers(newSelectedUsers);
    setValue('memberIds', newSelectedUsers.map(u => u.id));
    
    // Auto-set room type based on number of selected users
    if (newSelectedUsers.length === 1) {
      setValue('type', 'private');
    } else {
      setValue('type', 'group');
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    setValue('memberIds', newSelectedUsers.map(u => u.id));
    
    // Auto-adjust room type
    if (newSelectedUsers.length === 1) {
      setValue('type', 'private');
    }
  };

  const onSubmit = async (data: CreateRoomForm) => {
    try {
      const roomData: CreateRoomDto = {
        type: data.type,
        memberIds: data.memberIds,
      };

      if (data.type === 'group') {
        roomData.name = data.name || `Group with ${selectedUsers.map(u => u.name).join(', ')}`;
        roomData.description = data.description;
      }

      createRoom(roomData);
      handleClose();
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    setSearchResults([]);
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Start New Conversation
          </h2>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Search Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add people
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-32 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <img
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name}
                        />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected ({selectedUsers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      <Avatar className="w-5 h-5">
                        <img
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name}
                        />
                      </Avatar>
                      <span>{user.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Type Display */}
            {selectedUsers.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {watchType === 'group' ? (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Group conversation</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>Private conversation</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Group Name (only for groups) */}
            {watchType === 'group' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group name (optional)
                </label>
                <Input
                  {...register('name')}
                  placeholder="Enter group name..."
                />
              </div>
            )}

            {/* Group Description (only for groups) */}
            {watchType === 'group' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <Input
                  {...register('description')}
                  placeholder="What's this group about?"
                />
              </div>
            )}

            {/* Error Messages */}
            {errors.memberIds && (
              <p className="text-sm text-red-600">{errors.memberIds.message}</p>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={selectedUsers.length === 0 || isCreatingRoom}
                className="flex-1"
              >
                {isCreatingRoom ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}