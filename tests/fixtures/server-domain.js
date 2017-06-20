const Meteor = require('meteor/meteor').Meteor
const faker = require('faker')
const campaign = require('/tests/browser/fixtures/domain').campaign
const user = require('/tests/browser/fixtures/domain').user
const contact = require('/tests/browser/fixtures/domain').contact
const campaignList = require('/tests/browser/fixtures/domain').campaignList
const contactList = require('/tests/browser/fixtures/domain').contactList
const MasterLists = require('/imports/api/master-lists/master-lists').default
const Contacts = require('/imports/api/contacts/contacts').default
const Campaigns = require('/imports/api/campaigns/campaigns').default
const Embeds = require('/imports/api/embeds/embeds').default
const createContact = require('/imports/api/contacts/methods').createContact
const createCampaign = require('/imports/api/campaigns/methods').createCampaign
const createMasterList = require('/imports/api/master-lists/methods').createMasterList
const findOneUserRef = require('/imports/api/users/users').findOneUserRef

const createTestUsers = (count) => {
  return Array(count)
    .fill(0)
    .map(() => Meteor.users.insert(user()))
    .map((_id) => Meteor.users.findOne(_id))
}

const createTestCampaigns = (count, creatorId) => {
  return Array(count)
    .fill(0)
    .map(() => createCampaign.run.call({
      userId: (creatorId || createTestUsers(1)[0]._id)
    }, campaign()))
    .map(slug => Campaigns.findOne({slug}))
}

const createTestContacts = (count, creatorId) => {
  return Array(count)
    .fill(0)
    .map(() => createContact.run.call({
      userId: (creatorId || createTestUsers(1)[0]._id)
    }, {
      details: contact()
    }))
    .map(slug => Contacts.findOne({slug}))
}

const createTestCampaignLists = (count, creatorId) => {
  return Array(count)
    .fill(0)
    .map(() => createMasterList.run.call({
      userId: (creatorId || createTestUsers(1)[0]._id)
    }, campaignList()))
    .map(_id => MasterLists.findOne({_id}))
}

const createTestContactLists = (count, creatorId) => {
  return Array(count)
    .fill(0)
    .map(() => createMasterList.run.call({
      userId: (creatorId || createTestUsers(1)[0]._id)
    }, contactList()))
    .map(_id => MasterLists.findOne({_id}))
}

const createTestEmbeds = (count, creatorId) => {
  return Array(count)
    .fill(0)
    .map(() => Embeds.insert({
      createdBy: findOneUserRef(creatorId || createTestUsers(1)[0]._id),
      datePublished: faker.date.past(),
      headline: faker.lorem.sentence(),
      image: {
        url: faker.image.imageUrl(),
        height: 50,
        width: 200,
      },
      outlet: faker.company.companyName(),
      url: faker.internet.url(),
      urls: [
        faker.internet.url()
      ]
    }))
    .map(_id => Embeds.findOne({_id}))
}

module.exports = {
  createTestUsers,
  createTestCampaigns,
  createTestContacts,
  createTestCampaignLists,
  createTestContactLists,
  createTestEmbeds
}
