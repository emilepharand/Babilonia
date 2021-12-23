import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.listen(5000, () => console.log('started'));

const router = express.Router();

router.get('/api/idea', (req, res) => {
  res.send('{["Bonjour","Au revoir"]}');
});

module.exports = router;
