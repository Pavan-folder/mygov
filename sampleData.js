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
  .then(() => console.log('MongoDB connected for sample data insertion'))
  .catch(err => console.log(err));

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
    const existingData = await Mgnrega.findOne({
      state: 'ANDHRA PRADESH',
      district: district,
      year: '2024-2025'
    });

    if (!existingData) {
      const sampleData = new Mgnrega({
        state: 'ANDHRA PRADESH',
        district: district,
        month: null, // Annual data
        year: '2024-2025',
        data: {
          employment_generated: Math.floor(Math.random() * 500000) + 100000,
          households_covered: Math.floor(Math.random() * 300000) + 50000,
          total_expenditure: Math.floor(Math.random() * 50000) + 10000,
          works_completed: Math.floor(Math.random() * 20000) + 1000
        }
      });

      await sampleData.save();
      console.log(`Inserted sample data for ${district}`);
    } else {
      console.log(`Data already exists for ${district}`);
    }
  }

  console.log('Sample data insertion completed');
  mongoose.connection.close();
}

// Run the function
insertSampleData();
