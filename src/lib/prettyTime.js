export default function prettyTime (time) {
  const mins = Math.floor(time / 60)
  const secs = time - (mins * 60)

  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
