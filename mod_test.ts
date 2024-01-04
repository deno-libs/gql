import { superdeno } from 'https://deno.land/x/superdeno@4.8.0/mod.ts?target=deno'
import { describe, it } from 'https://deno.land/std@0.210.0/testing/bdd.ts'
import {
  buildSchema,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'npm:graphql@16.8.1'
import { GraphQLHTTP } from './mod.ts'

const schema = buildSchema(`
  type Query {
    hello: String
  }
`)

const rootValue = {
  hello: () => 'Hello World!',
}

const app = GraphQLHTTP({ schema, rootValue })

describe('GraphQLHTTP({ schema, rootValue })', () => {
  it('should send 400 on malformed request query', async () => {
    const request = superdeno(app)

    await request.get('/').expect(400, {
      'errors': [{ 'message': 'Missing query' }],
    })
  })
  it('should send unsupported media type on empty request body', async () => {
    const request = superdeno(app)

    await request.post('/').expect(415)
  })
  it('should send resolved POST GraphQL query', async () => {
    const request = superdeno(app)

    await request
      .post('/')
      .send({
        'query': '\n{\n  hello\n}',
      })
      .expect(200, { data: { hello: 'Hello World!' } })
  })
  it('should send resolved GET GraphQL query', async () => {
    const request = superdeno(app)

    await request.get('/?query={hello}').expect(
      200,
      { data: { hello: 'Hello World!' } },
    )
  })
  it('should send resolved GET GraphQL query when Accept is application/json', async () => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .set('Accept', 'application/json')
      .expect(200, { data: { hello: 'Hello World!' } })
      .expect('Content-Type', 'application/json; charset=utf-8')
  })
  it('should send resolved GET GraphQL query when Accept is */*', async () => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .set('Accept', '*/*')
      .expect(200, { data: { hello: 'Hello World!' } })
      .expect('Content-Type', 'application/json; charset=utf-8')
  })
  it('should send 406 not acceptable when Accept is other (text/html)', async () => {
    const request = superdeno(app)

    await request.get('/?query={hello}').set('Accept', 'text/html').expect(
      406,
      'Not Acceptable',
    )
  })
  it('should send 406 not acceptable when Accept is other (text/css)', async () => {
    const request = superdeno(app)

    await request.get('/?query={hello}').set('Accept', 'text/css').expect(
      406,
      'Not Acceptable',
    )
  })
  it('should pass req obj to server context', async () => {
    type Context = { request: Request }

    const app = GraphQLHTTP<Request, Context>({
      schema: new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            'hello': {
              type: GraphQLString,
              resolve: (_root, _args, { request: { url } }: Context) =>
                `Request from ${url.slice(url.lastIndexOf('/'))}`,
            },
          },
        }),
      }),
      context: (req) => ({ request: req.raw }),
    })

    const request = superdeno(app)

    await request
      .post('/')
      .send({
        'query': '\n{\n  hello\n}',
        'variables': {},
        'operationName': null,
      })
      .expect(200, { data: { hello: 'Request from /' } })
  })

  describe('graphiql', () => {
    it('should allow query GET requests when set to false', async () => {
      const app = GraphQLHTTP({ graphiql: false, schema, rootValue })

      const request = superdeno(app)

      await request.get('/?query={hello}').expect(
        200,
        { data: { hello: 'Hello World!' } },
      )
    })
    it('should allow query GET requests when set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const request = superdeno(app)

      await request.get('/?query={hello}').expect(
        200,
        { data: { hello: 'Hello World!' } },
      )
    })
    it('should send 406 when Accept is only text/html when set to false', async () => {
      const app = GraphQLHTTP({ graphiql: false, schema, rootValue })

      const request = superdeno(app)

      await request.get('/').set('Accept', 'text/html').expect(
        406,
        'Not Acceptable',
      )
    })
    it('should render a playground when Accept does include text/html when set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const request = superdeno(app)

      await request
        .get('/?query={hello}')
        .set('Accept', 'text/html;*/*')
        .expect(200)
        .expect('Content-Type', 'text/html')
    })
    it('should render a playground if graphiql is set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const request = superdeno(app)

      await request.get('/').set('Accept', 'text/html').expect(200).expect(
        'Content-Type',
        'text/html',
      )
    })
    describe('playgroundOptions', () => {
      it('supports custom favicon', async () => {
        const app = GraphQLHTTP({
          graphiql: true,
          schema,
          rootValue,
          playgroundOptions: {
            faviconUrl: 'https://github.com/favicon.ico',
          },
        })

        const request = superdeno(app)

        await request
          .get('/')
          .set('Accept', 'text/html')
          .expect(200)
          .expect('Content-Type', 'text/html')
          .expect(
            new RegExp(
              '<link rel="shortcut icon" href="https://github.com/favicon.ico" />',
            ),
          )
      })
      it('supports custom title', async () => {
        const app = GraphQLHTTP({
          graphiql: true,
          schema,
          rootValue,
          playgroundOptions: {
            title: 'Hello gql!',
          },
        })

        const request = superdeno(app)

        await request
          .get('/')
          .set('Accept', 'text/html')
          .expect(200)
          .expect('Content-Type', 'text/html')
          .expect(new RegExp('<title>Hello gql!</title>'))
      })
      it('adds React CDN links if env is React', async () => {
        const app = GraphQLHTTP({
          graphiql: true,
          schema,
          rootValue,
          playgroundOptions: {
            cdnUrl: 'https://unpkg.com',
          },
        })

        const request = superdeno(app)

        await request
          .get('/')
          .set('Accept', 'text/html')
          .expect(200)
          .expect('Content-Type', 'text/html')
          .expect(new RegExp('https://unpkg.com'))
      })
    })
  })
  describe('headers', () => {
    it('should pass custom headers to response', async () => {
      const app = GraphQLHTTP({ schema, rootValue, headers: { Key: 'Value' } })

      const request = superdeno(app)

      await request
        .post('/')
        .send({
          'query': '\n{\n  hello\n}',
          'variables': {},
          'operationName': null,
        })
        .expect(200, { data: { hello: 'Hello World!' } })
        .expect('Key', 'Value')
    })
    it('does not error with empty header object', async () => {
      const app = GraphQLHTTP({ schema, rootValue, headers: {} })

      const request = superdeno(app)

      await request
        .post('/')
        .send({
          'query': '\n{\n  hello\n}',
          'variables': {},
          'operationName': null,
        })
        .expect(200, { data: { hello: 'Hello World!' } })
    })
  })
})
