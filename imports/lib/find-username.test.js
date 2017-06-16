import assert from 'assert'
import findUsername from '/imports/lib/find-username'

describe('find-username', function () {
  it('should extract a twitter username', function () {
    const result = findUsername('twitter', 'https://twitter.com/achingbrain')
    assert.equal(result, 'achingbrain')
  })

  it('should extract a linkedin username', function () {
    const result = findUsername('linkedin', 'https://www.linkedin.com/in/alex-potsides-bb36383/')
    assert.equal(result, 'alex-potsides-bb36383')
  })

  it('should extract a facebook username', function () {
    const result = findUsername('facebook', 'https://www.facebook.com/alex.potsides')
    assert.equal(result, 'alex.potsides')
  })

  it('should extract a youtube channel', function () {
    const result = findUsername('youtube', 'https://www.youtube.com/channel/UCF4E6XLCDbDKybW5vQIDG0Q')
    assert.equal(result, 'UCF4E6XLCDbDKybW5vQIDG0Q')
  })

  it('should extract a youtube username', function () {
    const result = findUsername('youtube', 'https://www.youtube.com/user/SigalaVEVO')
    assert.equal(result, 'SigalaVEVO')
  })

  it('should extract an instagram username', function () {
    const result = findUsername('instagram', 'https://www.instagram.com/achingbrain/')
    assert.equal(result, 'achingbrain')
  })

  it('should extract a medium username', function () {
    const result = findUsername('medium', 'https://medium.com/the-node-js-collection/an-update-on-es6-modules-in-node-js-42c958b890c')
    assert.equal(result, 'the-node-js-collection')
  })

  it('should extract a pinterest username', function () {
    const result = findUsername('pinterest', 'https://uk.pinterest.com/ddelabarra/bike-for-life/')
    assert.equal(result, 'ddelabarra')
  })

  it('should return the input unchanged when we cannot match it', function () {
    const result = findUsername('website', 'http://achingbrain.net')
    assert.equal(result, 'http://achingbrain.net')
  })
})
