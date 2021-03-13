import { Request } from './types.ts'
import { runHttpQuery, GraphQLParams, GraphQLOptions } from './common.ts'

const dec = new TextDecoder()

export function GraphQLHTTP(options: GraphQLOptions) {
  return async (request: Request) => {
    const body = await Deno.readAll(request.body)

    try {
      const params = JSON.parse(dec.decode(body))

      const result = await runHttpQuery(params, options, { request })

      console.log(result)

      request.respond({ body: JSON.stringify(result, null, 2), status: 200 })
    } catch (e) {
      console.error(e)
      request.respond({ status: 400, body: 'Malformed request body' })
    }
  }
}
