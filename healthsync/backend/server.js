require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/food', require('./routes/food'));
app.use('/api/wellness', require('./routes/wellness'));
app.use('/api/vaccinations', require('./routes/vaccinations'));
app.use('/api/womens-health', require('./routes/womensHealth'));
app.use('/api/ai', require('./routes/ai'));

// Medicine-Food interaction data
const interactions = require('./data/interactions.json');
app.get('/api/interactions/:medicine', (req, res) => {
  const key = req.params.medicine.toLowerCase();
  const match = Object.keys(interactions).find(k => key.includes(k.toLowerCase()));
  res.json(match ? interactions[match] : { avoid: [], recommended: [], note: 'No specific interaction data found for this medication.' });
});

app.get('/api/health', (req, res) => res.json({ status: 'HealthSync API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
