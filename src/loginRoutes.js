const nanoid = require('nanoid');
const { Router } = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = Router();

const validationLogin = (request, response, next) => {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  const { email, password } = request.body;
  if (!email) return response.status(400).json({ message: 'O campo "email" é obrigatório' });
  if (!(regex.test(email))) {
    return response.status(400)
      .json({ message: 'O "email" deve ter o formato "email@email.com"' }); 
  }
  if (!password) return response.status(400).json({ message: 'O campo "password" é obrigatório' });
  if (password.length < 6) {
    return response.status(400)
      .json({ message: 'O "password" deve ter pelo menos 6 caracteres' }); 
  }
  return next();
};

router.post('/login', validationLogin, async (_request, response) => {
  const token = nanoid(16);
  // const tokens = JSON.parse(await fs.readFile(path.resolve(__dirname, 'tokens.json')));
  // await fs.writeFile(path.resolve(__dirname, 'tokens.json'), JSON.stringify([...tokens, token]));
  return response.status(200).json({ token });
});

module.exports = router;
