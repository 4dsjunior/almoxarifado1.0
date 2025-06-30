# Backend To-Do

## Integração com Vite

- Criar uma função em Python (no `app.py` do Flask) para ler o arquivo `static/dist/manifest.json`.
- Essa função deve mapear os nomes de assets originais (ex: `main.js`) para seus nomes com hash (ex: `main.a1b2c3d4.js`).
- Usar essa função nos templates do Jinja2 para injetar as URLs corretas dos arquivos CSS e JS no `layout.html`.
- Exemplo de como a função pode ser chamada no template:
  `<script src="{{ vite_asset('main.js') }}"></script>`
