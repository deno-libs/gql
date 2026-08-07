import { GraphQLHTTP } from '../../mod.ts'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { gql } from '@deno-libs/graphql-tag'

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

export default {
  async fetch(req: Request) {
    const { pathname } = new URL(req.url)

    return pathname === '/graphql'
      ? await GraphQLHTTP<Request>({
        schema,
        graphiql: true,
      })(req)
      : new Response('Not Found', { status: 404 })
  },
}
