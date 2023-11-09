# gql/graphiql

[![][docs-badge]][docs]

Tweaked version of
[graphql-playground-html](https://github.com/graphql/graphql-playground/tree/main/packages/graphql-playground-html)
without Electron and React environments.

## Get Started

```ts
import { renderPlaygroundPage } from 'https://deno.land/x/gql@2.0.0/graphiql/render.ts'

const playground = renderPlaygroundPage({
  endpoint: '/graphql',
})

return new Response(playground, {
  headers: new Headers({
    'Content-Type': 'text/html',
  }),
})
```

[docs-badge]: https://img.shields.io/github/v/release/deno-libs/gql?label=Docs&logo=deno&style=for-the-badge&color=DD3FAA
[docs]: https://doc.deno.land/https/deno.land/x/gql/graphiql/render.ts
