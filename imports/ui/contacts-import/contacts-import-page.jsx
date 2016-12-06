import React from 'react'
import Topbar from '../navigation/topbar'
import FilePicker from 'react-file-input'
import ImportTable from './contacts-import-table'
import CsvToContacts from './csv-to-contacts'

export default React.createClass({
  getInitialState () {
    return {
      fileLoading: false,
      file: null,
      rows: [],
      cols: []
    }
  },
  isFileReady () {
    const {file, fileLoading} = this.state
    return file && !fileLoading
  },
  onFileChange (evt) {
    const file = evt.target.files[0]
    this.setState({fileLoading: true, file: file})
    CsvToContacts.importCsvFile(file, (err, data) => {
      if (err) return console.error(err)
      const { rows, cols } = data
      this.setState({rows, cols, fileLoading: false})
    })
  },
  onColumnChange (newCol, i) {
    console.log('onColumnChange', newCol, i)
    const cols = Array.from(this.state.cols)
    cols[i] = newCol
    this.setState({cols})
  },
  render () {
    const { onFileChange, onColumnChange } = this
    const { cols, rows } = this.state
    const isFileReady = this.isFileReady()
    return (
      <div>
        <Topbar backLinkText='Cancel'><ActionButton showButton={isFileReady} /></Topbar>
        {isFileReady ? (
          <FileUploaded rows={rows} cols={cols} onColumnChange={onColumnChange} />
        ) : (
          <UploadFile style={{ borderStyle: 'dashed', borderWidth: '4px' }} onChange={onFileChange} />
        )}
      </div>
    )
  }
})

const UploadFile = ({ onChange, style }) => (
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

const FileUploaded = ({rows, cols, onColumnChange}) => (
  <section className='block'>
    <div className='my6 center pt6'>
      <h2 className='normal mt6'>Match your spreadsheet fields to Medialist fields</h2>
      <h3 className='normal'>Below is a preview of your spreadsheet. Match the columns to Medialist fields.</h3>
      <div className='inline-block bg-white mt3 border border-gray80'>
        <div className='inline-block border-right border-gray80 py3 px6'>
          <span className='blue mr1'>{rows.length}</span>Contacts found
        </div>
        <div className='inline-block py3 px6'>
          <span className='blue mr1'>{cols.filter((c) => !!c).length}</span>Columns selected
        </div>
      </div>
    </div>
    <div className='mt6 px3'>
      <ImportTable cols={cols} rows={rows} onColumnChange={onColumnChange} />
    </div>
  </section>
)

const ActionButton = (props) => {
  const { showButton } = props
  return showButton ? <button className='btn bg-completed white mx4'>Save and import contacts</button> : null
}
