import { SITE } from '@/consts'
import type { APIRoute } from 'astro'

// Note: tag/author listings are deliberately *not* disallowed here — they carry
// a `noindex, follow` meta tag, and blocking them in robots.txt would stop
// crawlers from ever reading that tag while still leaving the URLs indexable.
const getRobotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

# Data endpoint, nothing crawlable.
Disallow: /api/

Host: ${new URL(SITE.href).host}
Sitemap: ${sitemapURL.href}
`

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site ?? SITE.href)
  return new Response(getRobotsTxt(sitemapURL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
