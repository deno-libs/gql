import { opine } from 'https://deno.land/x/opine@1.2.0/mod.ts'
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

const app = opine()

app.use('/graphql', GraphQLHTTP({ schema })).listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
