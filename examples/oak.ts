import { Application } from 'https://deno.land/x/oak/mod.ts'
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
    hello: () => `Hello World!`
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const app = new Application()

app.use((ctx) =>
  GraphQLHTTP({
    schema,
    graphiql: true
  })(ctx.request.serverRequest)
)

console.log(`☁  Started on http://localhost:3000`)

await app.listen({ port: 3000 })
