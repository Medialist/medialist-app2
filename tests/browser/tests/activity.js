'use strict'

const test = {
  '@tags': ['activity'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should display context sensitive posts when adding a contact to a campaign': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.section.activityFeed
          .assertHasAddContactToCampaignPostWithText(contact, campaign, `added ${contact.name} (${contact.outlets[0].label}) to ${campaign.name}`)

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.section.activityFeed
          .assertHasAddContactToCampaignPostWithText(contact, campaign, `added ${contact.name.split(' ')[0]} to ${campaign.name}`)

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.section.activityFeed
          .assertHasAddContactToCampaignPostWithText(contact, campaign, `added ${contact.name} (${contact.outlets[0].label})`)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
