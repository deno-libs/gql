import { ServerRequest } from "https://deno.land/std@0.97.0/http/server.ts";
import { NativeRequest } from "https://deno.land/x/oak@v7.5.0/http_server_native.ts";

/**
 * Request type with only required properties
 */
export type Request =
  | Pick<ServerRequest, "respond" | "body" | "method" | "headers">
  | NativeRequest;
