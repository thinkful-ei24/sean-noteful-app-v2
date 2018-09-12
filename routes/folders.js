
const express = require('express');

const knex = require('../knex');

const router = express.Router();

router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      return res.json(results);
    })
    .catch(err => next(err));
});

module.exports = router;