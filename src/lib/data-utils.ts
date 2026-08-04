import { getCollection, render, type CollectionEntry } from 'astro:content'
import { readingTime, calculateWordCountFromHtml } from '@/lib/utils'

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  return await getCollection('authors')
}

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog')
  return posts
    .filter((post) => !post.data.draft && !isSubpost(post.id))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllPostsAndSubposts(): Promise<
  CollectionEntry<'blog'>[]
> {
  const posts = await getCollection('blog')
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects.sort((a, b) => {
    const dateA = a.data.startDate?.getTime() || 0
    const dateB = b.data.startDate?.getTime() || 0
    return dateB - dateA
  })
}

export async function getFeaturedProjects(): Promise<
  CollectionEntry<'projects'>[]
> {
  const projects = await getCollection('projects')
  return projects
    .filter((project) => project.data.featured === true)
    .sort((a, b) => {
      const dateA = a.data.startDate?.getTime() || 0
      const dateB = b.data.startDate?.getTime() || 0
      return dateB - dateA
    })
}

export async function getAllWorks() {
  const works = await getCollection('works')
  return works.sort((a, b) => {
    if (a.data.featured && !b.data.featured) return -1
    if (!a.data.featured && b.data.featured) return 1
    return a.data.name.localeCompare(b.data.name)
  })
}

export async function getFeaturedWorks(limit?: number) {
  const works = await getCollection(
    'works',
    ({ data }) => data.featured === true,
  )
  const sorted = works.sort((a, b) => a.data.name.localeCompare(b.data.name))
  return limit ? sorted.slice(0, limit) : sorted
}

export async function getPublishedWorks() {
  return await getCollection('works')
}

export async function getAllWritings(): Promise<CollectionEntry<'writings'>[]> {
  const writings = await getCollection('writings')
  return writings.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getFeaturedWritings(
  limit?: number,
): Promise<CollectionEntry<'writings'>[]> {
  const writings = await getCollection(
    'writings',
    ({ data }) => data.featured === true,
  )
  const sorted = writings.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )
  return limit ? sorted.slice(0, limit) : sorted
}

export async function getWritingsByType(
  type: string,
): Promise<CollectionEntry<'writings'>[]> {
  const writings = await getCollection(
    'writings',
    ({ data }) => data.type === type,
  )
  return writings.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getProjectsByCategory(
  category: string,
): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects
    .filter((project) => project.data.categories?.includes(category))
    .sort((a, b) => {
      const dateA = a.data.startDate?.getTime() || 0
      const dateB = b.data.startDate?.getTime() || 0
      return dateB - dateA
    })
}

export type Tag = {
  /** URL-safe identifier used in `/tags/<slug>`. */
  slug: string
  /** Human-readable label as written in the post frontmatter. */
  label: string
  count: number
}

/**
 * Turns a free-form tag into a URL-safe slug. Tags are authored by hand, so
 * this is what stops `Cloud Hacking` from producing a URL with a space in it
 * and `Cybersecurity`/`cybersecurity` from splitting one topic across two pages.
 */
export function slugifyTag(tag: string): string {
  return tag
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllTags(): Promise<Map<string, Tag>> {
  const posts = await getAllPosts()
  return posts.reduce((acc, post) => {
    post.data.tags?.forEach((tag) => {
      const slug = slugifyTag(tag)
      if (!slug) return
      const existing = acc.get(slug)
      if (existing) {
        existing.count += 1
      } else {
        acc.set(slug, { slug, label: tag, count: 1 })
      }
    })
    return acc
  }, new Map<string, Tag>())
}

export async function getAdjacentPosts(currentId: string): Promise<{
  newer: CollectionEntry<'blog'> | null
  older: CollectionEntry<'blog'> | null
  parent: CollectionEntry<'blog'> | null
}> {
  const allPosts = await getAllPosts()

  if (isSubpost(currentId)) {
    const parentId = getParentId(currentId)
    const allPosts = await getAllPosts()
    const parent = allPosts.find((post) => post.id === parentId) || null

    const posts = await getCollection('blog')
    const subposts = posts
      .filter(
        (post) =>
          isSubpost(post.id) &&
          getParentId(post.id) === parentId &&
          !post.data.draft,
      )
      .sort((a, b) => {
        const dateDiff = a.data.date.valueOf() - b.data.date.valueOf()
        if (dateDiff !== 0) return dateDiff

        const orderA = a.data.order ?? 0
        const orderB = b.data.order ?? 0
        return orderA - orderB
      })

    const currentIndex = subposts.findIndex((post) => post.id === currentId)
    if (currentIndex === -1) {
      return { newer: null, older: null, parent }
    }

    return {
      newer:
        currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
      older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
      parent,
    }
  }

  const parentPosts = allPosts.filter((post) => !isSubpost(post.id))
  const currentIndex = parentPosts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) {
    return { newer: null, older: null, parent: null }
  }

  return {
    newer: currentIndex > 0 ? parentPosts[currentIndex - 1] : null,
    older:
      currentIndex < parentPosts.length - 1
        ? parentPosts[currentIndex + 1]
        : null,
    parent: null,
  }
}

