import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'
import AddToMasterList from '../../../imports/ui/lists/add-to-master-list.jsx'

const stubFunc = () => {}

test('should not render initially', (t) => {
  t.plan(1)
  const wrapper = shallow(<AddToMasterList open={false} onDismiss={stubFunc} />)
  t.falsy(wrapper.node)
})

test('should render in modal', (t) => {
  t.plan(1)
  const wrapper = shallow(<AddToMasterList open onDismiss={stubFunc} />)
  t.truthy(wrapper.node)
})
