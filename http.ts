import { runHttpQuery } from './common.ts'
import type { GQLOptions, GQLRequest, GraphQLParams } from './types.ts'
import { renderPlaygroundPage } from './graphiql/render.ts';

/**
 * Create a new GraphQL HTTP middleware with schema, context etc
 * @param {GQLOptions} options
 *
 * @example
 * ```ts
 * const graphql = await GraphQLHTTP({ schema })
 *
 * for await (const req of s) graphql(req)
 * ```
 */
export function GraphQLHTTP<
  Req extends GQLRequest = GQLRequest,
  Ctx extends { request: Req } = { request: Req },
>({
  playgroundOptions = {},
  headers = {},
  ...options
}: GQLOptions<Ctx, Req>) {
  return async (request: Req) => {
    const accept = request.headers.get('Accept') || ''
    console.log('[INFO]', accept)

    const typeList = ['text/html', 'text/plain', 'application/json', '*/*']
      .map((contentType) => ({
        contentType,
        index: accept.indexOf(contentType),
      }))
      .filter(({ index }) => index >= 0)
      .sort((a, b) => a.index - b.index)
      .map(({ contentType }) => contentType)

    console.log('[INFO]', typeList.join(', '))
    if (accept && !typeList.length) {
      return new Response('Not Acceptable', {
        status: 406,
        headers: new Headers(headers),
      })
    } else if (!['GET', 'PUT', 'POST', 'PATCH'].includes(request.method)) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: new Headers(headers),
      })
    }

    console.log('[INFO] PARAMS TIME', 'params time');
    let params: Promise<GraphQLParams>

    if (request.method === 'GET') {
      console.log('[INFO] URL', request.url)
      const urlQuery = request.url.substring(request.url.indexOf('?'))
      console.log('[INFO] URL QUERY', urlQuery)
      const queryParams = new URLSearchParams(urlQuery)
      console.log('[INFO] SEARCH', queryParams)

      if (
        options.graphiql && typeList[0] === 'text/html' &&
        !queryParams.has('raw')
      ) {
        console.log('[INFO]', 'BEFORE IMPORT')
        console.log('[INFO]', 'AFTER IMPORT')
        const playground = renderPlaygroundPage({
          ...playgroundOptions,
          endpoint: '/graphql',
        })
        console.log('[INFO]', 'AFTER PLAYGROUND')

        console.log('[INFO]', 'RETURN RESPONSE')
        return new Response(playground, {
          headers: new Headers({
            'Content-Type': 'text/html',
            ...headers,
          }),
        })
      } else if (typeList.length === 1 && typeList[0] === 'text/html') {
        return new Response('Not Acceptable', {
          status: 406,
          headers: new Headers(headers),
        })
      } else if (queryParams.has('query')) {
        params = Promise.resolve(
          { query: queryParams.get('query') } as GraphQLParams,
        )
      } else {
        params = Promise.reject(new Error('No query given!'))
      }
    } else if (typeList.length === 1 && typeList[0] === 'text/html') {
      return new Response('Not Acceptable', {
        status: 406,
        headers: new Headers(headers),
      })
    } else {
      params = request.json()
    }

    console.log('[INFO]', 'finished if conditions')

    try {
      console.log('[INFO]', 'RUN QUERY')
      const result = await runHttpQuery<Req, Ctx>(await params, options, {
        request,
      })

      console.log('[INFO]', result)
      let contentType = 'text/plain'

      if (
        !typeList.length || typeList.includes('application/json') ||
        typeList.includes('*/*')
      ) {
        contentType = 'application/json'
      }

      return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: new Headers({
          'Content-Type': contentType,
          ...headers,
        }),
      })
    } catch (e) {
      console.log('[ERROR] deno', e)
      // console.error(e)
      return new Response(
        'Malformed Request ' + (request.method === 'GET' ? 'Query' : 'Body'),
        {
          status: 400,
          headers: new Headers(headers),
        },
      )
    }
  }
}
