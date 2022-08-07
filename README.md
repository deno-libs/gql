<div align="center">
  <img src="https://raw.githubusercontent.com/deno-libs/gql/master/logo.png" width="200px" />
  <br /><br />

[![nest badge][nest-badge]](https://nest.land/package/gql) [![GitHub Workflow Status][gh-actions-img]][github-actions]
[![Codecov][cov-badge]][cov] [![][docs-badge]][docs] [![][code-quality-img]][code-quality]

</div>

# gql

Universal [GraphQL](https://www.graphql.com/) HTTP middleware for Deno.

## Features

- ✨ Works with `std/http` and [Opine](https://github.com/asos-craigmorten/opine) out-of-the-box
- ⚡ [GraphQL Playground](https://github.com/graphql/graphql-playground/tree/master/packages/graphql-playground-html) integration (via `graphiql: true`)

## Get started

### Vanilla

The simplest setup with `std/http`:

```ts
import { Server } from 'https://deno.land/std@0.148.0/http/server.ts'
import { GraphQLHTTP } from '../mod.ts'
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools@0.0.2/mod.ts'
import { gql } from 'https://deno.land/x/graphql_tag@0.0.1/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = { Query: { hello: () => `Hello World!` } }

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url)

    return pathname === '/graphql'
      ? await GraphQLHTTP<Request>({
          schema: makeExecutableSchema({ resolvers, typeDefs }),
          graphiql: true
        })(req)
      : new Response('Not Found', { status: 404 })
  },
  addr: ':3000'
})

s.listenAndServe()
```

Then run:

```sh
$ curl -X POST localhost:3000/graphql -d '{ "query": "{ hello }" }'
{
  "data": {
    "hello": "Hello World!"
  }
}
```

Or in [GraphQL Playground](https://localhost:3000/graphql):

![image](https://user-images.githubusercontent.com/35937217/112218821-4133c800-8c35-11eb-984a-5c21fa71c229.png)

[docs-badge]: https://img.shields.io/github/v/release/deno-libs/gql?label=Docs&logo=deno&style=for-the-badge&color=DD3FAA
[docs]: https://doc.deno.land/https/deno.land/x/gql/mod.ts
[gh-actions-img]: https://img.shields.io/github/workflow/status/deno-libs/gql/CI?style=for-the-badge&logo=github&label=&color=DD3FAA
[github-actions]: https://github.com/deno-libs/gql/actions
[cov]: https://coveralls.io/github/deno-libs/gql
[cov-badge]: https://img.shields.io/coveralls/github/deno-libs/gql?style=for-the-badge&color=DD3FAA
[nest-badge]: https://img.shields.io/badge/publushed%20on-nest.land-DD3FAA?style=for-the-badge
[code-quality-img]: https://img.shields.io/codefactor/grade/github/deno-libs/gql?style=for-the-badge&color=DD3FAA
[code-quality]: https://www.codefactor.io/repository/github/deno-libs/gql
