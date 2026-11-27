# Team Chat & Messaging / Vue 3

[Leia em português](./README.pt-BR.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Free](https://img.shields.io/badge/price-free-brightgreen)

Team messaging: public site and a three-column chat client (conversations, thread, details) that collapses on mobile. Channels and direct messages, threaded replies, reactions, edit and delete, presence, attachments, search that jumps to the message, call history and a team directory.

Everything runs on mock data, so no backend, external API or service is needed.

## Highlights

- Internationalisation in Portuguese (pt-BR), English and Spanish
- Installable PWA
- Light and dark themes
- Responsive layout from phone to desktop
- Mock data in Portuguese (Brazil), easy to replace with a real API

## Tech stack

- Vue 3
- TypeScript
- Vite 6
- Tailwind CSS v4
- Pinia
- Vue Router 4
- ApexCharts
- VeeValidate

## Requirements

- Node.js 20 or newer and npm

## Getting started

```bash
npm install
npm run dev
```

The dev server prints the local URL to open.

Demo account:

- `voce@elo.com` / `demo123`

## Build for production

```bash
npm run build
```

Writes the production bundle to `dist/`; preview it locally with `npm run preview`. Any static host works; for client-side routes, point unknown paths to `index.html`.

## Project structure

```
src/
├── assets/  styles
├── components/  app, ch, layout, ui
├── composables/
├── data/
├── i18n/  locales
├── lib/
├── router/
├── stores/
├── views/  app, public
```

## Other stacks

This template also exists in 4 other stacks, with the same screens and visual identity. All of them are free:

- React 19: https://github.com/danilo62x/chat-react
- Angular 19: https://github.com/danilo62x/chat-angular
- Laravel 11: https://github.com/danilo62x/chat-laravel
- Static HTML: https://github.com/danilo62x/chat-html

More free templates (admin dashboards, vertical systems and Flutter apps): https://github.com/danilo62x?tab=repositories

## License

[MIT](./LICENSE), copyright 2026 Danilo Quinelato.
