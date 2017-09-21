const axios = require('axios')
const cheerio = require('cheerio')

async function openingHandler (req, res) {
  const {search} = req.query
  if (!search) return res.send({result: null})

  try {
    const {data: [html, id]} = await axios.post('https://themes.moe/includes/anime_search.php', `search=-1&name=${search}`)
    if (!id) return res.send({result: null})

    const $ = cheerio.load(html)
    const openings = $('a.vid-popup[data-type^="OP"]').toArray().map((el) => el.attribs.href)
    const result = openings[Math.floor(Math.random() * openings.length)]

    res.send({result})
  } catch (err) {
    console.error(err.message)
    res.send({result: null})
  }
}

module.exports = openingHandler
