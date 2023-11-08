import {
  createHandler,
  OperationContext,
  RawRequest,
  Status,
  STATUS_TEXT,
} from './deps.ts'
import { GQLOptions } from './types.ts'

function toRequest<Req = Request, Ctx = unknown>(
  req: Pick<Request, 'method' | 'url' | 'headers' | 'text'>,
  context: Ctx,
): RawRequest<Req, Ctx> {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: () => req.text(),
    raw: req as Req,
    context,
  }
}

export function GraphQLHTTP<
  Req = Request,
  Context extends OperationContext = { request: Req },
  ReqCtx extends { request: Req } = { request: Req },
>(
  {
    headers = {},
    graphiql,
    playgroundOptions = {},
    ...options
  }: GQLOptions<Req, ReqCtx, Context>,
  reqCtx?: (req: Req) => ReqCtx,
) {
  const handler = createHandler(options)

  return async function handleRequest(req: Request): Promise<Response> {
    try {
      const accept = req.headers.get('Accept') || ''

      if (
        req.method === 'GET' && graphiql && accept.split(';')[0] === 'text/html'
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
      const [body, init] = await handler(
        toRequest<Req, ReqCtx>(
          req,
          reqCtx ? reqCtx(req as Req) : { request: req } as ReqCtx,
        ),
      )

      return new Response(body || STATUS_TEXT[init.status as Status], {
        ...init,
        headers: new Headers({ ...init.headers, ...headers }),
      })
    } catch (e) {
      console.error(
        'Internal error occurred during request handling. ' +
          'Please check your implementation.',
        e,
      )
      return new Response(null, { status: 500 })
    }
  }
}
