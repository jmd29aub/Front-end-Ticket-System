# Ticket System Frontend

Vue frontend for the Ticket System project.

This app provides the client and support user interfaces for creating tickets, managing tickets, replying to tickets, receiving notifications, and updating account settings.

## Tech Stack

* Vue 3
* TypeScript
* Vite
* SCSS
* Laravel API backend

## Features

* Client dashboard
* Support dashboard
* Ticket creation
* Ticket details pages
* Ticket edit/update flows
* Client and support replies
* Realtime notification dropdown
* Notification center
* Password change modal
* Light/dark mode support
* Mobile responsive layout

## Requirements

* Node.js
* npm
* Running Laravel backend API

## Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
copy .env.example .env
```

Update `.env` with your backend API and realtime settings.

## Run Development Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Environment Variables

Create a `.env` file using `.env.example` as a template.

Example:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_REVERB_APP_KEY=
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

## Backend Repository

```text
https://github.com/jmd29aub/Back-End-Ticket-System
```
