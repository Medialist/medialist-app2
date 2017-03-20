export default function getAvatar (user) {
  const twitter = user && user.services && user.services.twitter && user.services.twitter.profile_image_url_https

  if (twitter) {
    return twitter
  }

  const avatar = encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/1/1e/Default-avatar.jpg')

  return `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=${avatar}`
}
