import { Mongo } from 'meteor/mongo'

export const CampaignContacts = new Mongo.Collection('campaign-contacts-client')

export const CampaignContactStatuses = new Mongo.Collection('campaign-contact-statuses-client')
