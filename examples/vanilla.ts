import { Server } from 'https://deno.land/std@0.122.0/http/server.ts'
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

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url)

    return pathname === '/graphql'
      ? await GraphQLHTTP<Request>({
          schema,
          graphiql: true
        })(req)
      : new Response('Not Found', { status: 404 })
  },
  port: 3000
})

s.listenAndServe()

console.log(`☁  Started on http://localhost:3000`)
