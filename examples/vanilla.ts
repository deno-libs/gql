import { serve } from 'https://deno.land/std@0.184.0/http/server.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://esm.sh/@graphql-tools/schema@9.0.17?target=deno'
import { gql } from 'https://deno.land/x/graphql_tag@0.1.1/mod.ts'

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

await serve(async (req) => {
  const { pathname } = new URL(req.url)

  return pathname === '/graphql'
    ? await GraphQLHTTP<Request>({
      schema,
      graphiql: true,
    })(req)
    : new Response('Not Found', { status: 404 })
}, {
  port: 3000,
  onListen: ({ hostname, port }) =>
    console.log(`☁  Started on http://${hostname}:${port}`),
})
