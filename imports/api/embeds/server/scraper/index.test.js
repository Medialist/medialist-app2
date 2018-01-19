import { URL } from 'url'
import assert from 'assert'
import { scrapeUrl, extractEmbedData } from '/imports/api/embeds/server/scraper'

const fixtures = [
  {
    url: 'http://www.bbc.co.uk/news/technology-42564461',
    embed: require('./examples/bbc.embed.test.json'),
    metadata: require('./examples/bbc.metadata.test.json')
  },
  {
    url: 'https://www.bloomberg.com/news/articles/2018-01-03/intel-says-research-showed-design-element-created-vulnerability',
    embed: require('./examples/bloomberg.embed.test.json'),
    metadata: require('./examples/bloomberg.metadata.test.json')
  },
  {
    url: 'https://www.ft.com/content/456875fc-f0e2-11e7-b220-857e26d1aca4',
    embed: require('./examples/ft.embed.test.json'),
    metadata: require('./examples/ft.metadata.test.json')
  },
  {
    url: 'http://www.itv.com/news/2018-01-04/intel-computer-processors-security-flaw/',
    embed: require('./examples/itv.embed.test.json'),
    metadata: require('./examples/itv.metadata.test.json')
  },
  {
    url: 'https://uk.reuters.com/article/uk-cyber-intel/security-flaws-put-virtually-all-phones-computers-at-risk-idUKKBN1ES1BW',
    embed: require('./examples/reuters.embed.test.json'),
    metadata: require('./examples/reuters.metadata.test.json')
  }
]

describe('embeds scrapeUrl', function () {
  it('should scrape some metadata from popular sites', function (done) {
    this.timeout(10000)

    const reqs = fixtures.map(({url}) => {
      return new Promise((resolve, reject) => {
        scrapeUrl(url, {
          headers: {
            'User-Agent': "'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'"
          }
        }, (err, metadata) => {
          if (err) return reject(err)
          resolve(metadata)
        })
      })
    })

    Promise.all(reqs)
      .catch(err => assert.ifError(err))
      .then(arr => arr.forEach(metadata => {
        // console.log(JSON.stringify(metadata))
        assert.ok(metadata.general.title)
      }))
      .then(() => done())
  })
})

describe('embeds extractEmbedData', function () {
  fixtures.forEach(({url, metadata, embed}) => {
    it(`should extract embed data from metadata from ${new URL(url).hostname}`, function () {
      const raw = JSON.stringify(extractEmbedData(metadata))
      // console.log(raw)
      const actual = JSON.parse(raw)
      assert.deepEqual(actual, embed)
    })
  })
})
