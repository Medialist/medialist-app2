import { Meteor } from 'meteor/meteor'
import uploadcare from 'uploadcare'

const ucare = uploadcare(
  Meteor.settings.public.uploadcare && Meteor.settings.public.uploadcare.publicKey,
  Meteor.settings.uploadcare && Meteor.settings.uploadcare.privateKey
)

const dryRun = process.env.NODE_ENV !== 'production'

if (dryRun) {
  console.log('Uploadcare in DRY RUN mode. No API calls will be made.')
}

function findUuid (str) {
  const uuidRegEx = /[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/i
  const matches = uuidRegEx.exec(str)
  return matches && matches[0]
}

export const store = (url) => {
  if (!url || url.indexOf('ucare') === -1) return false

  const uuid = findUuid(url)

  if (!uuid) {
    console.error(`Failed to find UUID in uploadcare URL "${url}"`)
    return false
  }

  if (dryRun) return true

  ucare.files.store(uuid, (err) => {
    if (err) console.warn(`Failed to store ${uuid}`, err)
  })

  return true
}
