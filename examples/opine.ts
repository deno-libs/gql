import { opine } from 'https://deno.land/x/opine@1.2.0/mod.ts'
import { GraphQLHTTP } from '../mod.ts'
import { buildSchema } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

const schema = buildSchema(`
type Query {
  hello: String
}
`)

const app = opine()

app
  .use(
    '/graphql',
    GraphQLHTTP({
      schema,
      rootValue: {
        hello: () => 'Hello World!'
      }
    })
  )
  .listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
