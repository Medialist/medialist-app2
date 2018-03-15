import { check, Match } from 'meteor/check'
import Posts from '/imports/api/posts/posts'

export const findPinnedNeedToKnows = (contactSlug, opts) => {
  opts = opts || {}

  check(contactSlug, String)
  check(opts, { limit: Match.Optional(Number) })

  const query = {
    'contacts.slug': contactSlug,
    type: 'NeedToKnowPost',
    pinnedAt: { $ne: null }
  }

  const queryOpts = {
    sort: { pinnedAt: -1 }
  }

  if (opts.limit) {
    queryOpts.limit = opts.limit
  }

  return Posts.find(query, queryOpts)
}
