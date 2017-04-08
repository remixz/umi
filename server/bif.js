const axios = require('axios')
const url = require('url')
const qs = require('querystring')

function bifHandler (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const {query} = url.parse(req.url)
  const {bif} = qs.parse(query)
  if (!bif) return res.end()
  const {hostname} = url.parse(bif)
  if (!hostname.endsWith('crunchyroll.com')) return res.end()

  res.setHeader('Content-Type', 'application/octet-stream')
  axios.get(bif, {
    responseType: 'stream'
  })
    .then(({data}) => data.pipe(res))
    .catch(() => res.end())
}

module.exports = bifHandler
