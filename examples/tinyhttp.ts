import { App } from 'https://deno.land/x/tinyhttp/mod.ts'
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

const app = new App()

app.post('/graphql', GraphQLHTTP({ schema })).listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
