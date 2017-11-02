import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor'
import Contacts from '/imports/api/contacts/contacts'
import dot from 'dot-object'

export function findTwitterSocials (contacts) {
  return contacts
    .map(c => c.socials) // array of arrays
    .reduce((a, b) => a.concat(b)) // flatten to one array
    .filter(s => s.label === 'Twitter') // pick our the twitters, until we know how to enrich others.
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
  if (Meteor.settings && !Meteor.settings.updateContactsFromTwitter) {
    return console.log('NOT sending contacts for twitter lookup. `updateContactsFromTwitter = false`')
  }
  const url = Meteor.settings.influence.apiUrl + '/webhook/socials/lookup'
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
  {
    socials: [{
      label: 'Twitter',
      value: 'guardian',
      twitterId: '87818409',
      name: 'The Guardian',
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/877153924637175809/deHwf3Qu_normal.jpg',
      location: 'London',
      description: 'The need for independent journalism has never been greater. Become a Guardian supporter: http://gu.com/supporter/twitter',
      url: 'https://www.theguardian.com'
    }]
  }
*/
export const handleSocialsUpdate = ({socials}) => {
  if (!Array.isArray(socials)) {
    throw new Meteor.Error('handleSocialsUpdate-missing-socials', 'Expected a Object with a socials array.')
  }

  socials.forEach(s => {
    // update previously enriched ones
    const res1 = Contacts.update({
      'socials': {
        $elemMatch: {
          twitterId: s.twitterId
        }
      }
    }, {
      $set: dot.dot({
        'bio': s.description,
        'avatar': s.profile_image_url_https,
        'socials.$': s
      })
    }, {
      multi: true
    })

    // We'd like to use an $or and do these updates in one shot, but the positional array operator does not like it.
    const res2 = Contacts.update({
      'socials': {
        $elemMatch: {
          label: s.label,
          value: {
            $regex: new RegExp(s.value, 'i')
          },
          twitterId: {$exists: false}
        }
      }
    }, {
      $set: dot.dot({
        'bio': s.description,
        'avatar': s.profile_image_url_https,
        'socials.$': s
      })
    }, {
      multi: true
    })

    if (res1 + res2 === 0) {
      console.log('No contact found with twitter social', s.value, s.twitterId)
    }
  })
}
