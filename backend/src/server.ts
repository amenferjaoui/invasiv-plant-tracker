const express = require("express");
import Database from "./database/connect";
import { allowCors } from "./middleware/cors";
import router from "./routes";
const PORT = 3000;
const app = express();

app.use(allowCors);

app.use(express.json({ limit: "10mb" }));
app.use(router);

const dbInstance = Database.getInstance();
dbInstance.connect();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
