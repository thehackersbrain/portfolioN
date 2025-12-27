import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'thehackersbrain | Gaurav Raj - Security Researcher',
  description:
    'I\'m Gaurav (thehackersbrain), Founder of Cybercraft Labs — Offensive Security Researcher and Software Engineer with close to a decade (8+ years) of experience.',
  href: 'https://thehackersbrain.dev',
  author: 'thehackersbrain',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 3,
}

export const NAV_LINKS: SocialLink[] = [
  {
    href: '/blog',
    label: 'blog',
  },
  {
    href: '/works',
    label: 'works',
  },
  {
    href: 'https://github.com/thehackersbrain/resume/blob/main/resume.pdf',
    label: 'resume',
  }
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/thehackersbrain',
    label: 'GitHub',
  },
  {
    href: 'https://twitter.com/thehackersbrain',
    label: 'Twitter',
  },
  {
    href: 'https://instagram.com/thehackersbrain',
    label: 'Instagram',
  },
  {
    href: 'mailto:gaurav@thehackersbrain.dev',
    label: 'Email',
  },
  {
    href: '/rss.xml',
    label: 'RSS',
  },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  GitHub: 'lucide:github',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Email: 'lucide:mail',
  RSS: 'lucide:rss',
  Instagram: 'lucide:instagram',
}
