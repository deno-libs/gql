import { ServerRequest } from 'https://deno.land/std@0.90.0/http/server.ts'

export type Request = Pick<ServerRequest, 'respond' | 'body' | 'method'>
