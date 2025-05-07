import { Injectable } from '@nestjs/common';
import {
  isEmpty,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { AuthService } from './auth.service';

@Injectable()
@ValidatorConstraint({ async: true, name: 'isNotRegister' })
export class IsNotRegisterConstraint implements ValidatorConstraintInterface {
  constructor(private readonly authService: AuthService) {}

  async validate(value: string, { object, property }: ValidationArguments) {
    if (isEmpty(value)) return true;

    const userExist = await this.authService.isRegistered({
      ...('id' in object
        ? ({ id: object.id } as Record<'id', `user_${string}`>)
        : {}),
      [property]: value,
    });

    return !userExist;
  }

  defaultMessage(): string {
    return '$property «$value» is already registered';
  }
}

export function IsNotRegister(options: ValidationOptions = {}) {
  return function (object: object, propertyName: 'username' | 'email') {
    registerDecorator({
      options,
      propertyName,
      target: object.constructor,
      validator: IsNotRegisterConstraint,
    });
  };
}
