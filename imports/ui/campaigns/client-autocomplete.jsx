import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import escapeRegExp from 'lodash.escaperegexp'
import Clients from '/imports/api/clients/clients'
import Autocomplete from '/imports/ui/lists/autocomplete'

const ClientAutocomplete = createContainer((props) => {
  const sub = Meteor.subscribe('clients')
  const {value: term} = props
  if (!term || term.length < 1) return {suggestions: []}
  const termRegExp = new RegExp('^' + escapeRegExp(term), 'i')
  const suggestions = Clients
    .find({name: termRegExp})
    .map((c) => c.name)
  return {suggestions, loading: !sub.ready()}
}, Autocomplete)

export default ClientAutocomplete
