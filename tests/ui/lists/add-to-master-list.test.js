import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'
import AddToMasterList from '../../../imports/ui/lists/add-to-master-list.jsx'

const stubFunc = () => {}

test('should not render if open is false', (t) => {
  t.plan(1)
  const wrapper = shallow(
    <AddToMasterList
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
    <AddToMasterList
      open
      onDismiss={stubFunc}
      onSave={stubFunc}
      selectedMasterLists={[]}
      allMasterLists={[]}
      title='Test' />
  )
  t.truthy(wrapper.node)
})
