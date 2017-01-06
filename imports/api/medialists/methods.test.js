import assert from 'assert'
import { update } from './methods'
import Medialists from './medialists'
import { resetDatabase } from 'meteor/xolvio:cleaner';

describe('medialists', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow update if not logged in', function () {
    const _id = Medialists.insert({})

    assert.throws(() => {
      update.run.call(
        { userId: null },
        { _id, avatar: 'http://example.org/image.jpg' }
      )
    }, /You must be logged in/)
  })

  it('should throw if no fields to update', function () {
    const _id = Medialists.insert({})

    assert.throws(() => {
      update.run.call({ userId: '123' }, { _id })
    }, /Missing fields to update/)
  })

  it('should update avatar', function () {
    const _id = Medialists.insert({ avatar: 'http://example.org/image.jpg' })
    const updatedAvatarUrl = 'http://example.org/new_image.jpg'

    update.run.call({ userId: '123' }, { _id, avatar: updatedAvatarUrl })

    const updatedMedialist = Medialists.findOne({ _id })
    assert.equal(updatedMedialist.avatar, updatedAvatarUrl)
  })
})
