'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')
const faker = require('faker')
const async = require('async')

const test = {
  '@tags': ['campaigns'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
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

    t.page.main().waitForSnackbarMessage('campaign-create-success')

    t.perform((done) => {
      t.db.findCampaign({
        name: campaign.name
      })
      .then(function (doc) {
        t.assert.urlEquals(`${t.launch_url}/campaign/${doc.slug}`)

        assertions.campaignsAreEqual(t, doc, campaign)

        const campaignPage = t.page.campaign()
        const info = campaignPage.section.info

        info.assert.containsText('@title', doc.name)
        info.assert.containsText('@client', doc.client.name)
        info.assert.containsText('@keyMessage', doc.purpose)
        info.assert.attributeContains('@link0', 'href', doc.links[0].url)
        info.assert.attributeContains('@link1', 'href', doc.links[1].url)
        info.assert.attributeContains('@link2', 'href', doc.links[2].url)

        campaignPage.section.activityFeed
          .assertHasCreatedCampaignPostWith(doc, {
            header: 'You\ncreated this campaign'
          })

        done()
      })
      .catch(error => {
        throw error
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should search for campaigns': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignsPage = t.page.main()
        .navigateToCampaigns(t)

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .clickRow(0)

      t.assert.urlEquals(`${t.launch_url}/campaign/${campaign.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should view campaign contacts from toast menu': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.viewContacts()

      t.assert.urlEquals(`${t.launch_url}/contacts?campaign=${campaign.slug}`)

      t.page.contacts()
        .section.contactTable.isInResults(contact1)

      t.page.contacts()
        .section.contactTable.isInResults(contact2)

      t.page.contacts()
        .section.contactTable.isNotInResults(contact3)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add to campaign list from toast menu': function (t) {
    t.createDomain(['campaignList', 'campaign'], (campaignList, campaign, done) => {
      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.openAddToCampaignListsModal()
      campaignsPage.section.campaignListsModal
        .selectList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-add-to-campaign-list-success')

      campaignsPage
        .navigateToCampaignList(campaignList)

      campaignsPage.section.campaignTable
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite campaigns from toast menu': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.favouriteCampaigns()

      t.page.main().waitForSnackbarMessage('campaigns-batch-favourite-success')

      campaignsPage
        .navigateToMyCampaigns()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to campaigns from toast menu': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign'], (campaign, done) => {
      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.openAddTagsToCampaignModal()

      campaignsPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-tag-success')

      campaignsPage
        .navigateToTag(tag)

      campaignsPage.section.campaignTable
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should filter campaigns by master list': function (t) {
    const domainArgs = Array(5).fill('campaign').concat(Array(5).fill('campaignList'))

    t.createDomain(domainArgs, function () {
      const args = Array.from(arguments)
      const campaigns = args.slice(0, 5)
      const masterLists = args.slice(5, 10)
      const done = args[10]

      t.perform((done) => {
        const tasks = campaigns.map((c, i) => {
          return (cb) => t.addCampaignsToCampaignLists([c], [masterLists[i]], cb)
        })
        async.parallel(tasks, done)
      })

      const campaignsPage = t.page.campaigns()
        .navigate()

      const masterListsSelector = campaignsPage.section.masterListsSelector
      const campaignTable = campaignsPage.section.campaignTable

      campaignsPage
        .waitForElementVisible(campaignsPage.section.masterListsSelector.selector)

      // Assert each campaign present/absent in each master list
      masterLists.forEach((masterList, i) => {
        masterListsSelector.clickMasterListBySlug(masterList.slug)

        const assertResult = (resultCampaign) => {
          campaigns.forEach((campaign, i) => {
            const selector = `[data-item='${campaign.slug}']`
            if (campaign === resultCampaign) {
              campaignTable.waitForElementPresent(selector)
            } else {
              campaignTable.waitForElementNotPresent(selector)
            }
          })
        }

        assertResult(campaigns[i])
      })

      // Ensure we can click all/my and that they become selected
      masterListsSelector
        .assert.elementPresent('@all')
        .clickMasterListBySlug('all')
        .waitForElementPresent('@allSelected')
        .assert.elementPresent('@my')
        .clickMasterListBySlug('my')
        .waitForElementPresent('@mySelected')

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should retain search query in search box after page refresh': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignsPage = t.page.main()
        .navigateToCampaigns(t)

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)

      t.refresh()

      campaignsPage.section.campaignTable
        .waitForElementVisible('@searchInput')
        .assert.value('@searchInput', campaign.name)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display show updates button': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      t.page.main()
        .logout()

      // Login with a new user
      this.user = t.page.authenticate()
        .register()

      const campaignsPage = t.page.main()
        .navigateToCampaigns(t)

      t.perform((done) => {
        t.db.connection
          .collection('campaigns')
          .update(
            {slug: campaign.slug},
            {$set: {name: `TEST${Date.now()}`}},
            done
          )
      })

      campaignsPage
        .waitForElementPresent('@showUpdatesButton')

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
