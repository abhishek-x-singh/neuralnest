const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`NeuralNest Knowledge API running on http://localhost:${PORT}`);
});
