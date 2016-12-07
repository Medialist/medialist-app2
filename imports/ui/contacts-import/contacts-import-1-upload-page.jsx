import React from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import FileInput from './file-input'
import Topbar from '../navigation/topbar'
import CsvToContacts from './csv-to-contacts'

export default withRouter(React.createClass({
  getInitialState () {
    return { file: null }
  },

  onFileChange (evt) {
    const file = evt.target.files[0]
    this.setState({file})
  },

  onImport () {
    const { router } = this.props
    const { file } = this.state
    CsvToContacts.importCsvFile(file, (err, data) => {
      if (err) return console.error(err)
      router.push({
        pathname: '/contacts/import/preview',
        state: data
      })
    })
  },

  render () {
    const { onFileChange, onImport } = this
    const { file } = this.state
    return (
      <div>
        <Topbar backLinkText='Cancel' />
        <section className='max-width-md mx-auto center py6'>
          <h1 className='mt6'>Import your contacts</h1>
          <h2 className='normal'>Select a CSV file or Excel spreadsheet below</h2>
          { file ? (
            <FileInfo onFileChange={onFileChange} onImport={onImport} file={file} />
          ) : (
            <UploadFile onFileChange={onFileChange} />
          )}
          <h4 className='normal' style={{lineHeight: '2rem'}}>Importing a CSV file or Excel spreadsheet allows you to add and update contacts stored in Medialist. If a contact email address or Twitter handle in your spreadsheet matches an existing contact, the contact will be updated with the mapped values from your spreadsheet. Otherwise, a new contact will be created.</h4>
        </section>
      </div>
    )
  }
}))

const UploadFile = ({ onFileChange }) => (
  <div className='border-gray80 bg-white mx-auto py6 width-100' style={{ borderStyle: 'dashed', borderWidth: '4px' }}>
    <h3 className='my4 normal'>Drag and drop your file here</h3>
    <h3 className='my2'>OR</h3>
    <div>Select a file from your computer...</div>
    <FileInput name='contacts-upload' accept='text/csv' onChange={onFileChange} className='pb4' />
  </div>
)

const FileInfo = ({ file, onImport, onFileChange }) => (
  <div className='border-gray80 bg-white mx-auto width-100' style={{ borderStyle: 'dashed', borderWidth: '4px' }}>
    <div className='py4'>
      <div className='inline-block align-middle rounded bg-gray10 white caps f-lg' style={{width: 53, padding: '15px 0'}}>
      CSV
      </div>
      <div className='inline-block align-middle'>
        <div className='italic gray20 f-lg semibold'>{file.name}</div>
        <div className='gray20 f-lg'>{(file.size * 0.001).toFixed(1)} KB</div>
        <div className='pointer blue f-sm underline'>
          <FileInput name='contacts-upload' accept='text/csv' onChange={onFileChange} className='pb4' />
        </div>
      </div>
    </div>
    <div className='py3 center border-top border-gray80'>
      <button className='btn bg-completed white mx4' onClick={onImport}>
        Upload File
      </button>
    </div>
  </div>
)
