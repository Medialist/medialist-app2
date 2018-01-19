import assert from 'assert'
import {
  withJsonLd,
  articleTypes,
  jsonLdTitleFinder,
  jsonLdUrlFinder,
  jsonLdImageFinder,
  jsonLdPublishedDateFinder,
  jsonLdOutletFinder
 } from '/imports/api/embeds/server/scraper/json-ld'
import {bbc, bloomberg, reuters} from './examples/metadatas'

describe('embeds jsonLd', function () {
  it('should extract JSON-LD from metadata', function () {
    assert.equal(withJsonLd(bbc, articleTypes, jsonLd => jsonLd['@type']), 'ReportageNewsArticle')
    assert.equal(withJsonLd(bloomberg, articleTypes, jsonLd => jsonLd['@type']), 'NewsArticle')
    assert.equal(withJsonLd(reuters, articleTypes, jsonLd => jsonLd['@type']), 'NewsArticle')
  })

  it('should extract JSON-LD title from metadata', function () {
    assert.equal(jsonLdTitleFinder(bbc), "Meltdown and Spectre: How chip hacks work")
    assert.equal(jsonLdTitleFinder(bloomberg), "Intel Says Range of Chips Vulnerable to Hack, Denies ‘Bug’")
    assert.equal(jsonLdTitleFinder(reuters), "Security flaws put virtually all phones, computers at risk")
  })

  it('should extract JSON-LD url from metadata', function () {
    assert.equal(jsonLdUrlFinder(bbc), "http://www.bbc.co.uk/news/technology-42564461")
    assert.equal(jsonLdUrlFinder(bloomberg), undefined)
    assert.equal(jsonLdUrlFinder(reuters), "https://uk.reuters.com/article/uk-cyber-intel/design-flaw-found-in-intel-chips-fix-causes-them-to-slow-report-idUKKBN1ES1BW")
  })

  it('should extract JSON-LD image from metadata', function () {
    assert.deepEqual(jsonLdImageFinder(bbc), {
      "url": "https://ichef.bbci.co.uk/images/ic/720x405/p05sth8x.jpg",
      "width": 720,
      "height": 405
    })
    assert.deepEqual(jsonLdImageFinder(bloomberg), {
      "url": "https://assets.bwbx.io/s3/javelin/public/javelin/images/social-default-a4f15fa7ee.jpg",
      "width": 1200,
      "height": 630
    })
    assert.deepEqual(jsonLdImageFinder(reuters), {
      "url": "https://s2.reutersmedia.net/resources/r/?m=02&d=20180104&t=2&i=1219290789&w=&fh=545px&fw=&ll=&pl=&sq=&r=LYNXMPEE030LC",
      "width": "800",
      "height": "800"
    })
  })

  it('should extract JSON-LD url from metadata', function () {
    assert.equal(jsonLdPublishedDateFinder(bbc), "2018-01-04T15:26:30+00:00")
    assert.equal(jsonLdPublishedDateFinder(bloomberg), "2018-01-03T20:31:53.243Z")
    assert.equal(jsonLdPublishedDateFinder(reuters), "2018-01-04T15:15:35+0000")
  })

  it('should extract JSON-LD url from metadata', function () {
    assert.equal(jsonLdOutletFinder(bbc), "BBC News")
    assert.equal(jsonLdOutletFinder(bloomberg), "Bloomberg")
    assert.equal(jsonLdOutletFinder(reuters), "Reuters")
  })
})
