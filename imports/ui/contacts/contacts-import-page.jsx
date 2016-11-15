import React from 'react'
import Topbar from '../navigation/topbar'
import FilePicker from 'react-file-input'
import Papa from 'papaparse'
import ImportTable from './contacts-import-table'

export default React.createClass({
  getInitialState () {
    return {
      headerRow: [],
      dataRows: []
    }
  },
  parseCSV (file) {
    const opts = {
      delimiter: ',',
      header: true,
      dynamicTyping: true,
      preview: 5,
      encoding: '',
      step: this.onReadRow,
      complete: this.onComplete,
      error: undefined,
      skipEmptyLines: true
    }
    Papa.parse(file, opts)
  },
  onReadRow (row) {
    const newDataRows = this.state.dataRows.slice(0)
    newDataRows.push(row.data[0])
    this.setState({dataRows: newDataRows})
  },
  onComplete (results, file) {
    const { dataRows } = this.state
    const headerRow = Object.keys(dataRows[0])
    this.setState({headerRow})
  },
  onChange (evt) {
    this.parseCSV(evt.target.files[0])
  },
  hasFile () {
    return this.state.headerRow.length > 0 && this.state.dataRows.length > 0
  },
  render () {
    const { hasFile, onChange } = this
    const { headerRow, dataRows } = this.state
    const style = {
      borderStyle: 'dashed',
      borderWidth: '4px'
    }
    return (
      <div>
        <Topbar backLinkText='Cancel'><ActionButton showButton={hasFile()} /></Topbar>
        {hasFile() ? (
          <div>
            <section className='block my6 center pt6'>
              <h2 className='normal mt6'>Match your spreadsheet fields to Medialist fields</h2>
              <h3 className='normal'>Below is a preview of your spreadsheet. Match the columns to Medialist fields.</h3>
              <div className='inline-block bg-white mt3 border border-gray80'>
                <div className='inline-block border-right border-gray80 py3 px6'>
                  <span className='blue mr1'>{dataRows.length}</span>Contacts found
                </div>
                <div className='inline-block py3 px6'>
                  <span className='blue mr1'>0</span>Columns selected
                </div>
              </div>
            </section>
            <ImportTable headerRow={headerRow} dataRows={dataRows} />
          </div>
        ) : (
          <UploadFile style={style} onChange={onChange} />
        )}
      </div>
    )
  }
})

const UploadFile = (props) => {
  const { onChange, style } = props
  return (
    <section className='max-width-md mx-auto center py6'>
      <h1 className='mt6'>Import your contacts</h1>
      <h2 className='normal'>Select a CSV file or Excel spreadsheet below</h2>
      <div className='border-gray80 bg-white mx-auto py6 width-100' style={style}>
        <h3 className='my4 normal'>Drag and drop your file here</h3>
        <h3 className='my2'>OR</h3>
        <button className='bg-blue white mt2 mb4 px4 py2 border-transparent normal rounded center relative' style={{width: '15rem'}}>
          <span>Select a file from your computer...</span>
          <span className='absolute top-0 left-0 width-100'>
            <FilePicker name='contacts-upload' accept='text/csv' onChange={onChange} className='pb4' />
          </span>
        </button>
      </div>
      <h4 className='normal' style={{lineHeight: '2rem'}}>Importing a CSV file or Excel spreadsheet allows you to add and update contacts stored in Medialist. If a contact email address or Twitter handle in your spreadsheet matches an existing contact, the contact will be updated with the mapped values from your spreadsheet. Otherwise, a new contact will be created.</h4>
    </section>
  )
}

const ActionButton = (props) => {
  const { showButton } = props
  return showButton ? <button className='btn bg-completed white mx4'>Save and import contacts</button> : null
}