export async function getPostsByAuthor(
  authorId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.data.authors?.includes(authorId))
}

/** Matches on the slug, so `Cybersecurity` and `cybersecurity` land together. */
export async function getPostsByTag(
  tagSlug: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) =>
    post.data.tags?.some((tag) => slugifyTag(tag) === tagSlug),
  )
}

export async function getRecentPosts(
  count: number,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

export async function getSortedTags(): Promise<Tag[]> {
  const tags = await getAllTags()
  return [...tags.values()].sort((a, b) => {
    const countDiff = b.count - a.count
    return countDiff !== 0 ? countDiff : a.label.localeCompare(b.label)
  })
}

export function getParentId(subpostId: string): string {
  return subpostId.split('/')[0]
}

export async function getSubpostsForParent(
  parentId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog')
  return posts
    .filter(
      (post) =>
        !post.data.draft &&
        isSubpost(post.id) &&
        getParentId(post.id) === parentId,
    )
    .sort((a, b) => {
      const dateDiff = a.data.date.valueOf() - b.data.date.valueOf()
      if (dateDiff !== 0) return dateDiff

      const orderA = a.data.order ?? 0
      const orderB = b.data.order ?? 0
      return orderA - orderB
    })
}

export function groupPostsByYear(
  posts: CollectionEntry<'blog'>[],
): Record<string, CollectionEntry<'blog'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'blog'>[]>, post) => {
      const year = post.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}

export async function hasSubposts(postId: string): Promise<boolean> {
  const subposts = await getSubpostsForParent(postId)
  return subposts.length > 0
}

export function isSubpost(postId: string): boolean {
  return postId.includes('/')
}

export async function getParentPost(
  subpostId: string,
): Promise<CollectionEntry<'blog'> | null> {
  if (!isSubpost(subpostId)) {
    return null
  }

  const parentId = getParentId(subpostId)
  const allPosts = await getAllPosts()
  return allPosts.find((post) => post.id === parentId) || null
}

export async function parseAuthors(authorIds: string[] = []) {
  if (!authorIds.length) return []

  const allAuthors = await getAllAuthors()
  const authorMap = new Map(allAuthors.map((author) => [author.id, author]))

  return authorIds.map((id) => {
    const author = authorMap.get(id)
    return {
      id,
      name: author?.data?.name || id,
      alias: author?.data?.alias || '',
      avatar: author?.data?.avatar || '/static/logo.png',
      isRegistered: !!author,
    }
  })
}

export async function getPostById(
  postId: string,
): Promise<CollectionEntry<'blog'> | null> {
  const allPosts = await getAllPostsAndSubposts()
  return allPosts.find((post) => post.id === postId) || null
}

export async function getSubpostCount(parentId: string): Promise<number> {
  const subposts = await getSubpostsForParent(parentId)
  return subposts.length
}

export async function getCombinedReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return readingTime(0)

  let totalWords = calculateWordCountFromHtml(post.body)

  if (!isSubpost(postId)) {
    const subposts = await getSubpostsForParent(postId)
    for (const subpost of subposts) {
      totalWords += calculateWordCountFromHtml(subpost.body)
    }
  }

  return readingTime(totalWords)
}

export async function getPostReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return readingTime(0)

  const wordCount = calculateWordCountFromHtml(post.body)
  return readingTime(wordCount)
}

export type TOCHeading = {
  slug: string
  text: string
  depth: number
  isSubpostTitle?: boolean
}

export type TOCSection = {
  type: 'parent' | 'subpost'
  title: string
  headings: TOCHeading[]
  subpostId?: string
}

export async function getTOCSections(postId: string): Promise<TOCSection[]> {
  const post = await getPostById(postId)
  if (!post) return []

  const parentId = isSubpost(postId) ? getParentId(postId) : postId
  const parentPost = isSubpost(postId) ? await getPostById(parentId) : post

  if (!parentPost) return []

  const sections: TOCSection[] = []

  const { headings: parentHeadings } = await render(parentPost)
  if (parentHeadings.length > 0) {
    sections.push({
      type: 'parent',
      title: 'Overview',
      headings: parentHeadings.map((heading) => ({
        slug: heading.slug,
        text: heading.text,
        depth: heading.depth,
      })),
    })
  }

  const subposts = await getSubpostsForParent(parentId)
  for (const subpost of subposts) {
    const { headings: subpostHeadings } = await render(subpost)
    if (subpostHeadings.length > 0) {
      sections.push({
        type: 'subpost',
        title: subpost.data.title,
        headings: subpostHeadings.map((heading, index) => ({
          slug: heading.slug,
          text: heading.text,
          depth: heading.depth,
          isSubpostTitle: index === 0,
        })),
        subpostId: subpost.id,
      })
    }
  }

  return sections
}
