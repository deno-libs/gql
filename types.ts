import type { GraphQLArgs } from 'https://deno.land/x/graphql_deno@v15.0.0/lib/graphql.d.ts'
import type { GraphQLSchema } from 'https://deno.land/x/graphql_deno@v15.0.0/lib/type/schema.d.ts'
import type { RenderPageOptions } from './graphiql/render.ts'

/**
 * gql options
 */
export interface GQLOptions<Context = any, Req extends GQLRequest = GQLRequest> extends Omit<GraphQLArgs, 'source'> {
  schema: GraphQLSchema
  context?: (val: Req) => Context | Promise<Context>
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

export type GQLRequest = {
  url: string
  method: string
  headers: Headers
  json: () => Promise<GraphQLParams>
}
