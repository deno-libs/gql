import { serve } from 'https://deno.land/std@0.90.0/http/server.ts'
import { GraphQLHTTP } from '../mod.ts'
import { buildSchema } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

const schema = buildSchema(`
type Query {
  hello: String
}
`)

const s = serve({ port: 3000 })

for await (const req of s) {
  await GraphQLHTTP({
    schema,
    rootValue: {
      hello: () => 'Hello World!'
    },
    graphiql: true
  })(req)
}
