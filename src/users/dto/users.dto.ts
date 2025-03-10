import { Role } from '@prisma/client';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  role: Role;
}
