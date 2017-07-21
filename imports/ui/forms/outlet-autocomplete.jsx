import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { searchOutlets } from '/imports/api/contacts/methods'
import ValidatedAutocomplete from '/imports/ui/forms/validated-autocomplete'

class OutletAutocomplete extends Component {
  static propTypes = {
    field: PropTypes.string,
    value: PropTypes.string
  }

  state = { suggestions: [] }

  componentWillMount () {
    this.updateSuggestions(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updateSuggestions(nextProps)
  }

  updateSuggestions ({ field, value }) {
    if (this.cancelUpdateSuggestions) {
      this.cancelUpdateSuggestions()
    }

    const term = value

    if (!term || term.length < 1) {
      return this.setState({ suggestions: [] })
    }

    let cancelled = false
    this.cancelUpdateSuggestions = () => { cancelled = true }

    searchOutlets.call({ field, term }, (err, suggestions) => {
      if (cancelled) return

      if (err) {
        this.setState({ suggestions: [] })
        return console.error('Failed to update suggestions')
      }

      this.setState({ suggestions })
    })
  }

  render () {
    const { props, state } = this
    return <ValidatedAutocomplete {...props} suggestions={state.suggestions} />
  }
}

export default OutletAutocomplete
