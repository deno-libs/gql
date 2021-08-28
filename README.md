<div align="center">
  <img src="https://raw.githubusercontent.com/deno-libs/gql/master/logo.png" width="200px" />
  <br /><br />

[![nest badge][nest-badge]](https://nest.land/package/gql) [![GitHub Workflow Status][gh-actions-img]][github-actions]
[![Codecov][cov-badge]][cov] [![][docs-badge]][docs] [![][code-quality-img]][code-quality]

</div>

# gql

Universal [GraphQL](https://www.graphql.com/) HTTP middleware for Deno.

## Features

- ✨ Works with `std/http`, [tinyhttp](https://github.com/deno-libs/tinyhttp-deno) and [Opine](https://github.com/asos-craigmorten/opine) out-of-the-box
- ⚡ [GraphQL Playground](https://github.com/graphql/graphql-playground/tree/master/packages/graphql-playground-html) integration (via `graphiql: true`)

## Donate

[![DEV](https://badge.devprotocol.xyz/0xcEAddcD2D86A348163EB2385e8fA76776d0DBf6e)](https://stakes.social/0xcEAddcD2D86A348163EB2385e8fA76776d0DBf6e)

**🎁 FIRST 10 PATRONS WILL RECEIVE BONUS 5 DEV 🎁**

Reward status: waiting for gas fees to get at least to 20-25 gwei

- `0xB3ebEe9d3E0bad437B75f4678D390c0d9608daF5` [pending]
- `0xAb0658c66670d93BF47B4b8D5797edD0a60F43A0` [pending]

The best way to support the project is to do staking on **[stakes.social](https://stakes.social/0xcEAddcD2D86A348163EB2385e8fA76776d0DBf6e)**. Note that you also get rewarded by staking, as well as the project author.

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

[docs-badge]: https://img.shields.io/github/v/release/deno-libs/gql?label=Docs&logo=deno&style=for-the-badge&color=DD3FAA
[docs]: https://doc.deno.land/https/deno.land/x/gql/mod.ts
[gh-actions-img]: https://img.shields.io/github/workflow/status/deno-libs/gql/CI?style=for-the-badge&logo=github&label=&color=DD3FAA
[github-actions]: https://github.com/deno-libs/gql/actions
[cov]: https://coveralls.io/github/deno-libs/gql
[cov-badge]: https://img.shields.io/coveralls/github/deno-libs/gql?style=for-the-badge&color=DD3FAA
[nest-badge]: https://img.shields.io/badge/publushed%20on-nest.land-DD3FAA?style=for-the-badge
[code-quality-img]: https://img.shields.io/codefactor/grade/github/deno-libs/gql?style=for-the-badge&color=DD3FAA
[code-quality]: https://www.codefactor.io/repository/github/deno-libs/gql
