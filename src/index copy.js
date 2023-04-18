const express = require('express');
const nanoid = require('nanoid');

const talkerRoute = require('./talkerRoutes');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.use(talkerRoute);

app.post('/login', async (request, response) => {
  const token = nanoid(16);
  return response.status(200).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});
