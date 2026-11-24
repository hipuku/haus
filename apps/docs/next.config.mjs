import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Next writes an AGENTS.md into the app on every dev start. It is generated,
  // nobody edits it, nothing reads it, it is not in the repository, and it
  // arrives with prose the house style gate then fails on.
  agentRules: false,
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
