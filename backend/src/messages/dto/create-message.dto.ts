import { IsString, IsEnum, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @IsString()
  @MaxLength(1000)
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsUUID()
  chatRoomId: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsUUID()
  @IsOptional()
  senderId?: string;
}