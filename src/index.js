const express = require('express');

const talkerRoute = require('./talkerRoutes');
const loginRoutes = require('./loginRoutes');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.use(talkerRoute);
app.use(loginRoutes);

app.listen(PORT, async () => {
  console.log('Online');
});
