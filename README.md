# Stay Ahead Frontend

React and TypeScript frontend for **Stay Ahead**, a personal finance application that helps users understand their commitments and decide whether they can afford a new one.

The Rails API lives in the [Stay Ahead backend repository](https://github.com/cesarecamurani/stay-ahead).

## Current Features

- Registration, login, logout, protected routes, and expired-session handling
- Financial dashboard with monthly income, total and protected savings, monthly commitments, available cash flow, savings runway, and a category breakdown
- Profile updates for income, total savings, and protected savings
- Recurring and one-time commitments
- Commitment lifecycle actions: pause, resume, and cancel
- Forecasts covering the next 1, 3, 6, or 12 months
- Affordability checks before creating a commitment:
  - Recurring commitments are evaluated against active and scheduled commitments over the proposed lifetime
  - One-time expenses are evaluated against savings available above the protected amount
  - Savings commitments add to total savings while recurring contributions still reduce available monthly cash flow
  - Assessments are advisory, so users can proceed after an over-budget warning

Savings contributions currently update the balance when the commitment is created. Recurring contributions are not automatically applied again over time.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Vitest and Testing Library
- ESLint

## Local Development

The frontend expects the Rails API to be running locally. By default, Vite proxies API requests to `http://localhost:3000`.

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

If the backend runs on another port, update `VITE_API_PROXY_TARGET` in `.env`.

Start the development server:

```bash
npm run dev
```

## Checks

```bash
npm test
npm run lint
npm run build
```

## Production API Configuration

Set `VITE_API_BASE_URL` to the deployed Rails API URL before creating the production build. Leave it empty during local development so requests use the Vite proxy.
