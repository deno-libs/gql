import { superdeno } from 'https://deno.land/x/superdeno@4.8.0/mod.ts'
import { GraphQLHTTP } from './http.ts'
import { runHttpQuery } from './common.ts'
import { buildSchema, GraphQLResolveInfo } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'
import { describe, it, expect, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts'

const schema = buildSchema(`
type Query {
  hello: String
}
`)

const rootValue = {
  hello: () => 'Hello World!'
}

const app = GraphQLHTTP({ schema, rootValue })

describe('GraphQLHTTP({ schema, rootValue })', () => {
  it('should send 400 on malformed request query', async () => {
    const request = superdeno(app)

    await request.get('/').expect(400, 'Malformed Request Query')
  })
  it('should send 400 on malformed request body', async () => {
    const request = superdeno(app)

    await request.post('/').expect(400, 'Malformed Request Body')
  })
  it('should send resolved POST GraphQL query', async () => {
    const request = superdeno(app)

    await request
      .post('/')
      .send('{ "query": "{ hello }" }')
      .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
  })
  it('should send resolved GET GraphQL query', async () => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
  })
  it('should send resolved GET GraphQL query when Accept is application/json', async () => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .set('Accept', 'application/json')
      .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
      .expect('Content-Type', 'application/json')
  })
  it('should send resolved GET GraphQL query when Accept is */*', async() => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .set('Accept', '*/*')
      .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
      .expect('Content-Type', 'application/json')
    })
      
  it('should send resolved GET GraphQL query when Accept is text/plain', async() => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .set('Accept', 'text/plain')
      .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
      .expect('Content-Type', 'text/plain')
  })
  it('should send 406 not acceptable when Accept is other (text/html)', async () => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .set('Accept', 'text/html')
      .expect(406, 'Not Acceptable')
  });
  it('should send 406 not acceptable when Accept is other (text/css)', async () => {
    const request = superdeno(app)

    await request
      .get('/?query={hello}')
      .set('Accept', 'text/css')
      .expect(406, 'Not Acceptable')
  })
  it('should pass req obj to server context', async () => {
    type Context = { request: Request }

    const app = GraphQLHTTP<Request, Context>({
      schema,
      fieldResolver: (_: any, __: any, { request: { url } }: Context, info: any) => {
        if (info.fieldName === 'hello') {
          return `Request from ${url.slice(url.lastIndexOf('/'))}`
        }
      },
      context: (request) => ({ request })
    })

    const request = superdeno(app)

    await request
      .post('/')
      .send('{ "query": "{ hello }" }')
      .expect(200, '{\n  "data": {\n    "hello": "Request from /"\n  }\n}')
  })

  describe('graphiql', () => {
    it('should allow query GET requests when set to false', async () => {
      const app = GraphQLHTTP({ graphiql: false, schema, rootValue })

      const request = superdeno(app)

      await request.get('/?query={hello}').expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
    })
    it('should allow query GET requests when set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const request = superdeno(app)

      await request.get('/?query={hello}').expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
    })
    it('should send 406 when Accept is only text/html when set to false', async () => {
      const app = GraphQLHTTP({ graphiql: false, schema, rootValue })

      const request = superdeno(app)

      await request.get('/').set('Accept', 'text/html').expect(406, 'Not Acceptable')
    })
    it('should render a playground when Accept does include text/html when set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const request = superdeno(app)

      await request.get('/?query={hello}').set('Accept', 'text/html;*/*').expect(200).expect('Content-Type', 'text/html')
    })
    it('should render a playground if graphiql is set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const request = superdeno(app)

      await request.get('/').set('Accept', 'text/html').expect(200).expect('Content-Type', 'text/html')
    })
    describe('playgroundOptions', () => {
      it('supports custom favicon', async () => {
        const app = GraphQLHTTP({
          graphiql: true,
          schema,
          rootValue,
          playgroundOptions: {
            faviconUrl: 'https://github.com/favicon.ico'
          }
        })

        const request = superdeno(app)

        await request
          .get('/')
          .set('Accept', 'text/html')
          .expect(200)
          .expect('Content-Type', 'text/html')
          .expect(new RegExp('<link rel="shortcut icon" href="https://github.com/favicon.ico" />'))
      })
      it('supports custom title', async () => {
        const app = GraphQLHTTP({
          graphiql: true,
          schema,
          rootValue,
          playgroundOptions: {
            title: 'Hello gql!'
          }
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
            cdnUrl: 'https://unpkg.com'
          }
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
        .send('{ "query": "{ hello }" }')
        .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
        .expect('Key', 'Value')
    })
    it('does not error with empty header object', async () => {
      const app = GraphQLHTTP({ schema, rootValue, headers: {} })

      const request = superdeno(app)

      await request
        .post('/')
        .send('{ "query": "{ hello }" }')
        .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
    })
  })
})

describe('runHttpQuery(params, options, context)', () => {
  it('should resolve GraphQL query', async () => {
    const result = await runHttpQuery(
      {
        query: '{ hello }'
      },
      { schema, rootValue }
    )

    expect(result.data).toEqual({ hello: 'Hello World!' })

    expect(result.errors).toEqual(undefined)
  })
  it('should send errors on incorrect query', async () => {
    const result = await runHttpQuery(
      {
        query: '{ world }'
      },
      { schema }
    )

    expect(result.data).toEqual(undefined)

    expect(result.errors?.[0].message).toBe('Cannot query field "world" on type "Query".')
  })
  it('should use properties passed to context', async () => {
    const obj = { a: 'Context prop' }

    const result = await runHttpQuery<Request, typeof obj>(
      { query: '{ hello }' },
      {
        schema,
        fieldResolver: (_: unknown, __: unknown, ctx: typeof obj, info: GraphQLResolveInfo) => {
          if (info.fieldName === 'hello') {
            return ctx.a
          }
        }
      },
      obj
    )

    expect(result.data).toEqual({ hello: 'Context prop' })
  })
})

run()
