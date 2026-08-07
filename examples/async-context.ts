import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { gql } from '@deno-libs/graphql-tag'

const typeDefs = gql`
  type Query {
    currentUser: String
    greeting: String
  }
`

interface ReqCtx {
  request: Request
  userId: string
  isAuthenticated: boolean
}

const resolvers = {
  Query: {
    currentUser: (_root: unknown, _args: unknown, ctx: { userId: string }) => {
      return `User ID: ${ctx.userId}`
    },
    greeting: (
      _root: unknown,
      _args: unknown,
      ctx: { isAuthenticated: boolean },
    ) => {
      return ctx.isAuthenticated
        ? 'Hello, authenticated user!'
        : 'Hello, guest!'
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
    ? await GraphQLHTTP<
      Request,
      { userId: string; isAuthenticated: boolean },
      ReqCtx
    >({
      schema,
      graphiql: true,
      context: (rawReq) => ({
        userId: rawReq.context.userId,
        isAuthenticated: rawReq.context.isAuthenticated,
      }),
    }, async (req: Request) => {
      // Simulate async operations like:
      // - Database queries
      // - Authentication checks
      // - API calls to auth services
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Extract auth token from headers
      const authHeader = req.headers.get('Authorization')
      const isAuthenticated = authHeader?.startsWith('Bearer ') ?? false
      const userId = isAuthenticated ? 'user-123' : 'guest'

      return {
        request: req,
        userId,
        isAuthenticated,
      }
    })(req)
    : new Response('Not Found', { status: 404 })
})
