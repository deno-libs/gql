<p align="center" >
<img src="logo.png" width="200" />
</p>

# gql

[![GitHub release (latest by date)][releases]][releases-page] [![GitHub Workflow Status][gh-actions-img]][github-actions]
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
import { buildSchema } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

const schema = buildSchema(`
type Query {
  hello: String
}
`)

const s = serve({ port: 3000 })

for await (const req of s) {
  req.url.startsWith('/graphql')
    ? await GraphQLHTTP({
        schema,
        rootValue: {
          hello: () => 'Hello World!'
        },
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

## Donate

[![PayPal](https://img.shields.io/badge/PayPal-cyan?style=flat-square&logo=paypal)](https://paypal.me/v1rtl) [![ko-fi](https://img.shields.io/badge/kofi-pink?style=flat-square&logo=ko-fi)](https://ko-fi.com/v1rtl) [![Qiwi](https://img.shields.io/badge/qiwi-white?style=flat-square&logo=qiwi)](https://qiwi.com/n/V1RTL) [![Yandex Money](https://img.shields.io/badge/Yandex_Money-yellow?style=flat-square&logo=yandex)](https://money.yandex.ru/to/410014774355272)

[![Bitcoin](https://badge-crypto.vercel.app/api/badge?coin=btc&address=3PxedDftWBXujWtr7TbWQSiYTsZJoMD8K5)](https://badge-crypto.vercel.app/btc/3PxedDftWBXujWtr7TbWQSiYTsZJoMD8K5) [![Ethereum](https://badge-crypto.vercel.app/api/badge?coin=eth&address=0x9d9236DC024958D7fB73Ad9B178BD5D372D82288)
](https://badge-crypto.vercel.app/eth/0x9d9236DC024958D7fB73Ad9B178BD5D372D82288) [![ChainLink](https://badge-crypto.vercel.app/api/badge?coin=link&address=0x9d9236DC024958D7fB73Ad9B178BD5D372D82288)](https://badge-crypto.vercel.app/link/0xcd0da1c9b0DA7D2b862bbF813cB50f76F2fB4F5d)

[releases]: https://img.shields.io/github/v/release/deno-libs/gql?style=flat-square
[docs-badge]: https://img.shields.io/github/v/release/deno-libs/gql?color=yellow&label=Documentation&logo=deno&style=flat-square
[docs]: https://doc.deno.land/https/deno.land/x/gql/mod.ts
[releases-page]: https://github.com/deno-libs/gql/releases
[gh-actions-img]: https://img.shields.io/github/workflow/status/deno-libs/gql/CI?style=flat-square
[codecov]: https://codecov.io/gh/deno-libs/gql
[github-actions]: https://github.com/deno-libs/gql/actions
[codecov-badge]: https://img.shields.io/codecov/c/gh/deno-libs/gql?style=flat-square
