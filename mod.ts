import { createHandler, RawRequest } from './deps.ts'
import { GQLOptions } from './types.ts'

function toRequest<Req extends Request = Request>(
  req: Request,
): RawRequest<Req, unknown> {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: () => req.text(),
    raw: req as Req,
    context: {},
  }
}

export function GraphQLHTTP<Req extends Request = Request>(
  { schema, context, headers = {}, graphiql, playgroundOptions, ...options }:
    GQLOptions<Req>,
) {
  const handler = createHandler({
    schema,
    context,
    ...options,
  })

  return async function handleRequest(req: Request): Promise<Response> {
    try {
      const accept = req.headers.get('Accept') || ''

      const typeList = ['text/html', 'text/plain', 'application/json', '*/*']
        .map((contentType) => ({
          contentType,
          index: accept.indexOf(contentType),
        }))
        .filter(({ index }) => index >= 0)
        .sort((a, b) => a.index - b.index)
        .map(({ contentType }) => contentType)

      if (
        req.method === 'GET' && graphiql && typeList[0] === 'text/html'
      ) {
        const urlQuery = req.url.substring(req.url.indexOf('?'))
        const queryParams = new URLSearchParams(urlQuery)

        if (!queryParams.has('raw')) {
          const { renderPlaygroundPage } = await import('./graphiql/render.ts')
          const playground = renderPlaygroundPage({
            ...playgroundOptions,
            endpoint: '/graphql',
          })

          return new Response(playground, {
            headers: new Headers({
              'Content-Type': 'text/html',
              ...headers,
            }),
          })
        }
      }
      const [body, init] = await handler(toRequest(req))

      return new Response(body, {
        ...init,
        headers: new Headers({ ...init.headers, ...headers }),
      })
    } catch (e) {
      console.error(e)
      return new Response(
        'Malformed Request ' + (req.method === 'GET' ? 'Query' : 'Body'),
        {
          status: 400,
          headers: new Headers(headers),
        },
      )
    }
  }
}
