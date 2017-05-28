import React, { PropTypes } from 'react'
import classnames from 'classnames'

/*
 Create a hidden file input, and simulate a click on it when parent element is
 clicked. Pass in a button or any children you want to see on the page.
*/
const FileInput = React.createClass({
  propTypes: {
    className: PropTypes.string,
    style: PropTypes.object,
    dropClassName: PropTypes.string,
    dropStyle: PropTypes.object,
    disabled: PropTypes.bool,
    accept: PropTypes.string,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    return { dragOver: false }
  },
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
    return false
  },
  onDragEnter (evt) {
    evt.preventDefault()
    evt.stopPropagation()
    console.log('dragEnter')
    this.setState({dragOver: true})
  },
  onDragLeave (evt) {
    evt.stopPropagation()
    evt.preventDefault()
    console.log('dragLeave')
    this.setState({dragOver: false})
  },
  render () {
    const { className, style, dropStyle, dropClassName, disabled, accept, onChange } = this.props
    const styles = Object.assign(
      {position: 'relative', overflow: 'hidden'},
      style,
      this.state.dragOver ? dropStyle : null
    )
    const cls = classnames(className, this.state.dragOver ? dropClassName : '')
    return (
      <div className={cls} style={styles}>
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
        <div
          style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
          onClick={this.onClick}
          onDrop={this.onDrop}
          onDragOver={this.onDragOver}
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
        />
      </div>
    )
  }
})

export default FileInput

