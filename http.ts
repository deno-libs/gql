import { Request } from './types.ts'
import { runHttpQuery, GraphQLOptions } from './common.ts'
import { readAll } from 'https://deno.land/std@0.99.0/io/util.ts'

const dec = new TextDecoder()

/**
 * Create a new GraphQL HTTP middleware with schema, context etc
 * @param {GraphQLOptions} options
 *
 * @example
 * ```ts
 * const graphql = await GraphQLHTTP({ schema })
 *
 * for await (const req of s) graphql(req)
 * ```
 */
export function GraphQLHTTP<Req extends Request = Request, Ctx extends { request: Req } = { request: Req }>(
  options: GraphQLOptions<Ctx, Req>
) {
  return async (request: Req) => {
    if (options.graphiql && request.method === 'GET' && request.headers.get('Accept')?.includes('text/html')) {
      const { renderPlaygroundPage } = await import('./graphiql/render.ts')
      const playground = renderPlaygroundPage({ endpoint: '/graphql' })

      await request.respond({
        headers: new Headers({
          'Content-Type': 'text/html'
        }),
        body: playground
      })
    } else {
      if (!['PUT', 'POST', 'PATCH'].includes(request.method)) {
        return await request.respond({
          status: 405,
          body: 'Method Not Allowed'
        })
      } else {
        const body = await readAll(request.body)

        try {
          const result = await runHttpQuery<Req, Ctx>(JSON.parse(dec.decode(body)), options, { request })

          await request.respond({
            body: JSON.stringify(result, null, 2),
            status: 200,
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          })
        } catch (e) {
          console.error(e)
          await request.respond({ status: 400, body: 'Malformed request body' })
        }
      }
    }
  }
}
