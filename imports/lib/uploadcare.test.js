import assert from 'assert'
import Uploadcare from '/imports/lib/uploadcare'

describe('Uploadcare', function () {
  it('should not store non-uploadcare URL', function () {
    const res = Uploadcare.store('http://example.org/image.jpg')
    assert.equal(res, false)
  })

  it('should not store null URL', function () {
    const res = Uploadcare.store(null)
    assert.equal(res, false)
  })

  it('should not store undefined URL', function () {
    const res = Uploadcare.store()
    assert.equal(res, false)
  })

  it('should not store uploadcare URL without UUID', function () {
    const res = Uploadcare.store('https://ucarecdn.com/')
    assert.equal(res, false)
  })

  it('should store uploadcare URL', function () {
    const res = Uploadcare.store('https://ucarecdn.com/c53f4db4-c995-44b3-b104-6b6b3357000a/BvZlyvfd.jpg')
    assert.equal(res, true)
  })
})
