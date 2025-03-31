const express = require('express');
const cors = require('cors'); // Import the cors package
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'data' directory
app.use('/data', express.static(path.join(__dirname, 'data')));

app.get('/data/pairs.json', (req, res) => {
  const pairsPath = path.join(__dirname, 'data', 'pairs.json');
  console.log('Attempting to read pairs.json from:', pairsPath); // Log the path being accessed
  fs.readFile(pairsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading pairs.json:', err);
      res.status(500).send('Error reading pairs.json');
      return;
    }
    console.log('Successfully accessed pairs.json');
    console.log('Content of pairs.json:', data); // Log the content of pairs.json
    res.json(JSON.parse(data));
  });
});

// Endpoint to update pairs.json
app.post('/update-pairs', (req, res) => {
  try {
    const { headValue, dinosaur, customTextInput } = req.body;
    const pairsPath = path.join(__dirname, 'data', 'pairs.json'); // Path to pairs.json in the data subfolder
    console.log(`Received request to update pairs: headValue=${headValue}, dinosaur=${dinosaur}, customTextInput=${customTextInput}`);

    const pairs = JSON.parse(fs.readFileSync(pairsPath, 'utf8'));
    console.log(`Current pairs: ${JSON.stringify(pairs, null, 2)}`);

    const updatedPairs = pairs.map(pair => {
      if (pair.headValue === headValue) {
        return {
          ...pair,
          dinosaur,
          customTextInput: customTextInput ?? 'none', // Use 'none' if customTextInput is not provided
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