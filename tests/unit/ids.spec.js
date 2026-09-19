import { describe, expect, it, vi } from 'vitest'

import { bigintIdPath, createClientRequestId, isBigintId } from '../../src/utils/ids'

describe('bigint IDs', () => {
  it.each([1, 9007199254740991, '1', '9223372036854775807'])(
    'accepts positive int64 ID %s',
    (id) => expect(isBigintId(id)).toBe(true),
  )

  it.each([0, -1, 1.5, '0', '-1', '01', '1.5', '9223372036854775808', 'abc', null])(
    'rejects invalid or out-of-range ID %s',
    (id) => expect(isBigintId(id)).toBe(false),
  )

  it('normalizes valid route IDs and rejects invalid path values', () => {
    expect(bigintIdPath(42)).toBe('42')
    expect(bigintIdPath('42')).toBe('42')
    expect(() => bigintIdPath('not-an-id')).toThrow(TypeError)
  })

  it('generates a positive JSON-safe integer client request ID', () => {
    const getRandomValues = vi.spyOn(crypto, 'getRandomValues').mockImplementation((words) => {
      words.set([0x001fffff, 0xffffffff])
      return words
    })

    const id = createClientRequestId()

    expect(id).toBe(Number.MAX_SAFE_INTEGER)
    expect(Number.isSafeInteger(id)).toBe(true)
    expect(getRandomValues).toHaveBeenCalledOnce()
    getRandomValues.mockRestore()
  })
})
