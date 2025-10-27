const axios = require('axios');
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mgnrega',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fetchAndStoreData(state = 'ANDHRA PRADESH', year = '2024-2025') {
  const apiKey = process.env.API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const baseUrl = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
  const apiUrl = `${baseUrl}?api-key=${apiKey}&format=json&offset=0&limit=100&filters[state_name]=${encodeURIComponent(state)}&filters[fin_year]=${encodeURIComponent(year)}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.records && data.records.length > 0) {
      // Process and store data
      for (const record of data.records) {
        // Check if data already exists
        const checkQuery = 'SELECT id FROM mgnrega_data WHERE state = $1 AND district = $2 AND month = $3 AND year = $4';
        const existing = await pool.query(checkQuery, [record.state_name, record.district_name, record.month_name, record.fin_year]);

        if (existing.rows.length === 0) {
          const insertQuery = `
            INSERT INTO mgnrega_data (state, district, month, year, employment_generated, households_covered, total_expenditure, works_completed)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
          console.log(`Saved data for ${record.district_name} - ${record.month_name} ${record.fin_year} - Employment: ${record.persondays}, Households: ${record.households}, Expenditure: ${record.expenditure}`);
        } else {
          console.log(`Data already exists for ${record.district_name} - ${record.month_name} ${record.fin_year}`);
        }
      }

      console.log(`Data fetched and stored successfully for ${state} - ${year}`);
    } else {
      console.log(`No data available for ${state} - ${year}`);
    }
  } catch (error) {
    console.error('Error fetching data:', error.response?.data || error.message);
  } finally {
    await pool.end();
  }
}

// Run the function
fetchAndStoreData();
