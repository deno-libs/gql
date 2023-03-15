import {
  Application,
  Middleware,
  Router,
} from 'https://deno.land/x/oak@v12.1.0/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://esm.sh/@graphql-tools/schema@9.0.17'
import { gql } from 'https://deno.land/x/graphql_tag@0.1.1/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (_root: undefined, _args: unknown, ctx: { request: Request }) => {
      return `Hello World! from ${ctx.request.url}`
    },
  },
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const resolve = GraphQLHTTP({
  schema,
  graphiql: true,
  context: (request) => ({ request }),
})

const handleGraphQL: Middleware = async (ctx) => {
  // cast Oak request into a normal Request
  const req = new Request(ctx.request.url.toString(), {
    body: ctx.request.originalRequest.getBody().body,
    headers: ctx.request.headers,
    method: ctx.request.method,
  })

  const res = await resolve(req)

  for (const [k, v] of res.headers.entries()) ctx.response.headers.append(k, v)

  ctx.response.status = res.status
  ctx.response.body = res.body
}

// Allow CORS:
// const cors: Middleware = (ctx) => {
// ctx.response.headers.append('access-control-allow-origin', '*')
// ctx.response.headers.append('access-control-allow-headers', 'Origin, Host, Content-Type, Accept')
// }

const graphqlRouter = new Router().all('/graphql', handleGraphQL)

const app = new Application().use(
  // cors,
  graphqlRouter.routes(),
  graphqlRouter.allowedMethods(),
)

app.addEventListener('listen', ({ secure, hostname, port }) => {
  if (hostname === '0.0.0.0') hostname = 'localhost'

  const protocol = secure ? 'https' : 'http'
  const url = `${protocol}://${hostname ?? 'localhost'}:${port}`

  console.log('☁  Started on ' + url)
})

await app.listen({ port: 3000 })
