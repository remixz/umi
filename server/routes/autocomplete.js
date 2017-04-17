const axios = require('axios')

function autocompleteHandler (req, res) {
  const {country} = req.params
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

    res.send(filtered)
  })).catch((err) => {
    console.error(err.message)
    res.status(500).send('something went wrong')
  })
}

module.exports = autocompleteHandler
