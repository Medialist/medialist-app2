import React, { PropTypes } from 'react'
import findUrl from '/imports/lib/find-url'
import LinkPreview from './link-preview'
import { Meteor } from 'meteor/meteor'
import debounce from 'lodash.debounce'

// how long to wait before we try to create an embed preview from a url in the post text
const EMBED_CREATION_WAIT = 500

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
    this.createEmbed = debounce((url) => {
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
    }, EMBED_CREATION_WAIT)

    return {
      embed: null,
      embedLoading: false,
      onChange: null
    }
  },

  componentWillReceiveProps ({value, onChange}) {
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

    this.createEmbed(url)
  },

  render () {
    const {focused, placeholder, value, disabled} = this.props
    const {embed, embedLoading} = this.state
    return (
      <div>
        <textarea
          rows={focused ? '3' : '1'}
          className='textarea mb1 placeholder-gray60 caret-blue'
          style={{border: '0 none', overflowY: 'auto', resize: 'none', paddingLeft: '3px'}}
          placeholder={placeholder}
          onChange={this.props.onChange}
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
