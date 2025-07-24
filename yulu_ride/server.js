import app from './app.js';
import db_health_check from './db/db_health_check.js';

const PORT = process.env.PORT || 3000;

await db_health_check(); // ✅ only runs in prod

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
