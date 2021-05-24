<p align="center" >
<img src="logo.png" width="200" />
</p>

# gql

[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/gql) [![GitHub release (latest by date)][releases]][releases-page] [![GitHub Workflow Status][gh-actions-img]][github-actions]
[![Codecov][codecov-badge]][codecov] [![][docs-badge]][docs]

Universal [GraphQL](https://www.graphql.com/) HTTP middleware for Deno.

## Features

- ✨ Works with `std/http`, [tinyhttp](https://github.com/deno-libs/tinyhttp-deno) and [Opine](https://github.com/asos-craigmorten/opine) out-of-the-box
- ⚡ [GraphQL Playground](https://github.com/graphql/graphql-playground/tree/master/packages/graphql-playground-html) integration (via `graphiql: true`)

## Get started

### Vanilla

The simplest setup with `std/http`:

```ts
import { serve } from 'https://deno.land/std@0.90.0/http/server.ts'
import { GraphQLHTTP } from 'https://deno.land/x/gql/mod.ts'
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools/mod.ts'
import { gql } from 'https://deno.land/x/graphql_tag/mod.ts'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => `Hello World!`
  }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

const s = serve({ port: 3000 })

for await (const req of s) {
  req.url.startsWith('/graphql')
    ? await GraphQLHTTP({
        schema,
        graphiql: true
      })(req)
    : req.respond({
        status: 404
      })
}
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

[releases]: https://img.shields.io/github/v/release/deno-libs/gql?style=flat-square
[docs-badge]: https://img.shields.io/github/v/release/deno-libs/gql?color=yellow&label=Documentation&logo=deno&style=flat-square
[docs]: https://doc.deno.land/https/deno.land/x/gql/mod.ts
[releases-page]: https://github.com/deno-libs/gql/releases
[gh-actions-img]: https://img.shields.io/github/workflow/status/deno-libs/gql/CI?style=flat-square
[codecov]: https://codecov.io/gh/deno-libs/gql
[github-actions]: https://github.com/deno-libs/gql/actions
[codecov-badge]: https://img.shields.io/codecov/c/gh/deno-libs/gql?style=flat-square
