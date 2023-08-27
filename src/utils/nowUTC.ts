export function nowUTC() {
  return new Date(new Date().toUTCString())
}
