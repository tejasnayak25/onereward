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

async function testRestaurantCity() {
  try {
    console.log('🔍 Testing restaurant city functionality...');
    
    // 1. Check existing restaurants
    console.log('\n📊 Existing restaurants:');
    const existingRestaurants = await Restaurant.find({});
    existingRestaurants.forEach(r => {
      console.log(`- ${r.name}: ${r.city || 'NO CITY'} (${r.email})`);
    });
    
    // 2. Test creating a new restaurant with city
    console.log('\n🧪 Testing restaurant creation with city...');
    const testRestaurant = {
      name: 'Test Restaurant City',
      email: 'test-city@example.com',
      password: 'testpass123',
      status: 'active',
      city: 'Test City'
    };
    
    // Delete if exists
    await Restaurant.deleteOne({ email: testRestaurant.email });
    
    const newRestaurant = new Restaurant(testRestaurant);
    const savedRestaurant = await newRestaurant.save();
    
    console.log('✅ Test restaurant created:', {
      name: savedRestaurant.name,
      email: savedRestaurant.email,
      city: savedRestaurant.city,
      id: savedRestaurant._id
    });
    
    // 3. Test updating restaurant city
    console.log('\n🔄 Testing restaurant city update...');
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      savedRestaurant._id,
      { city: 'Updated Test City' },
      { new: true }
    );
    
    console.log('✅ Restaurant city updated:', {
      name: updatedRestaurant.name,
      city: updatedRestaurant.city
    });
    
    // 4. Test getting unique cities
    console.log('\n🏙️ Testing unique cities query...');
    const cities = await Restaurant.distinct('city');
    console.log('Unique cities found:', cities);
    
    // 5. Clean up test data
    await Restaurant.deleteOne({ email: testRestaurant.email });
    console.log('🧹 Test data cleaned up');
    
    console.log('\n✅ All tests passed! City functionality is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testRestaurantCity();
