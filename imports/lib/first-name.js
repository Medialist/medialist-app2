export default function firstName (contact) {
  const name = contact && contact.name && contact.name.split(' ')[0]
  return name || 'this contact'
}
