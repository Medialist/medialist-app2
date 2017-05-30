import React from 'react'
import PropTypes from 'prop-types'

/*
 Create a hidden file input, and simulate a click on it when parent element is
 clicked. Pass in a button or any children you want to see on the page.
*/
const FileInput = React.createClass({
  propTypes: {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    accept: PropTypes.string,
    onFiles: PropTypes.func.isRequired
  },
  onClick () {
    this.fileInput.click()
  },
  onChange (evt) {
    const {files} = evt.target
    if (!files) return
    this.props.onFiles(files)
  },
  render () {
    const { className, disabled, accept } = this.props
    return (
      <div className={className} style={{position: 'relative', overflow: 'hidden'}} onClick={this.onClick}>
        <input
          ref={(r) => { this.fileInput = r }}
          type='file'
          accept={accept}
          disabled={disabled}
          onChange={this.onChange}
          style={{visibility: 'none', position: 'absolute', top: '-9999px'}}
          data-id='file-input'
          />
        { this.props.children }
      </div>
    )
  }
})

export default FileInput

