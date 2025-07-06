import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return await this.messageRepository.save(message);
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async findRoomMessages(roomId: string, page: number = 1, limit: number = 50): Promise<{
    messages: Message[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { chatRoomId: roomId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages: messages.reverse(), // 將最新的訊息放在最後
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateMessage(id: string, content: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new NotFoundException('You can only edit your own messages');
    }

    message.content = content;
    message.isEdited = true;
    
    return await this.messageRepository.save(message);
  }

  async deleteMessage(id: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new NotFoundException('You can only delete your own messages');
    }

    await this.messageRepository.remove(message);
  }

  async getUnreadCount(roomId: string, userId: string, lastReadAt?: Date): Promise<number> {
    if (!lastReadAt) {
      return await this.messageRepository.count({
        where: { chatRoomId: roomId },
      });
    }

    return await this.messageRepository.count({
      where: { 
        chatRoomId: roomId,
        createdAt: { $gt: lastReadAt } as any,
      },
    });
  }
}
