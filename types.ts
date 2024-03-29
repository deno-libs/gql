import type { HandlerOptions, OperationContext } from './deps.ts'
import type { RenderPageOptions } from './graphiql/render.ts'

/**
 * gql options
 */
export interface GQLOptions<
  Req = Request,
  ReqCtx = unknown,
  Context extends OperationContext = OperationContext,
> extends HandlerOptions<Req, ReqCtx, Context> {
  /**
   * GraphQL playground
   */
  graphiql?: boolean
  /**
   * Custom headers for responses
   */
  headers?: HeadersInit
  /**
   * Custom options for GraphQL Playground
   */
  playgroundOptions?: Omit<RenderPageOptions, 'endpoint'>
}

interface Params {
  variables?: Record<string, unknown>
  operationName?: string
}

interface QueryParams extends Params {
  query: string
  mutation?: never
}

interface MutationParams extends Params {
  mutation: string
  query?: never
}

export type GraphQLParams = QueryParams | MutationParams
