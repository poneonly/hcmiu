import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}
    
    async create(createTaskDto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {title: createTaskDto.title}
        })
    }

    async getAllTasks() {
        return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async getTaskById(id: string) {
        const task = await this.prisma.task.findUnique({ where: {id}});
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        return task;
    }

    async updateTask(id: string, dto: UpdateTaskDto) {
        await this.getTaskById(id);
        return this.prisma.task.update({ where: {id}, data: dto});
    }

    async deleteTask(id: string) {
        await this.getTaskById(id);
        return this.prisma.task.delete({ where: {id}});
    }
}
