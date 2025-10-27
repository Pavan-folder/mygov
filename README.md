# MGNREGA Dashboard

A comprehensive dashboard for monitoring MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) performance data in Andhra Pradesh, India.

## Features

- **Real-time Data**: Fetches live data from the official data.gov.in API
- **Multi-language Support**: Available in English, Hindi, and Telugu
- **Interactive Charts**: Visual representation of employment, expenditure, and household data
- **District-wise Analysis**: Detailed breakdown by districts in Andhra Pradesh
- **Caching**: Redis-based caching for improved performance
- **Responsive Design**: Mobile-friendly interface
- **PWA Ready**: Progressive Web App capabilities

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Caching**: Redis
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Template Engine**: EJS
- **Internationalization**: i18n

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Redis server
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pavan-folder/mygov.git
   cd mygov
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/mgnrega
   REDIS_URL=redis://localhost:6379
   API_KEY=your_data_gov_in_api_key
   NODE_ENV=production
   PORT=3000
   ```

4. **Set up PostgreSQL database**

   Create a database named `mgnrega` and run the following SQL to create the table:

   ```sql
   CREATE TABLE mgnrega_data (
     id SERIAL PRIMARY KEY,
     state VARCHAR(255) NOT NULL,
     district VARCHAR(255) NOT NULL,
     month VARCHAR(50),
     year VARCHAR(20) NOT NULL,
     employment_generated INTEGER DEFAULT 0,
     households_covered INTEGER DEFAULT 0,
     total_expenditure DECIMAL(15,2) DEFAULT 0,
     works_completed INTEGER DEFAULT 0,
     UNIQUE(state, district, month, year)
   );

   CREATE INDEX idx_mgnrega_data_state_district ON mgnrega_data(state, district);
   CREATE INDEX idx_mgnrega_data_year ON mgnrega_data(year);
   ```

5. **Start Redis server**
   ```bash
   # On Linux/Mac
   redis-server

   # On Windows (if using Redis for Windows)
   redis-server.exe
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Deployment Options

### 1. Railway (Recommended)

Railway provides easy deployment with built-in PostgreSQL and Redis support.

1. **Connect your GitHub repository to Railway**
   - Go to [Railway.app](https://railway.app)
   - Sign up/Login with your GitHub account
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `mygov` repository

2. **Configure Environment Variables**
   In Railway dashboard:
   - Go to your project → Variables
   - Add the following variables:
     ```
     API_KEY=your_data_gov_in_api_key
     NODE_ENV=production
     ```

3. **Database Setup**
   Railway automatically provisions PostgreSQL and Redis. The connection URLs will be available in the Variables section.

4. **Deploy**
   Railway will automatically deploy when you push to the main branch.

### 2. Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and create app**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add PostgreSQL and Redis addons**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   heroku addons:create heroku-redis:hobby-dev
   ```

4. **Set environment variables**
   ```bash
   heroku config:set API_KEY=your_data_gov_in_api_key
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### 3. DigitalOcean App Platform

1. **Create a new app** in DigitalOcean App Platform
2. **Connect your GitHub repository**
3. **Configure environment variables** (API_KEY, NODE_ENV)
4. **Add PostgreSQL and Redis databases** through the platform
5. **Deploy**

### 4. AWS/Vercel/Netlify + External DB

For platforms that don't provide managed databases:
- Use AWS RDS for PostgreSQL
- Use AWS ElastiCache for Redis
- Deploy the app on Vercel/Netlify/AWS Elastic Beanstalk

## API Endpoints

- `GET /` - Main dashboard
- `GET /api/states` - Get available states
- `GET /api/districts/:state` - Get districts for a state
- `GET /api/data/:state/:district` - Get MGNREGA data for state/district
- `POST /set-locale/:locale` - Change language (en/hi/te)

## Data Source

The application fetches data from the official [data.gov.in](https://data.gov.in) API for MGNREGA statistics.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
