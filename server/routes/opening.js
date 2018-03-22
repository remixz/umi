const axios = require('axios')
const cheerio = require('cheerio')
const cache = {}

async function openingHandler (req, res) {
  const {search} = req.query
  if (!search) return res.send({result: null})
  if (cache[search]) {
    const openings = cache[search]
    const result = openings[Math.floor(Math.random() * openings.length)].url
    return res.send({result})
  }

  try {
    const {data: results} = await axios.get(`https://openings.ninja/core/getAnime.php?term=${search}`, {timeout: 3000})
    if (!results || results.length === 0) return res.send({result: null})

    const {data: html} = await axios.get(`https://openings.ninja/${results[0]}/op/1`)
    const $ = cheerio.load(html)
    const openings = []
    $('#mirror > li[data-theme^="op"]').toArray()
      .forEach((el) => {
        const index = openings.findIndex((op) => op.theme === el.attribs['data-theme'])
        if (index < 0) {
          openings.push({theme: el.attribs['data-theme'], url: el.attribs['data-url']})
        }
      })

    cache[search] = openings
    const result = openings[Math.floor(Math.random() * openings.length)].url
    res.send({result})
  } catch (err) {
    console.error(err.message)
    res.send({result: null})
  }
}

module.exports = openingHandler
