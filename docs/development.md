# Development

The project is intentionally small: TypeScript, Vite, and `vite-plugin-monkey`.

Useful commands:

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

The userscript entry is `src/userscript.ts`. Runtime startup is in `src/main.ts`; site-specific behavior belongs in `src/adapters`.
