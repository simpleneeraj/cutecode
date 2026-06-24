<div align="center">
  <img src="public/og-image.png" alt="CuteCode" width="100%" />
  <h1>CuteCode</h1>
  <p><strong>Create beautiful images of your code</strong></p>
  <p>Open-source ray.so alternative with 45+ themes, snippet sharing, and more.<br/>Small Tools – Big Impact ✨</p>

  <a href="https://github.com/simpleneeraj/cutecode/stargazers"><img src="https://img.shields.io/github/stars/simpleneeraj/cutecode?style=for-the-badge&logo=github&logoColor=white&color=0d1117" alt="Stars" /></a>
  <a href="https://github.com/simpleneeraj/cutecode/blob/main/LICENSE"><img src="https://img.shields.io/github/license/simpleneeraj/cutecode?style=for-the-badge&color=0d1117" alt="License" /></a>
  <a href="https://github.com/simpleneeraj/cutecode/issues"><img src="https://img.shields.io/github/issues/simpleneeraj/cutecode?style=for-the-badge&color=0d1117" alt="Issues" /></a>
  <a href="https://github.com/sponsors/simpleneeraj"><img src="https://img.shields.io/badge/Sponsor-❤️-0d1117?style=for-the-badge" alt="Sponsor" /></a>
  <br />
  <a href="https://cutecode.app"><strong>Live Demo →</strong></a> · <a href="#-getting-started">Quick Start</a> · <a href="#-contributing">Contribute</a> · <a href="https://github.com/simpleneeraj/cutecode/issues">Report Bug</a>
</div>

<br />

## ✨ Features

- 🎨 **45+ Beautiful Themes** — Brand themes (Vercel, Stripe, Supabase, OpenAI, Claude, Gemini, etc.) + aesthetic themes (Aurora Nights, Neon Dreams, Golden Hour, etc.)
- 🖼️ **Code Screenshot Generator** — Turn code into stunning shareable images in seconds
- 📝 **Snippet Sharing** — Save, share, and explore public code snippets with unique URLs
- 🔄 **Remix** — Fork and remix any shared snippet with your own customizations
- 🌓 **Dark & Light Mode** — Full theme support with system preference detection
- 🎯 **Syntax Highlighting** — Powered by Shiki with 100+ language support
- 📤 **Export Options** — Copy to clipboard, download as PNG, or share via URL
- 🔐 **Authentication** — Clerk-powered sign-in to save and manage your snippets
- 💎 **Pro Plan** — Unlimited HD exports, premium themes, watermark-free images
- 📱 **Responsive Design** — Works beautifully on desktop and mobile
- ⚡ **Built on Next.js 16** — React 19, App Router, Server Components, Edge-ready

## 🎨 Themes (45+)

CuteCode ships with 45+ hand-crafted themes across two categories:

| Brand Themes (16) | Aesthetic Themes (28+) |
|---|---|
| Vercel | Bitmap |
| Supabase | Noir |
| Tailwind | Ice |
| OpenAI | Sand |
| Mintlify | Forest |
| Prisma | Mono |
| Clerk | Breeze |
| ElevenLabs | Candy |
| Resend | Crimson |
| Trigger.dev | Falcon |
| Nuxt | Meadow |
| Browserbase | Midnight |
| Cloudflare | Raindrop |
| Gemini | Sunset |
| Stripe | Roses |
| Claude | Retro Mac |
| | Love |
| | Valentine |
| | Coffee Date |
| | Sunset Chill |
| | PS6 |
| | Aurora Nights |
| | Starry Night |
| | Strawberry Milk |
| | Frosted Glass |
| | Velvet Night |
| | Peachy Mood |
| | Neon Dreams |
| | Golden Hour |
| | Rabbit |

> **Want to add a theme?** Check the [Contributing](#-contributing) section below!

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, Tailwind CSS 4, Radix UI |
| **Animation** | Motion (Framer Motion) |
| **Syntax Highlighting** | Shiki |
| **Authentication** | Clerk |
| **Database** | PostgreSQL + Prisma ORM |
| **Payments** | Dodo Payments |
| **State Management** | Jotai |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** database
- **Yarn** (package manager)

### 1. Clone the repository

```bash
git clone https://github.com/simpleneeraj/cutecode.git
cd cutecode
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Set up environment variables

```bash
cp .env.example .env.development
```

Fill in your environment variables:

```env
# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Clerk Authentication (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/account/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/account/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Dodo Payments (https://dodopayments.com)
DODO_PAYMENTS_API_KEY="your_api_key"
DODO_PAYMENTS_WEBHOOK_KEY="whsec_..."
DODO_PAYMENTS_RETURN_URL="http://localhost:3000/checkout/success"
DODO_PAYMENTS_ENVIRONMENT="test_mode"
NEXT_PUBLIC_DODO_PRODUCT_PRO="pdt_..."

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/cutecode"

# Redis (optional, for rate limiting)
REDIS_URL="redis://localhost:6379"

# Cron Security
CRON_SECRET="generate-with-openssl-rand-hex-32"
```

### 4. Set up the database

```bash
yarn db:generate
yarn db:push
```

### 5. Run the development server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) — you're all set! 🎉

## 📁 Project Structure

```
cutecode/
├── prisma/              # Database schema & migrations
├── public/              # Static assets, backgrounds, icons
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── (navigation)/ # Main app routes (editor, explore, snippets)
│   │   ├── api/         # API routes (tRPC, webhooks)
│   │   ├── account/     # Auth pages (sign-in, sign-up)
│   │   ├── pricing/     # Pricing page
│   │   └── legal/       # Terms, privacy, refund
│   ├── components/      # Reusable UI components
│   │   └── presets/     # 45+ theme preset frames
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── server/          # Server-side logic (tRPC routers)
│   ├── store/           # Jotai state atoms
│   ├── styles/          # Global CSS & preset styles
│   └── utils/           # Helper functions
├── .env.example         # Environment variables template
├── next.config.js       # Next.js configuration
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Adding a New Theme

1. Create a new directory in `src/components/presets/your-theme-name/`
2. Add your theme configuration and frame component
3. Register it in `src/components/presets/themes/index.ts`
4. Submit a PR!

> We love new themes — brand themes, aesthetic themes, seasonal themes, you name it!

## 💖 Sponsor

If CuteCode helps you create beautiful code screenshots, consider sponsoring to keep the project alive and growing:

<a href="https://github.com/sponsors/simpleneeraj">
  <img src="https://img.shields.io/badge/Sponsor_CuteCode-❤️-ea4aaa?style=for-the-badge&logo=github-sponsors" alt="Sponsor" />
</a>

## 🙏 Acknowledgements

- **Special thanks to [Raycast](https://raycast.com) and [ray.so](https://ray.so)** — CuteCode started as a fork of the incredible ray.so project. We're grateful for the foundation they built and their commitment to open source.
- [Shiki](https://shiki.matsu.io/) — Beautiful syntax highlighting
- [Clerk](https://clerk.com) — Authentication
- [Vercel](https://vercel.com) — Hosting & deployment

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p><strong>Small Tools – Big Impact ✨</strong></p>
  <p>Built with ❤️ by <a href="https://github.com/simpleneeraj">simpleneeraj</a></p>
  <p>
    <a href="https://cutecode.app">Website</a> · 
    <a href="https://x.com/iamsimpleneeraj">Twitter</a> · 
    <a href="https://github.com/simpleneeraj/cutecode/issues">Issues</a>
  </p>
</div>
