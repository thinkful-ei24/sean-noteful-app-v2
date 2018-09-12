
const express = require('express');

const knex = require('../knex');

const router = express.Router();

const nameError = function() {
  const err = new Error('Missing `name` in request body');
  err.status = 400;
  return err;
};

router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      return res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const {id} = req.params;

  knex('folders')
    .where({id})
    .then(result => {
      return res.json(result[0]);
    })
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) => {
  const {id} = req.params;
  const {name} = req.body;

  if(!name) {
    const err = nameError();
    return (err);
  }

  knex('folders')
    .update({name})
    .where({id})
    .returning(['name', 'id'])
    .then(response => {
      return res.json(response[0]);
    })
    .catch(err => {
      return next(err);
    });
});

router.post('/', (req, res, next) => {
  const {name} = req.body;

  if(!name) {
    const err = nameError();
    return next(err);
  }

  knex('folders')
    .insert({name})
    .returning(['name', 'id'])
    .then(result => {
      return res.json(result[0]);
    })
    .catch(err => {
      return next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  knex('folders')
    .where({id})
    .del()
    .then(() => {
      return res.sendStatus(204);
    })
    .catch(err => {
      return next(err);
    });
});

module.exports = router;