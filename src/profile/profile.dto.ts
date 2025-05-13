import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class Profile {
  @IsOptional()
  @IsString()
  readonly bio!: string | null;

  @IsString()
  @IsEmail()
  readonly email!: string;

  @IsBoolean()
  readonly following!: boolean;

  @IsOptional()
  @IsString()
  readonly image!: string | null;

  @IsString()
  @MinLength(4)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.-]+$/)
  readonly username!: string;
}
