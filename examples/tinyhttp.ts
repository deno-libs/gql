import { App, Request } from 'https://deno.land/x/tinyhttp@0.1.19/mod.ts'
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
    hello: () => `Hello World!`
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const app = new App()

app
  .use(
    '/graphql',
    GraphQLHTTP<Request>({
      schema,
      graphiql: true
    })
  )
  .listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
