const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_request, response) => {
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, 'talker.json')));
  response.status(200).json(data);
});

app.get('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, 'talker.json')));
  const filter = data.find((e) => e.id === Number(id));
  if (!filter) return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return response.status(200).json(filter);
});

app.listen(PORT, () => {
  console.log('Online');
});
