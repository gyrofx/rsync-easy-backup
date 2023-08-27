export function handleErrorDelicately(error: unknown) {
  /* eslint-disable no-console */
  if (error instanceof Error && process.env['NODE_ENV'] !== 'development') {
    try {
      console.error(
        JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
          unhandledRejection: true,
        })
      )
    } catch {
      console.error(error)
    }
  } else {
    console.error('The following error was caught by the root error handler')
    console.error("Printing normally instead of as object because we're in dev mode")
    console.error(error)
  }
  process.exit(1)
  /* eslint-enable no-console */
}
