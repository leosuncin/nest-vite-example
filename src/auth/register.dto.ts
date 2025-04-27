import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsNotRegister } from './is-not-register.validator';

export class Register {
  @IsString()
  @IsEmail()
  @IsNotRegister()
  readonly email!: string;

  @IsString()
  @MinLength(4)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.-]+$/)
  @IsNotRegister()
  readonly username!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(71)
  readonly password!: string;
}
