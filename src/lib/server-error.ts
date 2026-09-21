/**
 * Turns a thrown error into something safe to send to the browser.
 *
 * Server functions return `{ success: false, error }` and route components render that string, so
 * whatever goes in here ends up in the page HTML. Returning `error.message` leaked database
 * internals to visitors — a deep page of /hospitals used to print Mongo's
 * "Sort exceeded memory limit of 33554432 bytes ... Pass allowDiskUse:true" straight into the
 * serialized router state. The real message still goes to the server log, where it's useful.
 */
export function serverError(context: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`${context} failed:`, message);
  return "Something went wrong on our side. Please try again.";
}
