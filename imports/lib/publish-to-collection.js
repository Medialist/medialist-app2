/**
 * Publish results from a cursor to a named client side collection.
 */
export default function publishToCollection (sub, collectionName, cursor) {
  const subHandle = cursor.observeChanges({
    added: function (id, fields) {
      sub.added(collectionName, id, fields)
    },
    changed: function (id, fields) {
      sub.changed(collectionName, id, fields)
    },
    removed: function (id) {
      sub.removed(collectionName, id)
    }
  })

  sub.ready()

  sub.onStop(function () {
    subHandle.stop()
  })
}
