import app from './src/app.js';

console.log('JWT_SECRET: IN SERVER ', process.env.JWT_SECRET);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
