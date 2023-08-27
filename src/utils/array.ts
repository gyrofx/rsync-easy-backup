export function minLength1<T>(array: T[]): array is [T] {
  return array.length >= 1
}

export function minLength2<T>(array: T[]): array is [T, T] {
  return array.length >= 2
}
