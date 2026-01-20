# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A universal GraphQL HTTP middleware library for Deno and Bun, based on graphql-http. Provides spec-compliant GraphQL server capabilities with built-in GraphQL Playground support.

## Development Commands

### Testing
```bash
# Run all tests (excludes audit_test.ts by default)
deno task test

# Run audit tests specifically
deno task test:audit

# Run tests with coverage
deno test --allow-net --coverage=coverage
```

### Formatting
```bash
# Format code
deno fmt

# Check formatting
deno fmt --check
```

### Dependency Management
```bash
# Update dependencies to latest stable versions
deno run -A jsr:@molt/cli
```

### Publishing
```bash
# Publish to JSR (requires permissions)
npx jsr publish
```

## Architecture

### Core Components

**`mod.ts`** - Main entry point exporting `GraphQLHTTP` function
- `GraphQLHTTP<Req, Context, ReqCtx>()` - Factory function that returns a request handler
- Accepts `GQLOptions` configuration (schema, rootValue, graphiql, headers, playgroundOptions, etc.)
- Optional second parameter `reqCtx?: (req: Req) => ReqCtx` for custom request context
- Returns `(req: Request) => Promise<Response>` handler function
- Handles content negotiation for GraphQL Playground vs JSON responses
- Wraps graphql-http's `createHandler` with Deno/Bun-compatible Request/Response handling

**`types.ts`** - TypeScript type definitions
- `GQLOptions<Req, ReqCtx, Context>` - Main configuration interface extending graphql-http's `HandlerOptions`
- `GraphQLParams` - Union type for query/mutation parameters

**`deps.ts`** - External dependencies
- Re-exports from graphql, graphql-http, and @std/http
- Centralizes all third-party imports

**`graphiql/`** - GraphQL Playground integration
- `render.ts` - Generates HTML for GraphQL Playground UI
- `markup.ts` - Loading screen markup
- Uses XSS filtering for security
- Supports customization via `RenderPageOptions` (title, favicon, CDN URL, theme settings)

### Request Flow

1. `GraphQLHTTP()` is called with options to create a handler
2. Handler receives a standard `Request` object
3. If GET request with `Accept: text/html` and `graphiql: true`, render playground
4. Otherwise, convert Request to graphql-http's `RawRequest` format
5. Pass through graphql-http's `createHandler` for GraphQL execution
6. Convert response back to standard `Response` object

### Context System

The library supports a two-level context system:

1. **Request Context (`ReqCtx`)** - Created from incoming request via optional `reqCtx` callback
   - Available as `context` property in the raw GraphQL request
   - Example: `{ request: Request, isRequestContext: boolean }`

2. **GraphQL Context (`Context`)** - Passed to resolvers
   - Created via `context` option in `GQLOptions`
   - Receives the `RawRequest` containing the request context
   - Example: `{ request: Request, originalReq: GQLRequest<Request, ReqCtx> }`

See `examples/req-ctx.ts` for usage pattern.

### Framework Integration Patterns

**Vanilla Deno.serve** (`examples/vanilla.ts`)
- Direct usage with `Deno.serve()`
- Handler checks pathname and routes to GraphQL

**Oak Framework** (`examples/oak.ts`)
- Converts Oak's Request to standard Request object
- Maps Response back to Oak's context
- Passes Oak's request object via context to resolvers

**Denoflare** (`examples/denoflare/`)
- Edge/Cloudflare Workers integration pattern

## Testing

Tests use `@deno-libs/superfetch`'s `makeFetch` helper to create mock fetch clients. Test structure:
- `mod_test.ts` - Main functionality tests (GET/POST queries, GraphiQL rendering, headers, content negotiation)
- `graphiql/render_test.ts` - Playground rendering tests
- `audit_test.ts` - Separate audit tests (excluded by default)

The superfetch testing pattern:
```typescript
const fetch = makeFetch(app)
const res = await fetch('/', { method: 'POST', ... })
res.expectStatus(200)
res.expectBody({ data: { hello: 'Hello World!' } })
```

## Key Patterns

- All files use Deno-style imports (JSR, npm:, https://deno.land)
- XSS filtering applied to all user-provided playground configuration
- Content negotiation based on Accept header determines JSON vs HTML responses
- GraphQL Playground only renders on GET requests with `text/html` accept header (unless `?raw` query param present)
- Custom headers from `GQLOptions.headers` are merged into all responses
