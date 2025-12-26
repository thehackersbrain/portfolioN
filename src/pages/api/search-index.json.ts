import type { APIRoute } from 'astro'
import { getAllPosts, getAllProjects } from '@/lib/data-utils'

export const prerender = true

export const GET: APIRoute = async () => {
  try {
    const posts = await getAllPosts()
    const projects = await getAllProjects()

    // Index posts
    const postIndex = posts.map((post) => {
      const htmlContent = (post as { body?: string }).body || ''
      const textContent = htmlContent
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      return {
        id: post.id || '',
        title: post.data.title,
        description: post.data.description,
        date: post.data.date.toISOString(),
        tags: post.data.tags || [],
        authors: post.data.authors || [],
        url: `/blog/${post.id}`,
        content: textContent,
        type: 'post' as const,
      }
    })

    // Index projects
    const projectIndex = projects.map((project) => {
      const htmlContent = (project as { body?: string }).body || ''
      const textContent = htmlContent
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      return {
        id: project.id || '',
        title: project.data.name,
        description: project.data.description,
        date: project.data.startDate?.toISOString() || new Date().toISOString(),
        tags: project.data.tags,
        categories: project.data.categories || [],
        url: project.data.link,
        content: textContent,
        type: 'project' as const,
        featured: project.data.featured || false,
      }
    })

    // Combine both indexes
    const searchIndex = [...postIndex, ...projectIndex]

    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error generating search index:', error)
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }
}