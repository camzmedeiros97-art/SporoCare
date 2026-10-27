# SporoCare — site do guia educativo

Site estático (HTML + CSS + JavaScript puros, sem dependências nem etapa de build).

## Estrutura

```
index.html
css/style.css          estilos, com variáveis (cores, fontes, espaçamentos) no topo
js/main.js             menu, checklists, acordeão, vídeos, espaços de foto
assets/logo/1.svg      logo original (de SporoCare App Logo.zip), sem alterações
assets/logo/sporocare-app-logo.png   logo oficial (PNG, fundo branco removido) exibida na parte final da página
assets/img/            imagens originais, sem alterações (cópias idênticas byte a byte)
assets/photos/         coloque aqui suas fotografias reais
```

| Seção | Arquivo no projeto | Arquivo original enviado |
|---|---|---|
| Início | `assets/img/hero-site-sporocare-4.svg` | Hero site SporoCare (4).svg |
| Cuidados | `assets/img/hero-site-sporocare-1.svg` | Hero site SporoCare (1).svg |
| Lesões | `assets/img/hero-site-sporocare-2.svg` | Hero site SporoCare (2).svg |
| Medicação | `assets/img/hero-site-sporocare-3.svg` | Hero site SporoCare (3).svg |
| Contenção | `assets/img/gor.svg` | gor.svg |
| Isolamento | `assets/img/k.svg` | k.svg |

Os créditos de cada imagem aparecem na legenda, logo abaixo dela.

## Como executar

Abra `index.html` no navegador. Para simular a hospedagem, rode um servidor local na pasta:

```
python3 -m http.server 8000
```

e acesse http://localhost:8000.

## Como publicar (GitHub Pages)

1. Envie o conteúdo desta pasta para a raiz de um repositório.
2. Em **Settings → Pages**, escolha a branch principal e a pasta `/ (root)`.
3. Aguarde a publicação. Todos os caminhos são relativos, então funciona em subpastas.

Funciona também em Netlify, Cloudflare Pages ou qualquer hospedagem estática.

## Como inserir fotografias reais

O site não tem mais espaços de foto vazios: a seção "Quando procurar ajuda" usa `assets/photos/consulta-veterinaria.png`, "Por que este guia existe?" mostra três cartões de notícias e a parte final mostra a logo. O script ainda aceita um espaço de foto no formato abaixo, se você quiser criar um novo:

1. Coloque o arquivo em `assets/photos/`.
2. No `index.html`, crie um `<figure class="photo-slot" data-photo="nome" data-src="" data-alt=""></figure>` e preencha:
   `data-src="assets/photos/minha-foto.jpg"` e `data-alt="descrição da foto"`.

A foto ocupa o espaço com recorte automático, sem mexer no layout.

## Checklists

O progresso é salvo no `localStorage` do navegador, em uma chave por checklist
(`sporocare:v1:checklist:biosseguranca`, `...:contencao`, `...:isolamento`).
Não há envio para servidor nem sincronização entre aparelhos.

## Pendências antes de publicar

- Vídeos: os títulos não puderam ser verificados (o YouTube bloqueou a consulta automática), por isso aparecem como "Vídeo educativo 1, 2 e 3". Assista aos vídeos e, se quiser, troque pelos títulos reais no `index.html`.
- Respostas das perguntas frequentes: foram escritas somente com base nas orientações do briefing. Recomenda-se revisão por um médico-veterinário.
- Referências 5 e 6 (CRMV-PR e CRMV-MG): os links foram preservados, mas os documentos não foram lidos nem usados para acrescentar orientações.
- Fontes (Fraunces e Inter) e miniaturas dos vídeos são carregadas pela internet; sem conexão, o site usa fontes do sistema e a miniatura fica em branco.
