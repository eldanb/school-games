

export type SelfDescribingKeysHelper<T extends keyof E, E> = T extends keyof E ? ({ type: T } & E[T]) : never;
export type SelfDescribingMessage<E> = SelfDescribingKeysHelper<keyof E, E>;
