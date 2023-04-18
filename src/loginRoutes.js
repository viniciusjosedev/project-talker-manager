const nanoid = require('nanoid');
const { Router } = require('express');

const router = Router();

router.post('/login', async (request, response) => {
  const token = nanoid(16);
  return response.status(200).json({ token });
});

module.exports = router;
