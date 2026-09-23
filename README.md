# Enertech

**An accessible web platform to track and reduce home energy consumption.**

Register your appliances, log what you consume, set savings goals and get
personalized tips — including an AI assistant that knows your devices. Built to
meet **WCAG 2.2 AA**, bilingual (Spanish / English) and with light and dark themes.

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white) ![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=flat-square&logo=googlegemini&logoColor=white) ![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-10B981?style=flat-square)

---

## Features

| Area | What it does |
|---|---|
| **Devices** | Register appliances with type, power (W) and daily hours of use. Daily consumption and estimated monthly cost are calculated automatically. |
| **Consumption** | Log readings (date, kWh, cost, notes) and follow the trend in interactive charts. |
| **Savings goals** | Set a kWh target for a period and track progress until it is met or missed. |
| **Recommendations** | Personalized tips by category (heating, cooling, lighting, appliances) that you can mark as applied or dismiss. |
| **AI assistant** | A support chat powered by Gemini 2.5 Flash that answers with your profile and devices as context. Signed-in users keep their conversation history in Supabase; guests keep it in the browser. |
| **Admin panel** | Global statistics, user management, recommendation management and configurable electricity rates. |
| **Feedback** | Users can send feedback from inside the app. |
| **Personalization** | Spanish / English switch and light / dark theme, saved to the profile. |

## Accessibility

Accessibility was the main goal of the project, following WCAG 2.2 level AA:

- **Keyboard first** — every feature works without a mouse, with visible focus and no keyboard traps.
- **Screen readers** — semantic HTML, ARIA landmarks, roles and states, compatible with NVDA, JAWS and VoiceOver.
- **Contrast and zoom** — at least 4.5:1 text contrast, and layouts that reflow at 200% zoom without horizontal scrolling.
- **Touch targets** — interactive elements are at least 44×44 px.
- **Clear forms** — visible, associated labels and specific error messages with suggestions.
- **Motion** — respects `prefers-reduced-motion`; nothing flashes.
- **Accessibility panel** — in-app accessibility controls.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide icons
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **AI:** small Express proxy (`server/ai-proxy.js`) that calls Google Gemini, so the API key never reaches the browser

## Project structure

The app lives in the [`project/`](project) folder:

```
project/
├── src/
│   ├── components/      # Admin, Auth, Consumption, Dashboard, Devices, Feedback,
│   │                    # Goals, Layout, Profile, Recommendations, Settings
│   ├── contexts/        # Auth, Language, Theme and Accessibility providers
│   ├── lib/supabase.ts  # Supabase client
│   └── types/
├── server/ai-proxy.js   # Express proxy for the AI assistant
├── supabase/migrations/ # Database schema, seed data and policies
└── public/media/        # Welcome video and images
```

## Getting started

**Requirements:** Node.js 18+, a [Supabase](https://supabase.com) project and, for the
AI assistant, a [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/Angel17jc/Enertech.git
cd Enertech/project
npm install
```

Create `project/.env`:

```env
# Supabase (Project Settings → API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI assistant
VITE_API_URL=http://localhost:8080
GEMINI_API_KEY=your-gemini-key
# GEMINI_MODEL=gemini-2.5-flash   (optional)
```

Apply the SQL files in [`project/supabase/migrations`](project/supabase/migrations)
in order (Supabase SQL editor, or `supabase db push` with the Supabase CLI).

Then run the app and, in a second terminal, the AI proxy:

```bash
npm run dev          # app on http://localhost:5173
npm run start:api    # AI proxy on http://localhost:8080
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run start:api` | Start the AI proxy |
| `npm run typecheck` | Type-check without emitting files |
| `npm run lint` | Run ESLint |

## Database

| Table | Purpose |
|---|---|
| `profiles` | User profile linked to `auth.users`: role, language and theme preferences |
| `devices` / `devices_catalog` | User appliances and the catalog of common device types |
| `consumption_records` | Consumption history (date, kWh, cost) |
| `energy_goals` | Savings goals and their status |
| `recommendations` / `user_recommendations` | Bilingual tips and each user's status for them |
| `electricity_rates` | Cost per kWh, managed by admins |
| `feedback` | Feedback sent from the app |

The core tables have **Row Level Security** enabled: users only see their own data,
admins can read global data and manage configuration, and anonymous users see nothing.

> **Note:** the AI assistant saves conversations to a `support_chat_messages` table
> that is not created by the migrations yet. Create it (with RLS) before using the
> chat as a signed-in user, or conversations will not be saved.

## More documentation

Detailed guides (in Spanish) are in the `project/` folder:

- [Quick start](project/INICIO_RAPIDO.md)
- [Usage guide](project/USAGE_GUIDE.md)
- [Database schema](project/DATABASE_SCHEMA.md)
- [Executive summary](project/RESUMEN_EJECUTIVO.md)
- [Project index](project/INDICE_PROYECTO.md)

---

Built as an independent project for the **Usability and Accessibility** course,
Software Engineering at Universidad Laica Eloy Alfaro de Manabí (ULEAM).
