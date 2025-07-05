import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum SessionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  socketId: string;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ONLINE,
  })
  status: SessionStatus;

  @Column({ nullable: true })
  lastActivity: Date;

  @CreateDateColumn()
  connectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}