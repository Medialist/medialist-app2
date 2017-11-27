import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import { createContactSearchQuery } from '/imports/api/contacts/queries'
import { ContactSearchCount, ContactSearchResults } from './collections'
import Contacts from '/imports/api/contacts/contacts'
import { collationSort } from '/imports/lib/collation'

function extractQueryOpts (props) {
  const {
    minSearchLength = 3,
    excludeSlugs,
    term,
    campaignSlugs,
    tagSlugs,
    masterListSlug,
    userId,
    importId
  } = props

  const queryOpts = {
    excludeSlugs,
    campaignSlugs,
    masterListSlug,
    userId,
    tagSlugs,
    importId,
    minSearchLength
  }

  if (term && term.length >= minSearchLength) {
    queryOpts.term = term
  }

  return queryOpts
}

function isSearching (queryOpts) {
  const query = createContactSearchQuery(queryOpts)
  return Object.keys(query).length > 0
}

/**
* Contact SearchContainer HOC
* Find contacts by a search term and other criteria.
*
* You can pass in:
* - `term` - The Search term
* - `campaignSlugs` - Array of campaigns to search in.
* - `masterListSlug` - To search a in a specific list
* - `userId` to search in the `myContacts` for a given user
* - `importId` - to search in a specific import batch
* - `sort` - A mongo sort specifier
* - `limit` - Maximum number of docs to fetch.
*
* Your component will recieve these additional props:
* - `contacts` - search results
* - `loading` - search subscription is loading
* - `searching` - true if any sub is not ready
* - `searchTermActive` - true if search term is longer than `minSearchLength`
*/
export default (Component) => createContainer((props) => {
  const {
    limit = 20,
    sort = { updatedAt: -1 }
  } = props

  const queryOpts = extractQueryOpts(props)

  const searchOpts = {
    sort,
    limit,
    ...queryOpts
  }

  const searching = isSearching(queryOpts)

  const searchTermActive = queryOpts.hasOwnProperty('term')

  const subs = [Meteor.subscribe('contact-search-results', searchOpts)]

  const sortSpec = getCustomSortSpec(sort)

  const contacts = ContactSearchResults.find({}, {limit, sort: sortSpec}).fetch()

  const loading = props.loading || subs.some((s) => !s.ready())

  return { contacts, searching, searchTermActive, loading, sort }
}, Component)

/**
* SearchCountContainer HOC
* Count the total nunmber of results for your search criteria.
*
* You can pass in:
* - `term` - The Search term
* - `campaignSlugs` - Array of campaigns to search in.
* - `masterListSlug` - To search a in a specific list
* - `userId` - to search in the `myContacts` for a given user
* - `importId` - to search in a specific import batch
*
* Your component will recieve these additional props:
* - `allContactsCount` - total contacts in system
* - `contactsCount` - Number of search results that match criteria
* - `loading` - true if any sub is laoding
*/
export const createSearchCountContainer = (Component) => createContainer((props) => {
  const queryOpts = extractQueryOpts(props)

  const searching = isSearching(queryOpts)

  const allContactsCount = Contacts.allContactsCount()

  let contactsCount = allContactsCount

  const subs = []
  if (searching) {
    subs.push(Meteor.subscribe('contact-search-count-not-reactive', queryOpts))
    const res = ContactSearchCount.find().fetch()
    contactsCount = res[0] ? res[0].count : allContactsCount
  }

  const loading = props.loading || subs.some((s) => !s.ready())

  return { allContactsCount, contactsCount, loading }
}, Component)

// returns a sort compator fn or mongo sort specifier
function getCustomSortSpec (sort, contactSlug) {
  // Use collation Sort if is a text field
  const nonTextFields = ['updatedAt']
  const sortKey = Object.keys(sort)[0]
  if (nonTextFields.indexOf(sortKey) === -1) {
    return collationSort(sort)
  }
  return sort
}
