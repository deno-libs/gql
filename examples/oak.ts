import { Application, ServerRequest } from 'https://deno.land/x/oak@v7.7.0/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools@0.0.1/mod.ts'
import { gql } from 'https://deno.land/x/graphql_tag@0.0.1/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (_root: any, _args: any, ctx: { request: ServerRequest }) => {
      return `Hello World! from ${ctx.request.url}`
    }
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const app = new Application()

app.use(async (ctx) => {
  return await GraphQLHTTP<ServerRequest>({
    schema,
    graphiql: true
  })(ctx.request.originalRequest as ServerRequest)
})

console.log(`☁  Started on http://localhost:3000`)

await app.listen({ port: 3000 })
