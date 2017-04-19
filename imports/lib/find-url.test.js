import findUrl from './find-url'
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
