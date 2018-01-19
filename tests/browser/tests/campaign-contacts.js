'use strict'

const faker = require('faker')

const test = {
  '@tags': ['campaign-contacts'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
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
          t.assert.equal(doc.contacts.find(c => c.slug === contact1.slug).status, 'To Contact')
          t.assert.equal(doc.contacts.find(c => c.slug === contact2.slug).status, 'To Contact')

          done()
        })
        .catch(error => {
          throw error
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should update the status of a contact': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        const campaignPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignPage.section.contactTable
          .searchFor(contact1.name)
          .updateStatus(contact1, 'hot-lead')

        // Wait for request to be sent to server and db updated
        t.pause(1000)

        t.perform((done) => {
          t.db.findCampaign({
            slug: campaign.slug
          })
          .then((doc) => {
            t.assert.equal(doc.contacts.find(c => c.slug === contact1.slug).status, 'Hot Lead')

            done()
          })
          .catch(error => {
            throw error
          })
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add contacts to a campaign from campaign contacts page toast menu': function (t) {
    t.createDomain(['campaign', 'campaign', 'contact', 'contact'], (campaign1, campaign2, contact1, contact2, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign1, () => done())
      })

      t.perform((done) => {
        const campaign1ContactsPage = t.page.campaignContacts()
          .navigate(campaign1)

        campaign1ContactsPage.section.contactTable
          .searchFor(contact1.name)
          .selectRow(0)

        campaign1ContactsPage.section.toast.openAddContactsToCampaignModal()

        campaign1ContactsPage.section.campaignSelectorModal
          .searchForCampaign(campaign2)
          .selectSearchResult(campaign2)

        t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

        const campaign2ContactsPage = t.page.campaignContacts()
          .navigate(campaign2)

        campaign2ContactsPage.section.contactTable
          .assertInSearchResults(contact1)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add to contact list from campaign contacts page toast menu': function (t) {
    t.createDomain(['campaign', 'contactList', 'contact'], (campaign, contactList, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .searchFor(contact.name)
          .selectRow(0)

        campaignContactsPage.section.toast.openAddToContactListsModal()
        campaignContactsPage.section.contactListsModal
          .selectList(contactList)
          .save()

        t.page.main().waitForSnackbarMessage('batch-add-contacts-to-contact-list-success')

        const contactsPage = t.page.contacts()
          .navigate()

        contactsPage
          .navigateToContactList(contactList)

        contactsPage.section.contactTable
          .assertInSearchResults(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite contacts from campaign contacts page toast menu': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .searchFor(contact.name)
          .selectRow(0)

        campaignContactsPage.section.toast.favouriteContacts()

        t.page.main().waitForSnackbarMessage('batch-favourite-contacts-success')

        const contactsPage = t.page.contacts()
          .navigate()

        contactsPage
          .navigateToMyContacts()

        contactsPage.section.contactTable
          .searchFor(contact.name)
          .assertInSearchResults(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to contacts from campaign contacts page toast menu': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .searchFor(contact.name)
          .selectRow(0)

        campaignContactsPage.section.toast.openAddTagsToContactsModal()

        campaignContactsPage.section.tagSelectorModal
          .addTag(tag)
          .save()

        t.page.main().waitForSnackbarMessage('batch-tag-contacts-success')

        const contactsPage = t.page.contacts()
          .navigate()

        contactsPage
          .navigateToTag(tag)

        contactsPage.section.contactTable
          .assertInSearchResults(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should update contacts status from campaign contacts page toast menu': function (t) {
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
          .selectRow(2)

        campaignContactsPage.section.toast
          .openStatusDropdown()

        campaignContactsPage.section.toast.section.dropdown
          .selectStatus('Hot Lead')

        done()
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.section.activityFeed
          .assertHasStatusUpdatePostWith(campaign, {contactStatus: 'hot-lead'})

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove contacts from a campaign from campaign contacts toast menu': function (t) {
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

        campaignContactsPage.section.toast.openRemoveContactsModal()

        campaignContactsPage.section.removeContactsModal
          .confirm()

        t.page.main().waitForSnackbarMessage('batch-remove-contacts-from-campaign-success')

        t.perform((done) => {
          t.db.findContacts({
            campaigns: campaign.slug
          })
          .then((docs) => {
            t.assert.equal(docs.length, 1)

            done()
          })
          .catch(error => {
            throw error
          })
        })

        done()
      })

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.contacts[contact1._id], undefined)
          t.assert.equal(doc.contacts[contact2._id], undefined)

          done()
        })
        .catch(error => {
          throw error
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel removing contacts from a campaign from campaign contacts toast menu': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .selectRow(0)
          .selectRow(1)

        campaignContactsPage.section.toast.openRemoveContactsModal()

        campaignContactsPage.section.removeContactsModal
          .cancel()

        t.perform((done) => {
          t.db.findCampaign({
            _id: campaign._id
          })
          .then((doc) => {
            t.assert.equal(Object.keys(doc.contacts).length, 2)
            t.assert.equal(doc.contacts.find((c) => c.slug === contact1.slug).status, 'To Contact')
            t.assert.equal(doc.contacts.find((c) => c.slug === contact2.slug).status, 'To Contact')

            done()
          })
          .catch(error => {
            throw error
          })
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should retain search query in search box after page refresh': function (t) {
    t.createDomain(['campaign', 'contact', 'contact'], (campaign, contact1, contact2, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

        campaignContactsPage.section.contactTable
          .searchFor(contact1.name)

        t.refresh()

        campaignContactsPage.section.contactTable
          .waitForElementVisible('@searchInput')
          .assert.value('@searchInput', contact1.name)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should highlight previously selected contact when navigating back to the page': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2, contact3], campaign, () => done())
      })

      t.perform((done) => {
        const campaignPage = t.page.campaignContacts()
          .navigate(campaign)

        // Ensure that we hightlight the row when using browser back button
        campaignPage.section.contactTable
          .clickContact(contact2)

        const contactPage = t.page.contact()
        contactPage
          .waitForElementVisible(contactPage.section.info.selector)

        t.back()

        campaignPage.section.contactTable
          .assertContactIsHighlighted(contact2)

        // Ensure that we hightlight the row when using the in page back button

        campaignPage.section.contactTable
          .clickContact(contact3)

        contactPage
          .waitForElementVisible(contactPage.section.info.selector)
          .click('@backButton')

        campaignPage.section.contactTable
          .assertContactIsHighlighted(contact3)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display coverage link': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      let campaignContactsPage = t.page.campaignContacts()
        .navigate(campaign)

      campaignContactsPage.section.contactTable
        .searchFor(contact.name)
        .assertContactHasNoCoverage(contact)

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      const url = 'http://medialist.io/'

      campaignPage
        .addCoveragePost(contact, 'completed', url)

      campaignContactsPage = t.page.campaignContacts()
        .navigate(campaign)

      campaignContactsPage.section.contactTable
        .searchFor(contact.name)
        .assertContactHasCoverage(contact, url)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display multiple coverage links': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      let campaignContactsPage = t.page.campaignContacts()
        .navigate(campaign)

      campaignContactsPage.section.contactTable
        .searchFor(contact.name)
        .assertContactHasNoCoverage(contact)

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      const urls = [
        'http://medialist.io/',
        'https://www.google.co.uk/',
        'https://www.amazon.co.uk/'
      ]

      urls.forEach((url) => {
        campaignPage
          .addCoveragePost(contact, 'completed', `${faker.lorem.sentence()} ${url}`)
      })

      campaignContactsPage = t.page.campaignContacts()
        .navigate(campaign)

      campaignContactsPage.section.contactTable
        .searchFor(contact.name)
        .assertContactHasCoverage(contact, urls)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  // FIXME: There's no reason why this test shouldn't work.
  // The `observeChanges` setup by ReactiveAggregate does not fire a changed
  // callback when data changes.
  // Remove `'' + ` to enable.
  // https://github.com/nightwatchjs/nightwatch-docs/blob/7032f2e89c89f9283eeeff5a7df91048cf6d55e9/guide/running-tests/disabling-tests.md#disabling-individual-testcases
  'Should display show updates button': '' + function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.page.main()
        .logout()

      // Login with a new user
      this.user = t.page.authenticate()
        .register()

      const campaignContactsPage = t.page.campaignContacts()
          .navigate(campaign)

      // ReactiveAggregate is reactive for the collection you're aggregating
      // over, but is not reactive over documents you obtain via $lookup.
      // The campaign-contacts publication almost exclusively uses fields from
      // Contacts, so we alter a contact field and then alter the updatedAt
      // field on the campaign so the subscription picks up the change.
      t.perform((done) => {
        t.db.connection
          .collection('contacts')
          .update(
            {slug: contact.slug},
            {$set: {name: `TEST${Date.now()}`}},
            done
          )
      })

      t.perform((done) => {
        t.db.connection
          .collection('campaigns')
          .update(
            {slug: campaign.slug},
            {$set: {updatedAt: new Date()}},
            done
          )
      })

      campaignContactsPage
        .waitForElementPresent('@showUpdatesButton')

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
