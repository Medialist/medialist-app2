import { createContainer } from 'meteor/react-meteor-data'
import MasterLists from '/imports/api/master-lists/master-lists'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'

export default createContainer(({open, type, ...props}) => {
  // master lists are subscribed to at the layout level
  const allMasterLists = open ? MasterLists.find({type}).fetch() : []
  return { open, type, allMasterLists, ...props }
}, AddToMasterListModal)
