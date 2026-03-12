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
app.use('/api/survey', require('./routes/survey'));
app.use('/api/health-report', require('./routes/healthReport'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/food', require('./routes/food'));
app.use('/api/wellness', require('./routes/wellness'));
app.use('/api/vaccinations', require('./routes/vaccinations'));
app.use('/api/womens-health', require('./routes/womensHealth'));
app.use('/api/fitness', require('./routes/fitness'));
app.use('/api/ai', require('./routes/ai'));

// Medicine-Food interaction data
const interactions = require('./data/interactions.json');
const interactionKeys = ['paracetamol', 'acetaminophen', 'iron', 'warfarin', 'metformin', 'calcium', 'thyroid', 'levothyroxine', 'antibiotic', 'aspirin', 'statin', 'alcohol'];
function findInteraction(medicineName) {
  const key = (medicineName || '').toLowerCase();
  const match = Object.keys(interactions).find(k => key.includes(k));
  if (match) return interactions[match];
  if (key.includes('alcohol')) return { medicineName: 'Alcohol', avoid: ['Many medications'], recommended: ['Consult your doctor'], note: 'Alcohol interacts with many medications. Avoid or limit alcohol when taking prescription drugs.' };
  if (key.includes('paracetamol') || key.includes('acetaminophen')) return { medicineName: 'Paracetamol/Acetaminophen', avoid: ['Alcohol', 'Other products containing paracetamol'], recommended: ['Take with water', 'Stay within daily dose limits'], note: 'Avoid alcohol. Do not exceed 4g per day.' };
  return null;
}
app.get('/api/interactions/:medicine', (req, res) => {
  const data = findInteraction(req.params.medicine);
  res.json(data || { avoid: [], recommended: [], note: 'No specific interaction data found for this medication.' });
});
app.post('/api/interactions/check', (req, res) => {
  const medicine = req.body?.medicine || req.body?.medicineName || '';
  const data = findInteraction(medicine);
  if (data) {
    res.json({ found: true, medicine: data.medicineName || medicine, avoid: data.avoid || [], recommended: data.recommended || [], message: data.note });
  } else {
    res.json({ found: false, medicine, avoid: [], recommended: [], message: 'No specific interaction data found. Consult your pharmacist for personalized advice.' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'HealthSync API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
