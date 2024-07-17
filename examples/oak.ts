import {
  Application,
  type Middleware,
  type Request as OakRequest,
  Router,
} from 'https://deno.land/x/oak@v16.1.0/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'npm:@graphql-tools/schema@10.0.3'
import { gql } from 'https://deno.land/x/graphql_tag@0.1.2/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (_root: undefined, _args: unknown, ctx: { request: OakRequest }) => {
      return `Hello from ${ctx.request.url}`
    },
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const handleGraphQL: Middleware = async (ctx) => {
  // cast Oak request into a normal Request
  const req = new Request(ctx.request.url.toString(), {
    body: await ctx.request.body.blob(),
    headers: ctx.request.headers,
    method: ctx.request.method,
  })

  const res = await GraphQLHTTP<OakRequest>({
    schema,
    graphiql: true,
    context: () => ({ request: ctx.request }),
  })(req)

  for (const [k, v] of res.headers.entries()) ctx.response.headers.append(k, v)

  ctx.response.status = res.status
  ctx.response.body = res.body
}

const graphqlRouter = new Router().all('/graphql', handleGraphQL)

const app = new Application().use(
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
