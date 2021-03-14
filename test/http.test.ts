import { superdeno } from 'https://deno.land/x/superdeno@3.0.0/mod.ts'
import { GraphQLHTTP } from '../http.ts'
import { GraphQLSchema, GraphQLString, GraphQLObjectType } from '../deps.ts'
import { describe, it, run } from 'https://deno.land/x/wizard@0.1.0/mod.ts'

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

const app = GraphQLHTTP({ schema })

describe('GraphQLHTTP(opts)', () => {
  it('should send 405 on GET', async () => {
    const request = superdeno(app)

    await request.get('/').expect(405)
  })
  it('should send 400 on malformed request body', async () => {
    const request = superdeno(app)

    await request.post('/').expect(400, 'Malformed request body')
  })
  it('should resolve GraphQL query', async () => {
    const request = superdeno(app)

    await request
      .post('/')
      .send('{ "query": "{ hello }" }')
      .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
  })
})

run()
