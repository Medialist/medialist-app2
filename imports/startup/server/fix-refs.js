import { Meteor } from 'meteor/meteor'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import Embeds from '/imports/api/embeds/embeds'
import MasterLists from '/imports/api/master-lists/master-lists'
import Posts from '/imports/api/posts/posts'
import Tags from '/imports/api/tags/tags'

Meteor.startup(() => {
  Campaigns.find().fetch().forEach(campaign => {
    validateHashOfSlugs(campaign, 'contacts', Campaigns, Contacts, 'campaign', 'contact')
    validateListOfRefs(campaign, 'team', Campaigns, Meteor.users, 'campaign', 'teammate')
    validateListOfRefs(campaign, 'masterLists', Campaigns, MasterLists, 'campaign', 'masterList')
    validateListOfRefs(campaign, 'tags', Campaigns, Tags, 'campaign', 'tag')
  })

  Contacts.find().fetch().forEach(contact => {
    validateListOfSlugs(contact, 'campaigns', Contacts, Campaigns, 'contact', 'campaign')
    validateListOfRefs(contact, 'masterLists', Contacts, MasterLists, 'contact', 'masterList')
    validateListOfRefs(contact, 'tags', Contacts, Tags, 'contact', 'tag')
  })

  Posts.find().fetch().forEach(post => {
    validateListOfRefs(post, 'contacts', Posts, Contacts, 'post', 'contact')
    validateListOfRefs(post, 'campaigns', Posts, Campaigns, 'post', 'campaign')
    validateListOfRefs(post, 'embeds', Posts, Embeds, 'post', 'embed')

    if (!post.contacts.length && !post.campaigns.length) {
      console.warn(`${post.type} ${post._id} had no contacts or campaigns`)
    }
  })

  MasterLists.find().fetch().forEach(list => {
    if (list.type === 'Contacts') {
      validateListOfIds(list, 'items', MasterLists, Contacts, 'masterList', 'contact')
    } else if (list.type === 'Campaigns') {
      validateListOfIds(list, 'items', MasterLists, Campaigns, 'masterList', 'campaign')
    } else {
      console.warn(`${list.name} ${list._id} had an invalid type ${list.type}`)
    }
  })

  Meteor.users.find().fetch().forEach(user => {
    validateListOfRefs(user, 'myContacts', Meteor.users, Contacts, 'user', 'myContact')
    validateListOfRefs(user, 'myCampaigns', Meteor.users, Campaigns, 'user', 'myCampaign')
    enforceFieldMinimumValue(user, 'onCampaigns', Meteor.users, 0, 'user')
  })

  Tags.find().fetch().forEach(tag => {
    const $set = {}
    const contactsCount = Contacts.find({
      'tags._id': tag._id
    }).count()

    if (tag.contactsCount !== contactsCount) {
      console.warn(`tag ${tag._id} had an invalid contactsCount - got ${tag.contactsCount} expected ${contactsCount}`)
      $set.contactsCount = contactsCount
    }

    const campaignsCount = Campaigns.find({
      'tags._id': tag._id
    }).count()

    if (tag.campaignsCount !== campaignsCount) {
      console.warn(`tag ${tag._id} had an invalid campaignsCount - got ${tag.campaignsCount} expected ${campaignsCount}`)
      $set.campaignsCount = campaignsCount
    }

    if (Object.keys($set).length) {
      Tags.update({
        _id: tag._id
      }, {
        $set
      })
    }
  })
})

const validateListOfRefs = (doc, list, docCollection, refCollection, docType, refType) => {
  doc[list].forEach(ref => {
    const refOf = refCollection.findOne(ref._id)

    if (refOf) {
      return
    }

    console.warn(`${docType} ${doc._id} has non-existent ${refType} with id ${ref._id}`)

    let t

    if (ref.slug) {
      console.warn(`Searching for ${refType} with slug ${ref.slug}`)

      t = refCollection.findOne({slug: ref.slug})
    }

    docCollection.update({
      _id: doc._id
    }, {
      $pull: {
        [`${list}._id`]: ref._id
      }
    })

    if (t) {
      docCollection.update({
        _id: doc._id
      }, {
        $push: {
          [list]: t
        }
      })
    }
  })
}

const validateHashOfSlugs = (doc, hash, docCollection, refCollection, docType, refType) => {
  Object.keys(doc[hash]).forEach(slug => {
    const ref = refCollection.findOne({slug: slug})

    if (!ref) {
      console.warn(`${docType} ${doc._id} has non-existent ${refType} with slug ${slug}`)

      docCollection.update({
        _id: doc._id
      }, {
        $unset: {
          [`${hash}.${slug}`]: ''
        }
      })

      return
    }
  })
}

const validateListOfSlugs = (doc, list, docCollection, refCollection, docType, refType) => {
  doc[list].forEach(slug => {
    const ref = refCollection.findOne({slug: slug})

    if (!ref) {
      console.warn(`${docType} ${doc._id} has non-existent ${refType} with slug ${slug}`)

      docCollection.update({
        _id: doc._id
      }, {
        $pull: {
          [list]: slug
        }
      })

      return
    }
  })
}

const validateListOfIds = (doc, list, docCollection, refCollection, docType, refType) => {
  doc[list].forEach(_id => {
    const ref = refCollection.findOne({_id})

    if (!ref) {
      console.warn(`${docType} ${doc._id} has non-existent ${refType} id with id ${_id}`)

      docCollection.update({
        _id: doc._id
      }, {
        $pull: {
          [list]: _id
        }
      })
    }
  })
}

const enforceFieldMinimumValue = (doc, property, collection, min, docType) => {
  if (doc[property] < min) {
    console.warn(`${docType} ${doc._id} has invalid ${property} value ${doc[property]}`)

    collection.update({
      _id: doc._id
    }, {
      $set: {
        [property]: min
      }
    })
  }
}
