import { JsonRoutes } from 'meteor/simple:json-routes'
import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'
import Contacts from '/imports/api/contacts/contacts'
import dot from 'dot-object'

export function findTwitterSocials (contacts) {
  return contacts
    .map(c => c.socials) // array of arrays
    .reduce((a, b) => a.concat(b)) // flatten to one array
    .filter(s => s.label === 'Twitter') // pick our thw twitters, until we know how to enrich others.
}

/*
  Sends batches of social objects to `influence` for enrichment.

  {
    callbackUrl: 'https://bm.medialist.io',
    socials: [{
      label: 'Twitter',
      value: 'guardian'
    }]
  }
*/
export const sendForSocials = (contacts) => {
  const url = Meteor.settings.influnce.apiUrl + '/webhook/socials/lookup'
  const callbackUrl = Meteor.absoluteUrl('webhook/socials/update')
  const socials = findTwitterSocials(contacts)
  HTTP.post(url, {
    data: {
      callbackUrl,
      socials
    }
  })
}

/*
  Receives batches of enriched socials objects.

  [{
    label: 'Twitter',
    value: 'guardian',
    twitterId: '87818409',
    name: 'The Guardian',
    profile_image_url_https: 'https://pbs.twimg.com/profile_images/877153924637175809/deHwf3Qu_normal.jpg',
    location: 'London',
    description: 'The need for independent journalism has never been greater. Become a Guardian supporter: http://gu.com/supporter/twitter',
    url: 'https://www.theguardian.com'
  }]
*/
export const handleSocialsUpdate = ({socials}) => {
  socials.forEach(s => {
    // update previously enriched ones
    Contacts.update({
      'socials': {
        $elemMatch: {
          twitterId: s.twitterId
        }
      }
    }, {
      $set: dot.dot({
        'bio': s.description,
        'avatar': s.profile_image_url_https.replace('_normal.', '_bigger.'),
        'socials.$': s
      })
    }, {
      multi: true
    })

    // We'd like to use an $or and do these updates in one shot, but the positional array operator does not like it.
    Contacts.update({
      'socials': {
        $elemMatch: {
          label: s.label,
          value: s.value,
          twitterId: {$exists: false}
        }
      }
    }, {
      $set: dot.dot({
        'bio': s.description,
        'avatar': s.profile_image_url_https.replace('_normal.', '_bigger.'),
        'socials.$': s
      })
    }, {
      multi: true
    })
  })
}

JsonRoutes.add('post', '/webhook/socials/update', function (req, res, next) {
  let code = 200
  let headers = {}
  console.log(typeof req.body, req.body)

  // TODO: verify
  handleSocialsUpdate(req.body)

  JsonRoutes.sendResult(res, {code, headers})
})
