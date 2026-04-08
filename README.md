# BraViz

Visualização interativa de todos os estabelecimentos brasileiros.

Os dados de localização vêm do **Cadastro Nacional de Endereços para Fins Estatísticos (CNEFE)**, publicado pelo IBGE em 2022. O CNEFE reúne os endereços de todos os domicílios e estabelecimentos identificados durante o Censo Demográfico, totalizando cerca de **8 milhões de pontos** distribuídos por todo o Brasil, classificados em 8 tipos de uso.

## Tipos de estabelecimento

| ID | Categoria |
|---|---|
| 1 | Residência |
| 2 | Uso coletivo / hospedagem |
| 3 | Uso agropecuário |
| 4 | Educação |
| 5 | Saúde |
| 6 | Uso não residencial / comercial |
| 7 | Sem classificação / vago |
| 8 | Religioso |

## Stack

Sem servidor backend.
- **[tippecanoe](https://github.com/felt/tippecanoe)** — converte o CSV em PMTiles com pirâmide de zoom
- **[PMTiles](https://protomaps.com/docs/pmtiles)** — formato de arquivo único servido via HTTP Range Requests, sem tile server
- **[Deck.gl](https://deck.gl)** — renderização GPU de milhões de pontos no browser
- **[MapLibre GL JS](https://maplibre.org)** — mapa base cartográfico
- **[Vite](https://vitejs.dev)** — bundler

## Fonte dos dados

IBGE — Cadastro Nacional de Endereços para Fins Estatísticos (CNEFE)
https://www.ibge.gov.br/estatisticas/sociais/habitacao/9218-cadastro-nacional-de-enderecos-para-fins-estatisticos.html
