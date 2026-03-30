# ngrx-demo

Proyecto de ejemplo para aprender **Angular 21 + NgRx 21** con un caso real y pequeño: un dashboard de criptomonedas con snapshot por REST y actualizaciones en vivo por WebSocket.

## Qué incluye

- Angular standalone con routing.
- NgRx clásico y visible: `actions`, `reducers`, `selectors`, `effects` y Devtools.
- Datos públicos de Kraken para `BTC/USD`, `ETH/USD` y `SOL/USD`.
- Watchlist persistida en `localStorage`.
- Deploy listo para Vercel como SPA estática.

## Flujo NgRx que muestra la app

1. El `App` despacha `App Entered`.
2. Un effect lanza `Load Snapshot` y carga favoritos desde `localStorage`.
3. El effect de REST guarda el snapshot inicial en el reducer.
4. Otro effect abre el WebSocket de Kraken.
5. Cada mensaje `ticker` se convierte en acción y actualiza el store.
6. Los selectors construyen view models para dashboard y detalle.
7. Las plantillas renderizan esos selectors con `async`.

Recorrido principal en código:

- `component -> action -> effect -> service -> reducer -> selector -> template`

## Estructura rápida

- `src/app/state/markets`: estado principal del mercado.
- `src/app/state/watchlist`: favoritos persistidos.
- `src/app/core/services`: integración REST y WebSocket con Kraken.
- `src/app/core/adapters`: normalización de payloads externos.
- `src/app/features/markets`: pantallas y componentes.

## Cómo arrancarlo

```bash
npm install
npm start
```

La app queda en `http://localhost:4200`.

## Scripts útiles

```bash
npm run build
npm test
npm run test:ci
```

## Qué mirar para aprender

- Dashboard: [src/app/features/markets/containers/markets-page/markets-page.component.ts](/C:/Repos/ngrx-demo/src/app/features/markets/containers/markets-page/markets-page.component.ts)
- Detail route: [src/app/features/markets/containers/market-detail-page/market-detail-page.component.ts](/C:/Repos/ngrx-demo/src/app/features/markets/containers/market-detail-page/market-detail-page.component.ts)
- Actions: [src/app/state/markets/markets.actions.ts](/C:/Repos/ngrx-demo/src/app/state/markets/markets.actions.ts)
- Reducer: [src/app/state/markets/markets.reducer.ts](/C:/Repos/ngrx-demo/src/app/state/markets/markets.reducer.ts)
- Effects: [src/app/state/markets/markets.effects.ts](/C:/Repos/ngrx-demo/src/app/state/markets/markets.effects.ts)
- Selectors: [src/app/state/markets/markets.selectors.ts](/C:/Repos/ngrx-demo/src/app/state/markets/markets.selectors.ts)

## Deploy en Vercel

El proyecto ya incluye `vercel.json`, así que normalmente no hace falta tocar nada.

### Opción 1: desde Git

1. Sube el repo a GitHub, GitLab o Bitbucket.
2. Importa el proyecto en Vercel.
3. Vercel leerá estos valores ya definidos:
   - Build Command: `npm run build`
   - Output Directory: `dist/ngrx-demo/browser`

### Opción 2: desde CLI

```bash
npx vercel
npx vercel --prod
```

## Nota sobre la API

- REST: `https://api.kraken.com/0/public`
- WebSocket: `wss://ws.kraken.com/v2`
- En la validación hecha el **30 de marzo de 2026**, Kraken respondió con CORS para REST pública cuando el navegador envía `Origin`, así que esta v1 consume Kraken directamente sin proxy de Vercel.

## Tests incluidos

- Reducers de `markets` y `watchlist`.
- Selectors derivados para dashboard y detalle.
- Effects de snapshot, hidratación y persistencia.

## Siguientes mejoras posibles

- Añadir filtros u ordenación como estado derivado.
- Incluir `@ngrx/entity` en una rama aparte para comparar enfoques.
- Añadir un gráfico pequeño para estudiar composición de selectors.
