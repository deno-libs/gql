import { serve, ServerRequest } from 'https://deno.land/std@0.90.0/http/server.ts'
import { GraphQLHTTP, GraphQLSchema, GraphQLObjectType, GraphQLString } from '../mod.ts'

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
  await GraphQLHTTP({ schema })(req)
}
