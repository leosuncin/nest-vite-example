import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsNotRegister } from './is-not-register.validator';

export class UpdateUser {
  @Allow()
  readonly id!: `user_${string}`;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly bio?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotRegister()
  readonly email?: string;

  @Allow()
  image?: string;

  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(71)
  readonly password?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsNotRegister()
  readonly username?: string;
}
