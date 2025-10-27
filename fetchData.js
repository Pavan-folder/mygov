const axios = require('axios');
const mongoose = require('mongoose');

// Define MGNREGA data schema
const MgnregaSchema = new mongoose.Schema({
  state: String,
  district: String,
  month: String,
  year: String,
  data: Object
});

const Mgnrega = mongoose.model('Mgnrega', MgnregaSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mgnrega')
  .then(() => console.log('MongoDB connected for data fetching'))
  .catch(err => console.log(err));

async function fetchAndStoreData(state = 'ANDHRA PRADESH', year = '2024-2025') {
  const apiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const baseUrl = 'https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
  const apiUrl = `${baseUrl}?api-key=${apiKey}&format=json&offset=0&limit=100&filters[state_name]=${encodeURIComponent(state)}&filters[fin_year]=${encodeURIComponent(year)}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.records && data.records.length > 0) {
      // Process and store data
      for (const record of data.records) {
        // Check if data already exists
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
              employment_generated: parseInt(record.Total_Individuals_Worked) || 0,
              households_covered: parseInt(record.Total_Households_Worked) || 0,
              total_expenditure: parseFloat(record.Total_Exp) || 0,
              works_completed: parseInt(record.Number_of_Completed_Works) || 0
            }
          });

          await mgnregaData.save();
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
  }
}

// Run the function
fetchAndStoreData();
