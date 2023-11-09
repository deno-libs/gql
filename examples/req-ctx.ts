import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'npm:@graphql-tools/schema@10.0.0'
import { gql } from 'https://deno.land/x/graphql_tag@0.1.2/mod.ts'
import type { Request as GQLRequest } from 'npm:graphql-http@1.22.0'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

type ReqContext = {
  request: Request
  isRequestContext: boolean
}

type Context = {
  request: Request
  originalReq: GQLRequest<Request, ReqContext>
}

const resolvers = {
  Query: {
    hello: (_root: unknown, _args: unknown, ctx: Context) => {
      return `Hello from request context: ${ctx.originalReq.context.isRequestContext}`
    },
  },
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

Deno.serve({
  port: 3000,
  onListen({ hostname, port }) {
    console.log(`☁  Started on http://${hostname}:${port}`)
  },
}, async (req) => {
  const { pathname } = new URL(req.url)
  return pathname === '/graphql'
    ? await GraphQLHTTP<Request, Context, ReqContext>({
      schema,
      graphiql: true,
      context: (request) => ({ request: req, originalReq: request }),
    }, () => ({ request: req, isRequestContext: true }))(req)
    : new Response('Not Found', { status: 404 })
})
