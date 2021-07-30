/* global describe, it, expect */

import TPLSmartDevice from './index.js'

describe('TPLSmartDevice', () => {
  it('should have unit-tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should be able to encryt', () => {
    expect(TPLSmartDevice.encrypt(Buffer.from('hello world')).toString('hex')).toBe('c3a6caa6c9e99ef183ef8b')
  })

  it('should be able to decrypt', () => {
    expect(TPLSmartDevice.decrypt(Buffer.from('c3a6caa6c9e99ef183ef8b', 'hex')).toString('utf8')).toBe('hello world')
  })
})
