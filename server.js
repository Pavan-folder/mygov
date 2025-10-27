const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgnrega')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define MGNREGA data schema
const MgnregaSchema = new mongoose.Schema({
  state: String,
  district: String,
  month: String,
  year: String,
  data: Object
});

const Mgnrega = mongoose.model('Mgnrega', MgnregaSchema);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api/states', async (req, res) => {
  // Only return Andhra Pradesh as requested
  res.json(['ANDHRA PRADESH']);
});

app.get('/api/districts/:state', async (req, res) => {
  const state = req.params.state;
  // Fetch districts from database
  const districts = await Mgnrega.distinct('district', { state });
  res.json(districts.sort());
});

app.get('/api/data/:state/:district', async (req, res) => {
  const { state, district } = req.params;
  // Fetch data from database or API
  const data = await Mgnrega.find({ state, district }).sort({ year: -1, month: -1 });

  // If no data in database, try to fetch from API
  if (data.length === 0) {
    try {
      const apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
      const baseUrl = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
      const apiUrl = `${baseUrl}?api-key=${apiKey}&format=json&offset=0&limit=100&filters[state_name]=${encodeURIComponent(state)}&filters[district_name]=${encodeURIComponent(district)}`;

      const response = await axios.get(apiUrl);
      const apiData = response.data;

      if (apiData.records && apiData.records.length > 0) {
        // Store new data
        for (const record of apiData.records) {
          const existingData = await Mgnrega.findOne({
            state: record.state_name,
            district: record.district_name,
            month: record.month_name,
            year: record.fin_year
          });

          if (!existingData) {
            const mgnregaData = new Mgnrega({
              state: record.state_name,
              district: record.district_name,
              month: record.month_name,
              year: record.fin_year,
              data: {
                employment_generated: parseInt(record.persondays) || 0,
                households_covered: parseInt(record.households) || 0,
                total_expenditure: parseFloat(record.expenditure) || 0,
                works_completed: parseInt(record.works) || 0
              }
            });

            await mgnregaData.save();
          }
        }

        // Return the newly stored data
        const newData = await Mgnrega.find({ state, district }).sort({ year: -1, month: -1 });
        res.json(newData);
        return;
      }
    } catch (error) {
      console.error('Error fetching from API:', error.message);
    }
  }

  res.json(data);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
