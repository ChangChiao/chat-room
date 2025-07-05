import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('chat_room_members')
@Unique(['chatRoom', 'user'])
export class ChatRoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ nullable: true })
  lastReadAt: Date;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatRoomId' })
  chatRoom: ChatRoom;

  @Column()
  chatRoomId: string;

  @ManyToOne(() => User, (user) => user.chatRoomMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}