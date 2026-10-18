/**
 * The site's Worker. Static files are served from `dist` before this runs;
 * only paths with no asset reach here: the PostHog reverse proxy under
 * `/ingest/*` (so analytics requests stay first-party, see `analytics.ts`),
 * and client routes, which `not_found_handling` resolves to `index.html`.
 */
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

const POSTHOG_API = 'https://us.i.posthog.com'
const POSTHOG_ASSETS = 'https://us-assets.i.posthog.com'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/ingest/')) {
      const rest = url.pathname.slice('/ingest'.length)
      const upstream = rest.startsWith('/static/') ? `${POSTHOG_ASSETS}${rest}` : `${POSTHOG_API}${rest}`
      const headers = new Headers(request.headers)
      headers.set('host', new URL(upstream).host)
      return fetch(`${upstream}${url.search}`, { method: request.method, headers, body: request.body, redirect: 'follow' })
    }
    return env.ASSETS.fetch(request)
  },
}
