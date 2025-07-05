import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatRoomMember } from './chat-room-member.entity';
import { Message } from '../../messages/entities/message.entity';

export enum ChatRoomType {
  PRIVATE = 'private',
  GROUP = 'group',
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ChatRoomType,
    default: ChatRoomType.PRIVATE,
  })
  type: ChatRoomType;

  @Column({ default: 30 })
  maxMembers: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ChatRoomMember, (member) => member.chatRoom)
  members: ChatRoomMember[];

  @OneToMany(() => Message, (message) => message.chatRoom)
  messages: Message[];
}