# Gerador dos SVGs do perfil

Todos os SVGs animados de `../assets` são gerados por `gen.mjs` (Node 18+, sem dependências).

```bash
node generator/gen.mjs        # regenera ../assets/*.svg
node generator/serve.mjs      # prévia local em http://localhost:8765/generator/preview.html
```

- `src/` — screenshots, miniaturas e ícones embutidos nos SVGs.
- `screenshot.mjs` — tira prints de página inteira via Edge headless (DevTools Protocol).
