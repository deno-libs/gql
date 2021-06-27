import { opine, Request } from 'https://deno.land/x/opine@1.5.3/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools/mod.ts'
import { gql } from 'https://deno.land/x/graphql_tag/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: (_root: undefined, _args: unknown, ctx: { request: Request }, info: { fieldName: string }) => {
      return `Hello World from ${ctx.request.originalUrl}!. You have called ${info.fieldName}`
    }
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const app = opine()

app
  .use(
    '/graphql',
    GraphQLHTTP<Request>({ schema, context: (request) => ({ request }), graphiql: true })
  )
  .listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
