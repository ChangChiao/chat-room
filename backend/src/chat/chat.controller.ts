import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessagesService } from '../messages/messages.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private messagesService: MessagesService,
  ) {}

  @Post('rooms')
  async createRoom(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @CurrentUser() user: User,
  ) {
    return await this.chatService.createChatRoom(createChatRoomDto, user.id);
  }

  @Get('rooms')
  async getUserRooms(@CurrentUser() user: User) {
    return await this.chatService.getUserRooms(user.id);
  }

  @Get('rooms/:id')
  async getRoom(@Param('id', ParseUUIDPipe) roomId: string, @CurrentUser() user: User) {
    // 驗證用戶是否為聊天室成員
    const isMember = await this.chatService.isUserMember(roomId, user.id);
    if (!isMember) {
      throw new Error('You are not a member of this room');
    }

    return await this.chatService.getRoomWithMembers(roomId);
  }

  @Get('rooms/:id/messages')
  async getRoomMessages(
    @Param('id', ParseUUIDPipe) roomId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @CurrentUser() user: User,
  ) {
    // 驗證用戶是否為聊天室成員
    const isMember = await this.chatService.isUserMember(roomId, user.id);
    if (!isMember) {
      throw new Error('You are not a member of this room');
    }

    return await this.messagesService.findRoomMessages(roomId, page, limit);
  }

  @Post('rooms/:id/members/:userId')
  async addMember(
    @Param('id', ParseUUIDPipe) roomId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
  ) {
    return await this.chatService.addMember(roomId, userId);
  }

  @Delete('rooms/:id/members/:userId')
  async removeMember(
    @Param('id', ParseUUIDPipe) roomId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
  ) {
    return await this.chatService.removeMember(roomId, userId, user.id);
  }

  @Post('rooms/:id/read')
  async markAsRead(
    @Param('id', ParseUUIDPipe) roomId: string,
    @CurrentUser() user: User,
  ) {
    return await this.chatService.updateLastRead(roomId, user.id);
  }
}
