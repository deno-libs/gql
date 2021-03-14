import { Request } from './types.ts'
import { runHttpQuery, GraphQLParams, GraphQLOptions } from './common.ts'

const dec = new TextDecoder()

export function GraphQLHTTP(options: GraphQLOptions) {
  return async (request: Request) => {
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

        const result = await runHttpQuery(params, options, { request })

        request.respond({ body: JSON.stringify(result, null, 2), status: 200 })
      } catch (e) {
        console.error(e)
        request.respond({ status: 400, body: 'Malformed request body' })
      }
    }
  }
}
