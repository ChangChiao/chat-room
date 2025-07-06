import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom, ChatRoomType } from './entities/chat-room.entity';
import { ChatRoomMember, MemberRole } from './entities/chat-room-member.entity';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatRoomMember)
    private chatRoomMemberRepository: Repository<ChatRoomMember>,
    private usersService: UsersService,
  ) {}

  async createChatRoom(createChatRoomDto: CreateChatRoomDto, creatorId: string): Promise<ChatRoom> {
    const { memberIds, type, name, description } = createChatRoomDto;

    // 驗證成員數量
    if (type === ChatRoomType.PRIVATE && memberIds.length !== 1) {
      throw new BadRequestException('Private chat must have exactly 2 members (you + 1 other)');
    }
    
    if (type === ChatRoomType.GROUP && memberIds.length > 29) {
      throw new BadRequestException('Group chat cannot have more than 30 members');
    }

    // 檢查私聊是否已存在
    if (type === ChatRoomType.PRIVATE) {
      const existingRoom = await this.findPrivateRoom(creatorId, memberIds[0]);
      if (existingRoom) {
        return existingRoom;
      }
    }

    // 驗證所有成員是否存在
    const allMemberIds = [...memberIds, creatorId];
    for (const memberId of allMemberIds) {
      const user = await this.usersService.findOne(memberId);
      if (!user) {
        throw new NotFoundException(`User with id ${memberId} not found`);
      }
    }

    // 建立聊天室
    const chatRoom = this.chatRoomRepository.create({
      name: type === ChatRoomType.GROUP ? name : null,
      type,
      description,
      maxMembers: type === ChatRoomType.PRIVATE ? 2 : 30,
    });

    const savedRoom = await this.chatRoomRepository.save(chatRoom);

    // 加入創建者為管理員
    await this.addMember(savedRoom.id, creatorId, MemberRole.ADMIN);

    // 加入其他成員
    for (const memberId of memberIds) {
      await this.addMember(savedRoom.id, memberId, MemberRole.MEMBER);
    }

    return savedRoom;
  }

  async findPrivateRoom(userId1: string, userId2: string): Promise<ChatRoom | null> {
    const room = await this.chatRoomRepository
      .createQueryBuilder('room')
      .innerJoin('room.members', 'member1', 'member1.userId = :userId1', { userId1 })
      .innerJoin('room.members', 'member2', 'member2.userId = :userId2', { userId2 })
      .where('room.type = :type', { type: ChatRoomType.PRIVATE })
      .getOne();

    return room;
  }

  async addMember(roomId: string, userId: string, role: MemberRole = MemberRole.MEMBER): Promise<ChatRoomMember> {
    // 檢查聊天室是否存在
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    // 檢查是否已經是成員
    const existingMember = await this.chatRoomMemberRepository.findOne({
      where: { chatRoomId: roomId, userId },
    });

    if (existingMember) {
      return existingMember;
    }

    // 檢查成員數量限制
    if (room.members.length >= room.maxMembers) {
      throw new BadRequestException('Chat room is full');
    }

    const member = this.chatRoomMemberRepository.create({
      chatRoomId: roomId,
      userId,
      role,
    });

    return await this.chatRoomMemberRepository.save(member);
  }

  async removeMember(roomId: string, userId: string, removerId: string): Promise<void> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    // 私聊不能移除成員
    if (room.type === ChatRoomType.PRIVATE) {
      throw new BadRequestException('Cannot remove members from private chat');
    }

    // 檢查移除者的權限
    const remover = await this.chatRoomMemberRepository.findOne({
      where: { chatRoomId: roomId, userId: removerId },
    });

    if (!remover || remover.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can remove members');
    }

    // 移除成員
    await this.chatRoomMemberRepository.delete({
      chatRoomId: roomId,
      userId,
    });
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    return await this.chatRoomRepository
      .createQueryBuilder('room')
      .innerJoin('room.members', 'member', 'member.userId = :userId', { userId })
      .leftJoinAndSelect('room.members', 'allMembers')
      .leftJoinAndSelect('allMembers.user', 'user')
      .orderBy('room.updatedAt', 'DESC')
      .getMany();
  }

  async getRoomWithMembers(roomId: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members', 'members.user'],
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    return room;
  }

  async isUserMember(roomId: string, userId: string): Promise<boolean> {
    const member = await this.chatRoomMemberRepository.findOne({
      where: { chatRoomId: roomId, userId },
    });

    return !!member;
  }

  async updateLastRead(roomId: string, userId: string): Promise<void> {
    await this.chatRoomMemberRepository.update(
      { chatRoomId: roomId, userId },
      { lastReadAt: new Date() },
    );
  }
}
