import { SITE } from '@/consts'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPosts } from '@/lib/data-utils'

export async function GET(context: APIContext) {
  try {
    const posts = await getAllPosts()
    const siteUrl = context.site ?? SITE.href
    
    return rss({
      title: SITE.title,
      description: SITE.description,
      site: siteUrl,
      items: posts.map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/blog/${post.id}/`,
      })),
      customData: `<atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />`,
      xmlns: {
        atom: "http://www.w3.org/2005/Atom",
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}