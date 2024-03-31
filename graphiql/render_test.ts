import { describe, it } from 'https://deno.land/std@0.221.0/testing/bdd.ts'
import { expect } from 'https://deno.land/x/expect@v0.4.0/mod.ts'
import { renderPlaygroundPage } from './render.ts'

describe('renderPlaygroundPage', () => {
  it('supports custom CDNs', () => {
    const html = renderPlaygroundPage({ cdnUrl: 'https://unpkg.com' })

    expect(html).toContain(
      `https://unpkg.com/graphql-playground-react/build/static/css/index.css`,
    )
    expect(html).toContain(
      `https://unpkg.com/graphql-playground-react/build/favicon.png`,
    )
    expect(html).toContain(
      `https://unpkg.com/graphql-playground-react/build/static/js/middleware.js`,
    )
  })
  it('supports custom versions of graphql-playground-react', () => {
    const html = renderPlaygroundPage({ version: '1.7.27' })

    expect(html).toContain(
      `jsdelivr.net/npm/graphql-playground-react@1.7.27/build/favicon.png`,
    )
    expect(html).toContain(
      `jsdelivr.net/npm/graphql-playground-react@1.7.27/build/static/js/middleware.js`,
    )
  })
  it('supports custom GraphQL endpoint', () => {
    const html = renderPlaygroundPage({ endpoint: '/grafql' })

    expect(html).toContain(`/grafql`)
  })
  it('supports custom favicon', () => {
    const html = renderPlaygroundPage({
      faviconUrl: 'https://tinyhttp.v1rtl.site/favicon.png',
    })

    expect(html).toContain(
      `<link rel="shortcut icon" href="https://tinyhttp.v1rtl.site/favicon.png" />`,
    )
  })
})
