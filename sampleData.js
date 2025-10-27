const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mgnrega',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function insertSampleData() {
  const districts = [
    'ALLURI SITHARAMA RAJU',
    'ANAKAPALLI',
    'ANANTHAPURAMU',
    'ANNAMAYYA',
    'BAPATLA',
    'CHITTOOR',
    'DR. B.R. AMBEDKAR KONASEEMA',
    'EAST GODAVARI',
    'ELURU',
    'GUNTUR',
    'KAKINADA',
    'KRISHNA',
    'KURNOOL',
    'NANDYAL',
    'NTR',
    'PALNADU',
    'PARVATHIPURAM MANYAM',
    'PRAKASAM',
    'SRI POTTI SRIRAMULU NELLORE',
    'SRI SATHYA SAI',
    'SRIKAKULAM',
    'TIRUPATI',
    'VISAKHAPATNAM',
    'VIZIANAGARAM',
    'WEST GODAVARI',
    'YSR KADAPA'
  ];

  for (const district of districts) {
    const checkQuery = 'SELECT id FROM mgnrega_data WHERE state = $1 AND district = $2 AND year = $3';
    const existing = await pool.query(checkQuery, ['ANDHRA PRADESH', district, '2024-2025']);

    if (existing.rows.length === 0) {
      const insertQuery = `
        INSERT INTO mgnrega_data (state, district, month, year, employment_generated, households_covered, total_expenditure, works_completed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await pool.query(insertQuery, [
        'ANDHRA PRADESH',
        district,
        null, // Annual data
        '2024-2025',
        Math.floor(Math.random() * 500000) + 100000,
        Math.floor(Math.random() * 300000) + 50000,
        Math.floor(Math.random() * 50000) + 10000,
        Math.floor(Math.random() * 20000) + 1000
      ]);
      console.log(`Inserted sample data for ${district}`);
    } else {
      console.log(`Data already exists for ${district}`);
    }
  }

  console.log('Sample data insertion completed');
  await pool.end();
}

// Run the function
insertSampleData();
