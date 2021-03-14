import { App } from 'https://deno.land/x/tinyhttp/mod.ts'
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

const app = new App()

app.post('/graphql', GraphQLHTTP({ schema })).listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
