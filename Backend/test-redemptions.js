const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loyalty-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema (same as in server.js)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['customer', 'restaurant', 'admin'], default: 'customer' },
  availablePoints: [{
    restaurantName: String,
    points: { type: Number, default: 0 }
  }],
  redeemPoints: [{
    restaurantName: String,
    points: Number,
    description: String,
    timestamp: { type: Date, default: Date.now },
    redeemedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function testRedemptions() {
  try {
    console.log('🧪 Testing redemption data...');
    
    // 1. Check existing users
    const allUsers = await User.find({});
    console.log(`📊 Found ${allUsers.length} users in database`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      process.exit(1);
    }
    
    // 2. Check existing redemptions
    const usersWithRedemptions = await User.find({
      redeemPoints: { $exists: true, $ne: [] }
    });
    console.log(`📊 Users with existing redemptions: ${usersWithRedemptions.length}`);
    
    // 3. Show sample users
    console.log('\n👥 Sample users:');
    allUsers.slice(0, 5).forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      if (user.availablePoints && user.availablePoints.length > 0) {
        user.availablePoints.forEach(ap => {
          console.log(`  Available: ${ap.points} points at ${ap.restaurantName}`);
        });
      }
      if (user.redeemPoints && user.redeemPoints.length > 0) {
        user.redeemPoints.forEach(rp => {
          console.log(`  Redeemed: ${rp.points} points at ${rp.restaurantName} - ${rp.description}`);
        });
      }
    });
    
    // 4. Add sample redemptions if none exist
    if (usersWithRedemptions.length === 0) {
      console.log('\n🔧 Adding sample redemption data...');
      
      const sampleRedemptions = [
        { userIndex: 0, restaurantName: 'choice', points: 100, description: 'Free coffee' },
        { userIndex: 1, restaurantName: 'choice', points: 200, description: 'Free meal' },
        { userIndex: 0, restaurantName: 'choice', points: 50, description: 'Discount applied' }
      ];
      
      for (let redemption of sampleRedemptions) {
        if (allUsers[redemption.userIndex]) {
          const user = allUsers[redemption.userIndex];
          
          if (!user.redeemPoints) {
            user.redeemPoints = [];
          }
          
          user.redeemPoints.push({
            restaurantName: redemption.restaurantName,
            points: redemption.points,
            description: redemption.description,
            timestamp: new Date(),
            redeemedAt: new Date()
          });
          
          await user.save();
          console.log(`✅ Added redemption for ${user.name}: ${redemption.points} points at ${redemption.restaurantName}`);
        }
      }
    }
    
    // 5. Verify final state
    console.log('\n📊 Final verification:');
    const finalUsers = await User.find({});
    let totalRedemptions = 0;
    let totalRedemptionPoints = 0;
    
    finalUsers.forEach(user => {
      if (user.redeemPoints && user.redeemPoints.length > 0) {
        const userRedemptions = user.redeemPoints.filter(rp => rp.restaurantName === 'choice');
        const userTotal = userRedemptions.reduce((sum, rp) => sum + rp.points, 0);
        totalRedemptions += userRedemptions.length;
        totalRedemptionPoints += userTotal;
        
        if (userRedemptions.length > 0) {
          console.log(`- ${user.name}: ${userRedemptions.length} redemptions, ${userTotal} points total`);
        }
      }
    });
    
    console.log(`\n🎯 Summary for restaurant 'choice':`);
    console.log(`   Total redemptions: ${totalRedemptions}`);
    console.log(`   Total redemption points: ${totalRedemptionPoints}`);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error testing redemptions:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testRedemptions();
