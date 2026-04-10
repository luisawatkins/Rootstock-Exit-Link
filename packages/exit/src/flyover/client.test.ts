import { describe, expect, it } from 'vitest'
import { isEthereumProvider } from './client.js'

describe('isEthereumProvider', () => {
  it('accepts minimal EIP-1193 shape', () => {
    expect(isEthereumProvider({ request: async () => undefined })).toBe(true)
  })

  it('rejects non-objects and missing request', () => {
    expect(isEthereumProvider(null)).toBe(false)
    expect(isEthereumProvider({})).toBe(false)
    expect(isEthereumProvider({ request: 'nope' })).toBe(false)
  })
})
