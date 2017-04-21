'use strict'

const test = {
  '@tags': ['campaign-contacts'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
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

      t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

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

        t.page.main().waitForSnackbarMessage('batch-remove-contacts-from-campaign-success')

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
  }
}

module.exports = test
