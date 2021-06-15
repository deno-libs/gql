import { superdeno } from 'https://deno.land/x/superdeno@4.2.1/mod.ts'
import { GraphQLHTTP } from './http.ts'
import { runHttpQuery } from './common.ts'
import { buildSchema } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'
import { describe, it, expect, run } from 'https://deno.land/x/tincan@0.2.1/mod.ts'
import { ServerRequest } from 'https://deno.land/std@0.99.0/http/server.ts'

const schema = buildSchema(`
type Query {
  hello: String
}
`)

const rootValue = {
  hello: () => 'Hello World!'
}

const app = GraphQLHTTP({ schema, rootValue })

describe('GraphQLHTTP(opts)', () => {
  it('should send 405 on GET', async () => {
    const request = superdeno(app)

    await request.get('/').expect(405)
  })
  it('should send 400 on malformed request body', async () => {
    const request = superdeno(app)

    await request.post('/').expect(400, 'Malformed request body')
  })
  it('should send resolved GraphQL query', async () => {
    const request = superdeno(app)

    await request
      .post('/')
      .send('{ "query": "{ hello }" }')
      .expect(200, '{\n  "data": {\n    "hello": "Hello World!"\n  }\n}')
  })
  it('should pass req obj to server context', async () => {
    type Context = { request: ServerRequest }

    const app = GraphQLHTTP<ServerRequest, Context>({
      schema,
      fieldResolver: (_, __, ctx: Context, info) => {
        if (info.fieldName === 'hello') {
          return `Request from ${ctx.request.url}`
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

    const result = await runHttpQuery<unknown, typeof obj>(
      { query: '{ hello }' },
      {
        schema,
        fieldResolver: (_, __, ctx: typeof obj, info) => {
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
