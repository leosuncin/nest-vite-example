import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  isEmail,
  isString,
  maxLength,
  minLength,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true, name: 'credential' })
export class IsValidCredentialConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly authService: AuthService) {}

  validate(_: unknown, { object, property }: ValidationArguments) {
    if (!this.hasCredentials(object)) return true;

    return this.authService.verifyCredentials(object, property);
  }

  defaultMessage(): string {
    return 'The $property is incorrect';
  }

  private hasCredentials(object: object): object is {
    email: string;
    password: string;
    [key: string]: unknown;
  } {
    const { password, email } = object as Record<string, unknown>;
    const isValidPassword =
      isString(password) && minLength(password, 8) && maxLength(password, 30);
    const isValidEmail = isString(email) && isEmail(email);

    if (isValidPassword && isValidEmail) return true;

    return false;
  }
}

export function IsValidCredential(options: ValidationOptions = {}) {
  return function (object: object, propertyName: 'email' | 'password') {
    registerDecorator({
      options,
      propertyName,
      target: object.constructor,
      validator: IsValidCredentialConstraint,
    });
  };
}
