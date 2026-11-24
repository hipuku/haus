import { createMDX } from 'fumadocs-mdx/next'

// `agentRules` writes an AGENTS.md into the app on every dev start. It is a
// generated file nobody edits and nothing reads, it is not in the repository,
// and it arrives with prose the house style gate then fails on.
const withMDX = createMDX({ agentRules: false })

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/llms.mdx/docs/:path*.md',
      },
      {
        source: '/docs/:path*.txt',
        destination: '/llms.mdx/docs/:path*.txt',
      },
    ]
  },
}

export default withMDX(config)
