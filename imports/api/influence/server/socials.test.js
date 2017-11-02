/* global describe it beforeEach */

import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import testResponse from './socials.update.test.json'
import {sendForSocials, handleSocialsUpdate} from './routes'
import { createTestUsers, createTestContacts } from '/tests/fixtures/server-domain'
import { HTTP } from 'meteor/http'

describe('handleSocialsUpdate', function () {
  let users
  let contacts

  beforeEach(function () {
    resetDatabase()
    users = createTestUsers(1)
    contacts = createTestContacts(4)
  })

  it('should validate params', function () {
    assert.throws(() => {
      handleSocialsUpdate({socials: 'no scrubs'})
    }, 'Throw scrubs')
    assert.throws(() => {
      handleSocialsUpdate({buster: ['also', 'known', 'as']})
    }, 'Throw busters')
  })

  it('should update contacts with new social info', function () {
    const testUsername = 'guardian'

    Contacts.update({
      _id: contacts[0]._id
    }, {
      $set: {
        socials: [{
          label: 'Twitter',
          value: testUsername
        }]
      }
    })

    Contacts.update({
      _id: contacts[1]._id
    }, {
      $set: {
        socials: [{
          label: 'Twitter',
          value: testUsername
        }]
      }
    })

    // has old screen_name that should get updated
    Contacts.update({
      _id: contacts[2]._id
    }, {
      $set: {
        socials: [{
          label: 'Twitter',
          value: 'OG',
          twitterId: '87818409'
        }]
      }
    })

    // 1 contact has same username for a different network
    Contacts.update({
      _id: contacts[3]._id
    }, {
      $set: {
        socials: [{
          label: 'Foobar',
          value: testUsername
        }]
      }
    })

    handleSocialsUpdate(testResponse)

    const res = Contacts.find({
      _id: {
        $in: contacts.slice(0,3).map(c => c._id)
      }
    }).fetch()
    console.log('res ', res.map(r => r.socials))
    res.forEach(c => {
      console.log(c.socials[0], testResponse.socials[0])
      assert.deepEqual(c.socials[0], testResponse.socials[0], 'Social info should be updated')
      assert.equal(c.bio, 'The need for independent journalism has never been greater. Become a Guardian supporter: http://gu.com/supporter/twitter')
      assert.equal(c.avatar, 'https://pbs.twimg.com/profile_images/877153924637175809/deHwf3Qu_normal.jpg')
    })

    Contacts.find({
      _id: contacts[3]
    }).forEach(c => {
      assert.deepEqual(c.socials, [{
        label: 'Foobar',
        value: testUsername
      }], 'Social info should NOT be updated')
    })
  })
})
