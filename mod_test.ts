import { makeFetch } from '@deno-libs/superfetch'
import { describe, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import { buildSchema } from 'graphql'
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
    const fetch = makeFetch(app)

    const res = await fetch('/', {
      headers: { 'Content-Type': 'application/json' },
    })
    res.expectBody({
      'errors': [{ 'message': 'Missing query' }],
    })
    res.expectStatus(400)
  })
  it('should send unsupported media type on empty request body', async () => {
    const fetch = makeFetch(app)

    const res = await fetch('/', {
      method: 'POST',
    })
    res.expectStatus(415)
  })

  it('should send resolved POST GraphQL query', async () => {
    const fetch = makeFetch(app)

    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '\n{\n  hello\n}',
      }),
    })
    res.expectBody({ data: { hello: 'Hello World!' } })
    res.expectStatus(200)
  })

  it('should send resolved GET GraphQL query', async () => {
    const fetch = makeFetch(app)

    const res = await fetch('/?query={hello}')
    res.expectBody({ data: { hello: 'Hello World!' } })
    res.expectStatus(200)
  })

  it('should send resolved GET GraphQL query when Accept is application/json', async () => {
    const fetch = makeFetch(app)

    const res = await fetch('/?query={hello}', {
      headers: { Accept: 'application/json' },
    })
    res.expectBody({ data: { hello: 'Hello World!' } })
    res.expectStatus(200)
    res.expectHeader('Content-Type', 'application/json; charset=utf-8')
  })

  it('should send resolved GET GraphQL query when Accept is */*', async () => {
    const fetch = makeFetch(app)

    const res = await fetch('/?query={hello}', {
      headers: { Accept: '*/*' },
    })
    res.expectBody({ data: { hello: 'Hello World!' } })
    res.expectStatus(200)
    res.expectHeader('Content-Type', 'application/json; charset=utf-8')
  })

  it('should send 406 not acceptable when Accept is other (text/html)', async () => {
    const fetch = makeFetch(app)

    const res = await fetch('/?query={hello}', {
      headers: { Accept: 'text/html' },
    })
    res.expectStatus(406)
    res.expectBody('Not Acceptable')
  })

  it('should send 406 not acceptable when Accept is other (text/css)', async () => {
    const fetch = makeFetch(app)

    const res = await fetch('/?query={hello}', {
      headers: { Accept: 'text/css' },
    })
    res.expectStatus(406)
    res.expectBody('Not Acceptable')
  })

  describe('graphiql', () => {
    it('should allow query GET requests when set to false', async () => {
      const app = GraphQLHTTP({ graphiql: false, schema, rootValue })

      const fetch = makeFetch(app)

      const res = await fetch('/?query={hello}')
      res.expectBody({ data: { hello: 'Hello World!' } })
      res.expectStatus(200)
    })

    it('should allow query GET requests when set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const fetch = makeFetch(app)

      const res = await fetch('/?query={hello}')
      res.expectBody({ data: { hello: 'Hello World!' } })
      res.expectStatus(200)
    })

    it('should send 406 when Accept is only text/html when set to false', async () => {
      const app = GraphQLHTTP({ graphiql: false, schema, rootValue })

      const fetch = makeFetch(app)

      const res = await fetch('/', {
        headers: { Accept: 'text/html' },
      })
      res.expectStatus(406)
      res.expectBody('Not Acceptable')
    })

    it('should render a playground when Accept does include text/html when set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const fetch = makeFetch(app)

      const res = await fetch('/?query={hello}', {
        headers: { Accept: 'text/html;*/*' },
      })
      res.expectStatus(200)
      res.expectHeader('Content-Type', 'text/html')
    })

    it('should render a playground if graphiql is set to true', async () => {
      const app = GraphQLHTTP({ graphiql: true, schema, rootValue })

      const fetch = makeFetch(app)

      const res = await fetch('/', {
        headers: { Accept: 'text/html' },
      })
      res.expectStatus(200)
      res.expectHeader('Content-Type', 'text/html')
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

        const fetch = makeFetch(app)

        const res = await fetch('/', {
          headers: { Accept: 'text/html' },
        })
        res.expectStatus(200)
        res.expectHeader('Content-Type', 'text/html')
        res.expectBody(
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

        const fetch = makeFetch(app)

        const res = await fetch('/', {
          headers: { Accept: 'text/html' },
        })
        res.expectStatus(200)
        res.expectHeader('Content-Type', 'text/html')
        res.expectBody(new RegExp('<title>Hello gql!</title>'))
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

        const fetch = makeFetch(app)

        const res = await fetch('/', {
          headers: { Accept: 'text/html' },
        })
        res.expectStatus(200)
        res.expectHeader('Content-Type', 'text/html')
        res.expectBody(new RegExp('unpkg.com'))
      })
    })
  })

  describe('headers', () => {
    it('should pass custom headers to response', async () => {
      const app = GraphQLHTTP({ schema, rootValue, headers: { Key: 'Value' } })

      const fetch = makeFetch(app)

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '\n{\n  hello\n}',
          variables: {},
          operationName: null,
        }),
      })
      res.expectBody({ data: { hello: 'Hello World!' } })
      res.expectStatus(200)
      res.expectHeader('Key', 'Value')
    })

    it('does not error with empty header object', async () => {
      const app = GraphQLHTTP({ schema, rootValue, headers: {} })

      const fetch = makeFetch(app)

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '\n{\n  hello\n}',
          variables: {},
          operationName: null,
        }),
      })
      res.expectBody({ data: { hello: 'Hello World!' } })
      res.expectStatus(200)
    })
  })

  describe('error handling', () => {
    it('should handle resolver errors gracefully', async () => {
      const badSchema = buildSchema(`
        type Query {
          error: String
        }
      `)

      const badRootValue = {
        error: () => {
          throw new Error('Intentional error')
        },
      }

      const app = GraphQLHTTP({ schema: badSchema, rootValue: badRootValue })
      const fetch = makeFetch(app)

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ error }',
        }),
      })
      res.expectStatus(200)
    })

    it('should catch handler errors and return 500', async () => {
      // @ts-ignore - intentionally passing invalid schema to trigger error
      const app = GraphQLHTTP({ schema: null })
      const fetch = makeFetch(app)

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ hello }',
        }),
      })
      res.expectStatus(500)
      res.expectHeader('Content-Type', 'application/json; charset=utf-8')
      res.expectBody({ errors: [{ message: 'Internal server error' }] })
    })

    it('should apply custom headers to the 500 response', async () => {
      const app = GraphQLHTTP({
        // @ts-ignore - intentionally passing invalid schema to trigger error
        schema: null,
        headers: { Key: 'Value' },
      })
      const fetch = makeFetch(app)

      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ hello }' }),
      })
      res.expectStatus(500)
      res.expectHeader('Key', 'Value')
    })

    it('should hint at a graphql version mismatch on a foreign schema', async () => {
      const logs: string[] = []
      const error = console.error
      console.error = (...args: unknown[]) => void logs.push(String(args[0]))

      try {
        // A plain object reaches graphql's assertSchema the same way a schema
        // built by a second copy of graphql would.
        // @ts-ignore - intentionally passing a non-schema
        const app = GraphQLHTTP({ schema: {} })
        const fetch = makeFetch(app)

        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ hello }' }),
        })
        res.expectStatus(500)
      } finally {
        console.error = error
      }

      expect(logs.join('\n')).toContain('different copy of graphql')
    })

    it('should not add the mismatch hint to unrelated errors', async () => {
      const logs: string[] = []
      const error = console.error
      console.error = (...args: unknown[]) => void logs.push(String(args[0]))

      try {
        // @ts-ignore - intentionally passing invalid schema to trigger error
        const app = GraphQLHTTP({ schema: null })
        const fetch = makeFetch(app)

        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ hello }' }),
        })
        res.expectStatus(500)
      } finally {
        console.error = error
      }

      expect(logs.join('\n')).not.toContain('different copy of graphql')
    })
  })

  describe('reqCtx parameter', () => {
    it('should support custom request context', async () => {
      interface ReqCtx {
        request: Request
        customData: string
      }

      const app = GraphQLHTTP<Request, { request: Request }, ReqCtx>(
        {
          schema,
          rootValue,
        },
        (req: Request) => ({ request: req, customData: 'custom' }),
      )

      const fetch = makeFetch(app)

      const res = await fetch('/?query={hello}')
      res.expectBody({ data: { hello: 'Hello World!' } })
      res.expectStatus(200)
    })

    it('should support async request context', async () => {
      interface ReqCtx {
        request: Request
        asyncData: string
      }

      const app = GraphQLHTTP<Request, { request: Request }, ReqCtx>(
        {
          schema,
          rootValue,
        },
        async (req: Request) => {
          // Simulate async operation like DB query or auth check
          await new Promise((resolve) => setTimeout(resolve, 10))
          return { request: req, asyncData: 'async-value' }
        },
      )

      const fetch = makeFetch(app)

      const res = await fetch('/?query={hello}')
      res.expectBody({ data: { hello: 'Hello World!' } })
      res.expectStatus(200)
    })

    it('should support async context with resolver access', async () => {
      const customSchema = buildSchema(`
        type Query {
          currentUser: String
        }
      `)

      const customRootValue = {
        currentUser: (_args: unknown, context: { userId: string }) => {
          return `User: ${context.userId}`
        },
      }

      const app = GraphQLHTTP(
        {
          schema: customSchema,
          rootValue: customRootValue,
          context: (rawReq) => ({
            userId: rawReq.context.userId,
          }),
        },
        async (req: Request) => {
          // Simulate async auth check
          await new Promise((resolve) => setTimeout(resolve, 5))
          return { request: req, userId: 'user-123' }
        },
      )

      const fetch = makeFetch(app)

      const res = await fetch('/?query={currentUser}')
      res.expectBody({ data: { currentUser: 'User: user-123' } })
      res.expectStatus(200)
    })
  })
})
