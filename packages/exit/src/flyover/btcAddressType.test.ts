import { describe, expect, it, vi } from 'vitest'

vi.mock('@rsksmart/bridges-core-sdk', () => ({
  isTaprootAddress: () => false,
  isBtcNativeSegwitAddress: () => false,
  isLegacyBtcAddress: () => false,
}))

import { inferBtcAddressType } from './btcAddressType.js'

describe('inferBtcAddressType', () => {
  it('throws when format is unrecognized', () => {
    expect(() => inferBtcAddressType('not-a-valid-btc-address')).toThrow(/Unrecognized Bitcoin address/)
  })
})
