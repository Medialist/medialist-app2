import test from 'ava'
import React from 'react'
import moment from 'moment'

import { timeFromNowShortFormat } from '../../../imports/ui/time/time'

const now = new Date()

test('should format \'Just now\' for under a minute', (t) => {
  t.plan(2)
  const then = moment(now).subtract(30, 's')
  t.is(timeFromNowShortFormat(then), 'Just now')
  t.not(timeFromNowShortFormat(then.subtract(60, 's')), 'Just now')
})

test('should reply with minutes for duration under an hour', (t) => {
  t.plan(1)
  const then = moment(now).subtract(30, 'm')
  t.is(timeFromNowShortFormat(then), '30mins')
})

test('should reply with the hour if then is during that day', (t) => {
  t.plan(2)
  const then = moment(now).subtract(2, 'h')
  const yesterday = moment(now).subtract(25, 'h')
  t.is(timeFromNowShortFormat(then), '2h')
  t.not(timeFromNowShortFormat(yesterday), '25h')
})

test('should format a date from the current year', (t) => {
  t.plan(1)
  const thisYear = moment(now).format('YYYY')
  const then = moment(`${thisYear}-01-01`)
  const result = timeFromNowShortFormat(then)
  t.is(result, `1 Jan`)
})

test('should format a date from a previous year', (t) => {
  t.plan(1)
  const then = moment('1970-01-01', 'YYYY-MM-DD')
  const result = timeFromNowShortFormat(then)
  t.is(result, '1 Jan 1970')
})
