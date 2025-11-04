const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api", (req, res) => {
  res.json({ message: "Hello from Backend!" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://3.110.205.36:${PORT}`));
