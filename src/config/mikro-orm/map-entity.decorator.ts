import { EntityClass } from '@mikro-orm/core';

export const entities: EntityClass<any>[] = [];

export function MapEntity() {
  return function (target: EntityClass<any>) {
    entities.push(target);
  };
}
