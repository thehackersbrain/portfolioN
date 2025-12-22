import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'Gaurav Raj (thehackersbrain) | Security Researcher and Software Engineer',
  description:
    'I\'m Gaurav, founder of Cybercraft Labs — Red team operator and Software Engineer, with hands-on experience across development, deployment, and security for close to a decade (8+ years). Majorly occupied in Penetration Testing, Reverse Engineering, Bug Hunting with various related projects.',
  href: 'https://thehackersbrain.xyz',
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
    href: '/about',
    label: 'about',
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
    href: 'mailto:gaurav@thehackersbrain.xyz',
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
}
