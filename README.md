# Cub Notes

Cub Notes is a local-first notes app. The Vite web client calls a Bun server over
tRPC, and the server stores notes in SQLite via `bun:sqlite`.

## Development

- Install dependencies:

```bash
bun install
```

- Start the web client and Bun server together:

```bash
vp run dev
```

The web client is available at `http://localhost:5173`; Vite proxies `/trpc` to
the Bun server at `http://localhost:3000`.

By default, the SQLite database is stored at
`apps/cub-server/data/cub-notes.sqlite`. Set `DATABASE_PATH` to use another
location, or set `PORT` to choose the Bun server port.

## Validation

Run all formatting, type checks, tests, and builds:

```bash
vp run ready
```

Run an individual server command:

```bash
vp run cub-server#dev
```
