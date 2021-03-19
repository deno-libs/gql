<p align="center" >
<img src="logo.png" width="200" />
</p>

# gql

[![GitHub release (latest by date)][releases]][releases-page] [![GitHub Workflow Status][gh-actions-img]][github-actions]
[![Codecov][codecov-badge]][codecov] [![][docs-badge]][docs]

Universal [GraphQL](https://www.graphql.com/) HTTP middleware for Deno.

## Examples

### Vanilla

```ts
import { serve } from 'https://deno.land/std@0.90.0/http/server.ts'
import { GraphQLHTTP } from 'https://deno.land/x/gql/mod.ts'
import { GraphQLSchema, GraphQLString, GraphQLObjectType } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

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

for await (const req of serve({ port: 3000 })) {
  await GraphQLHTTP({ schema })(req)
}
```

### [tinyhttp](https://github.com/talentlessguy/tinyhttp-deno)

```ts
import { App } from 'https://deno.land/x/tinyhttp/mod.ts'
import { GraphQLHTTP } from 'https://deno.land/x/gql/mod.ts'
import { GraphQLSchema, GraphQLString, GraphQLObjectType } from 'https://deno.land/x/graphql_deno@v15.0.0/mod.ts'

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

const app = new App()

app.post('/graphql', GraphQLHTTP({ schema }))

app.listen(3000, () => console.log(`☁  Started on http://localhost:3000`))
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

## Donate

[![PayPal](https://img.shields.io/badge/PayPal-cyan?style=flat-square&logo=paypal)](https://paypal.me/v1rtl) [![ko-fi](https://img.shields.io/badge/kofi-pink?style=flat-square&logo=ko-fi)](https://ko-fi.com/v1rtl) [![Qiwi](https://img.shields.io/badge/qiwi-white?style=flat-square&logo=qiwi)](https://qiwi.com/n/V1RTL) [![Yandex Money](https://img.shields.io/badge/Yandex_Money-yellow?style=flat-square&logo=yandex)](https://money.yandex.ru/to/410014774355272) [![Bitcoin](https://img.shields.io/badge/bitcoin-Donate-yellow?style=flat-square&logo=bitcoin)](https://en.cryptobadges.io/donate/3PxedDftWBXujWtr7TbWQSiYTsZJoMD8K5) [![Ethereu,](https://img.shields.io/badge/ethereum-Donate-cyan?style=flat-square&logo=ethereum)](https://vittominacori.github.io/ethereum-badge/detail.html?address=0x9d9236DC024958D7fB73Ad9B178BD5D372D82288)

[releases]: https://img.shields.io/github/v/release/deno-libs/gql?style=flat-square
[docs-badge]: https://img.shields.io/github/v/release/deno-libs/gql?color=yellow&label=Documentation&logo=deno&style=flat-square
[docs]: https://doc.deno.land/https/deno.land/x/gql/mod.ts
[releases-page]: https://github.com/deno-libs/gql/releases
[gh-actions-img]: https://img.shields.io/github/workflow/status/deno-libs/gql/CI?style=flat-square
[codecov]: https://codecov.io/gh/deno-libs/gql
[github-actions]: https://github.com/deno-libs/gql/actions
[codecov-badge]: https://img.shields.io/codecov/c/gh/deno-libs/gql?style=flat-square
