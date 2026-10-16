import { expect } from '@std/expect'
import { buildSchema } from 'graphql'
import { GraphQLHTTP } from './mod.ts'

const schema = buildSchema('type Query { hello: String }')
const rootValue = { hello: () => 'Hello World!' }

for (
  const headers of [
    { 'X-Custom': 'value' },
    new Headers({ 'X-Custom': 'value' }),
    [['X-Custom', 'value']] as [string, string][],
  ]
) {
  Deno.test(`custom headers support ${headers.constructor.name}`, async () => {
    const app = GraphQLHTTP({ schema, rootValue, headers, graphiql: true })
    const result = await app(
      new Request('http://localhost/graphql?query={hello}'),
    )
    expect(result.status).toBe(200)
    expect(await result.json()).toEqual({ data: { hello: 'Hello World!' } })
    expect(result.headers.get('X-Custom')).toBe('value')
    expect(result.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    )

    const playground = await app(
      new Request('http://localhost/graphql', {
        headers: { Accept: 'text/html' },
      }),
    )
    expect(playground.status).toBe(200)
    expect(playground.headers.get('X-Custom')).toBe('value')
    expect(playground.headers.get('Content-Type')).toBe('text/html')
    await playground.body?.cancel()

    const failingApp = GraphQLHTTP(
      { schema, headers },
      () => Promise.reject(new Error('Synthetic context failure')),
    )
    const failed = await failingApp(
      new Request('http://localhost/graphql?query={hello}'),
    )
    expect(failed.status).toBe(500)
    expect(failed.headers.get('X-Custom')).toBe('value')
    expect(failed.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    )
    expect(await failed.json()).toEqual({
      errors: [{ message: 'Internal server error' }],
    })
  })
}

Deno.test('custom Headers override response headers case-insensitively', async () => {
  const app = GraphQLHTTP({
    schema,
    rootValue,
    headers: new Headers({ 'Content-Type': 'application/custom+json' }),
  })
  const result = await app(
    new Request('http://localhost/graphql?query={hello}'),
  )
  expect(result.headers.get('Content-Type')).toBe('application/custom+json')
  await result.body?.cancel()
})
