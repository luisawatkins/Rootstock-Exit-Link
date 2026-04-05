import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import {
  decimalToUnits,
  ExitProgressTracker,
  parseBitcoinPayInput,
  rbtcDecimalToWei,
  recommendBridgeRoute,
  satoshisToWei,
  useFlyoverPegoutMutation,
  usePegoutQuotes,
  usePowPegFees,
  useSwapToRbtc,
  weiToRbtcDecimal,
  type EthereumProvider,
  type ExitNetwork,
  type ExitStage,
  type Urgency,
} from '@rootstock-kits/exit'

const CHAIN_IDS: Record<ExitNetwork, string> = {
  mainnet: '0x1e',
  testnet: '0x1f',
}

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

export function App() {
  const [network, setNetwork] = useState<ExitNetwork>('testnet')
  const [account, setAccount] = useState<string | undefined>()
  const [chainWarning, setChainWarning] = useState<string | undefined>()
  const [payInput, setPayInput] = useState(
    'bitcoin:tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx?amount=0.0001&label=Invoice%20demo',
  )
  const [rbtcAmount, setRbtcAmount] = useState('0.005')
  const [urgency, setUrgency] = useState<Urgency>('high')
  const [payToken, setPayToken] = useState<'RBTC' | 'RIF' | 'USDT'>('RBTC')
  const [tokenAmount, setTokenAmount] = useState('10')
  const [exitStage, setExitStage] = useState<ExitStage>('idle')

  const eth = typeof window !== 'undefined' ? (window as Window & { ethereum?: EthereumProvider }).ethereum : undefined

  const parsed = useMemo(() => parseBitcoinPayInput(payInput, network), [payInput, network])

  const valueWei = useMemo(() => {
    if (!parsed.ok) return undefined
    if (parsed.value.amountSatoshis !== undefined) {
      return satoshisToWei(parsed.value.amountSatoshis)
    }
    return rbtcDecimalToWei(rbtcAmount.trim())
  }, [parsed, rbtcAmount])

  const rbtcForPowpeg = useMemo(() => {
    if (valueWei === undefined) return rbtcAmount.trim()
    return weiToRbtcDecimal(valueWei)
  }, [valueWei, rbtcAmount])

  const connect = useCallback(async () => {
    if (!eth) {
      setChainWarning('No injected wallet (MetaMask, Rabby, etc.).')
      return
    }
    const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[]
    const addr = accounts[0]
    setAccount(addr)
    const id = (await eth.request({ method: 'eth_chainId' })) as string
    if (id.toLowerCase() !== CHAIN_IDS[network].toLowerCase()) {
      setChainWarning(
        `Switch wallet to Rootstock ${network} (chainId ${CHAIN_IDS[network]}). Connected: ${id}`,
      )
    } else {
      setChainWarning(undefined)
    }
  }, [eth, network])

  const pegoutQuery = usePegoutQuotes({
    provider: eth,
    network,
    rskRefundAddress: account,
    btcDestination: parsed.ok ? parsed.value.address : undefined,
    valueWei,
    enabled: parsed.ok && Boolean(account) && valueWei !== undefined && valueWei > 0n,
  })

  const powpegFees = usePowPegFees({
    network,
    amountRbtcDecimal: rbtcForPowpeg,
    fromRskAddress: account,
    enabled: Boolean(account) && rbtcForPowpeg.length > 0,
  })

  const route = useMemo(
    () =>
      recommendBridgeRoute({
        urgency,
        amountSatoshis: parsed.ok ? parsed.value.amountSatoshis : undefined,
        flyoverQuotesAvailable: Boolean(pegoutQuery.data),
        powPegEtaHours: 34,
      }),
    [urgency, parsed, pegoutQuery.data],
  )

  const pegoutMut = useFlyoverPegoutMutation()
  const swapMut = useSwapToRbtc()

  const runPegout = async () => {
    if (!eth || !account || !pegoutQuery.data) return
    setExitStage('rootstock_tx')
    try {
      const tx = await pegoutMut.mutateAsync({
        provider: eth,
        network,
        selection: pegoutQuery.data,
      })
      setExitStage('bridge')
      console.info('depositPegout tx', tx)
    } catch (e) {
      console.error(e)
      setExitStage('idle')
    }
  }

  const runSwap = async () => {
    if (!eth || !account) return
    const dec = payToken === 'USDT' ? 18 : 18
    const fromAmount = decimalToUnits(tokenAmount.trim(), dec)
    if (fromAmount === null || fromAmount <= 0n) return
    try {
      await swapMut.mutateAsync({
        provider: eth,
        network,
        fromToken: payToken,
        fromAmount,
        recipientRsk: account,
        refundRsk: account,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const powpegUrl =
    network === 'testnet' ? 'https://powpeg.testnet.rootstock.io/' : 'https://powpeg.rootstock.io/'

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <header style={{ marginBottom: '2.25rem' }}>
        <p
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '2.75rem',
            lineHeight: 1.1,
            margin: '0 0 0.5rem',
            fontStyle: 'italic',
            color: 'var(--accent)',
          }}
        >
          Crypto Bill Pay
        </p>
        <p style={{ margin: 0, color: 'var(--muted)', maxWidth: '36rem' }}>
          Demo of <strong>@rootstock-kits/exit</strong>: pay a Bitcoin invoice from Rootstock using Flyover or PowPeg,
          with optional RIF/USDT → RBTC swap via RSK Swap.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.85fr)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
        className="layout-grid"
      >
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '1.35rem 1.5rem',
            display: 'grid',
            gap: '1.1rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <label style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as ExitNetwork)}
              style={selectStyle}
            >
              <option value="testnet">Rootstock Testnet</option>
              <option value="mainnet">Rootstock Mainnet</option>
            </select>
            <button type="button" onClick={connect} style={btnPrimary}>
              {account ? `Connected ${shortAddr(account)}` : 'Connect wallet'}
            </button>
          </div>
          {chainWarning && (
            <div style={{ color: 'var(--warn)', fontSize: '0.85rem' }}>{chainWarning}</div>
          )}

          <label style={labelStyle}>
            Bitcoin address or BIP-21 URI
            <textarea
              value={payInput}
              onChange={(e) => setPayInput(e.target.value)}
              rows={3}
              style={textareaStyle}
            />
          </label>

          {!parsed.ok && <div style={{ color: '#f87171', fontSize: '0.9rem' }}>{parsed.error}</div>}
          {parsed.ok && (
            <div style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
              Pay to <strong style={{ color: 'var(--text)' }}>{parsed.value.address}</strong>
              {parsed.value.amountSatoshis !== undefined && (
                <>
                  {' '}
                  — URI amount {parsed.value.amountBtc} BTC (
                  {parsed.value.amountSatoshis.toString()} sat)
                </>
              )}
            </div>
          )}

          {parsed.ok && parsed.value.amountSatoshis === undefined && (
            <label style={labelStyle}>
              RBTC amount to peg out (if not in URI)
              <input
                value={rbtcAmount}
                onChange={(e) => setRbtcAmount(e.target.value)}
                style={inputStyle}
              />
            </label>
          )}

          <label style={labelStyle}>
            Urgency (route hint)
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
              style={selectStyle}
            >
              <option value="high">High — prefer Flyover speed</option>
              <option value="medium">Medium</option>
              <option value="low">Low — large slow exits may favor PowPeg</option>
            </select>
          </label>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 8,
              background: '#0f141c',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Route suggestion</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{route.summary}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--accent)' }}>
              Selected route: <strong>{route.route}</strong>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.65rem' }}>Flyover peg-out</div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
              Quotes load via liquidity providers. Executing calls <code>acceptPegoutQuote</code> and{' '}
              <code>depositPegout</code> on the LBC.
            </p>
            {pegoutQuery.isLoading && <div style={{ color: 'var(--muted)' }}>Loading quotes…</div>}
            {pegoutQuery.error && (
              <div style={{ color: '#f87171', fontSize: '0.88rem' }}>{pegoutQuery.error.message}</div>
            )}
            {pegoutQuery.data && (
              <div style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Best quote from <strong style={{ color: 'var(--text)' }}>{pegoutQuery.data.preview.providerName}</strong>
                — total {weiToRbtcDecimal(pegoutQuery.data.preview.totalWei)} RBTC (incl. fees, wei{' '}
                {pegoutQuery.data.preview.totalWei.toString()})
              </div>
            )}
            <button
              type="button"
              style={{ ...btnPrimary, marginTop: '0.75rem', opacity: pegoutQuery.data ? 1 : 0.45 }}
              disabled={!pegoutQuery.data || pegoutMut.isPending}
              onClick={runPegout}
            >
              {pegoutMut.isPending ? 'Signing…' : 'Pay Bitcoin (Flyover)'}
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>PowPeg (native bridge)</div>
            {powpegFees.isLoading && <div style={{ color: 'var(--muted)' }}>Estimating fees…</div>}
            {powpegFees.data && (
              <div style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Est. Rootstock fee (wei): {powpegFees.data.rootstockFee.toString()} — Bitcoin fee (sats):{' '}
                {powpegFees.data.bitcoinFee.toString()}
              </div>
            )}
            <a href={powpegUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.65rem' }}>
              Open PowPeg app for full native peg-out flow →
            </a>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Auto-swap to RBTC</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={payToken}
                onChange={(e) => setPayToken(e.target.value as typeof payToken)}
                style={selectStyle}
              >
                <option value="RBTC">RBTC (no swap)</option>
                <option value="RIF">RIF → RBTC</option>
                <option value="USDT">USDT → RBTC</option>
              </select>
              {payToken !== 'RBTC' && (
                <input
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="Amount (18 decimals)"
                  style={{ ...inputStyle, minWidth: 140 }}
                />
              )}
              {payToken !== 'RBTC' && (
                <button type="button" style={btnSecondary} disabled={swapMut.isPending} onClick={runSwap}>
                  {swapMut.isPending ? 'Swapping…' : 'Run swap'}
                </button>
              )}
            </div>
            {swapMut.isSuccess && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--ok)' }}>
                Swap submitted (see console for tx hash).
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: 12,
            padding: '1.35rem 1.5rem',
          }}
        >
          <ExitProgressTracker stage={exitStage} />
          <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
            After a Flyover deposit, poll <code>getPegoutStatus</code> and map statuses with{' '}
            <code>mapPegoutDetailStatusToExitStage</code> from the kit to drive this UI.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const labelStyle: CSSProperties = {
  display: 'grid',
  gap: '0.35rem',
  fontSize: '0.8rem',
  color: 'var(--muted)',
}

const inputStyle: CSSProperties = {
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: '#0f141c',
  color: 'var(--text)',
  padding: '0.55rem 0.65rem',
  fontSize: '0.95rem',
}

const textareaStyle: CSSProperties = { ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }

const selectStyle: CSSProperties = { ...inputStyle, cursor: 'pointer' }

const btnPrimary: CSSProperties = {
  border: 'none',
  borderRadius: 8,
  padding: '0.55rem 1rem',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-dim) 100%)',
  color: '#111',
}

const btnSecondary: CSSProperties = {
  ...btnPrimary,
  background: '#243044',
  color: 'var(--text)',
}
