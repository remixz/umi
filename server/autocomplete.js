const axios = require('axios')

function autocompleteHandler (req, res) {
  const country = req.url.replace('/autocomplete/', '')
  axios.all([
    axios.get(`http://because.moe/json/${country}`),
    axios.get('http://www.crunchyroll.com/ajax/?req=RpcApiSearch_GetSearchCandidates')
  ]).then(axios.spread((a, b) => {
    const moe = a.data.shows
    const cr = JSON.parse(b.data.substring(10, b.data.length - 2)).data

    const filtered = cr
      .filter((c) => c.type === 'Series' && !!(moe.find((m) => m.sites.crunchyroll && m.sites.crunchyroll === `http://www.crunchyroll.com${c.link}`)))
      .map((c) => ({
        name: c.name,
        id: c.id,
        image: c.img
      }))

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(filtered))
  })).catch((err) => {
    console.error(err.message)
    res.statusCode = 500
    res.end('something went wrong')
  })
}

module.exports = autocompleteHandler
