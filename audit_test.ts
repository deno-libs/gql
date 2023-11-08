import { serverAudits } from 'npm:graphql-http@1.22.0'

for (
  const audit of serverAudits({
    url: 'http://localhost:3000/graphql',
  })
) {
  Deno.test(audit.name, { sanitizeResources: false }, async () => {
    const result = await audit.fn()
    if (result.status === 'error') {
      throw result.reason
    }
    if (result.status === 'warn') {
      console.warn(result.reason) // or throw if you want full compliance (warnings are not requirements)
    }
    // Avoid leaking resources
    if ('body' in result && result.body instanceof ReadableStream) {
      await result.body.cancel()
    }
  })
}
