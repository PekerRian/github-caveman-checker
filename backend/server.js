const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

const allowedOrigins = ['*']; // Allow all origins for simplicity, change as needed
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/data/pairs.json', (req, res) => {
  const pairsPath = path.join(__dirname, 'data', 'pairs.json');
  fs.readFile(pairsPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading pairs.json');
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.post('/update-pairs', (req, res) => {
  try {
    const { headValue, dinosaur, customTextInput } = req.body;
    const pairsPath = path.join(__dirname, 'data', 'pairs.json');
    const pairs = JSON.parse(fs.readFileSync(pairsPath, 'utf8'));

    const updatedPairs = pairs.map(pair => {
      if (pair.headValue === headValue) {
        return {
          ...pair,
          dinosaur,
          customTextInput: customTextInput ?? 'none',
        };
      }
      return pair;
    });

    fs.writeFileSync(pairsPath, JSON.stringify(updatedPairs, null, 2));
    res.json({ message: 'Pairs updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update pairs' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});