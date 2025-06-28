const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loyalty-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixRestaurantSchema() {
  try {
    console.log('🔧 Fixing restaurant schema...');
    
    // Get the raw collection (bypassing mongoose schema)
    const db = mongoose.connection.db;
    const collection = db.collection('restaurants');
    
    // Check current documents
    console.log('\n📊 Current restaurant documents:');
    const restaurants = await collection.find({}).toArray();
    restaurants.forEach(r => {
      console.log(`- ${r.name}: city = ${r.city || 'MISSING'}`);
    });
    
    // Add city field to all documents that don't have it
    console.log('\n🔧 Adding city field to documents without it...');
    const result = await collection.updateMany(
      { city: { $exists: false } },
      { $set: { city: '' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} documents`);
    
    // Verify the fix
    console.log('\n✅ Verification - Documents after fix:');
    const updatedRestaurants = await collection.find({}).toArray();
    updatedRestaurants.forEach(r => {
      console.log(`- ${r.name}: city = ${r.city || 'EMPTY'}`);
    });
    
    // Test updating a specific restaurant
    console.log('\n🧪 Testing city update...');
    const testUpdate = await collection.updateOne(
      { name: 'choice' },
      { $set: { city: 'Test Hamilton' } }
    );
    
    if (testUpdate.modifiedCount > 0) {
      console.log('✅ Test update successful');
      
      // Verify the test update
      const testRestaurant = await collection.findOne({ name: 'choice' });
      console.log('🔍 Test restaurant after update:', {
        name: testRestaurant.name,
        city: testRestaurant.city
      });
    } else {
      console.log('❌ Test update failed');
    }
    
    console.log('\n✅ Schema fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixRestaurantSchema();
