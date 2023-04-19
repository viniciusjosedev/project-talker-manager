const path = require('path');
const fs = require('fs/promises');
const { Router } = require('express');

const router = Router();

const nomeDoArquivo = 'talker.json';

const isAuth = (req, response, next) => {
  const { authorization } = req.headers;
  // console.log(authorization);
  if (!authorization) return response.status(401).json({ message: 'Token não encontrado' });
  if (authorization.length !== 16) return response.status(401).json({ message: 'Token inválido' });
  return next();
};

const validationName = async (req, res, next) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  if (name.length < 3) {
    return res.status(400)
      .json({ message: 'O "name" deve ter pelo menos 3 caracteres' }); 
}
  return next();
};

const validationAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (Number.isNaN(Number(age))) {
    return res.status(400)
      .json({ message: 'O campo "age" deve ser um número inteiro igual ou maior que 18' }); 
  }
  if (!(Number.isInteger(Number(age)))) {
    return res.status(400)
      .json({ message: 'O campo "age" deve ser um número inteiro igual ou maior que 18' }); 
  }
  if (Number(age) < 18) {
    return res.status(400)
      .json({ message: 'O campo "age" deve ser um número inteiro igual ou maior que 18' }); 
  }
  return next();
};

const completValidationRate = (req, res, next) => {
  const { talk: { rate } } = req.body;
  if (Number.isNaN(Number(rate))) {
    return res.status(400)
      .json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' }); 
  }
  // console.log('vai passar abaixo');
  if (!([1, 2, 3, 4, 5].includes(Number(rate)))) {
    return res.status(400)
      .json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' }); 
  }
  next();
};

const validationTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  if (!talk.watchedAt) {
    return res.status(400)
      .json({ message: 'O campo "watchedAt" é obrigatório' }); 
  }
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(19|20)\d{2}$/;
  if (!regex.test(talk.watchedAt)) {
    return res.status(400)
      .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' }); 
  }
  if (talk.rate === undefined) {
    return res.status(400)
      .json({ message: 'O campo "rate" é obrigatório' }); 
  }
  completValidationRate(req, res, next);
};

router.get('/talker', async (_request, response) => {
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, nomeDoArquivo)));
  response.status(200).json(data);
});

const validationQ = async (req, res, next) => {
  const { q } = req.query;
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, nomeDoArquivo)));
  if (q !== undefined) {
    const filter = data.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()));
    req.filterParams = filter;
    return next();
  }
  req.filterParams = data;
  return next();
};

const validationRate = async (req, res, next) => {
  const { query: { rate }, filterParams } = req;
  if (rate !== undefined) {
    if (!([1, 2, 3, 4, 5].includes(Number(rate)))) {
      return res.status(400)
        .json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
    }
    const filter = filterParams.filter((e) => Number(e.talk.rate) === Number(rate));
    req.filterParams = filter;
    return next();
  }
  next();
};

const validationDate = (req, res, next) => {
  const regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(19|20)\d{2}$/;
  const { query: { date }, filterParams } = req;
  if (date !== undefined) {
    if (date.length > 0 && !(regex.test(date))) {
      return res.status(400)
        .json({ message: 'O parâmetro "date" deve ter o formato "dd/mm/aaaa"' });
    }
    const filter = filterParams.filter((e) => e.talk.watchedAt.includes(date));
    req.filterParams = filter;
    return next();
  }
  next();
};

router.get('/talker/search', isAuth, validationQ, validationRate, validationDate,
  async (_request, response) => {
    const { filterParams } = _request;
    return response.status(200).json(filterParams);
});

router.get('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, nomeDoArquivo)));
  const filter = data.find((e) => e.id === Number(id));
  if (!filter) return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return response.status(200).json(filter);
});

router.post('/talker', isAuth, validationName, validationAge, validationTalk,
  async (_request, response) => {
    const { body } = _request;
    const data = JSON.parse(await fs.readFile(path.resolve(__dirname, nomeDoArquivo)));
    await fs.writeFile(path.resolve(__dirname, nomeDoArquivo), JSON
      .stringify([...data, { id: data.length + 1, ...body }]));
    response.status(201).json({ id: data.length + 1, ...body });
});

router.put('/talker/:id', isAuth, validationName, validationAge, validationTalk,
  async (_request, response) => {
    const { body, params: { id } } = _request;
    const data = JSON.parse(await fs.readFile(path.resolve(__dirname, nomeDoArquivo)));
    const filter = data.find((e) => e.id === Number(id));
    if (!filter) return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    const index = data.findIndex((e) => e.id === Number(id));
    data[index] = { ...data[index], ...body };
    await fs.writeFile(path.resolve(__dirname, nomeDoArquivo), JSON
      .stringify([...data]));
    response.status(200).json(data[index]);
});

router.delete('/talker/:id', isAuth, async (_request, response) => {
    const { params: { id } } = _request;
    const data = JSON.parse(await fs.readFile(path.resolve(__dirname, nomeDoArquivo)));
    const find = data.find((e) => e.id === Number(id));
    if (!find) return response.status(204).json();
    const filter = data.filter((e) => e.id !== Number(id));
    await fs.writeFile(path.resolve(__dirname, nomeDoArquivo), JSON
      .stringify([...filter]));
    return response.status(204).json();
});

router.patch('/talker/rate/:id', isAuth, async (_request, response) => {
  const { params: { id }, body: { rate } } = _request;
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, nomeDoArquivo)));
  if (rate !== undefined) {
    if (!([1, 2, 3, 4, 5].includes(Number(rate)))) {
      return response.status(400)
        .json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
    }
    const index = data.findIndex((e) => Number(e.id) === Number(id));
    console.log(id);
    data[index].talk.rate = Number(rate);
    await fs.writeFile(path.resolve(__dirname, nomeDoArquivo), JSON.stringify(data));
    return response.status(204).json();
  }
  return response.status(400).json({ message: 'O campo "rate" é obrigatório' });
});

module.exports = router;
