const axios = require('axios')
const url = require('url')

function bifHandler (req, res) {
  const {bif} = req.query
  if (!bif) return res.end()
  const {hostname} = url.parse(bif)
  if (!hostname.endsWith('crunchyroll.com')) return res.end()

  res.type('application/octet-stream')
  axios.get(bif, {
    responseType: 'stream'
  })
    .then(({data}) => data.pipe(res))
    .catch(() => res.end())
}

module.exports = bifHandler
