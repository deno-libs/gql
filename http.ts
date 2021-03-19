import { Request } from './types.ts'
import { runHttpQuery, GraphQLOptions } from './common.ts'

const dec = new TextDecoder()

/**
 * Create a new GraphQL HTTP middleware with schema, context etc
 * @param {GraphQLOptions} options
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
    if (!['PUT', 'POST', 'PATCH'].includes(request.method)) {
      request.respond({
        status: 405,
        body: 'Method Not Allowed'
      })
      return
    } else {
      const body = await Deno.readAll(request.body)

      try {
        const params = JSON.parse(dec.decode(body))

        const result = await runHttpQuery<Req, Ctx>(params, options, {
          request
        })

        request.respond({ body: JSON.stringify(result, null, 2), status: 200 })
      } catch (e) {
        console.error(e)
        request.respond({ status: 400, body: 'Malformed request body' })
      }
    }
  }
}
