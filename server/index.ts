import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(distPath));
app.get('*', (_, res) => {
  res.sendFile('index.html', { root: distPath });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
