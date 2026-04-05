# Rootstock Exit-Link

Monorepo for the **Pay-to-Bitcoin** toolkit: a Rootstock dApp can treat a Bitcoin address or BIP-21 invoice like a withdrawal target—optionally swapping tokens to RBTC, then exiting via **Flyover** (fast) or **PowPeg** (native bridge).

## Repository layout

| Path | Description |
|------|-------------|
| [`packages/exit`](packages/exit) | **`@rootstock-kits/exit`** — parsing, routing hints, Flyover/PowPeg/RSK Swap helpers, TanStack Query hooks, progress UI |
| [`apps/crypto-bill-pay-demo`](apps/crypto-bill-pay-demo) | **Crypto Bill Pay** — Vite + React demo application |

## Requirements

- **Node.js** 18 or newer
- A browser wallet (MetaMask, Rabby, etc.) on **Rootstock Mainnet** (chain ID `30`, hex `0x1e`) or **Testnet** (chain ID `31`, hex `0x1f`)

## Install

From the repository root:

```bash
npm install --ignore-scripts
```

Use **`--ignore-scripts`** because a transitive dependency (`@stellar/stellar-sdk`) runs a postinstall step that expects `yarn` and can fail on Windows and other environments. Skipping lifecycle scripts is safe for this workspace.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Crypto Bill Pay demo (Vite dev server, default [http://localhost:5173](http://localhost:5173)) |
| `npm run build` | Build the `@rootstock-kits/exit` library (`dist/`) |
| `npm run build -w crypto-bill-pay-demo` | Production build of the demo |
| `npm run lint` | Typecheck the exit package (and the demo, if a lint script is added) |

After changing Vite polyfills or heavy dependencies, refresh prebundling:

```bash
npm run dev -- --force
```

## `@rootstock-kits/exit`

Published-style package name: **`@rootstock-kits/exit`**. It wraps:

- [@rsksmart/flyover-sdk](https://www.npmjs.com/package/@rsksmart/flyover-sdk)
- [@rsksmart/powpeg-sdk](https://www.npmjs.com/package/@rsksmart/powpeg-sdk)
- [@rsksmart/rsk-swap-sdk](https://www.npmjs.com/package/@rsksmart/rsk-swap-sdk)
- [@rsksmart/bridges-core-sdk](https://www.npmjs.com/package/@rsksmart/bridges-core-sdk)

**Highlights:**

- **Input parsing** — `parseBitcoinPayInput()` for bare addresses and `bitcoin:…?amount=` URIs (network-aware validation via Flyover utils).
- **Route suggestion** — `recommendBridgeRoute()` prefers Flyover when quotes exist and urgency is higher; large, low-urgency amounts can skew toward PowPeg in the heuristic.
- **Flyover peg-out** — `createFlyoverClient()`, `fetchBestPegoutQuote()`, `executeFlyoverPegout()` (accept quote + `depositPegout`).
- **PowPeg** — `createPowPegSdk()`, `estimatePowPegPegoutFees()` for fee visibility; full native peg-out UX is typically completed in the [PowPeg app](https://powpeg.rootstock.io/) (testnet: [https://powpeg.testnet.rootstock.io/](https://powpeg.testnet.rootstock.io/)).
- **Swap to RBTC** — `createRskSwapSdk()`, `runSwapToRbtc()` for same-chain token → RBTC via RSK Swap.
- **React + TanStack Query** — `usePegoutQuotes`, `usePowPegFees`, `useSwapToRbtc`, `useFlyoverPegoutMutation`.
- **Progress UI** — `ExitProgressTracker` plus `mapPegoutDetailStatusToExitStage()` to map Flyover peg-out statuses into coarse stages.

Peer dependencies: `react`, `@tanstack/react-query`.

Build the library:

```bash
npm run build -w @rootstock-kits/exit
```

## Crypto Bill Pay demo

The demo connects a wallet, parses a sample testnet BIP-21 line, loads Flyover quotes and PowPeg fee estimates, shows the suggested route, and can submit a Flyover peg-out when a quote is returned. It also demonstrates RIF/USDT → RBTC swap entry points.

Develop against the **source** of the kit via the Vite alias in [`apps/crypto-bill-pay-demo/vite.config.ts`](apps/crypto-bill-pay-demo/vite.config.ts) (no need to rebuild `packages/exit` on every UI change).

## Browser bundling (Vite / Webpack)

Rootstock SDKs pull in **bitcoinjs-lib**, **streams**, and **WASM** (for example via PowPeg). For Vite, this demo uses:

- [`vite-plugin-node-polyfills`](https://github.com/davidmyersdev/vite-plugin-node-polyfills) for `Buffer`, `process`, `util`, `stream`, `crypto`, and related shims
- [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) and [`vite-plugin-top-level-await`](https://github.com/Menci/vite-plugin-top-level-await) for WASM used in the dependency tree

If you embed `@rootstock-kits/exit` in your own app, mirror a similar setup or expect runtime errors such as `Buffer is not defined` or `process is not defined`.

## Further reading

- [Flyover — Rootstock Developers Portal](https://dev.rootstock.io/developers/integrate/flyover/)
- [Flyover SDK integration](https://dev.rootstock.io/developers/integrate/flyover/sdk/)
- [PowPeg app overview](https://dev.rootstock.io/resources/guides/powpeg-app/overview/)
