import { Application, NativeRequest } from 'https://deno.land/x/oak@v10.1.0/mod.ts'
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
    hello: (_root: undefined, _args: unknown, ctx: { request: NativeRequest }) => {
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

app.use(async (ctx, next) => {
  if(!ctx.request.url.pathname.startsWith('/graphql'))
    return next()

  const req: NativeRequest & { json(): Promise<unknown> } = Object.assign(
    ctx.request.originalRequest,
    {
      async json(): Promise<unknown> {
        if(!ctx.request.hasBody)
          return null
    
        return await ctx.request.body({ type: 'json' }).value
      }
    })

  const res = await resolve(req)

  for(const [k, v] of res.headers.entries())
    ctx.response.headers.append(k, v)

  ctx.response.status = res.status

  ctx.response.body = await res.text()
})

console.log(`☁  Started on http://localhost:3000`)

await app.listen({ port: 3000 })
