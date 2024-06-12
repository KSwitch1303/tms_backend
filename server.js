const express = require('express');
const cors = require('cors');
const { RuleEngine } = require('node-rules');

// Enable CORS
const app = express();
app.use(cors());

// Simulated data
const trafficData = [
  { trafficSpeed: 15, trafficVolume: 120, location: 'Main St' },
  { trafficSpeed: 35, trafficVolume: 80, location: '2nd Ave' },
  { trafficSpeed: 10, trafficVolume: 150, location: '3rd Blvd' },
  { trafficSpeed: 25, trafficVolume: 90, location: '4th St' },
  { trafficSpeed: 20, trafficVolume: 110, location: '5th Ave' },
  { trafficSpeed: 30, trafficVolume: 70, location: '6th Rd' }
];

const accidentData = [
  { accidentSeverity: 3, location: 'Main St' },
  { accidentSeverity: 1, location: '2nd Ave' },
  { accidentSeverity: 4, location: '4th St' },
  { accidentSeverity: 2, location: '5th Ave' },
  { accidentSeverity: 3, location: '6th Rd' }
];

const roadConditionData = [
  { roadCondition: 'construction', location: 'Main St' },
  { roadCondition: 'clear', location: '2nd Ave' },
  { roadCondition: 'construction', location: '5th Ave' },
  { roadCondition: 'clear', location: '6th Rd' }
];

// Define rules
const rules = [
  {
    condition: function(R) {
      R.when(this.trafficSpeed < 20 && this.trafficVolume > 100);
    },
    consequence: function(R) {
      this.result = 'High congestion detected';
      this.action = 'Optimize traffic signals';
      R.stop();
    }
  },
  {
    condition: function(R) {
      R.when(this.accidentSeverity > 2);
    },
    consequence: function(R) {
      this.result = 'Severe accident reported';
      this.action = 'Recommend alternative routes';
      R.stop();
    }
  },
  {
    condition: function(R) {
      R.when(this.roadCondition === 'construction');
    },
    consequence: function(R) {
      this.result = 'Road construction detected';
      this.action = 'Suggest infrastructure improvements';
      R.stop();
    }
  }
];

// Create rule engine
const R = new RuleEngine(rules);

// Endpoint to get recommendations for a specific location
app.get('/recommendations/:location', async (req, res) => {
  const location = req.params.location;
  const recommendations = [];

  console.log(`Fetching recommendations for location: ${location}`);

  const relevantTrafficData = trafficData.filter(data => data.location === location);
  const relevantAccidentData = accidentData.filter(data => data.location === location);
  const relevantRoadConditionData = roadConditionData.filter(data => data.location === location);

  console.log('Relevant Traffic Data:', relevantTrafficData);
  console.log('Relevant Accident Data:', relevantAccidentData);
  console.log('Relevant Road Condition Data:', relevantRoadConditionData);

  // Analyze traffic data
  const trafficPromises = relevantTrafficData.map(data => {
    return new Promise((resolve, reject) => {
      R.execute(data, result => {
        if (result.result) {
          recommendations.push(result);
        }
        resolve();
      });
    });
  });

  // Analyze accident data
  const accidentPromises = relevantAccidentData.map(data => {
    return new Promise((resolve, reject) => {
      R.execute(data, result => {
        if (result.result) {
          recommendations.push(result);
        }
        resolve();
      });
    });
  });

  // Analyze road condition data
  const roadConditionPromises = relevantRoadConditionData.map(data => {
    return new Promise((resolve, reject) => {
      R.execute(data, result => {
        if (result.result) {
          recommendations.push(result);
        }
        resolve();
      });
    });
  });

  try {
    await Promise.all([...trafficPromises, ...accidentPromises, ...roadConditionPromises]);
    console.log('Recommendations:', recommendations);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = 5019;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
