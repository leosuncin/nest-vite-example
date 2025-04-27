import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { IsValidCredential } from './is-valid-credential.validator';

export class Login {
  @IsString()
  @IsEmail()
  @IsValidCredential()
  readonly email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(71)
  @IsValidCredential()
  readonly password!: string;
}
