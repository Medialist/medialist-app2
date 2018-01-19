import moment from 'moment'
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

    const forTheScrape = Embeds.find({
      $or: [
        {
          updatedAt: {
            $exists: false
          }
        }, {
          updatedAt: {
            $lt: moment().subtract(1, 'days').toDate()
          }
        }
      ]
    }).fetch()

    console.log(`${forTheScrape.length} embeds to rescrape`)

    rescrapeAll(forTheScrape)
  }
}
