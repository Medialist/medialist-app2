import test from 'ava'
import React from 'react'
import { shallow } from 'enzyme'

import SectorSelector from '../../../imports/ui/campaigns/sector-selector.jsx'

test('should render without exploding', (t) => {
  t.plan(1)
  const items = [
    { _id: 0, name: 'All', count: 10 },
    { _id: 1, name: 'My campaigns', count: 0 }
  ]
  const wrapper = shallow(<SectorSelector items={items} selected={items[0]} onSectorChange={() => {}} />)
  t.is(wrapper.length, 1)
})
