import { makeFetch } from 'jsr:@deno-libs/superfetch@3.0.0'
import { describe, it } from 'jsr:@std/testing@0.225.3/bdd'
import { buildSchema } from 'npm:graphql@16.10.0'
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
})
