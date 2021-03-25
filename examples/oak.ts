import { Application } from 'https://deno.land/x/oak/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { buildSchema } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

const schema = buildSchema(`
type Query {
  hello: String
}
`)

const app = new Application()

app.use((ctx) =>
  GraphQLHTTP({
    schema,
    graphiql: true,
    rootValue: {
      hello: () => `Hello World!`
    }
  })(ctx.request.serverRequest)
)

console.log(`☁  Started on http://localhost:3000`)

await app.listen({ port: 3000 })
