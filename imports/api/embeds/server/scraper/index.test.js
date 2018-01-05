import assert from 'assert'
import { scrapeUrl, extractEmbedData } from '/imports/api/embeds/server/scraper'
import testMetadatas from './examples/metadatas'
import testEmbeds from './examples/embeds'

describe.only('embeds scrapeUrl', function () {
  it('should scrape some metadata from popular sites', function (done) {
    const urls = [
      'http://www.bbc.co.uk/news/technology-42564461',
      'https://www.ft.com/content/456875fc-f0e2-11e7-b220-857e26d1aca4',
      'http://www.itv.com/news/2018-01-04/intel-computer-processors-security-flaw/',
      'https://uk.reuters.com/article/uk-cyber-intel/security-flaws-put-virtually-all-phones-computers-at-risk-idUKKBN1ES1BW',
      'https://www.bloomberg.com/news/articles/2018-01-03/intel-says-research-showed-design-element-created-vulnerability'
    ]

    const reqs = urls.map(url => {
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

describe.only('embeds extractEmbedData', function () {
  it('should extract embed data from metadata', function () {
    Object.keys(testEmbeds).forEach((outlet) => {
      const metadata = testMetadatas[outlet]
      const expected = testEmbeds[outlet]
      const actual = JSON.parse(JSON.stringify(extractEmbedData(metadata)))
      assert.deepEqual(actual, expected)
    })
  })
})
