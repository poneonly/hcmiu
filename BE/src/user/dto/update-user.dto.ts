import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsBoolean()
    emailAlerts?: boolean;
}

