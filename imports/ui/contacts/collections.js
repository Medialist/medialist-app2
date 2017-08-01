import { Mongo } from 'meteor/mongo'

export const ContactCampaigns = new Mongo.Collection('contact-campaigns-client')

export const ContactCampaignStatuses = new Mongo.Collection('contact-campaign-statuses-client')
