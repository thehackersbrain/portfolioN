import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap'
import icon from 'astro-icon'

import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark'
import expressiveCode from 'astro-expressive-code'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkEmoji from 'remark-emoji'
import remarkMath from 'remark-math'

import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'

import tailwindcss from '@tailwindcss/vite'

import vercel from '@astrojs/vercel'

export default defineConfig({
  site: 'https://thehackersbrain.dev',

  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark', 'one-dark-pro'],
      plugins: [pluginCollapsibleSections(), pluginLineNumbers()],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme="${theme.name.split('-')[1]}"]`,
      defaultProps: {
        wrap: true,
        collapseStyle: 'collapsible-auto',
        overridesByLang: {
          'ansi,bat,bash,batch,cmd,console,powershell,ps,ps1,psd1,psm1,sh,shell,shellscript,shellsession,text,zsh':
            {
              showLineNumbers: false,
            },
        },
      },
      styleOverrides: {
        codeFontSize: '0.75rem',
        borderColor: 'var(--border)',
        codeFontFamily: 'var(--font-mono)',
        codeBackground: 'color-mix(in oklab, var(--muted) 25%, transparent)',
        frames: {
          editorActiveTabForeground: 'var(--muted-foreground)',
          editorActiveTabBackground:
            'color-mix(in oklab, var(--muted) 25%, transparent)',
          editorActiveTabIndicatorBottomColor: 'transparent',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorTabBorderRadius: '0',
          editorTabBarBackground: 'transparent',
          editorTabBarBorderBottomColor: 'transparent',
          frameBoxShadowCssValue: 'none',
          terminalBackground:
            'color-mix(in oklab, var(--muted) 25%, transparent)',
          terminalTitlebarBackground: 'transparent',
          terminalTitlebarBorderBottomColor: 'transparent',
          terminalTitlebarForeground: 'var(--muted-foreground)',
        },
        lineNumbers: {
          foreground: 'var(--muted-foreground)',
        },
        uiFontFamily: 'var(--font-sans)',
      },
    }),
    mdx(),
    react(),
    sitemap({
      // Keep the sitemap in sync with what we actually allow to be indexed:
      // tag/author listings and subposts are marked noindex, and the search
      // index is a data endpoint — none of them belong here.
      filter: (page) => {
        const { pathname } = new URL(page)
        if (pathname.startsWith('/tags')) return false
        if (pathname.startsWith('/authors')) return false
        if (pathname.startsWith('/api/')) return false
        // Subposts live at /blog/<parent>/<child> and are noindex.
        if (/^\/blog\/[^/]+\/[^/]+\/?$/.test(pathname)) return false
        return true
      },
      serialize: (item) => {
        const url = new URL(item.url)
        // Drop trailing slashes so sitemap URLs are byte-identical to the
        // canonical tags — otherwise Google sees two URLs per page.
        url.pathname = url.pathname.replace(/(.+)\/$/, '$1')
        const { pathname } = url

        if (pathname === '/') {
          return {
            ...item,
            url: url.href,
            changefreq: ChangeFreqEnum.WEEKLY,
            priority: 1.0,
          }
        }
        if (pathname.startsWith('/blog/')) {
          return {
            ...item,
            url: url.href,
            changefreq: ChangeFreqEnum.MONTHLY,
            priority: 0.8,
          }
        }
        return {
          ...item,
          url: url.href,
          changefreq: ChangeFreqEnum.WEEKLY,
          priority: 0.6,
        }
      },
    }),
    icon(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  server: {
    port: 1234,
    host: true,
  },

  devToolbar: {
    enabled: false,
  },

  // Astro 7 compresses whitespace with JSX rules by default, which drops the
  // spaces between adjacent inline elements. Keep the v6 HTML behaviour.
  compressHTML: true,

  markdown: {
    // Astro 7 ships its own markdown pipeline; this opts back into unified so
    // the remark/rehype plugins below keep working.
    processor: unified(),
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noreferrer', 'noopener'],
        },
      ],
      rehypeHeadingIds,
      rehypeKatex,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'github-light',
            // dark: 'github-dark',
            dark: 'one-dark-pro',
          },
        },
      ],
    ],
    remarkPlugins: [remarkMath, remarkEmoji],
  },

  adapter: vercel(),
})
