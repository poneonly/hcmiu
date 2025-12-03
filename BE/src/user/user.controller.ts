import {
    Controller,
    Get,
    Put,
    Param,
    Body,
    NotFoundException,
    UseGuards,
    Req,
    ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProfile(@Param('id') id: string, @Req() req: Request) {
        const payload = (req as any).user;

        if (!payload || payload.sub !== id) {
            throw new ForbiddenException('Access denied for this profile');
        }

        const user = await this.usersService.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            success: true,
            user: userWithoutPassword,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
        const payload = (req as any).user;

        if (!payload || payload.sub !== id) {
            throw new ForbiddenException('Access denied for this profile');
        }

        const updatedUser = await this.usersService.update(id, updateUserDto);
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;

        return {
            success: true,
            user: userWithoutPassword,
        };
    }
}
