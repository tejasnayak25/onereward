const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loyalty-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Restaurant schema (same as in server.js)
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    password: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    join_date: {
      type: Date,
      default: Date.now,
    },
    cardImage: {
      type: String,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Sample cities to assign randomly
const sampleCities = [
  'New York',
  'Los Angeles', 
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
  'Austin',
  'Jacksonville',
  'Fort Worth',
  'Columbus',
  'Charlotte',
  'San Francisco',
  'Indianapolis',
  'Seattle',
  'Denver',
  'Boston'
];

async function updateRestaurantsWithCities() {
  try {
    console.log('Connecting to database...');
    
    // Get all restaurants without city data
    const restaurants = await Restaurant.find({ 
      $or: [
        { city: { $exists: false } },
        { city: null },
        { city: '' }
      ]
    });
    
    console.log(`Found ${restaurants.length} restaurants without city data`);
    
    if (restaurants.length === 0) {
      console.log('All restaurants already have city data!');
      process.exit(0);
    }
    
    // Update each restaurant with a random city
    for (let restaurant of restaurants) {
      const randomCity = sampleCities[Math.floor(Math.random() * sampleCities.length)];
      
      await Restaurant.findByIdAndUpdate(restaurant._id, {
        city: randomCity
      });
      
      console.log(`Updated ${restaurant.name} with city: ${randomCity}`);
    }
    
    console.log('✅ All restaurants updated with city data!');
    
    // Verify the update
    const updatedRestaurants = await Restaurant.find({});
    console.log('\n📊 Updated restaurants:');
    updatedRestaurants.forEach(r => {
      console.log(`- ${r.name}: ${r.city}`);
    });
    
    // Show unique cities
    const uniqueCities = [...new Set(updatedRestaurants.map(r => r.city))];
    console.log(`\n🏙️ Unique cities (${uniqueCities.length}):`, uniqueCities);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating restaurants:', error);
    process.exit(1);
  }
}

// Run the update
updateRestaurantsWithCities();
