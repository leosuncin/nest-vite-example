import { hash } from '@node-rs/argon2';
import {
  type EntitySubscriberInterface,
  EventSubscriber,
  type InsertEvent,
} from 'typeorm';

import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    if (event.entity.password) {
      event.entity.password = await hash(event.entity.password);
    }
  }
}
