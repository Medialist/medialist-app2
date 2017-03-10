// import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
// import { searchOutlets } from '/imports/api/contacts/queries'
import { searchOutlets } from '/imports/api/contacts/methods'
import Autocomplete from '../lists/autocomplete'

const OutletAutocomplete = createContainer((props) => {
  const {field, value: term} = props
  if (!term || term.length < 1) return {suggestions: []}
  const suggestions = searchOutlets.call({field, term})
  return {suggestions}
}, Autocomplete)

export default OutletAutocomplete
