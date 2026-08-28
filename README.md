# Campaign Courier

Create a modern, full-featured web application called "MailFlow" — an Email Campaign Manager and Background Delivery Scheduler built with React, TypeScript, Tailwind CSS, Lucide Icons, and shadcn/ui components.

The app should have a sleek dark-mode glassmorphic aesthetic (Slate 900 background, Emerald and Cyan glowing accents, smooth micro-animations, and clean typography).

### 1. Architecture & API Configuration
- API Base URL: `http://localhost:4000`
- Store auth token in `localStorage.getItem("auth_token")`
- All authenticated API calls must send header: `Authorization: Bearer <auth_token>`
- Include a helper API client (`src/api/campaignApi.ts`) for all endpoints.

### 2. Routes & Authentication Flow
- `/` (Login / Landing Page):
  - Hero header with features: "Reliable background queuing", "Intelligent SMTP rate-limiting", "Persistent Redis delivery".
  - "Sign in with Google" button redirecting directly to `http://localhost:4000/auth/google`.
  - Feature highlights cards with stats and badges.
- `/auth/success` (Auth Callback Handler):
  - Parses `?token=...` from the URL query params.
  - Saves token to `localStorage.setItem("auth_token", token)`.
  - Shows a loader spinner and redirects to `/dashboard`.
- `/dashboard` (Protected Dashboard):
  - Redirects to `/` if no token is found in localStorage.
  - Header with user profile placeholder, status indicator (System Online), and Logout button.

### 3. Dashboard Features & Layout
- Top Summary Metric Cards:
  - Total Upcoming Scheduled Jobs
  - Total Successfully Sent Emails
  - Current Hourly Rate Limit Setting (e.g. 20/hr)
  - Queue Health Status (Active / Healthy)
- Action Bar:
  - Search bar to filter campaigns by recipient or subject.
  - Filter toggle / Tabs: "Scheduled / Upcoming" vs "Completed / Sent".
  - Refresh button to re-fetch data.
  - Prominent "+ Launch Campaign" primary button that opens the modal.
- Tab 1: "Upcoming Campaigns" Table
  - Fetches from `GET http://localhost:4000/api/v1/campaigns/upcoming`
  - Columns: Recipient Email, Subject, Scheduled Delivery Time (relative countdown e.g., "in 2 hours" + formatted date), Status Badge (`SCHEDULED` in blue/cyan).
  - Empty state with an illustration when no scheduled emails exist.
- Tab 2: "Completed Deliveries" Table
  - Fetches from `GET http://localhost:4000/api/v1/campaigns/completed`
  - Columns: Recipient Email, Subject, Sent At Timestamp, Status Badge (`SENT` in emerald green).
  - Action button on each row to open a "View Email Details / Body" modal.

### 4. "Launch Campaign" Modal (Multi-step or Tabbed Dialog)
Opens when clicking "+ Launch Campaign" and submits a POST request to `http://localhost:4000/api/v1/campaigns/launch` with the following JSON payload:
```json
{
  "subject": "string",
  "body": "string",
  "emails": ["user1@example.com", "user2@example.com"],
  "sendAt": "2026-08-28T14:30:00.000Z",
  "delayMs": 2000,
  "hourlyLimit": 20
}

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7fbc189e-6dbc-4d69-9d3d-e49b0e738d87).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
