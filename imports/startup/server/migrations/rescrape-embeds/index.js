import { rescrapeAll } from '/imports/api/embeds/server/scraper/utils/rescrape'
import Embeds from '/imports/api/embeds/embeds'

export default {
  name: 'Rescape all embeds',
  up: () => {
    // fix null images
    Embeds.update({
      image: null
    }, {
      $unset: {
        image: null
      }
    }, {
      multi: true
    })

    rescrapeAll()
  }
}
