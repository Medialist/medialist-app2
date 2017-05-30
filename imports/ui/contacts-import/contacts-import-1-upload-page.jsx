import React from 'react'
import { withRouter } from 'react-router'
import path from 'path'
import FileInput from '/imports/ui/contacts-import/file-input'
import FileDrop from '/imports/ui/contacts-import/file-drop'
import Topbar from '/imports/ui/navigation/topbar'
import CsvToContacts from '/imports/ui/contacts-import/csv-to-contacts'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'

class ContactImportUploadPage extends React.Component {
  state = { file: null }

  onFilesChange = (files) => {
    const file = files[0]
    const ext = path.extname(file.name)
    if (ext && ext !== '.csv') {
      const msg = `Please convert ${file.name} to a .csv file and try again.`
      this.props.snackbar.error(msg, 'contacts-import-file-not-csv')
    } else {
      this.setState({file})
      this.parseCsv(file, (err, data) => {
        if (err) return
        this.setState({data})
      })
    }
  }

  onImportClick = () => {
    const { file, data } = this.state
    if (data) {
      this.goToPreview(data)
    } else {
      this.parseCsv(file, (err, data) => {
        if (err) return
        this.goToPreview(data)
      })
    }
  }

  parseCsv (file, cb) {
    CsvToContacts.importCsvFile(file, (err, data) => {
      if (err) {
        console.error(`Error parsing ${file.name} as csv`, err, file)
        const msg = `Please ensure ${file.name} only contains comma seperated values`
        this.props.snackbar.error(msg, 'contacts-import-csv-parse-error')
        this.setState({file: null, data: null})
        return cb(err)
      } else {
        cb(null, data)
      }
    })
  }

  goToPreview (data) {
    this.props.router.push({
      pathname: '/contacts/import/preview',
      state: data
    })
  }

  render () {
    const { onFilesChange, onImportClick } = this
    const { file } = this.state
    return (
      <div data-id='contacts-import'>
        <Topbar backLinkText='Cancel' />
        <section className='mx-auto center py3' style={{maxWidth: 554}}>
          <h1 className='f-xxl gray10 m0 pb2 semibold'>Import your contacts</h1>
          <p className='f-lg gray20 m0 pb5'>Select a CSV file or Excel spreadsheet</p>
          { file ? (
            <FileInfo onFilesChange={onFilesChange} onImport={onImportClick} file={file} />
          ) : (
            <UploadFile onFilesChange={onFilesChange} />
          )}
          <p className='normal p2' style={{lineHeight: '1.8rem'}}>
            Importing a CSV file allows you to add and update contacts stored in Medialist. If a contact email address or Twitter handle in your spreadsheet matches an existing contact, the contact will be updated with the mapped values from your spreadsheet. Otherwise, a new contact will be created.
          </p>
        </section>
      </div>
    )
  }
}

export default withSnackbar(withRouter(ContactImportUploadPage))

const UploadFile = ({ onFilesChange }) => (
  <FileDropZone onFiles={onFilesChange}>
    <h3 className='py4 m0 normal'>Drag and drop your file here</h3>
    <div className='semibold gray10'>OR</div>
    <div className='pt4 pb6'>
      <FileInput
        accept='text/csv'
        onFiles={onFilesChange} >
        <div className='btn bg-blue white mx4'>
          Select a file from your computer...
        </div>
      </FileInput>
    </div>
  </FileDropZone>
)

const FileInfo = ({ file, onImport, onFilesChange }) => (
  <FileDropZone onFiles={onFilesChange}>
    <div className='py6'>
      <div className='inline-block mr3 align-middle rounded bg-gray10 white caps semibold f-lg' style={{width: 53, padding: '15px 0'}}>
      CSV
      </div>
      <div className='inline-block align-middle left-align'>
        <div className='italic gray20 f-lg semibold'>{file.name}</div>
        <div className='gray20 f-lg'>{(file.size * 0.001).toFixed(1)} KB</div>
        <FileInput accept='text/csv' onFiles={onFilesChange}>
          <div className='pointer blue f-sm underline'>Change</div>
        </FileInput>
      </div>
    </div>
    <div className='py4 center border-top border-gray80'>
      <button className='btn bg-completed white mx4' onClick={onImport} data-id='upload-contacts-button'>
        Upload File
      </button>
    </div>
  </FileDropZone>
)

const FileDropZone = ({onFiles, children}) => (
  <FileDrop
    style={{ borderStyle: 'dashed', borderWidth: '2px' }}
    className='rounded border-gray60 bg-white py2 mx-auto width-100'
    dropClassName='border-blue'
    onFiles={onFiles} >
    {children}
  </FileDrop>
)
