# Chat & Mensageria / Vue 3

[Read in English](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Free](https://img.shields.io/badge/price-free-brightgreen)

Mensageria de equipe em Vue 3 + Tailwind: site público e cliente de chat em três colunas (conversas, thread, detalhe) que colapsa no celular. Canais e mensagens diretas, respostas em thread, reações, edição e remoção, presença, anexos, busca que leva à mensagem, histórico de chamadas e diretório do time. Traz os detalhes que fazem um chat parecer vivo: rascunho por canal, "digitando…", agrupamento de mensagens seguidas e separador de não lidas. i18n pt-BR/en/es, PWA, dark mode.

## Destaques

- Três colunas: conversas, thread e detalhe
- Threads, reações, edição e fixar
- Rascunho por canal e não lidas
- Busca que leva até a mensagem
- i18n pt-BR/en/es, PWA, dark mode

## Telas em destaque

- Conversas: Canais e mensagens diretas
- Thread: Respostas e reações
- Busca: Trecho e ida à mensagem
- Chamadas: Histórico e participantes

## Stack

- Vue 3
- TypeScript
- Vite 6
- Tailwind CSS v4
- Pinia
- Vue Router 4
- ApexCharts
- VeeValidate

## Requisitos

- Node.js 20 ou mais novo, com npm

## Como rodar

```bash
npm install
npm run dev
```

O servidor de desenvolvimento mostra a URL local para abrir.

Conta de demonstração:

- `voce@elo.com` / `demo123`

## Build de produção

```bash
npm run build
```

Gera o pacote de produção em `dist/`; para conferir localmente, `npm run preview`. Qualquer hospedagem estática serve; para as rotas no cliente, redirecione caminhos desconhecidos para `index.html`.

## Estrutura do projeto

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

## Outras tecnologias

Este template também existe em outras 4 tecnologias, com as mesmas telas e a mesma identidade visual. Todas são gratuitas:

- React 19: https://github.com/danilo62x/chat-react
- Angular 19: https://github.com/danilo62x/chat-angular
- Laravel 11: https://github.com/danilo62x/chat-laravel
- HTML estático: https://github.com/danilo62x/chat-html

Mais templates gratuitos (painéis admin, sistemas por segmento e apps Flutter): https://github.com/danilo62x?tab=repositories

## Licença

[MIT](./LICENSE), copyright 2026 Danilo Quinelato.
