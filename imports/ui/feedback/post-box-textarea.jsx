import React, { PropTypes } from 'react'
import findUrl from '/imports/lib/find-url'
import LinkPreview from './link-preview'
import { Meteor } from 'meteor/meteor'

const PostBoxTextArea = React.createClass({
  propTypes: {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string,
    focused: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    'data-id': PropTypes.string.isRequired
  },

  getInitialState () {
    return {
      embed: null,
      embedLoading: false
    }
  },

  componentWillReceiveProps ({value}) {
    if (value === this.props.value) {
      return
    }

    const url = findUrl(value)

    if (!url) {
      return this.setState({
        embedLoading: false,
        embed: null
      })
    }

    if (this.state.embed && this.state.embed.url === url) {
      return
    }

    this.setState({
      embedLoading: true
    })

    Meteor.call('createEmbed', {
      url
    }, (error, embed) => {
      if (error) {
        console.log(error)
        embed = null
      }

      this.setState({
        embed,
        embedLoading: false
      })
    })
  },

  render () {
    const {focused, placeholder, onChange, value, disabled} = this.props
    const {embed, embedLoading} = this.state
    return (
      <div>
        <textarea
          rows={focused ? '3' : '1'}
          className='textarea mb1 placeholder-gray60 caret-blue'
          style={{border: '0 none', overflowY: 'auto', resize: 'none', paddingLeft: '3px'}}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          disabled={disabled}
          data-id={this.props['data-id']} />
        {embedLoading || embed ? (
          <div className='py3'>
            <LinkPreview {...embed} loading={embedLoading} />
          </div>
        ) : null }
      </div>
    )
  }
})

export default PostBoxTextArea
