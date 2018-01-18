import assert from 'assert'
import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { rescrapeAll } from '/imports/api/embeds/server/scraper/utils/rescrape'
import Embeds from '/imports/api/embeds/embeds'
import { createTestEmbeds } from '/tests/fixtures/server-domain'

describe('embeds rescrape', function () {
  beforeEach(function () {
    resetDatabase()
    Meteor.settings.embeds = {
      userAgent: "'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'"
    }
  })

  it('should update embeds by rescraping the url', function (done) {
    this.timeout(10000)

    const fakeEmbed = createTestEmbeds(1).pop()
    const url = 'http://www.bbc.co.uk/news/technology-42564461'
    Embeds.update({_id: fakeEmbed._id}, {
      $set: {
        url: url,
        urls: fakeEmbed.urls.concat([url, 'https://coolguy.website']),
        headline: 'BORING'
      }
    })

    rescrapeAll()

    const embed = Embeds.findOne({urls: url})
    assert.notEqual(embed.headline, 'BORING', 'Embed headline had been updated')
    assert.ok(embed.icon, 'Embed includes an icon' )
    assert.ok(embed.urls.includes('https://coolguy.website'), 'Embed urls include previous urls')
    assert.ok(embed.urls.includes(url), 'Embed urls include requested url')
    done()
  })
})