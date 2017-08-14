import { Mongo } from 'meteor/mongo'

export const CampaignSearchResults = new Mongo.Collection('campaign-search-results')

export const CampaignSearchCount = new Mongo.Collection('campaign-search-count')

export const CampaignContacts = new Mongo.Collection('campaign-contacts-client')

export const CampaignContactStatuses = new Mongo.Collection('campaign-contact-statuses-client')

window.CampaignSearchResults = CampaignSearchResults
window.CampaignSearchCount = CampaignSearchCount
