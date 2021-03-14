import { Request } from './types.ts'
import { graphql, ExecutionResult, GraphQLSchema, GraphQLArgs } from './deps.ts'

export type GraphQLOptions = {
  schema: GraphQLSchema
  context?: (val: any) => any
  rootValue?: any
}

export type GraphQLParams = {
  query?: string
  mutation?: string
  variables?: Record<string, unknown>
  operationName?: string
}

export type ServerContext<T> = { request: Request } & T

/** Returns a GraphQL response. */
export async function runHttpQuery<Context = unknown>(
  params: GraphQLParams,
  options: GraphQLOptions,
  context?: ServerContext<Context>
): Promise<ExecutionResult> {
  if (!params) throw new Error('Bad Request')

  const contextValue = options.context && context?.request ? await options.context?.(context?.request) : undefined
  const source = params.query! || params.mutation!

  // https://graphql.org/graphql-js/graphql/#graphql
  const graphQLArgs: GraphQLArgs = {
    source,
    schema: options.schema,
    rootValue: options.rootValue,
    contextValue: contextValue,
    variableValues: params.variables,
    operationName: params.operationName
  }

  return await graphql(graphQLArgs)
}
