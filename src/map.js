import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { Deck } from '@deck.gl/core';
import { TileLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { parse } from '@loaders.gl/core';
import { MVTLoader } from '@loaders.gl/mvt';
import { PMTiles } from 'pmtiles';
import { getColor, getLegendData, TIPOS } from './colors.js';

const PMTILES_URL = 'https://braviz.hel1.your-objectstorage.com/estabelecimentos.pmtiles';
const INITIAL_VIEW = { longitude: -51.9, latitude: -14.2, zoom: 4.2, bearing: 0, pitch: 0 };

const STYLES = {
  'dark-matter': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  'positron':    'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  'voyager':     'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
};
const STYLES_NOLABELS = {
  'dark-matter': 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  'positron':    'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
  'voyager':     'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json',
};

// ── Estado ────────────────────────────────────────────────────────────────
const selectedTypes = new Set(Object.keys(TIPOS).map(Number));
let currentStyle = 'dark-matter';
let showLabels = true;

// ── PMTiles source ─────────────────────────────────────────────────────────
const pmtilesSource = new PMTiles(PMTILES_URL);

// ── MapLibre base map ──────────────────────────────────────────────────────
const map = new maplibregl.Map({
  container: 'map',
  style: STYLES['dark-matter'],
  center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
  zoom: INITIAL_VIEW.zoom,
  interactive: false,
  attributionControl: { compact: true },
});

// ── Deck.gl ────────────────────────────────────────────────────────────────
const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  preserveDrawingBuffer: true,
  useDevicePixels: true,
  initialViewState: { ...INITIAL_VIEW, minZoom: 2, maxZoom: 16 },
  controller: true,
  onViewStateChange: ({ viewState }) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing ?? 0,
      pitch: viewState.pitch ?? 0,
    });
  },
  getTooltip: ({ object }) => {
    if (!object?.properties) return null;
    const tipo = object.properties.tipo;
    const nome = TIPOS[tipo]?.nome ?? `Tipo ${tipo}`;
    return { html: `<b>${nome}</b>` };
  },
  layers: [buildLayer()],
});

window.__deck = deck;

// ── Layer ──────────────────────────────────────────────────────────────────
function selectionKey() {
  return [...selectedTypes].sort().join(',');
}

function buildLayer() {
  const key = selectionKey();
  return new TileLayer({
    id: 'estabelecimentos',
    getTileData: async ({ index: { x, y, z } }) => {
      const tile = await pmtilesSource.getZxy(z, x, y);
      if (!tile?.data) return [];
      const result = await parse(tile.data, MVTLoader, {
        mvt: { coordinates: 'wgs84', tileIndex: { x, y, z } },
        worker: false,
      });
      const features = Array.isArray(result) ? result : (result?.features ?? []);
      return features.filter(f => f?.geometry?.type === 'Point');
    },
    updateTriggers: { renderSubLayers: key },
    renderSubLayers: props => {
      const { data } = props;
      if (!data?.length) return null;
      requestAnimationFrame(renderLegend);

      return new ScatterplotLayer({
        ...props,
        id: `${props.id}-points`,
        data,
        getPosition: f => f.geometry.coordinates,
        getFillColor: f => {
          const tipo = Number(f.properties?.tipo);
          return selectedTypes.has(tipo) ? getColor(tipo) : [0, 0, 0, 0];
        },
        updateTriggers: { getFillColor: key },
        getRadius: 40,
        radiusMinPixels: 0.8,
        radiusMaxPixels: 5,
        stroked: false,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 100],
      });
    },
    minZoom: 0,
    maxZoom: 14,
    pickable: true,
  });
}

function refreshLayer() {
  deck.setProps({ layers: [buildLayer()] });
}

// ── Legenda + filtros ──────────────────────────────────────────────────────
let legendReady = false;

function renderLegend() {
  if (legendReady) return;
  legendReady = true;

  const items = getLegendData();
  const container = document.getElementById('legend-items');

  container.innerHTML = items.map(({ id, nome, cor, count }) => `
    <label class="legend-item">
      <input type="checkbox" class="tipo-check" data-id="${id}" checked />
      <span class="legend-dot" style="background:rgba(${cor[0]},${cor[1]},${cor[2]},0.9)"></span>
      <span>${nome} <span class="legend-count">(${count.toLocaleString('pt-BR')})</span></span>
    </label>
  `).join('');

  container.querySelectorAll('.tipo-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = Number(cb.dataset.id);
      cb.checked ? selectedTypes.add(id) : selectedTypes.delete(id);
      refreshLayer();
    });
  });
}

document.getElementById('btn-all').addEventListener('click', () => {
  selectedTypes.clear();
  Object.keys(TIPOS).map(Number).forEach(id => selectedTypes.add(id));
  document.querySelectorAll('.tipo-check').forEach(cb => (cb.checked = true));
  refreshLayer();
});

document.getElementById('btn-none').addEventListener('click', () => {
  selectedTypes.clear();
  document.querySelectorAll('.tipo-check').forEach(cb => (cb.checked = false));
  refreshLayer();
});

// ── Mapa base: estilo e labels ─────────────────────────────────────────────
function applyMapStyle() {
  const catalog = showLabels ? STYLES : STYLES_NOLABELS;
  map.setStyle(catalog[currentStyle]);
}

document.getElementById('style-select').addEventListener('change', e => {
  currentStyle = e.target.value;
  applyMapStyle();
});

document.getElementById('labels-check').addEventListener('change', e => {
  showLabels = e.target.checked;
  applyMapStyle();
});
