# YBudget 💰

> Budget management software built for NGOs, by NGOs.

YBudget is an open-source budget management platform designed specifically for gemeinnützige Vereine (non-profit organizations) in Germany. Built as a capstone project at CODE University for the Young Founders Network e.V., it solves the real-world problem of managing complex budgets when Excel just isn't enough anymore.

## The Problem

The [Young Founders Network e.V.](https://youngfounders.network) is a gemeinnütziger Verein in Germany supporting young founders and builders through startup resources, community networking, and entrepreneurial education in schools. As we grew, our budget management became increasingly complex, outgrowing simple Excel sheets.

Most budget management tools are either:

- 💸 **Too expensive** for small non-profits
- 🤯 **Too complex** with features we don't need
- 🔒 **Not transparent** about where money goes

We needed something simple, transparent, and affordable. So we built it.

## Features

### 📊 Budget Planning in Minutes

- Organize projects by donors or departments
- Plan expected expenses and track them in real-time
- Get budget warnings when approaching limits
- Real-time budget availability tracking

### 💳 Smart Transaction Management

- Import CSV bank statements from all German banks (Sparkasse, Volksbank, DKB, N26, etc.)
- Smart matching with expected expenses
- Automatic categorization
- No more manual copy-paste

### 🎯 Project-Based Organization

- Assign all expenses to specific projects
- See remaining budget at a glance
- Clear expense history and audit trail
- Automatic categorization by project

### 📈 Reports in 2 Clicks

- Generate professional Verwendungsnachweise for donors
- PDF export with branding
- Filter by project, time period, or donor
- Transparent breakdown of all expenses

## Screenshots

![Dashboard Overview](/public/screenshots/Dashboard%20Overview.png)
_Real-time budget overview with project tracking and expense breakdown_

![Transaction Import](/public/screenshots/Import%20Overview.png)
_Smart CSV import with automatic matching and categorization_

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **Backend**: [Convex](https://www.convex.dev/) (Real-time database & backend)
- **Auth**: [@convex-dev/auth](https://labs.convex.dev/auth) (Google OAuth)
- **Payments**: [Stripe](https://stripe.com/) (Subscription management)
- **UI**: [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **CSV Parsing**: [PapaParse](https://www.papaparse.com/)
- **Language**: TypeScript

## Self-Hosting

YBudget is fully self-hostable. You can run your own instance by connecting it to your own Convex backend and deploying on Vercel (or any other hosting platform).

### Prerequisites

- Node.js 20+ and pnpm
- A [Convex](https://www.convex.dev/) account (free tier available)
- A [Vercel](https://vercel.com/) account (optional, for deployment)
- Google OAuth credentials (for authentication)
- Stripe account (optional, only needed if you want to enable payments)

### Step-by-Step Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/ybudget.git
cd ybudget
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up Convex**

```bash
npx convex dev
```

This will create a new Convex project and link it to your local setup. Follow the prompts to create an account or sign in.

4. **Configure environment variables**

Create a `.env.local` file in the root directory with the following variables:

```bash
# Convex (automatically generated when you run `npx convex dev`)
CONVEX_DEPLOYMENT=your-convex-deployment-url
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Authentication (Google OAuth)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
BETTER_AUTH_SECRET=your-random-secret-key
JWKS=your-jwks-value
JWT_PRIVATE_KEY=your-jwt-private-key

# Site Configuration
SITE_URL=http://localhost:3000

# Stripe (optional - only if you want payment features)
STRIPE_KEY=your-stripe-secret-key
STRIPE_WEBHOOKS_SECRET=your-stripe-webhook-secret
```

**Getting your credentials:**

- **Google OAuth**: Create a project in [Google Cloud Console](https://console.cloud.google.com/), enable Google+ API, and create OAuth 2.0 credentials
- **BETTER_AUTH_SECRET**: Generate with `openssl rand -base64 32`
- **JWKS & JWT_PRIVATE_KEY**: Follow the [@convex-dev/auth documentation](https://labs.convex.dev/auth)
- **Stripe**: Get your keys from the [Stripe Dashboard](https://dashboard.stripe.com/)

5. **Seed the database (optional)**

```bash
npx convex run categories/seed:seedCategories
```

6. **Run the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your local instance!

7. **Deploy to production**

Deploy the Next.js app to Vercel:

```bash
npx vercel
```

Then deploy your Convex functions:

```bash
npx convex deploy
```

Don't forget to set your environment variables in Vercel's project settings!

## Contributing

We're actively looking for contributors to help us build the next generation of software for NGOs! 🚀

Whether you're interested in:

- Adding new features
- Improving the UI/UX
- Fixing bugs
- Writing documentation
- Adding support for more banks/CSV formats

**Your contributions are welcome!**

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Feedback & Ideas

Have ideas for new features? Found a bug? Want to discuss the roadmap?

**We'd love to hear from you!**

Send us an email at **[team@ybudget.de](mailto:team@ybudget.de)** or open an issue on GitHub.

## About Young Founders Network e.V.

The [Young Founders Network e.V.](https://youngfounders.network) is a non-profit organization supporting young founders and builders in Germany. We provide:

- 🚀 Helpful startup resources
- 🤝 A strong community network
- 📚 Entrepreneurial education in schools

This project started as a capstone project at [CODE University](https://code.berlin/) to solve our own budget management challenges. Now we're open-sourcing it so other NGOs can benefit too.

---

Built with ❤️ by the Young Founders Network team
