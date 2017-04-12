import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'
import AddToMasterListModal from '../../../imports/ui/master-lists/add-to-master-list-modal'

const stubFunc = () => {}

test('should not render if open is false', (t) => {
  t.plan(1)
  const wrapper = shallow(
    <AddToMasterListModal
      open={false}
      onDismiss={stubFunc}
      onSave={stubFunc}
      selectedMasterLists={[]}
      allMasterLists={[]}
      title='Test' />
  )
  t.falsy(wrapper.node)
})

test('should render it open is true', (t) => {
  t.plan(1)
  const wrapper = shallow(
    <AddToMasterListModal
      open
      onDismiss={stubFunc}
      onSave={stubFunc}
      selectedMasterLists={[]}
      allMasterLists={[]}
      title='Test' />
  )
  t.truthy(wrapper.node)
})
