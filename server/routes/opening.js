const axios = require('axios')
const cheerio = require('cheerio')

function openingHandler (req, res) {
  const {search} = req.query
  if (!search) return res.send({result: null})

  axios.post('https://themes.moe/includes/anime_search.php', `search=-1&name=${search}`).then(({data}) => {
    const [html, id] = data
    if (!id) return res.send({result: null})

    const $ = cheerio.load(html)
    const openings = $('a.vid-popup[data-type^="OP"]').toArray().map((el) => el.attribs.href)
    const result = openings[Math.floor(Math.random() * openings.length)]

    res.send({result})
  })
}

module.exports = openingHandler
