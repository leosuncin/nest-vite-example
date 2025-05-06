import HashId from 'hashids';
import Snowflakify from 'snowflakify';
import type { ValueTransformer } from 'typeorm';

const hashId = new HashId();
const snowflakify = new Snowflakify();

export function generateId<P extends string>(prefix: P): `${P}_${string}` {
  const id = snowflakify.nextId();
  const numbers = snowflakify.destructure(id).map((fragment) => fragment.value);

  return `${prefix}_${hashId.encode(numbers)}`;
}

export function getTransformId<P extends string>(prefix: P) {
  type ID = `${P}_${string}`;

  return {
    from(value: bigint): ID {
      return `${prefix}_${hashId.encode(value)}`;
    },
    to(value: ID) {
      if (value == null) return value;

      const [, id] = value.split('_') as [P, string];

      return hashId
        .decode(id)
        .map(BigInt)
        .reduce((a, b) => a + b, 0n);
    },
  } satisfies ValueTransformer;
}
