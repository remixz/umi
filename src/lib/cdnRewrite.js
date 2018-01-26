const CRUNCHYROLL_CDN = 'http://img1.ak.crunchyroll.com/'

export default function cdnRewrite (url) {
  if (typeof url !== 'string') return url

  if (url.indexOf(CRUNCHYROLL_CDN) > -1) {
    return url.replace(CRUNCHYROLL_CDN, '/cdn/')
  } else {
    return url
  }
}
