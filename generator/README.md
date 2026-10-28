# Gerador dos SVGs do perfil

Todos os SVGs de `../assets` são gerados por `gen.mjs` (Node 18+, sem dependências), no mesmo tema do portfólio ([meu-portfolio-robsonrodrigues.vercel.app](https://meu-portfolio-robsonrodrigues.vercel.app/)).

```bash
node generator/gen.mjs        # regenera ../assets/*.svg
node generator/serve.mjs      # prévia local em http://localhost:8765/generator/preview.html
```

- `src/` — fontes Geist e Geist Mono, avatar, foto, prints dos projetos (`work/`) e ícones da stack, tudo copiado do repositório do portfólio e embutido nos SVGs.
- Os textos dos projetos seguem `src/content/site.ts` do portfólio: ao mudar lá, atualize `PROJECTS` em `gen.mjs`.
- `screenshot.mjs` — tira prints de página inteira via Edge headless (DevTools Protocol).
