const path = require('path');
const fs = require('fs/promises');
const { Router } = require('express');

const router = Router();

router.get('/talker', async (_request, response) => {
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, 'talker.json')));
  response.status(200).json(data);
});

router.get('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const data = JSON.parse(await fs.readFile(path.resolve(__dirname, 'talker.json')));
  const filter = data.find((e) => e.id === Number(id));
  if (!filter) return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return response.status(200).json(filter);
});

module.exports = router;
