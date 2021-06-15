import { Application } from 'https://deno.land/x/abc@v1.3.2/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools@0.0.1/mod.ts'
import { gql } from 'https://deno.land/x/graphql_tag@0.0.1/mod.ts'

const app = new Application()

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (_root: undefined, _args: unknown, ctx: { request: Request }, info: { fieldName: string }) => {
      return `Hello World from ${ctx.request.url}!. You have called ${info.fieldName}`
    }
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

console.log(`☁  Started on http://localhost:3000`)

app
  .use((next) => {
    return async (ctx) => {
      if (ctx.request.url.startsWith('/graphql')) {
        return await GraphQLHTTP({ schema, graphiql: true })(ctx.request)
      } else next(ctx)
    }
  })
  .start({ port: 3000 })
