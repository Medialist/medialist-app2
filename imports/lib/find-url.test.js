import findUrl, {findAllUrls} from '/imports/lib/find-url'
import assert from 'assert'

describe('find-url', function () {

  it('should find a url', function () {
    const text = `This is some text with http://www.google.com a url in it`

    assert.equal(findUrl(text), 'http://www.google.com')
  })

  it('should find a url with a trailing slash', function () {
    const text = `This is some text with http://www.google.com/ a url in it`

    assert.equal(findUrl(text), 'http://www.google.com/')
  })
})

describe('findAllUrls', function () {

  it('should find all the urls', function () {
    const text = `This is some text with http://www.google.com a url in it and a HTTPS://foo.bar`

    assert.deepEqual(findAllUrls(text), ['http://www.google.com', 'HTTPS://foo.bar'])
  })

  it('should return empty array where no urls exist', function () {
    const text = `This is some text with`

    assert.deepEqual(findAllUrls(text), [])
  })

  it('should return empty array when text is invalid', function () {
    const inputs = [null, false, undefined, 0, NaN, {}]
    inputs.forEach(t => assert.deepEqual(findAllUrls(t), []))
  })
})
