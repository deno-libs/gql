import { serve, ServerRequest } from 'https://deno.land/std@0.90.0/http/server.ts'
import { GraphQLHTTP } from '../mod.ts'
import { GraphQLSchema, GraphQLString, GraphQLObjectType } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'Hello World!'
        }
      }
    }
  })
})

const s = serve({ port: 3000 })

for await (const req of s) {
  await GraphQLHTTP<ServerRequest>({ schema })(req)
}
