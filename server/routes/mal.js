const express = require('express')
const axios = require('axios')
const {json} = require('body-parser')
const popura = require('popura')
const Iron = require('iron')

const {IRON_TOKEN} = process.env

const router = express.Router()
router.use(json())

router.post('/login', function malLogin (req, res) {
  const {username, password} = req.body
  if (!username || !password) return res.status(400).send({status: 'not ok', error: 'Invalid login'})

  const client = popura(username, password)

  client.verifyAuth()
    .then((obj) => {
      Iron.seal(password, IRON_TOKEN, Iron.defaults, (err, sealed) => {
        if (err) return res.status(500).send({status: 'not ok', error: 'Internal error'})

        res.send({
          status: 'ok',
          username: obj.username,
          password: sealed
        })
      })
    })
    .catch((err) => {
      res.status(err.statusCode).send({
        status: 'not ok',
        error: err.message
      })
    })
})

router.get('/series', function malSeries (req, res) {
  const {name} = req.query
  if (!name) return res.status(400).send({status: 'not ok', error: 'Invalid payload'})

  axios({
    method: 'GET',
    url: 'https://myanimelist.net/search/prefix.json',
    params: {
      type: 'anime',
      keyword: name,
      v: 1
    }
  })
    .then(({data}) => {
      const {items} = data.categories[0]

      let item = items.find((i) => i.name.toLowerCase() === name.toLowerCase()) || items[0]
      if (name === 'My Hero Academia Season 2') {
        item = items.find((i) => i.name === 'Boku no Hero Academia 2nd Season') || item
      }
      if (!item) return res.status(404).send({status: 'not ok', error: `Couldn't find anime for "${name}"`})

      res.send({status: 'ok', item})
    })
})

router.post('/update', function malUpdate (req, res) {
  const {username, password, id, episode, status} = req.body
  if (!username || !password) return res.status(400).send({status: 'not ok', error: 'Invalid login'})
  if (!id || !episode || !status) return res.status(400).send({status: 'not ok', error: 'Invalid payload'})

  Iron.unseal(password, IRON_TOKEN, Iron.defaults, (err, unsealed) => {
    if (err) return res.status(500).send({status: 'not ok', error: 'Internal error'})

    const client = popura(username, unsealed)
    client.updateAnime(id, {episode, status})
      .then(() => {
        res.send({status: 'ok'})
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send({status: 'not ok', error: 'Internal error'})
      })
  })
})

module.exports = router
