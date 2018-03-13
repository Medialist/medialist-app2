import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import _ from 'underscore'
import Posts from '/imports/api/posts/posts'
import { findPinnedNeedToKnows } from '/imports/api/posts/queries'
import { createTestNeedToKnowPosts } from '/tests/fixtures/server-domain'

describe('findPinnedNeedToKnows', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should validate conatct slug is present and a string', function () {
    assert.throws(() => findPinnedNeedToKnows())
    assert.throws(() => findPinnedNeedToKnows(138))
    assert.doesNotThrow(() => findPinnedNeedToKnows('TEST'))
  })

  it('should only find pinned posts', function () {
    const allPosts = createTestNeedToKnowPosts(3)

    // Un-pin the first
    Posts.update({
      _id: allPosts[0]._id
    }, {
      $set: {
        pinnedAt: null,
        pinnedBy: null
      }
    })

    const posts = findPinnedNeedToKnows(allPosts[0].contacts[0].slug).fetch()

    // Should find two posts
    assert.equal(posts.length, 2)

    // Assert that the pinned posts are the found posts
    assert(allPosts.slice(1).every(post => posts.some(p => post._id === p._id)))
  })

  it('should sort by pinnedAt', function () {
    const allPosts = createTestNeedToKnowPosts(3)
    const now = Date.now()

    _.shuffle(allPosts).forEach((post, i) => {
      Posts.update({
        _id: post._id
      }, {
        $set: {
          pinnedAt: new Date(now + i)
        }
      })
    })

    const posts = findPinnedNeedToKnows(allPosts[0].contacts[0].slug).fetch()

    // Should find three posts
    assert.equal(posts.length, 3)

    // Should have sorted them by pinnedAt
    assert(posts[0].pinnedAt > posts[1].pinnedAt)
    assert(posts[1].pinnedAt > posts[2].pinnedAt)
  })
})
