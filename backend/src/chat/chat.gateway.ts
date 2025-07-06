import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  UseFilters,
  UseInterceptors,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ChatService } from './chat.service';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { WsExceptionsFilter } from '../common/filters/ws-exception.filter';
import { WsLoggingInterceptor } from '../common/interceptors/ws-logging.interceptor';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@UseFilters(new WsExceptionsFilter())
@UseInterceptors(new WsLoggingInterceptor())
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private chatService: ChatService,
    private messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        client.disconnect();
        return;
      }

      client.data.user = user;
      this.connectedUsers.set(client.id, user.id);
      
      // 加入用戶所有的聊天室
      const userRooms = await this.chatService.getUserRooms(user.id);
      for (const room of userRooms) {
        client.join(room.id);
      }

      this.logger.log(`User ${user.name} connected with socket ${client.id}`);
      
      // 廣播用戶上線狀態
      this.server.emit('user-online', {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      
      // 檢查用戶是否還有其他連線
      const hasOtherConnection = Array.from(this.connectedUsers.values()).includes(userId);
      if (!hasOtherConnection) {
        // 廣播用戶下線狀態
        this.server.emit('user-offline', { userId });
      }
    }
    
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinRoomDto: JoinRoomDto,
  ) {
    const user = client.data.user;
    const { roomId } = joinRoomDto;

    try {
      // 驗證用戶是否為聊天室成員
      const isMember = await this.chatService.isUserMember(roomId, user.id);
      if (!isMember) {
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      client.join(roomId);
      
      // 通知房間內其他用戶
      client.to(roomId).emit('user-joined', {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
      });

      this.logger.log(`User ${user.name} joined room ${roomId}`);
    } catch (error) {
      this.logger.error('Join room error:', error);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = client.data.user;
    const { roomId } = data;

    client.leave(roomId);
    
    // 通知房間內其他用戶
    client.to(roomId).emit('user-left', {
      userId: user.id,
      name: user.name,
    });

    this.logger.log(`User ${user.name} left room ${roomId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const user = client.data.user;
    
    try {
      // 驗證用戶是否為聊天室成員
      const isMember = await this.chatService.isUserMember(
        createMessageDto.chatRoomId,
        user.id,
      );
      
      if (!isMember) {
        client.emit('error', { message: 'You are not a member of this room' });
        return;
      }

      // 儲存訊息到資料庫
      const message = await this.messagesService.create({
        ...createMessageDto,
        senderId: user.id,
      });

      // 獲取完整的訊息資料（包含發送者資訊）
      const fullMessage = await this.messagesService.findOne(message.id);

      // 廣播訊息給房間內所有用戶
      this.server.to(createMessageDto.chatRoomId).emit('new-message', {
        id: fullMessage.id,
        content: fullMessage.content,
        type: fullMessage.type,
        createdAt: fullMessage.createdAt,
        sender: {
          id: fullMessage.sender.id,
          name: fullMessage.sender.name,
          avatar: fullMessage.sender.avatar,
        },
        chatRoomId: fullMessage.chatRoomId,
      });

      this.logger.log(`Message sent in room ${createMessageDto.chatRoomId}`);
    } catch (error) {
      this.logger.error('Send message error:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const user = client.data.user;
    const { roomId, isTyping } = data;

    // 廣播打字狀態給房間內其他用戶
    client.to(roomId).emit('user-typing', {
      userId: user.id,
      name: user.name,
      isTyping,
    });
  }

  // 獲取線上用戶列表
  getOnlineUsers(): string[] {
    return Array.from(new Set(this.connectedUsers.values()));
  }

  // 發送系統訊息
  async sendSystemMessage(roomId: string, content: string) {
    const message = await this.messagesService.create({
      chatRoomId: roomId,
      content,
      type: 'system',
      senderId: null,
    });

    this.server.to(roomId).emit('new-message', {
      id: message.id,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      sender: null,
      chatRoomId: message.chatRoomId,
    });
  }
}