import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import MasterLists from '/imports/api/master-lists/master-lists'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import findUniqueSlug from '/imports/lib/slug'
import { addToMyFavourites, findOneUserRef } from '/imports/api/users/users'
import { ContactSlugsOrSearchSchema } from '/imports/api/contacts/schema'
import { findOrValidateContactSlugs } from '/imports/api/contacts/queries'
import { findOrValidateCampaignSlugs } from '/imports/api/campaigns/queries'
import { CampaignSlugsOrSearchSchema } from '/imports/api/campaigns/schema'

export const batchAddToContactLists = new ValidatedMethod({
  name: 'batchAddToContactLists',

  applyOptions: {
    returnStubValue: false
  },

  validate: new SimpleSchema({
    masterListIds: {
      type: Array
    },
    'masterListIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).extend(ContactSlugsOrSearchSchema).validator(),

  run ({masterListIds, ...searchOrSlugs}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const slugs = findOrValidateContactSlugs(searchOrSlugs)

    return batchAddToMasterLists.run.call(this, {
      slugs,
      masterListIds,
      type: 'Contacts'
    })
  }
})

export const batchAddToCampaignLists = new ValidatedMethod({
  name: 'batchAddToCampaignLists',

  applyOptions: {
    returnStubValue: false
  },

  validate: new SimpleSchema({
    masterListIds: {
      type: Array
    },
    'masterListIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).extend(CampaignSlugsOrSearchSchema).validator(),

  run ({masterListIds, ...searchOrSlugs}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (this.isSimulation) {
      return
    }

    const slugs = findOrValidateCampaignSlugs(searchOrSlugs)

    return batchAddToMasterLists.run.call(this, {
      slugs,
      masterListIds,
      type: 'Campaigns'
    })
  }
})

/*
 * Add an array of Campaigns/Contacts to an array of master lists.
 * If any of the entities are already in a given master list, it will remain so.
 */
export const batchAddToMasterLists = new ValidatedMethod({
  name: 'batchAddToMasterLists',
  validate: new SimpleSchema({
    slugs: {
      type: Array
    },
    'slugs.$': {
      type: String
    },
    masterListIds: {
      type: Array
    },
    'masterListIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    type: {
      type: String,
      allowedValues: ['Contacts', 'Campaigns']
    }
  }).validator(),

  run ({type, slugs = [], masterListIds = []}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const Collection = (type === 'Contacts') ? Contacts : Campaigns

    const itemIds = Collection
      .find({
        slug: {
          $in: slugs
        }
      }, {
        fields: {
          _id: 1
        }
      })
      .map((d) => d._id)

    const masterListRefs = MasterLists
      .find({
        _id: {
          $in: masterListIds
        }
      }, {
        fields: {
          _id: 1,
          name: 1,
          slug: 1
        }
      }).fetch()

    MasterLists.update({
      _id: {
        $in: masterListIds
      }
    }, {
      $addToSet: {
        items: {
          $each: itemIds
        }
      }
    }, {
      multi: true
    })

    Collection.update({
      _id: {
        $in: itemIds
      }
    }, {
      $addToSet: {
        masterLists: {
          $each: masterListRefs
        }
      },
      $set: {
        updatedAt: new Date()
      }
    }, {
      multi: true
    })

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: type === 'Campaigns' ? slugs : [],
      contactSlugs: type === 'Contacts' ? slugs : []
    })

    return { slugCount: slugs.length, masterListCount: masterListIds.length }
  }
})

export const createMasterList = new ValidatedMethod({
  name: 'MasterLists/create',
  validate: new SimpleSchema({
    name: {
      type: String,
      min: 1
    },
    type: {
      type: String,
      allowedValues: ['Contacts', 'Campaigns']
    }
  }).validator(),
  run ({ type, name }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const lists = MasterLists.find({
      type: type
    }, {
      sort: {
        order: -1
      },
      limit: 1
    }).fetch()

    const order = lists.reduce((p, doc) => {
      return doc.order + 1
    }, 0)

    const doc = {type, name, order, items: []}
    doc.slug = findUniqueSlug(doc.name, MasterLists)
    doc.createdBy = findOneUserRef(this.userId)
    doc.createdAt = new Date()

    return MasterLists.insert(doc)
  }
})

export const removeMasterList = new ValidatedMethod({
  name: 'MasterLists/delete',
  validate: new SimpleSchema({
    _ids: {
      type: Array
    },
    '_ids.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run ({_ids}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    _ids.forEach(_id => {
      const masterList = MasterLists.findOne({
        _id: _id
      })

      if (!masterList) {
        return
      }

      MasterLists.remove({
        _id: _id
      })

      const refCollection = (masterList.type === 'Contacts') ? Contacts : Campaigns
      refCollection.update({
        'masterLists._id': _id
      }, {
        $pull: {
          masterLists: { _id: _id }
        }
      }, {
        multi: true
      })
    })
  }
})

export const updateMasterList = new ValidatedMethod({
  name: 'MasterLists/update',
  validate: new SimpleSchema({
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    name: {
      type: String,
      min: 1
    }
  }).validator(),
  run ({ _id, name }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const masterList = MasterLists.findOne({ _id })

    if (!masterList) {
      throw new Meteor.Error('MasterList not found')
    }

    MasterLists.update({
      _id
    }, {
      $set: {
        name,
        updatedBy: findOneUserRef(this.userId),
        updatedAt: new Date()
      }
    })

    const refCollection = (masterList.type === 'Contacts') ? Contacts : Campaigns
    return refCollection.update({
      'masterLists._id': _id
    }, {
      $set: {
        'masterLists.$.name': name
      }
    }, { multi: true })
  }
})

export const setMasterLists = new ValidatedMethod({
  name: 'MasterLists/setMasterLists',
  validate: new SimpleSchema({
    item: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    masterLists: {
      type: Array
    },
    'masterLists.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    type: {
      type: String,
      allowedValues: ['Contacts', 'Campaigns']
    }
  }).validator(),
  run ({type, item, masterLists = []}) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const refCollection = (type === 'Contacts') ? Contacts : Campaigns
    const itemDocument = refCollection.findOne({_id: item})

    if (!itemDocument) {
      throw new Meteor.Error(`${type.substring(0, type.length - 1)} not found`)
    }

    MasterLists.update({
      _id: {
        $in: masterLists
      }
    }, {
      $addToSet: {
        items: item
      }
    }, {
      multi: true
    })

    const removeItemsFromMasterListsIds = itemDocument.masterLists
      .map(list => list._id)
      .filter((oldListItem) => masterLists.indexOf(oldListItem) === -1)

    MasterLists.update({
      _id: {
        $in: removeItemsFromMasterListsIds
      }
    }, {
      $pull: {
        items: item
      }
    }, {
      multi: true
    })

    const masterListRefs = MasterLists.findRefs(masterLists)

    refCollection.update({
      _id: item
    }, {
      $set: {
        masterLists: masterListRefs
      }
    })

    addToMyFavourites({
      userId: this.userId,
      campaignSlugs: type === 'Campaigns' ? [itemDocument.slug] : [],
      contactSlugs: type === 'Contacts' ? [itemDocument.slug] : []
    })
  }
})
