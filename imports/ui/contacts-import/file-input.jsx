import React from 'react'

/*
 Create a hidden file input, and simulate a click on it when parent element is
 clicked.

 Pass in a button or any children you want to see on the page.
*/
const FileInput = React.createClass({
  onClick () {
    this.fileInput.click()
  },
  onDrop (evt) {
    evt.preventDefault()
    evt.stopPropagation()
    const files = evt.nativeEvent.dataTransfer && evt.nativeEvent.dataTransfer.files
    if (!files) return false
    this.props.onChange({target: {files}})
  },
  onDragOver (evt) {
    // Voodoo to make onDrop work...
    evt.preventDefault()
    evt.stopPropagation()
    return false
  },
  render () {
    const { className, disabled, accept, onChange } = this.props
    return (
      <div className={className} style={{position: 'relative', overflow: 'hidden'}} onClick={this.onClick} onDrop={this.onDrop} onDragOver={this.onDragOver}>
        <input
          ref={(r) => { this.fileInput = r }}
          type='file'
          accept={accept}
          disabled={disabled}
          onChange={onChange}
          style={{visibility: 'none', position: 'absolute', top: '-9999px'}}
          data-id='file-input'
          />
        { this.props.children }
      </div>
    )
  }
})

export default FileInput
