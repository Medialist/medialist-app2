import { Mongo } from 'meteor/mongo'

export const ContactSearchResults = new Mongo.Collection('contact-search-results')

export const ContactSearchCount = new Mongo.Collection('contact-search-count')

export const ContactCampaigns = new Mongo.Collection('contact-campaigns-client')

export const ContactCampaignStatuses = new Mongo.Collection('contact-campaign-statuses-client')
