import { serve, ServerRequest } from 'https://deno.land/std@0.100.0/http/server.ts'
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
    hello: () => `Hello World!`
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const s = serve({ port: 3000 })

for await (const req of s) {
  req.url.startsWith('/graphql')
    ? await GraphQLHTTP<ServerRequest>({
        schema,
        graphiql: true
      })(req)
    : req.respond({
        status: 404
      })
}
