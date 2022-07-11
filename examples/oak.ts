import { Application } from 'https://deno.land/x/oak@v10.1.0/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools@0.0.2/mod.ts'
import { gql } from 'https://deno.land/x/graphql_tag@0.0.1/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (_root: undefined, _args: unknown, ctx: { request: Request }) => {
      return `Hello World! from ${ctx.request.url}`
    }
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const resolve = GraphQLHTTP({
  schema,
  graphiql: true,
  context: request => ({ request })
})

const app = new Application()

app.use((ctx, next) => {
  // Allow CORS:
  // ctx.response.headers.append('access-control-allow-origin', '*')
  // ctx.response.headers.append('access-control-allow-headers', 'Origin, Host, Content-Type, Accept')

  if(ctx.request.method !== 'OPTIONS')
    return next()

  ctx.response.status = 204;

  if(ctx.request.url.pathname.startsWith('/graphql'))
    ctx.response.headers.append('allow', 'OPTIONS, GET, POST')
  else
    ctx.response.headers.append('allow', '*')
})

app.use(async (ctx, next) => {
  if(!ctx.request.url.pathname.startsWith('/graphql'))
    return next()

  const req = ctx.request.originalRequest.request
  const res = await resolve(req)

  for(const [k, v] of res.headers.entries())
    ctx.response.headers.append(k, v)

  ctx.response.status = res.status
  ctx.response.body = res.body
})

app.addEventListener('listen', ({ secure, hostname, port }) => {
  if(hostname === '0.0.0.0')
    hostname = 'localhost';

  const protocol = secure ? 'https' : 'http'
  const url = `${protocol}://${hostname ?? 'localhost'}:${port}`

  console.log('☁  Started on ' + url)
})

await app.listen({ port: 3000 })
