export function unknownErrorToPlainObject(error: unknown) {
  return errorToPlainObject(unknownAsError(error))
}

export function errorToPlainObject(error: Error, level = 0): Record<string, any> {
  if (level > 20)
    return {
      type: 'error',
      name: 'Too deep',
      message: 'Too many levels of error.cause',
    }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack || '',
    cause: error.cause instanceof Error ? errorToPlainObject(error.cause, level + 1) : '',
    details: error instanceof ErrorWithDetails ? error.details : undefined,
    type: 'error',
    stringified: error.toString(),
  }
}

export function friendlyError(error: unknown) {
  if (typeof error === 'string') {
    return error
  }
  if (typeof error === 'object' && error) {
    const errorObject: { message?: unknown } = error
    if (typeof errorObject.message === 'string') {
      return errorObject.message
    }
    return JSON.stringify(error)
  }
  return 'Unknown Error'
}

export function unknownAsError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  return new Error(`Error: ${error}`)
}

export class ErrorWithDetails extends Error {
  readonly details: unknown

  constructor(message: string, options: ErrorOptions & { details: unknown }) {
    super(message, options)
    this.details = options.details
  }

  toString() {
    return `${this.name}: ${this.message} ${JSON.stringify(this.details)}`
  }
}
