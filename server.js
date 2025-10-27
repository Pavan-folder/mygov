const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');
const redis = require('redis');
const i18n = require('i18n');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mgnrega',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Redis client for caching
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// i18n configuration
i18n.configure({
  locales: ['en', 'hi', 'te'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'locale'
});

app.use(i18n.init);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index', { __: res.__ });
});

app.get('/api/states', async (req, res) => {
  // Only return Andhra Pradesh as requested
  res.json(['ANDHRA PRADESH']);
});

app.get('/api/districts/:state', async (req, res) => {
  try {
    const cacheKey = `districts:${req.params.state}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const query = 'SELECT DISTINCT district FROM mgnrega_data WHERE state = $1 ORDER BY district';
    const result = await pool.query(query, [req.params.state]);
    const districts = result.rows.map(row => row.district);

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(districts)); // Cache for 1 hour
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/data/:state/:district', async (req, res) => {
  try {
    const { state, district } = req.params;
    const cacheKey = `data:${state}:${district}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Fetch data from database
    const query = 'SELECT * FROM mgnrega_data WHERE state = $1 AND district = $2 ORDER BY year DESC, month DESC';
    const result = await pool.query(query, [state, district]);
    let data = result.rows;

    // If no data in database, try to fetch from API
    if (data.length === 0) {
      try {
        const apiKey = process.env.API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
        const baseUrl = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
        const apiUrl = `${baseUrl}?api-key=${apiKey}&format=json&offset=0&limit=100&filters[state_name]=${encodeURIComponent(state)}&filters[district_name]=${encodeURIComponent(district)}`;

        const response = await axios.get(apiUrl);
        const apiData = response.data;

        if (apiData.records && apiData.records.length > 0) {
          // Store new data
          for (const record of apiData.records) {
            const insertQuery = `
              INSERT INTO mgnrega_data (state, district, month, year, employment_generated, households_covered, total_expenditure, works_completed)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              ON CONFLICT (state, district, month, year) DO NOTHING
            `;
            await pool.query(insertQuery, [
              record.state_name,
              record.district_name,
              record.month_name,
              record.fin_year,
              parseInt(record.persondays) || 0,
              parseInt(record.households) || 0,
              parseFloat(record.expenditure) || 0,
              parseInt(record.works) || 0
            ]);
          }

          // Return the newly stored data
          const newResult = await pool.query(query, [state, district]);
          data = newResult.rows;
        }
      } catch (error) {
        console.error('Error fetching from API:', error.message);
      }
    }

    await redisClient.setEx(cacheKey, 1800, JSON.stringify(data)); // Cache for 30 minutes
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Language switching route
app.post('/set-locale/:locale', (req, res) => {
  const locale = req.params.locale;
  if (['en', 'hi', 'te'].includes(locale)) {
    res.cookie('locale', locale);
  }
  res.redirect('back');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
