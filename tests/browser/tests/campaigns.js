'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['campaigns'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should create new campaign': function (t) {
    const campaignsPage = t.page.main()
      .navigateToCampaigns(t)

    campaignsPage.waitForElementVisible('@newCampaignButton')
      .click('@newCampaignButton')
      .waitForElementVisible(campaignsPage.section.editCampaignForm.selector)

    const campaign = domain.campaign()

    campaignsPage.section.editCampaignForm
      .populate(campaign)
      .submit()

    t.perform((done) => {
      t.db.findCampaign({
        name: campaign.name
      })
      .then(function (doc) {
        t.assert.urlEquals(`http://localhost:3000/campaign/${doc.slug}`)

        assertions.campaignsAreEqual(t, doc, campaign)

        const campaignPage = t.page.campaign()
        const info = campaignPage.section.info

        info.assert.containsText('@title', doc.name)
        info.assert.containsText('@client', doc.client.name)
        info.assert.containsText('@keyMessage', doc.purpose)
        info.assert.attributeContains('@link0', 'href', doc.links[0].url)
        info.assert.attributeContains('@link1', 'href', doc.links[1].url)
        info.assert.attributeContains('@link2', 'href', doc.links[2].url)

        campaignPage.section.activity.assert.containsText('@createCampaignPost', 'You\ncreated this campaign')

        done()
      })
    })

    t.page.main().logout()
    t.end()
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

    t.page.main().logout()
    t.end()
  },

  'Should search for campaigns': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      t.page.main()
        .navigateToCampaigns(t)
        .searchForCampaign(campaign.name)
        .selectSearchResult(campaign.name)

      t.assert.urlEquals(`http://localhost:3000/campaign/${campaign.slug}`)

      done()
    })

    t.page.main().logout()
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

    t.page.main().logout()
    t.end()
  },

  'should add team members to a campaign': function (t) {
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

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
