import {
  accepts,
  createHandler,
  type OperationContext,
  type RawRequest,
  STATUS_TEXT,
  type StatusCode,
} from './deps.ts'
import type { GQLOptions } from './types.ts'

/**
 * graphql refuses to work with a schema built by a different copy of itself,
 * which is the usual outcome of a major graphql upgrade on either side. The
 * raw assertion says nothing about the cause, so point at it.
 */
function schemaMismatchHint(e: unknown): string {
  return e instanceof Error && e.message.includes('to be a GraphQL schema')
    ? '\nThe schema appears to come from a different copy of graphql than the ' +
      'one gql resolves. Make sure both resolve the same graphql version ' +
      '(see the compatibility table in the gql README).'
    : ''
}

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
  reqCtx?: (req: Req) => ReqCtx | Promise<ReqCtx>,
): (req: Request) => Promise<Response> {
  const handler = createHandler(options)
  const responseHeaders = (defaults?: HeadersInit) => {
    const merged = new Headers(defaults)
    new Headers(headers).forEach((value, name) => merged.set(name, value))
    return merged
  }

  return async function handleRequest(req: Request): Promise<Response> {
    try {
      if (
        req.method === 'GET' && graphiql && accepts(req)[0] === 'text/html'
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
            headers: responseHeaders({ 'Content-Type': 'text/html' }),
          })
        }
      }
      const [body, init] = await handler(
        toRequest<Req, ReqCtx>(
          req,
          reqCtx ? await reqCtx(req as Req) : { request: req } as ReqCtx,
        ),
      )

      return new Response(
        body || STATUS_TEXT[init.status as StatusCode],
        {
          ...init,
          headers: responseHeaders(init.headers),
        },
      )
    } catch (e) {
      console.error(
        'Internal error occurred during request handling. ' +
          'Please check your implementation.' + schemaMismatchHint(e),
        e,
      )
      // Keep the details server-side, but answer in the GraphQL error shape
      // clients already parse instead of an empty body.
      return new Response(
        JSON.stringify({ errors: [{ message: 'Internal server error' }] }),
        {
          status: 500,
          headers: responseHeaders({
            'Content-Type': 'application/json; charset=utf-8',
          }),
        },
      )
    }
  }
}
