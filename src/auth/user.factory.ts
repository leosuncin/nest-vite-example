import { setSeederFactory } from 'typeorm-extension';

import { User } from './user.entity';

export const userFactory = setSeederFactory(User, (faker) => {
  const user = new User();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  user.email = faker.internet.email({ firstName, lastName });
  user.password = faker.internet.password();
  user.username = faker.internet.userName({ firstName, lastName });
  user.bio = faker.lorem.sentence();
  user.image = faker.image.avatar();

  return user;
});
