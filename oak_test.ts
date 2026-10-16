import { expect } from '@std/expect'
import { app } from './examples/oak.ts'

Deno.test('Oak example serves the playground on GET', async () => {
  const res = await app.handle(
    new Request('http://localhost/graphql', {
      headers: { Accept: 'text/html' },
    }),
  )
  expect(res?.status).toBe(200)
  expect(res?.headers.get('Content-Type')).toBe('text/html')
  expect(await res?.text()).toContain('GraphQL Playground')
})

Deno.test('Oak example forwards HEAD to the GraphQL handler', async () => {
  const res = await app.handle(
    new Request('http://localhost/graphql', { method: 'HEAD' }),
  )
  expect(res?.status).toBe(405)
  await res?.body?.cancel()
})

for (const method of ['GET', 'POST']) {
  Deno.test(`Oak example ${method}`, async () => {
    const res = await app.handle(
      new Request(
        'http://localhost/graphql?query={hello}',
        method === 'POST'
          ? {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{hello}' }),
          }
          : { method },
      ),
    )
    expect(res?.status).toBe(200)
    expect(await res?.json()).toEqual({
      data: { hello: 'Hello from http://localhost/graphql?query={hello}' },
    })
  })
}
