const url = require('url')
const qs = require('querystring')
const axios = require('axios')
const cheerio = require('cheerio')

function openingHandler (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const {query} = url.parse(req.url)
  const {search} = qs.parse(query)
  if (!search) return res.end(JSON.stringify({result: null}))

  axios.post('https://themes.moe/includes/anime_search.php', `search=-1&name=${search}`).then(({data}) => {
    const [html, id] = data
    if (!id) return res.end(JSON.stringify({result: null}))

    const $ = cheerio.load(html)
    const openings = $('a.vid-popup[data-type^="OP"]').toArray().map((el) => $(el).attr('href'))
    const result = openings[Math.floor(Math.random() * openings.length)]

    res.end(JSON.stringify({result}))
  })
}

module.exports = openingHandler
