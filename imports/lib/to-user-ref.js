import getAvatar from '/imports/lib/get-avatar'

export default function toUserRef (user) {
  if (!user) {
    return null
  }

  const ref = {
    _id: user._id,
    name: user.profile.name,
    email: user.emails && user.emails.length ? user.emails[0].address : undefined,
    avatar: getAvatar(user)
  }

  if (!ref.avatar) {
    delete ref.avatar
  }

  if (!ref.email) {
    delete ref.email
  }

  return ref
}
