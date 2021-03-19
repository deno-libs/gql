import { graphql, GraphQLSchema, ExecutionResult } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

export type GraphQLOptions<Context = any, Request = any> = {
  schema: GraphQLSchema
  context?: (val: Request) => Context | Promise<Context>
  rootValue?: any
}

export type GraphQLParams = {
  query?: string
  mutation?: string
  variables?: Record<string, unknown>
  operationName?: string
}
/**
 * Execute a GraphQL query
 * @param {GraphQLParams} params
 * @param {GraphQLOptions} options
 * @param context GraphQL context to use inside resolvers
 *
 * @example
 * ```ts
 * const { errors, data } = await runHttpQuery<ServerRequest, typeof context>({ query: `{ hello }` }, { schema } }, context)
 * ```
 */
export async function runHttpQuery<Req extends any = any, Context extends { request: Req } = { request: Req }>(
  params: GraphQLParams,
  options: GraphQLOptions<Context, Req>,
  context?: Context | any
): Promise<ExecutionResult> {
  if (!params) throw new Error('Bad Request')

  const contextValue = options.context && context?.request ? await options.context?.(context?.request) : context
  const source = params.query! || params.mutation!

  if (!source) throw new Error('Query or mutation must be provided')

  return await graphql({
    source,
    ...options,
    contextValue,
    variableValues: params.variables,
    operationName: params.operationName
  })
}
