'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')
const faker = require('faker')

const test = {
  '@tags': ['campaign'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
      .register()
  },

  'Should favourite and unfavourite a campaign': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)
        .favouriteCampaign()

      t.page.main().waitForSnackbarMessage('campaign-info-favourite-success')

      t.perform((done) => {
        t.db.findUser({
          'profile.name': this.user.name
        })
        .then((doc) => {
          t.assert.ok(doc.myCampaigns.find(c => c._id === campaign._id))

          done()
        })
      })

      campaignPage.unFavouriteCampaign()

      t.page.main().waitForSnackbarMessage('campaign-info-unfavourite-success')

      t.perform((done) => {
        t.db.findUser({
          'profile.name': this.user.name
        })
        .then((doc) => {
          t.assert.ok(!doc.myCampaigns.find(c => c._id === campaign._id))

          done()
        })
      })

      done()
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

      t.page.main().waitForSnackbarMessage('campaign-update-success')

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

  'Should delete an existing campaign': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)
        .editCampaign()

      campaignPage.section.editCampaignForm
        .openDeleteConfirmation(campaign)
        .confirmDeletion()

      t.page.main().waitForSnackbarMessage('campaign-delete-success')

      t.assert.urlEquals('http://localhost:3000/campaigns')

      t.page.campaigns().section.campaignTable
        .searchForWithoutFinding(campaign.name)
        .assertNotInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel deleting an existing campaign': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)
        .editCampaign()

      campaignPage.section.editCampaignForm
        .openDeleteConfirmation(campaign)
        .cancelDeletion()

      // should have gone back to edit campaign form
      campaignPage.assert.visible(campaignPage.section.editCampaignForm.selector)

      campaignPage.section.editCampaignForm
        .cancel()

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add campaign to campaign list from campaign page': function (t) {
    t.createDomain(['campaign', 'campaignList'], (campaign, campaignList, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage.section.info
        .waitForElementVisible('@editCampaignMasterListsButton')
        .click('@editCampaignMasterListsButton')

      const campaignListsModal = campaignPage.section.campaignListsModal

      campaignPage.waitForElementVisible(campaignListsModal.selector)

      campaignListsModal
        .selectList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('update-campaign-campaign-lists-success')

      campaignPage.section.info.assert.attributeContains('a[data-id=campaign-list-link]', 'href', `/campaigns?list=${campaignList.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove campaign from campaign list from campaign page': function (t) {
    t.createDomain(['campaign', 'campaignList'], (campaign, campaignList, done) => {
      t.perform((done) => {
        t.addCampaignsToCampaignLists([campaign], [campaignList], () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage.section.info
        .waitForElementVisible('@editCampaignMasterListsButton')
        .click('@editCampaignMasterListsButton')

      const campaignListsModal = campaignPage.section.campaignListsModal

      campaignPage.waitForElementVisible(campaignListsModal.selector)

      campaignListsModal
        .deselectList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('update-campaign-campaign-lists-success')

      campaignPage.section.info.assert.elementNotPresent('a[data-id=campaign-list-link]')

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to campaign on campaign page': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage.section.info
        .waitForElementVisible('@editCampaignTagsButton')
        .click('@editCampaignTagsButton')

      const tagSelectorModal = campaignPage.section.tagSelectorModal

      campaignPage.waitForElementVisible(tagSelectorModal.selector)

      campaignPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('update-campaign-tags-success')

      campaignPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/campaigns?tag=${tag}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove tags from campaign on campaign page': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign', 'campaignList'], (campaign, campaignList, done) => {
      t.perform((done) => {
        t.tagCampaign(campaign, [tag], () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/campaigns?tag=${tag}`)

      campaignPage.section.info
        .waitForElementVisible('@editCampaignTagsButton')
        .click('@editCampaignTagsButton')

      const tagSelectorModal = campaignPage.section.tagSelectorModal

      campaignPage.waitForElementVisible(tagSelectorModal.selector)

      campaignPage.section.tagSelectorModal
        .removeTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('update-campaign-tags-success')

      campaignPage.section.info.assert.elementNotPresent('a[data-id=tag-link]')

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel removing tags from campaign on campaign page': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign', 'campaignList'], (campaign, campaignList, done) => {
      t.perform((done) => {
        t.tagCampaign(campaign, [tag], () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/campaigns?tag=${tag}`)

      campaignPage.section.info
        .waitForElementVisible('@editCampaignTagsButton')
        .click('@editCampaignTagsButton')

      const tagSelectorModal = campaignPage.section.tagSelectorModal

      campaignPage.waitForElementVisible(tagSelectorModal.selector)

      campaignPage.section.tagSelectorModal
        .removeTag(tag)
        .cancel()

      campaignPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/campaigns?tag=${tag}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should update the status of a contact and change their last updated time': function (t) {
    let originalContact
    let originalCampaign
    let originalCampaignContact
    let newStatus

    t.createDomain(['campaign', 'contact', 'contact'], (campaign, contact1, contact2, done) => {
      // make sure updateAt timestamps are different
      t.pause(1000)

      t.perform((done) => {
        t.addContactsToCampaign([contact1], campaign, () => done())
      })

      // make sure updateAt timestamps are different
      t.pause(1000)

      t.perform((done) => {
        t.addContactsToCampaign([contact2], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        // should be at the bottom of the table
        campaignContactsPage.section.contactTable.assertInPosition(contact1, 1)

        done()
      })

      t.perform((done) => {
        t.db.findContact({
          name: contact1.name
        })
        .then((doc) => {
          originalContact = doc

          done()
        })
      })

      t.perform((done) => {
        t.db.findCampaign({
          name: campaign.name
        })
        .then((doc) => {
          originalCampaign = doc

          done()
        })
      })

      t.perform((done) => {
        t.db.findCampaignContact({
          campaign: campaign.slug,
          slug: contact1.slug
        })
        .then((doc) => {
          originalCampaignContact = doc

          done()
        })
      })

      // make sure updateAt timestamps are different
      t.pause(1000)

      t.perform((done) => {
        const campaignPage = t.page.campaign()
          .navigate(campaign)

        newStatus = domain.status(originalCampaignContact.status)
        t.assert.notEqual(originalCampaignContact.status, newStatus)

        campaignPage.section.campaignContacts.updateStatus(contact1, newStatus)

        done()
      })

      t.perform((done) => {
        t.db.findContact({
          name: contact1.name
        })
        .then((updatedContact) => {
          // should have updated the contact updatedAt
          t.assert.ok(updatedContact.updatedAt.getTime() > originalContact.updatedAt.getTime())

          done()
        })
      })

      t.perform((done) => {
        t.db.findCampaign({
          name: campaign.name
        })
        .then((updatedCampaign) => {
          // should have updated the campaign updatedAt
          t.assert.ok(updatedCampaign.updatedAt.getTime() > originalCampaign.updatedAt.getTime())

          done()
        })
      })

      t.perform((done) => {
        t.db.findCampaignContact({
          campaign: campaign.slug,
          slug: contact1.slug
        })
        .then((updatedCampaignContact) => {
          // should have updated the the status for the contact on the campaign
          t.assert.equal(updatedCampaignContact.status.toLowerCase().replace(/\s+/g, '-'), newStatus)

          // should have updated the updatedAt value for the contact on the campaign
          t.assert.ok(updatedCampaignContact.updatedAt.getTime() > originalCampaignContact.updatedAt.getTime())

          done()
        })
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        // should be at the top of the table
        campaignContactsPage.section.contactTable.assertInPosition(contact1, 0)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
