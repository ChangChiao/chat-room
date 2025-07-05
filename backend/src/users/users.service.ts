import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findOne(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { googleId } });
  }

  async createOrUpdateGoogleUser(googleData: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<User> {
    let user = await this.findByGoogleId(googleData.googleId);
    
    if (!user) {
      user = await this.findByEmail(googleData.email);
      if (user) {
        // 更新現有用戶的 Google 資訊
        user.googleId = googleData.googleId;
        user.isGoogleUser = true;
        user.avatar = googleData.avatar || user.avatar;
        return await this.userRepository.save(user);
      }
      
      // 建立新用戶
      return await this.create({
        ...googleData,
        isGoogleUser: true,
      });
    }
    
    // 更新用戶資訊
    user.name = googleData.name;
    user.avatar = googleData.avatar || user.avatar;
    return await this.userRepository.save(user);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
