import { IsString, IsEnum, IsOptional, IsArray, IsUUID, MaxLength, ArrayMaxSize } from 'class-validator';
import { ChatRoomType } from '../entities/chat-room.entity';

export class CreateChatRoomDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsEnum(ChatRoomType)
  type: ChatRoomType;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMaxSize(30)
  memberIds: string[];
}