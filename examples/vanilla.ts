import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'npm:@graphql-tools/schema@10.0.0'
import { gql } from 'https://deno.land/x/graphql_tag@0.1.2/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => `Hello World!`,
  },
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

Deno.serve({
  port: 3000,
  onListen({ hostname, port }) {
    console.log(`☁  Started on http://${hostname}:${port}`)
  },
}, async (req) => {
  const { pathname } = new URL(req.url)
  return pathname === '/graphql'
    ? await GraphQLHTTP<Request>({
      schema,
      graphiql: true,
    })(req)
    : new Response('Not Found', { status: 404 })
})
