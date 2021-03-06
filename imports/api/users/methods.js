import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { findOneUserRef } from '/imports/api/users/users'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import Posts from '/imports/api/posts/posts'
import MasterLists from '/imports/api/master-lists/master-lists'
import { checkAllSlugsExist } from '/imports/lib/slug'

let sendLoginLinkImplementation = () => {}
let verifyLoginTokenImplementation = () => {}

if (Meteor.isServer) {
  sendLoginLinkImplementation = require('./server/send-login-link').default
  verifyLoginTokenImplementation = require('./server/verify-login-token').default
}

const MAX_RECENT_MASTERLISTS = 5

const updateCollection = (Collection, ref, match, set) => {
  Collection.update({
    [match]: ref._id
  }, {
    $set: {
      [set]: ref
    }
  }, {
    multi: true
  })
}

export const sendLogInLink = new ValidatedMethod({
  name: 'Authentication/sendLogInLink',
  validate: new SimpleSchema({
    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    }
  }).validator(),
  run ({ email }) {
    if (this.isSimulation) {
      return
    }

    return sendLoginLinkImplementation(email)
  }
})

export const verifyLoginToken = new ValidatedMethod({
  name: 'Authentication/verifyLoginToken',
  validate: new SimpleSchema({
    token: {
      type: String
    }
  }).validator(),
  run ({ token }) {
    if (this.isSimulation) {
      return
    }

    return verifyLoginTokenImplementation(token)
  }
})

export const updateUser = new ValidatedMethod({
  name: 'User/update',
  validate: new SimpleSchema({
    name: {
      type: String
    },
    avatar: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    }
  }).validator(),
  run ({ name, avatar }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    Meteor.users.update({
      _id: this.userId
    }, {
      $set: {
        'profile.name': name,
        'profile.avatar': avatar
      }
    })

    // update all references to the user
    const userRef = findOneUserRef(this.userId)

    // yay, non-relational - nb. we cannot update `createdBy` fields as
    // they are only settable on insert
    updateCollection(Campaigns, userRef, 'team._id', 'team.$')
    updateCollection(Campaigns, userRef, 'createdBy._id', 'createdBy')
    updateCollection(Campaigns, userRef, 'updatedBy._id', 'updatedBy')
    updateCollection(Contacts, userRef, 'createdBy._id', 'createdBy')
    updateCollection(Contacts, userRef, 'updatedBy._id', 'updatedBy')
    updateCollection(Posts, userRef, 'createdBy._id', 'createdBy')
    updateCollection(Posts, userRef, 'updatedBy._id', 'updatedBy')
    updateCollection(Posts, userRef, 'pinnedBy._id', 'pinnedBy')
    updateCollection(MasterLists, userRef, 'createdBy._id', 'createdBy')
    updateCollection(MasterLists, userRef, 'updatedBy._id', 'updatedBy')
  }
})

export const addRecentCampaignList = new ValidatedMethod({
  name: 'User/addRecentCampaignList',
  validate: new SimpleSchema({
    slug: {
      type: String
    }
  }).validator(),
  run ({ slug }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    checkAllSlugsExist([slug], MasterLists)

    const user = Meteor.users.findOne({_id: this.userId})
    const recentCampaignLists = [slug].concat(user.recentCampaignLists.filter(s => s !== slug))

    if (recentCampaignLists.length > MAX_RECENT_MASTERLISTS) {
      recentCampaignLists.length = MAX_RECENT_MASTERLISTS
    }

    Meteor.users.update({
      _id: this.userId
    }, {
      $set: {
        recentCampaignLists: recentCampaignLists
      }
    })
  }
})

export const addRecentContactList = new ValidatedMethod({
  name: 'User/addRecentContactList',
  validate: new SimpleSchema({
    slug: {
      type: String
    }
  }).validator(),
  run ({ slug }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    checkAllSlugsExist([slug], MasterLists)

    const user = Meteor.users.findOne({_id: this.userId})
    const recentContactLists = [slug].concat(user.recentContactLists.filter(s => s !== slug))

    if (recentContactLists.length > MAX_RECENT_MASTERLISTS) {
      recentContactLists.length = MAX_RECENT_MASTERLISTS
    }

    Meteor.users.update({
      _id: this.userId
    }, {
      $set: {
        recentContactLists: recentContactLists
      }
    })
  }
})
