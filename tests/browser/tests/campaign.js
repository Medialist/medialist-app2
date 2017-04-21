'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['campaign'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should edit an existing campaign': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)
        .editCampaign()

      const updated = domain.campaign()

      campaignPage.section.editCampaignForm
        .verifyEditFormContents(campaign)
        .populate(updated)
        .submit()

      t.perform((done) => {
        t.db.findCampaign({
          name: updated.name
        })
        .then((doc) => {
          assertions.campaignsAreEqual(t, doc, updated)

          done()
        })
      })

      done()
    })

    t.end()
  },

  'Should add contacts to a campaign': function (t) {
    t.createDomain(['contact', 'contact', 'campaign'], (contact1, contact2, campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .openAddContactsModal()

      campaignPage.section.addContactsModal
        .add(contact1)
        .add(contact2)
        .save()

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(Object.keys(doc.contacts).length, 2)
          t.assert.equal(doc.contacts[contact1.slug], 'To Contact')
          t.assert.equal(doc.contacts[contact2.slug], 'To Contact')

          done()
        })
      })

      done()
    })

    t.end()
  },

  'Should remove contacts from a campaign': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2, contact3], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .selectRow(0)
          .selectRow(1)

        campaignContactsPage.removeContacts()

        t.perform((done) => {
          t.db.findContacts({
            campaigns: {
              $in: [campaign.slug]
            }
          })
          .then((docs) => {
            t.assert.equal(docs.length, 1)

            done()
          })
        })

        done()
      })

      done()
    })

    t.end()
  },

  'Should cancel removing contacts from a campaign': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage
          .openAddContactsModal()

        campaignPage.section.addContactsModal
          .add(contact3)
          .cancel()

        t.perform((done) => {
          t.db.findCampaign({
            _id: campaign._id
          })
          .then((doc) => {
            t.assert.equal(Object.keys(doc.contacts).length, 2)
            t.assert.equal(doc.contacts[contact1.slug], 'To Contact')
            t.assert.equal(doc.contacts[contact2.slug], 'To Contact')

            done()
          })
        })

        done()
      })

      done()
    })

    t.end()
  },

  'Should add team members to a campaign': function (t) {
    t.createDomain(['user', 'user', 'campaign'], (user1, user2, campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .editTeam()
        .addToTeam(user1)
        .addToTeam(user2)
        .saveTeamEdit()

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.team.length, 3)
          t.assert.equal(doc.team.find(member => member._id === user1._id)._id, user1._id)
          t.assert.equal(doc.team.find(member => member._id === user2._id)._id, user2._id)

          done()
        })
      })

      done()
    })

    t.end()
  },

  'Should remove team members from a campaign': function (t) {
    t.createDomain(['user', 'user', 'campaign'], (user1, user2, campaign, done) => {
      t.perform((done) => {
        t.addTeamMembersToCampaign([user1, user2], campaign, () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .editTeam()
        .removeFromTeam(user1)
        .removeFromTeam(user2)
        .saveTeamEdit()

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.team.length, 1)
          t.assert.notEqual(doc.team[0]._id, user1._id)
          t.assert.notEqual(doc.team[0]._id, user2._id)

          done()
        })
      })

      done()
    })

    t.end()
  },

  'Should cancel removing team members from a campaign': function (t) {
    t.createDomain(['user', 'user', 'campaign'], (user1, user2, campaign, done) => {
      t.perform((done) => {
        t.addTeamMembersToCampaign([user1, user2], campaign, () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage
        .editTeam()
        .removeFromTeam(user1)
        .removeFromTeam(user2)
        .cancelTeamEdit()

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.team.length, 3)
          t.assert.equal(doc.team.find(member => member._id === user1._id)._id, user1._id)
          t.assert.equal(doc.team.find(member => member._id === user2._id)._id, user2._id)

          done()
        })
      })

      done()
    })

    t.end()
  }
}

module.exports = test
