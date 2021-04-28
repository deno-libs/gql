import { App } from 'https://deno.land/x/tinyhttp@0.1.0/mod.ts'
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

const app = new App()

app
  .use(
    '/graphql',
    GraphQLHTTP({
      schema,
      graphiql: true
    })
  )
  .listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
