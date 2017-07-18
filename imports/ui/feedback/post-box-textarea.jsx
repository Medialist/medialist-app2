import React from 'react'
import PropTypes from 'prop-types'
import findUrl from '/imports/lib/find-url'
import LinkPreview from '/imports/ui/feedback/link-preview'
import { Meteor } from 'meteor/meteor'
import debounce from 'lodash.debounce'

// how long to wait before we try to create an embed preview from a url in the post text
const EMBED_CREATION_WAIT = 500

const PostBoxTextArea = React.createClass({
  propTypes: {
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string,
    focused: PropTypes.bool,
    shouldFocus: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
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
          embedLoading: false,
          embed
        })

        this.props.onChange({
          target: {
            name: 'embed',
            value: embed
          }
        })
      })
    }, EMBED_CREATION_WAIT)

    return {
      embedLoading: false,
      embed: null
    }
  },

  componentWillMount () {
    this.didFocus = false
  },

  componentWillReceiveProps (nextProps) {
    // If shouldFocus becomes true, then focus the textarea after update
    if (nextProps.shouldFocus && !this.props.shouldFocus) {
      this.didFocus = false
    }

    if (nextProps.value === this.props.value) {
      return
    }

    const url = findUrl(nextProps.value)

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

  onChange (event) {
    this.props.onChange({
      target: {
        name: 'message',
        value: event.target.value
      }
    })
  },

  focusTextArea () {
    // If we have a textarea ref, and should focus it, and did not focus it yet...
    if (this.textArea && this.props.shouldFocus && !this.didFocus) {
      this.textArea.focus()
      this.didFocus = true
    }
  },

  onTextAreaRef (ref) {
    this.textArea = ref
    this.focusTextArea()
  },

  componentDidUpdate () {
    this.focusTextArea()
  },

  render () {
    return (
      <div>
        <textarea
          rows={this.props.focused ? '3' : '1'}
          className='textarea placeholder-gray60 caret-blue'
          style={{border: '0 none', overflowY: 'auto', resize: 'none', paddingLeft: '3px'}}
          placeholder={this.props.placeholder}
          onChange={this.onChange}
          value={this.props.value}
          disabled={this.props.disabled}
          data-id={this.props['data-id']}
          ref={this.onTextAreaRef} />
        {this.state.embed || this.state.embedLoading ? (
          <div className='mb3'>
            <LinkPreview {...this.state.embed} loading={this.state.embedLoading} />
          </div>
        ) : null }
      </div>
    )
  }
})

export default PostBoxTextArea
