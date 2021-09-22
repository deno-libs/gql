import { graphql, GraphQLSchema, ExecutionResult } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'
import type { GraphQLArgs } from 'https://deno.land/x/graphql_deno@v15.0.0/lib/graphql.d.ts'
import type { GQLRequest } from './types.ts'
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

/**
 * Execute a GraphQL query
 * @param {GraphQLParams} params
 * @param {GQLOptions} options
 * @param context GraphQL context to use inside resolvers
 *
 * @example
 * ```ts
 * const { errors, data } = await runHttpQuery<ServerRequest, typeof context>({ query: `{ hello }` }, { schema } }, context)
 * ```
 */
export async function runHttpQuery<Req extends GQLRequest = GQLRequest, Context = { request?: Req }>(
  params: GraphQLParams,
  options: GQLOptions<Context, Req>,
  context?: Context | any
): Promise<ExecutionResult> {
  const contextValue = options.context && context?.request ? await options.context?.(context?.request) : context
  const source = params.query! || params.mutation!

  return await graphql({
    source,
    ...options,
    contextValue,
    variableValues: params.variables,
    operationName: params.operationName
  })
}
