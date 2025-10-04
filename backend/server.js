const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const cors = require('cors');
app.use(cors()); // allow all origins during dev


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
