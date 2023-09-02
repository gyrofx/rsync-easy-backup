export function minLength1<T>(array: T[]): array is [T] {
  return array.length >= 1
}

export function minLength2<T>(array: T[]): array is [T, T] {
  return array.length >= 2
}

export function truthy<T>(value: T): value is Truthy<T> {
  return !!value
}

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T
