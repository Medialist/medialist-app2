const faker = require('faker')

const createCampaign = () => {
  return {
    name: faker.company.catchPhrase(),
    client: faker.company.companyName(),
    keyMessage: faker.hacker.phrase(),
    links: [faker.internet.url(), faker.internet.url(), faker.internet.url()]
  }
}

const verifyCampaignsAreEqual = (t, other, campaign) => {
  t.assert.equal(other.name, campaign.name)
  t.assert.equal(other.client.name, campaign.client)
  t.assert.equal(other.purpose, campaign.keyMessage)
  t.assert.equal(other.links.length, campaign.links.length)

  other.links.forEach((link, index) => {
    t.assert.equal(link.url, campaign.links[index])
  })
}

module.exports = {
  createCampaign: createCampaign,
  verifyCampaignsAreEqual: verifyCampaignsAreEqual
}
