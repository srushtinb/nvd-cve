require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`List: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("DB Error:", err);
    process.exit(1);
  });
