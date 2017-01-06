import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import Medialists, { MedialistUpdateSchema } from './medialists'

export const update = new ValidatedMethod({
  name: 'Medialists/update',
  validate: MedialistUpdateSchema.validator(),
  run (data) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')

    const { _id } = data
    delete data._id

    if (!Object.keys(data).length) {
      throw new Error('Missing fields to update')
    }

    return Medialists.update({ _id }, { $set: data })
  }
})
