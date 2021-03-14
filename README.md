<p align="center" >
<img src="logo.png" width="200" />
</p>

# gql

[![GitHub release (latest by date)][releases]][releases-page] [![][docs-badge]][docs]

Universal [GraphQL](https://www.graphql.com/) HTTP middleware for Deno.

## Features

- supports vanilla, tinyhttp and any other backend framework
- re-exports GraphQL interfaces from `graphql_deno`

## Examples

### Vanilla

```ts
import { serve, ServerRequest } from 'https://deno.land/std@0.90.0/http/server.ts'
import { GraphQLHTTP, GraphQLSchema, GraphQLObjectType, GraphQLString } from 'https://deno.land/x/gql/mod.ts'

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

const s = serve({ port: 3000 })

for await (const req of s) {
  await GraphQLHTTP({ schema })(req)
}
```

### [tinyhttp](https://github.com/talentlessguy/tinyhttp-deno)

```ts
import { App, Request } from 'https://deno.land/x/tinyhttp/mod.ts'
import { GraphQLHTTP, GraphQLSchema, GraphQLObjectType, GraphQLString } from 'https://deno.land/x/gql/mod.ts'

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

[releases]: https://img.shields.io/github/v/release/deno-libs/gql?style=flat-square
[docs-badge]: https://img.shields.io/github/v/release/deno-libs/gql?color=yellow&label=Documentation&logo=deno&style=flat-square
[docs]: https://doc.deno.land/https/deno.land/x/gql/mod.ts
[releases-page]: https://github.com/deno-libs/gql/releases
