import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToEntity(user) : undefined;
  }

  async findByStudentId(studentId: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { studentId },
    });
    return user ? this.mapToEntity(user) : undefined;
  }

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.passwordHash,
        fullName: userData.fullName,
        studentId: userData.studentId,
        role: userData.role || 'student',
        verified: userData.verified || false,
        emailAlerts: userData.preferences?.emailAlerts ?? true,
      },
    });
    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToEntity(user) : undefined;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already registered');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(updateUserDto.fullName && { fullName: updateUserDto.fullName }),
        ...(updateUserDto.emailAlerts !== undefined && { emailAlerts: updateUserDto.emailAlerts }),
      },
    });

    return this.mapToEntity(updatedUser);
  }

  private mapToEntity(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      fullName: prismaUser.fullName,
      studentId: prismaUser.studentId,
      role: prismaUser.role,
      verified: prismaUser.verified,
      preferences: {
        emailAlerts: prismaUser.emailAlerts,
      },
      createdAt: prismaUser.createdAt.toISOString(),
    };
  }
}
