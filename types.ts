import { ServerRequest } from 'https://deno.land/std@0.99.0/http/server.ts'

/**
 * Request type with only required properties
 */
export type Request = Pick<ServerRequest, 'respond' | 'body' | 'method' | 'headers'>
