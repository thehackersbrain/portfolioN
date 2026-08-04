export type Site = {
  /** Short brand name — used as the title suffix, og:site_name and RSS title. */
  title: string
  /** Title used verbatim on the homepage (no suffix appended). */
  defaultTitle: string
  /** Real name behind the site, used for schema.org and author metadata. */
  name: string
  description: string
  href: string
  author: string
  /** BCP 47 language tag, e.g. `en-US` (used for <html lang> and RSS). */
  locale: string
  /** Open Graph locale, e.g. `en_US` (underscore, per the OG spec). */
  ogLocale: string
  featuredPostCount: number
  postsPerPage: number
}

export type SocialLink = {
  href: string
  label: string
}

export type IconMap = {
  [key: string]: string
}
