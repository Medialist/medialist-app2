import { Meteor } from 'meteor/meteor'

export default function trackEvent (name, opts) {
  if (Meteor.isServer) return
  if (window.Intercom) {
    window.Intercom('trackEvent', name, opts)
  }
  if (window.heap) {
    window.heap.track(name, opts)
  }
}
