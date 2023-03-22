import { ExecutionResult, graphql } from './deps.ts'
import type { GQLOptions, GQLRequest, GraphQLParams } from './types.ts'

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
export async function runHttpQuery<
  Req extends GQLRequest = GQLRequest,
  Context = { request?: Req },
>(
  params: GraphQLParams,
  options: GQLOptions<Context, Req>,
  context?: Context | any,
): Promise<ExecutionResult> {
  const contextValue = options.context && context?.request
    ? await options.context?.(context?.request)
    : context
  const source = params.query! || params.mutation!
  console.log('[SOURCE]', source)

  return await graphql({
    source,
    ...options,
    contextValue,
    variableValues: params.variables,
    operationName: params.operationName,
  })
}
