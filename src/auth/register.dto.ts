import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class Register {
  @IsString()
  @IsEmail()
  readonly email!: string;

  @IsString()
  @MinLength(4)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.-]+$/)
  readonly username!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(71)
  readonly password!: string;
}
