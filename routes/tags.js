
const knex = require('../knex');

const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  knex('tags')
    .then(results => {
      return res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const {id} = req.params;
  knex('tags')
    .where({id})
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
/* ========== POST/CREATE ITEM ========== */
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) => {
  const {id} = req.params;
  const {name} = req.body;
  knex('tags')
    .update({name})
    .where({id})
    .returning(['name', 'id'])
    .then(result => {
      res.json(result);
    })
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  const {id} = req.params;
  knex('tags').del()
    .where({id})
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));
});

module.exports = router;