const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Enable CORS for specific origin (Vercel)
const allowedOrigins = ['http://localhost:3001', 'https://github-caveman-checker-spie.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Serve static files from the 'data' directory
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/data/pairs.json', (req, res) => {
  const pairsPath = path.join(__dirname, 'data', 'pairs.json');
  console.log('Attempting to read pairs.json from:', pairsPath);
  fs.readFile(pairsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading pairs.json:', err);
      res.status(500).send('Error reading pairs.json');
      return;
    }
    console.log('Successfully accessed pairs.json');
    console.log('Content of pairs.json:', data);
    res.json(JSON.parse(data));
  });
});

// Endpoint to update pairs.json
app.post('/update-pairs', (req, res) => {
  try {
    const { headValue, dinosaur, customTextInput } = req.body;
    const pairsPath = path.join(__dirname, 'data', 'pairs.json');
    console.log(`Received request to update pairs: headValue=${headValue}, dinosaur=${dinosaur}, customTextInput=${customTextInput}`);

    const pairs = JSON.parse(fs.readFileSync(pairsPath, 'utf8'));
    console.log(`Current pairs: ${JSON.stringify(pairs, null, 2)}`);

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
    console.log(`Updated pairs: ${JSON.stringify(updatedPairs, null, 2)}`);

    res.json({ message: 'Pairs updated successfully' });
  } catch (error) {
    console.error('Error updating pairs:', error);
    res.status(500).json({ message: 'Failed to update pairs' });
  }
});

// Endpoint to log status messages
app.post('/log', (req, res) => {
  const { status, headValueAvailable, connectionStatus } = req.body;
  console.log(`Status: ${status}, Head Value Available: ${headValueAvailable}, Connection Status: ${connectionStatus}`);
  res.json({ message: 'Log entry added' });
});

// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});