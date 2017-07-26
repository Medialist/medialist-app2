import { check } from 'meteor/check'
import escapeRegExp from 'lodash.escaperegexp'
import CampaignContacts from '/imports/api/campaign-contacts/campaign-contacts'
import { StatusIndex, StatusValues } from '/imports/api/contacts/status'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

/**
 * Find contacts that match a search term and other criteria.
 * Returns a Cursor.
 */
export const searchCampaignContacts = ({
  term,
  campaignSlug,
  status,
  sort,
  limit = 2000,
  minSearchLength = 3
}) => {
  check(campaignSlug, String)
  check(sort, Object)
  check(limit, Number)

  const query = {
    campaign: campaignSlug
  }

  if (status && StatusIndex[status] > -1) {
    query.status = status
  }

  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(escapeRegExp(term), 'gi')

    query.$or = [{
      name: termRegExp
    }, {
      'outlets.value': termRegExp
    }, {
      'outlets.label': termRegExp
    }]
  }

  return CampaignContacts.find(query, {sort, limit})
}
