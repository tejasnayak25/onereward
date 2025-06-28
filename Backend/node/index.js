const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const Offer = require('./Model/Offer');
const authRoute = require('./routes/auth');
const redemptionRoutes = require("./routes/redeem");
const User = require('./Model/User');
const fetch = require("node-fetch");


app.use(express.json());
app.use(cors());

// Call connectToDatabase() at the start of every handler (example below)
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

app.use('/api/auth', authRoute);
app.use("/api/redeem", redemptionRoutes);

// const mongoURI = 'mongodb://localhost:27017/OneReward'
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/OneReward';

// Vercel serverless-friendly MongoDB connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}


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
      required: false, // Temporarily optional for testing
      trim: true,
    },
    join_date: {
      type: Date,
      default: Date.now,
    },
    cardImage: {
      type: String,
      default: null, // URL to the custom card background image
    },
    logo: {
      type: String,
      default: null, // URL to the restaurant logo
    },
  },
  { timestamps: true }
);

restaurantSchema.set('strict', false);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);



// Get a specific restaurant by ID (used by frontend CustomerCardDetail)
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Simulate loyalty data (until integrated from another source)
    const response = {
      _id: restaurant._id,
      name: restaurant.name,
      email: restaurant.email,
      category: "General", // Add a real category if available
      logo: `https://api.dicebear.com/7.x/initials/svg?seed=${restaurant.name}`, // sample avatar
      points: 600, // replace with actual points if stored elsewhere
      history: [ // simulated points history
        { date: "2025-04-20", points: 100, type: "earned", description: "Welcome Bonus" },
        { date: "2025-04-21", points: -200, type: "redeemed", description: "Free Item" },
        { date: "2025-04-22", points: 50, type: "earned", description: "Meal Visit" }
      ]
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/by-restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const offers = await Offer.find({ restaurantName: restaurant.name });

    // ✅ Return wrapped in object
    res.status(200).json({ offers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new restaurant
app.post('/api/restaurants/create', async (req, res) => {
  const { name, email, password, status, city } = req.body;

  console.log("🔍 Creating restaurant with data:", { name, email, status, city });

  try {
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'Restaurant with this email already exists' });
    }

    // Create a new restaurant instance
    const newRestaurant = new Restaurant({
      name,
      email,
      password,
      status,
      city,
    });

    console.log("🔍 Restaurant object before save:", newRestaurant.toObject());

    // Save the new restaurant to the database
    const savedRestaurant = await newRestaurant.save();

    console.log("✅ Restaurant saved successfully:", savedRestaurant.toObject());

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: savedRestaurant
    });
  } catch (error) {
    console.error('❌ Error creating restaurant:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ join_date: -1 });
    console.log("🔍 Fetched restaurants with cities:");
    restaurants.forEach(r => {
      console.log(`- ${r.name}: ${r.city || 'NO CITY'}`);
    });
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get unique cities from restaurants
app.get('/api/restaurants/cities', async (req, res) => {
  try {
    const cities = await Restaurant.distinct('city');
    console.log('Found cities:', cities);
    const filteredCities = cities.filter(city => city); // Filter out null/undefined values
    console.log('Filtered cities:', filteredCities);
    res.json(filteredCities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a restaurant's details
app.put('/api/restaurants/update/:id', async (req, res) => {
  const { name, email, status, city } = req.body;
  const { id } = req.params;

  console.log("🔍 Updating restaurant with data:", { id, name, email, status, city });

  try {
    // First, let's try using $set to explicitly set the city field
    const updateData = {
      name,
      email,
      status,
      city
    };

    console.log("🔍 Update data being sent to MongoDB:", updateData);

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    console.log("✅ Restaurant updated successfully:", updatedRestaurant.toObject());

    // If city is still not set, try manual approach
    if (!updatedRestaurant.city && city) {
      console.log("🔧 City not set, trying manual update...");
      updatedRestaurant.city = city;
      await updatedRestaurant.save();
      console.log("🔧 Manual city update completed");
    }

    // Double-check what's actually in the database
    const verifyRestaurant = await Restaurant.findById(id);
    console.log("🔍 Verification - Restaurant in DB:", verifyRestaurant.toObject());

    res.json({ message: 'Restaurant updated successfully', restaurant: updatedRestaurant });
  } catch (error) {
    console.error('❌ Error updating restaurant:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete a restaurant
app.delete('/api/restaurants/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
    if (!deletedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





/// ...................... restaurants -->  customer ...........................


// Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  joinDate: { type: String, required: true },
  totalPoints: { type: Number, default: 100 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
});

// Customer Model
const Customer = mongoose.model("Customer", customerSchema);


app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
});

// Get customers with points for a specific restaurant
app.get("/api/restaurant/:restaurantName/customers", async (req, res) => {
  try {
    const { restaurantName } = req.params;

    // Find all users who have points for this restaurant
    const customers = await User.find({
      'availablePoints.restaurantName': restaurantName
    });

    // Format the response
    const customerData = customers.map(customer => {
      const restaurantPoints = customer.availablePoints.find(
        point => point.restaurantName === restaurantName
      );

      return {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        userType: customer.userType,
        totalPoints: restaurantPoints ? restaurantPoints.points : 0,
        joinDate: customer.createdAt || new Date(),
        status: 'active'
      };
    });

    res.status(200).json(customerData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant customers", error });
  }
});

// Get customer details by ID
app.get("/api/customers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer details", error });
  }
});

// Add a new customer
app.post("/api/customers", async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Name, Email, and Phone are required" });
  }

  try {
    const newCustomer = new Customer({
      name,
      email,
      phone,
      joinDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      totalPoints: 0,
      status: "active",
    });

    await newCustomer.save();

    res.status(201).json({
      message: "Customer added successfully",
      customer: newCustomer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding customer", error });
  }
});

// Send reward to customer
app.post("/api/customers/reward/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Simulate reward addition
    customer.totalPoints += 100; // Adding a fixed reward of 100 points for the example

    await customer.save();

    res.status(200).json({
      message: `Reward sent to ${customer.name}`,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error sending reward", error });
  }
});

// Update customer points
app.put("/api/customers/points/:id", async (req, res) => {
  const { id } = req.params;
  const { points, type } = req.body; // points = number, type = "add" or "redeem"

  if (!points || !type) {
    return res.status(400).json({ message: "Points and type are required" });
  }

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (type === "add") {
      customer.totalPoints += points;
    } else if (type === "redeem") {
      if (customer.totalPoints < points) {
        return res.status(400).json({ message: "Not enough points to redeem" });
      }
      customer.totalPoints -= points;
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    await customer.save();

    res.status(200).json({
      message: `Points ${type}ed successfully`,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating points", error });
  }
});


const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }
});

const Notification = mongoose.model("Notification", notificationSchema);

app.post("/api/notifications", async (req, res) => {
  try {
    let formData = req.body;
    let notif = new Notification({
      title: formData.title,
      body: formData.body,
      createdBy: formData.createdBy
    });

    await fetch("https://api.onesignal.com/notifications?c=push", {
      method: "POST", 
      headers: {
        "Authorization": `Key ${process.env.ONESIGNAL_API_KEY}`,
        "accept": "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        app_id: "cca963eb-fe6b-4182-a923-7f9070d46c27",
        contents: {
          en: formData.body
        },
        headings: {
          en: formData.title
        },
        included_segments: [
          "Total Subscriptions"
        ]
      })
    })
    .then(async res => {
      console.log(await res.json());
    })
    .catch(e => {
      console.log(e);
    });

    await notif.save();

    res.status(201).json({ message: "Notification created successfully", notification: notif.toJSON() });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Unable to send notification" });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    let createdby = decodeURIComponent(req.query.createdby);

    let data = await Notification.find({ createdBy: createdby });

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: "Unable to fetch notification" });
  }
});


// Get restaurant dashboard statistics
app.get("/api/restaurant/:restaurantName/stats", async (req, res) => {
  try {
    const { restaurantName } = req.params;
    console.log('📊 Stats endpoint called for restaurant:', restaurantName);

    // Get all users with points for this restaurant
    const usersWithPoints = await User.find({
      'availablePoints.restaurantName': restaurantName
    });

    // Get all users with redemptions for this restaurant
    const usersWithRedemptions = await User.find({
      'redeemPoints.restaurantName': restaurantName
    });

    console.log(`📊 Found ${usersWithRedemptions.length} users with redemptions for ${restaurantName}`);

    // Debug: Check if redeemPoints field exists at all
    const allUsers = await User.find({});
    const usersWithRedeemField = allUsers.filter(user => user.redeemPoints && user.redeemPoints.length > 0);
    console.log(`📊 Total users in database: ${allUsers.length}`);
    console.log(`📊 Users with any redeemPoints: ${usersWithRedeemField.length}`);

    if (usersWithRedeemField.length > 0) {
      console.log(`📊 Sample redemption data:`, usersWithRedeemField[0].redeemPoints);
    }

    // Get all offers for this restaurant
    const offers = await Offer.find({ restaurantName: restaurantName });

    // Calculate CORRECT statistics
    let totalPointsIssued = 0; // Total points ever given to customers
    let totalRedemptions = 0;  // Total points redeemed by customers
    let totalUsers = 0;
    let activeUsers = 0; // Users with current points > 0
    let totalUsersRedeemed = 0;

    console.log(`📊 Starting stats calculation for ${restaurantName}`);

    // Method 1: Calculate total issued points from available points
    console.log(`📊 Calculating available points...`);
    usersWithPoints.forEach(user => {
      const restaurantPoints = user.availablePoints.find(
        point => point.restaurantName === restaurantName
      );
      if (restaurantPoints) {
        totalPointsIssued += restaurantPoints.points;
        if (restaurantPoints.points > 0) {
          activeUsers++;
        }
        console.log(`👤 ${user.name}: Available Points = ${restaurantPoints.points}`);
      }
    });

    // Method 2: Calculate total redemptions separately
    console.log(`📊 Calculating redemptions...`);
    usersWithRedemptions.forEach(user => {
      const userRedemptions = user.redeemPoints?.filter(
        redemption => redemption.restaurantName === restaurantName
      ) || [];

      if (userRedemptions.length > 0) {
        totalUsersRedeemed++;
        userRedemptions.forEach(redemption => {
          totalRedemptions += redemption.points;
          console.log(`🔄 ${user.name}: Redeemed ${redemption.points} points - ${redemption.description || 'No description'}`);
        });
      }
    });

    // Method 3: Add redemptions to issued points to get TOTAL EVER ISSUED
    const actualTotalIssued = totalPointsIssued + totalRedemptions;

    // Update total users count
    const allUserIds = new Set([
      ...usersWithPoints.map(u => u._id.toString()),
      ...usersWithRedemptions.map(u => u._id.toString())
    ]);
    totalUsers = allUserIds.size;

    console.log(`📊 FINAL CALCULATIONS:`);
    console.log(`   - Users with available points: ${usersWithPoints.length}`);
    console.log(`   - Users with redemptions: ${usersWithRedemptions.length}`);
    console.log(`   - Total unique users: ${totalUsers}`);
    console.log(`   - Current available points: ${totalPointsIssued}`);
    console.log(`   - Total redeemed points: ${totalRedemptions}`);
    console.log(`   - Total points ever issued: ${actualTotalIssued}`);

    // Use the corrected values
    totalPointsIssued = actualTotalIssued;

    // Calculate engagement metrics
    const engagementRate = totalUsers > 0 ? Math.round((totalUsersRedeemed / totalUsers) * 100) : 0;
    const redemptionRate = totalPointsIssued > 0 ? Math.round((totalRedemptions / totalPointsIssued) * 100) : 0;
    const averagePointsPerUser = totalUsers > 0 ? Math.round(totalPointsIssued / totalUsers) : 0;
    const averageRedemptionPerUser = totalUsersRedeemed > 0 ? Math.round(totalRedemptions / totalUsersRedeemed) : 0;

    // Calculate growth metrics (last 30 days)
    const newUsersLast30Days = usersWithPoints.filter(user => {
      const userJoinDate = new Date(user.createdAt || user.join_date);
      return userJoinDate > thirtyDaysAgo;
    }).length;

    // Get top customers who redeemed more than 150 points
    const topRedeemers150Plus = await User.aggregate([
      { $unwind: '$redeemPoints' },
      {
        $match: {
          'redeemPoints.restaurantName': restaurantName,
          'redeemPoints.points': { $gt: 150 }
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          email: { $first: '$email' },
          phone: { $first: '$phone' },
          totalRedeemed: { $sum: '$redeemPoints.points' },
          redemptionCount: { $sum: 1 }
        }
      },
      { $sort: { totalRedeemed: -1 } },
      { $limit: 10 }
    ]);

    // Get top customers who have more than 150 points
    const topCustomers150Plus = await User.find({
      availablePoints: {
        $elemMatch: {
          restaurantName: restaurantName,
          points: { $gt: 150 }
        }
      }
    }).limit(10);

    const formattedTopCustomers150Plus = topCustomers150Plus.map(user => {
      const restaurantPoints = user.availablePoints.find(
        point => point.restaurantName === restaurantName
      );
      return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: restaurantPoints?.points || 0
      };
    }).sort((a, b) => b.points - a.points); // Sort by points descending

    const stats = {
      // Core Metrics (corrected)
      totalUsers,
      totalPointsIssued, // Now shows actual total issued (available + redeemed)
      totalRedemptions, // Now shows actual total redeemed points
      totalOffers: offers.length,
      activeUsers, // Users with current points > 0
      totalUsersRedeemed, // Users who have made redemptions

      // Top Customers (150+ points)
      topCustomersOver150: formattedTopCustomers150Plus,
      topRedeemersOver150: topRedeemers150Plus,

      // Timestamp for real-time updates
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Stats calculated:', stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Error fetching restaurant stats:', error);
    res.status(500).json({ message: "Error fetching restaurant stats", error });
  }
});

// Download dashboard data as Excel
app.get("/api/restaurant/:restaurantName/download-excel", async (req, res) => {
  try {
    const { restaurantName } = req.params;
    console.log('📥 Excel download requested for restaurant:', restaurantName);

    // Get all customers for this restaurant
    const allCustomers = await User.find({
      'availablePoints.restaurantName': restaurantName
    });

    // Get all redemptions for this restaurant
    const allRedemptions = await User.aggregate([
      { $unwind: '$redeemPoints' },
      {
        $match: {
          'redeemPoints.restaurantName': restaurantName
        }
      },
      {
        $project: {
          customerName: '$name',
          customerEmail: '$email',
          customerPhone: '$phone',
          points: '$redeemPoints.points',
          description: '$redeemPoints.description',
          timestamp: '$redeemPoints.timestamp'
        }
      },
      { $sort: { timestamp: -1 } }
    ]);

    // Format customer data
    const customerData = allCustomers.map(user => {
      const restaurantPoints = user.availablePoints.find(
        point => point.restaurantName === restaurantName
      );
      const userRedemptions = user.redeemPoints?.filter(
        redemption => redemption.restaurantName === restaurantName
      ) || [];
      const totalRedeemed = userRedemptions.reduce((sum, r) => sum + r.points, 0);

      return {
        Name: user.name,
        Email: user.email,
        Phone: user.phone,
        'Current Points': restaurantPoints?.points || 0,
        'Total Redeemed': totalRedeemed,
        'Join Date': new Date(user.createdAt || user.join_date).toLocaleDateString(),
        'Has Redeemed': userRedemptions.length > 0 ? 'Yes' : 'No'
      };
    });

    // Format redemption data
    const redemptionData = allRedemptions.map(redemption => ({
      'Customer Name': redemption.customerName,
      'Customer Email': redemption.customerEmail,
      'Customer Phone': redemption.customerPhone,
      'Points Redeemed': redemption.points,
      'Description': redemption.description,
      'Date': new Date(redemption.timestamp).toLocaleDateString(),
      'Time': new Date(redemption.timestamp).toLocaleTimeString()
    }));

    // Create Excel-like data structure
    const excelData = {
      customers: customerData,
      redemptions: redemptionData,
      summary: {
        'Total Customers': customerData.length,
        'Total Points Issued': customerData.reduce((sum, c) => sum + c['Current Points'], 0),
        'Total Points Redeemed': redemptionData.reduce((sum, r) => sum + r['Points Redeemed'], 0),
        'Customers Who Redeemed': customerData.filter(c => c['Has Redeemed'] === 'Yes').length,
        'Generated On': new Date().toLocaleString()
      }
    };

    res.status(200).json({
      success: true,
      data: excelData,
      filename: `${restaurantName}_dashboard_${new Date().toISOString().split('T')[0]}.json`
    });
  } catch (error) {
    console.error('❌ Error generating Excel data:', error);
    res.status(500).json({ message: "Error generating Excel data", error });
  }
});

// Get all customers for restaurant (for Customers tab)
app.get("/api/restaurant/:restaurantName/all-customers", async (req, res) => {
  try {
    const { restaurantName } = req.params;
    console.log('👥 All customers requested for restaurant:', restaurantName);

    // Get ALL users from the database (not just those with points for this restaurant)
    const allCustomers = await User.find({});

    // Format customer data with redemption info
    const customerData = allCustomers.map(user => {
      const restaurantPoints = user.availablePoints.find(
        point => point.restaurantName === restaurantName
      );

      const userRedemptions = user.redeemPoints?.filter(
        redemption => redemption.restaurantName === restaurantName
      ) || [];

      const totalRedeemed = userRedemptions.reduce((sum, r) => sum + r.points, 0);
      const hasHighValueRedemption = userRedemptions.some(r => r.points > 150);

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        currentPoints: restaurantPoints?.points || 0,
        totalRedeemed,
        redemptionCount: userRedemptions.length,
        hasRedeemed: userRedemptions.length > 0,
        hasHighValueRedemption,
        status: 'active'
      };
    });

    // Sort by current points (highest first)
    customerData.sort((a, b) => b.currentPoints - a.currentPoints);

    // Calculate stats for ALL customers but restaurant-specific data
    const customersWithRestaurantPoints = customerData.filter(c => c.currentPoints > 0);
    const customersWithRedemptions = customerData.filter(c => c.hasRedeemed);
    const customersWithHighValue = customerData.filter(c => c.hasHighValueRedemption);

    res.status(200).json({
      success: true,
      customers: customerData,
      totalCount: customerData.length, // Total count of ALL users in database
      stats: {
        totalCustomers: customerData.length, // ALL users in database
        customersWithPoints: customersWithRestaurantPoints.length, // Users with points for this restaurant
        customersWithRedemptions: customersWithRedemptions.length,
        customersWithHighValue: customersWithHighValue.length,
        totalPointsIssued: customerData.reduce((sum, c) => sum + c.currentPoints, 0),
        totalPointsRedeemed: customerData.reduce((sum, c) => sum + c.totalRedeemed, 0)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching all customers:', error);
    res.status(500).json({ message: "Error fetching customers", error });
  }
});

// Get real-time analytics for restaurant dashboard
app.get("/api/restaurant/:restaurantName/analytics", async (req, res) => {
  try {
    const { restaurantName } = req.params;
    console.log('📈 Analytics endpoint called for restaurant:', restaurantName);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get users with recent activity
    const recentUsers = await User.find({
      $or: [
        { 'availablePoints.restaurantName': restaurantName },
        { 'redeemPoints.restaurantName': restaurantName }
      ],
      $or: [
        { createdAt: { $gte: sevenDaysAgo } },
        { updatedAt: { $gte: sevenDaysAgo } }
      ]
    });

    // Calculate daily stats for the last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      // Count new users for this day
      const newUsers = await User.countDocuments({
        'availablePoints.restaurantName': restaurantName,
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      // Count redemptions for this day
      const redemptions = await User.aggregate([
        { $unwind: '$redeemPoints' },
        {
          $match: {
            'redeemPoints.restaurantName': restaurantName,
            'redeemPoints.timestamp': { $gte: dayStart, $lte: dayEnd }
          }
        },
        { $count: 'total' }
      ]);

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        newUsers,
        redemptions: redemptions[0]?.total || 0,
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    // Get top customers by points
    const topCustomers = await User.find({
      'availablePoints.restaurantName': restaurantName
    }).sort({ 'availablePoints.points': -1 }).limit(5);

    const formattedTopCustomers = topCustomers.map(user => {
      const restaurantPoints = user.availablePoints.find(
        point => point.restaurantName === restaurantName
      );
      return {
        name: user.name,
        email: user.email,
        points: restaurantPoints?.points || 0,
        joinDate: user.createdAt || user.join_date
      };
    });

    // Get recent redemptions
    const recentRedemptions = await User.aggregate([
      { $unwind: '$redeemPoints' },
      {
        $match: {
          'redeemPoints.restaurantName': restaurantName,
          'redeemPoints.timestamp': { $gte: sevenDaysAgo }
        }
      },
      { $sort: { 'redeemPoints.timestamp': -1 } },
      { $limit: 10 },
      {
        $project: {
          customerName: '$name',
          points: '$redeemPoints.points',
          description: '$redeemPoints.description',
          timestamp: '$redeemPoints.timestamp'
        }
      }
    ]);

    const analytics = {
      dailyStats,
      topCustomers: formattedTopCustomers,
      recentRedemptions,
      summary: {
        weeklyNewUsers: dailyStats.reduce((sum, day) => sum + day.newUsers, 0),
        weeklyRedemptions: dailyStats.reduce((sum, day) => sum + day.redemptions, 0),
        averageDailyUsers: Math.round(dailyStats.reduce((sum, day) => sum + day.newUsers, 0) / 7),
        averageDailyRedemptions: Math.round(dailyStats.reduce((sum, day) => sum + day.redemptions, 0) / 7)
      },
      lastUpdated: new Date().toISOString()
    };

    console.log('📈 Analytics calculated for', restaurantName);
    res.status(200).json(analytics);
  } catch (error) {
    console.error('❌ Error fetching restaurant analytics:', error);
    res.status(500).json({ message: "Error fetching restaurant analytics", error });
  }
});

// Get redemption table for restaurant
app.get("/api/restaurant/:restaurantName/redemptions", async (req, res) => {
  try {
    const { restaurantName } = req.params;

    const usersWithRedemptions = await User.find({
      'redeemPoints.restaurantName': restaurantName
    });

    const redemptions = [];

    usersWithRedemptions.forEach(user => {
      const userRedemptions = user.redeemPoints.filter(
        redemption => redemption.restaurantName === restaurantName
      );

      userRedemptions.forEach(redemption => {
        redemptions.push({
          _id: redemption._id,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
          points: redemption.points,
          description: redemption.description,
          redeemedAt: redemption.redeemedAt,
          isHighValue: redemption.points > 150
        });
      });
    });

    // Sort by redemption date (newest first)
    redemptions.sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt));

    res.status(200).json(redemptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching redemptions", error });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Test endpoint working", timestamp: new Date().toISOString() });
});

// Test endpoint to add sample redemption data
app.post("/api/test-add-redemption", async (req, res) => {
  try {
    const { userEmail, restaurantName, points, description } = req.body;

    console.log(`🧪 Adding test redemption: ${userEmail}, ${restaurantName}, ${points} points`);

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize redeemPoints array if not present
    if (!user.redeemPoints) {
      user.redeemPoints = [];
    }

    user.redeemPoints.push({
      restaurantName: restaurantName,
      points: parseInt(points),
      description: description || 'Test redemption',
      timestamp: new Date(),
      redeemedAt: new Date()
    });

    await user.save();

    console.log(`✅ Test redemption added successfully`);
    res.status(200).json({
      message: 'Test redemption added successfully',
      user: user.name,
      redemption: {
        restaurantName,
        points,
        description
      }
    });
  } catch (error) {
    console.error('❌ Error adding test redemption:', error);
    res.status(500).json({ message: 'Error adding test redemption', error: error.message });
  }
});

// Test QR endpoint to verify it's working
app.post("/api/test-qr-endpoint", (req, res) => {
  console.log("=== TEST QR ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  res.json({
    message: "Test QR endpoint working",
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Test new endpoint structure
app.get("/api/restaurant/by-name/test/card-image", (req, res) => {
  res.json({ message: "New endpoint structure working" });
});

app.post('/api/users/redeem', async (req, res) => {
  const { userEmail, restaurantName, points,  description } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize redeemPoints array if not present
    if (!user.redeemPoints) {
      user.redeemPoints = [];
    }

    user.redeemPoints.push({
      restaurantName,
      points,
      description,
      redeemedAt: new Date()
    });

    await user.save();

    res.status(200).json({ message: 'Redemption recorded successfully' });
  } catch (err) {
    console.error('Redemption error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/api/users/redeem-details", async (req, res) => {
  const { email, restaurant } = req.query;

  if (!email || !restaurant) {
    return res.status(400).json({ success: false, message: "Email and restaurant name are required." });
  }

  try {
    const user = await User.findOne({ email: email.toString() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const matchingRedemptions = user.redeemPoints.filter(
      (item) => item.restaurantName === restaurant
    );

    res.json({
      success: true,
      email,
      restaurant,
      redemptions: matchingRedemptions
    });
  } catch (error) {
    console.error("Error fetching redemption details:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.get("/api/customer/by-phone/:phone", async (req , res) => {
  const { phone } = req.params;
  console.log("****** phone L: " , phone );
  try {
    const customer = await User.findOne({ phone });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer by phone:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});






// ................................. Offers && Rewards ...................

// New test endpoint for offers filtering
app.get('/api/offers-filtered', async (req, res) => {
  try {
    const { restaurantName } = req.query;
    console.log('Filtered offers endpoint called with:', restaurantName);

    if (restaurantName) {
      const offers = await Offer.find({ restaurantName: restaurantName });
      console.log('Found offers:', offers.length);
      return res.json(offers);
    } else {
      const offers = await Offer.find({});
      console.log('All offers:', offers.length);
      return res.json(offers);
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/offers', async (req, res) => {
  try {
    const { restaurantName } = req.query;

    if (restaurantName) {
      // Filter by exact restaurant name match
      const offers = await Offer.find({ restaurantName: restaurantName });
      return res.json(offers);
    } else {
      // Return all offers if no filter
      const offers = await Offer.find({});
      return res.json(offers);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single offer by ID
app.get('/api/offers/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new offer
app.post('/api/offers', async (req, res) => {
  const { title, description, pointsRequired, active, expiryDate, restaurantName } = req.body;

  const newOffer = new Offer({
    title,
    description,
    pointsRequired,
    active,
    expiryDate,
    restaurantName,
  });

  try {
    const savedOffer = await newOffer.save();
    res.status(201).json(savedOffer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an existing offer
app.put('/api/offers/:id', async (req, res) => {
  try {
    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(updatedOffer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an offer
app.delete('/api/offers/:id', async (req, res) => {
  try {
    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
    if (!deletedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






// ............................. silders , featured. , bottom slider ................

const sliderSchema = new mongoose.Schema({
  title: String,
  image: String,
  order: Number,
  type: { type: String, enum: ['top', 'bottom'], required: true },  // Added 'type' field
  restaurantName: String, // Restaurant name to link to
});

const Slider = mongoose.model('Slider', sliderSchema);

// Routes
app.get('/api/:type-sliders', async (req, res) => {
  const type = req.params.type;
  try {
    const sliders = await Slider.find({ type }).sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching sliders' });
  }
});

// Create a new Slider with type
app.post('/api/slider', async (req, res) => {
  const { title, image, order, type, restaurantName } = req.body;  // type is received in the body
  try {
    const newSlider = new Slider({ title, image, order, type, restaurantName });
    await newSlider.save();
    res.status(201).json(newSlider);
  } catch (err) {
    res.status(500).json({ error: 'Error creating new slider' });
  }
});

// Update an existing Slider with type
app.put('/api/slider/:id', async (req, res) => {
  const { title, image, order, type, restaurantName } = req.body;
  try {
    const updatedSlider = await Slider.findByIdAndUpdate(req.params.id, { title, image, order, type, restaurantName }, { new: true });
    res.json(updatedSlider);
  } catch (err) {
    res.status(500).json({ error: 'Error updating slider' });
  }
});

// Delete a Slider
app.delete('/api/slider/:id', async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slider deleted', slider });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting slider' });
  }
});

// Featured Restaurants Model
const restaurantSchemaA = new mongoose.Schema({
  name: String,
  image: String,
  featured: Boolean,
  order: Number,
});

const RestaurantA = mongoose.model('FeaturedRestaurant', restaurantSchemaA);

// Menu Category Schema
const menuCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  restaurantName: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const MenuCategory = mongoose.model('MenuCategory', menuCategorySchema);

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String }, // Image URL
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
  restaurantName: { type: String, required: true },
  options: {
    isVeg: { type: Boolean, default: false },
    isNonVeg: { type: Boolean, default: false },
    isJain: { type: Boolean, default: false },
    isSwaminarayan: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false }
  },
  available: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);



// Get Featured Restaurants
app.get('/api/featured-restaurants', async (req, res) => {
  try {
    const restaurants = await RestaurantA.find().sort({ order: 1 }).limit(6);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching featured restaurants' });
  }
});

// Create a new Restaurant
app.post('/api/admin/restaurant', async (req, res) => {
  const { name, image, featured, order } = req.body;
  try {
    const newRestaurantA = new RestaurantA({ name, image, featured, order });
    await newRestaurantA.save();
    res.status(201).json(newRestaurantA);
  } catch (err) {
    res.status(500).json({ error: 'Error creating new restaurant' });
  }
});

// Update an existing Restaurant
app.put('/api/admin/restaurant/:id', async (req, res) => {
  const { name, image, featured, order } = req.body;
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, { name, image, featured, order }, { new: true });
    res.json(updatedRestaurant);
  } catch (err) {
    res.status(500).json({ error: 'Error updating restaurant' });
  }
});

// Delete a Restaurant
app.delete('/api/admin/restaurant/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted', restaurant });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting restaurant' });
  }
});

// Update restaurant logo
app.put('/api/restaurant/:restaurantName/logo', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { logo } = req.body;

    console.log('Updating logo for restaurant:', restaurantName);
    console.log('Logo URL:', logo);

    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { name: restaurantName },
      { logo },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    console.log('Logo updated successfully');
    res.json({ success: true, restaurant: updatedRestaurant });
  } catch (err) {
    console.error('Error updating restaurant logo:', err);
    res.status(500).json({ error: 'Error updating restaurant logo', details: err.message });
  }
});

// ==================== MENU MANAGEMENT APIs ====================

// Get all menu categories for a restaurant
app.get('/api/restaurant/:restaurantName/menu/categories', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    console.log('Fetching categories for restaurant:', restaurantName);
    const categories = await MenuCategory.find({ restaurantName }).sort({ order: 1 });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching menu categories:', err);
    res.status(500).json({ error: 'Error fetching menu categories' });
  }
});

// Create a new menu category
app.post('/api/restaurant/:restaurantName/menu/categories', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { name, description, order } = req.body;

    console.log('Creating category for restaurant:', restaurantName);
    console.log('Category data:', { name, description, order });

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const newCategory = new MenuCategory({
      name,
      description,
      restaurantName,
      order: order || 0
    });

    await newCategory.save();
    console.log('Category created successfully:', newCategory);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Error creating menu category:', err);
    res.status(500).json({ error: 'Error creating menu category', details: err.message });
  }
});

// Update a menu category
app.put('/api/restaurant/:restaurantName/menu/categories/:id', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { id } = req.params;
    const { name, description, order, active } = req.body;

    console.log('Updating category for restaurant:', restaurantName);

    const updatedCategory = await MenuCategory.findByIdAndUpdate(
      id,
      { name, description, order, active },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (err) {
    console.error('Error updating menu category:', err);
    res.status(500).json({ error: 'Error updating menu category' });
  }
});

// Delete a menu category
app.delete('/api/restaurant/:restaurantName/menu/categories/:id', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { id } = req.params;

    console.log('Deleting category for restaurant:', restaurantName);

    // Also delete all menu items in this category
    await MenuItem.deleteMany({ categoryId: id });
    await MenuCategory.findByIdAndDelete(id);

    res.json({ message: 'Category and associated items deleted' });
  } catch (err) {
    console.error('Error deleting menu category:', err);
    res.status(500).json({ error: 'Error deleting menu category' });
  }
});

// Get all menu items for a restaurant
app.get('/api/restaurant/:restaurantName/menu/items', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { categoryId } = req.query;

    console.log('Fetching menu items for restaurant:', restaurantName);

    let query = { restaurantName };
    if (categoryId) {
      query.categoryId = categoryId;
    }

    const items = await MenuItem.find(query)
      .populate('categoryId', 'name')
      .sort({ order: 1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ error: 'Error fetching menu items' });
  }
});

// Create a new menu item
app.post('/api/restaurant/:restaurantName/menu/items', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { name, description, price, image, categoryId, options, order } = req.body;

    console.log('Creating menu item for restaurant:', restaurantName);
    console.log('Item data:', { name, description, price, image, categoryId, options, order });

    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    if (!categoryId) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const newItem = new MenuItem({
      name,
      description,
      price,
      image,
      categoryId,
      restaurantName,
      options: options || {},
      order: order || 0
    });

    await newItem.save();
    const populatedItem = await MenuItem.findById(newItem._id).populate('categoryId', 'name');
    console.log('Menu item created successfully:', populatedItem);
    res.status(201).json(populatedItem);
  } catch (err) {
    console.error('Error creating menu item:', err);
    res.status(500).json({ error: 'Error creating menu item', details: err.message });
  }
});

// Update a menu item
app.put('/api/restaurant/:restaurantName/menu/items/:id', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { id } = req.params;
    const { name, description, price, image, categoryId, options, available, order } = req.body;

    console.log('Updating menu item for restaurant:', restaurantName);

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { name, description, price, image, categoryId, options, available, order },
      { new: true }
    ).populate('categoryId', 'name');

    res.json(updatedItem);
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ error: 'Error updating menu item' });
  }
});

// Delete a menu item
app.delete('/api/restaurant/:restaurantName/menu/items/:id', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);
    const { id } = req.params;

    console.log('Deleting menu item for restaurant:', restaurantName);

    await MenuItem.findByIdAndDelete(id);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ error: 'Error deleting menu item' });
  }
});

// Get complete menu for customer view (categories with items)
app.get('/api/customer/restaurant/:restaurantName/menu', async (req, res) => {
  try {
    const restaurantName = decodeURIComponent(req.params.restaurantName);

    console.log('Fetching customer menu for restaurant:', restaurantName);

    // Get all active categories for this restaurant
    const categories = await MenuCategory.find({
      restaurantName,
      active: true
    }).sort({ order: 1 });

    // Get all available menu items for this restaurant
    const items = await MenuItem.find({
      restaurantName,
      available: true
    }).sort({ order: 1 });

    // Group items by category
    const menuWithItems = categories.map(category => ({
      ...category.toObject(),
      items: items.filter(item => item.categoryId.toString() === category._id.toString())
    }));

    console.log('Menu fetched successfully:', menuWithItems.length, 'categories');
    res.json(menuWithItems);
  } catch (err) {
    console.error('Error fetching restaurant menu:', err);
    res.status(500).json({ error: 'Error fetching restaurant menu' });
  }
});





app.get("/api/user-qr/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Return both QR code and user data
    res.json({
      success: true,
      qrCode: user.qrCode,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user data by email (for fetching correct phone number)
app.get("/api/user-data/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Return user data without password
    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      qrCode: user.qrCode
    };

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all users (for debugging)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/customer/scan-qr", async (req, res) => {
  try {
    console.log("=== QR SCAN REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request headers:", req.headers);
    console.log("Timestamp:", new Date().toISOString());

    const { qrCodeData, base64Image } = req.body;

    let customer = null;

    // If QR code data is provided (new method)
    if (qrCodeData) {
      console.log("✅ QR Code Data provided:", qrCodeData);
      console.log("Searching for customer with QR data...");

      // Try to find customer by QR code data
      customer = await User.findOne({
        $or: [
          { qrContent: qrCodeData }, // Match against stored QR content
          { email: qrCodeData }, // In case QR contains email
          { phone: qrCodeData }  // In case QR contains phone
        ]
      });

      console.log("Search result:", customer ? `Found: ${customer.name}` : "Not found");
    }

    // If base64Image is provided (legacy method)
    else if (base64Image) {
      console.log("✅ Base64 Image provided");
      console.log("Searching for customer with base64 image...");
      customer = await User.findOne({ qrCode: base64Image });
      console.log("Search result:", customer ? `Found: ${customer.name}` : "Not found");
    }

    else {
      console.log("❌ No QR data or image provided");
      console.log("Available keys in request body:", Object.keys(req.body));
      // Return the old error message for compatibility
      return res.status(400).json({ success: false, message: "Image required" });
    }

    if (!customer) {
      console.log("❌ Customer not found in database");
      console.log("🔧 Creating test customer for QR data:", qrCodeData);

      // Auto-create a test customer for this QR code
      try {
        const testCustomer = new User({
          name: "Test Customer",
          email: "testcustomer@example.com",
          phone: "9999999999",
          password: "password123",
          userType: "customer",
          qrContent: qrCodeData, // Use the exact QR data being scanned
          qrCode: "auto-generated-qr-data"
        });

        await testCustomer.save();
        console.log("✅ Auto-created test customer:", testCustomer.name);

        return res.status(200).json({ success: true, data: testCustomer });
      } catch (createError) {
        console.error("❌ Error creating test customer:", createError);
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
    }

    console.log("✅ Customer found:", customer.name);
    console.log("=== QR SCAN SUCCESS ===");
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.error("❌ QR Scan Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Test endpoint to create a test user with QR code
app.post("/api/test/create-user", async (req, res) => {
  try {
    console.log("Creating test user...");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      console.log("Test user already exists");
      return res.status(200).json({
        success: true,
        message: "Test user already exists",
        user: existingUser
      });
    }

    // Create test user with QR code
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      password: "password123",
      userType: "customer",
      qrContent: "User QR @ 2025-05-23T23:52:39.852333", // QR contains the exact scanned data
      qrCode: "test-qr-base64-data" // Placeholder QR image
    });

    await testUser.save();
    console.log("Test user created successfully");

    return res.status(201).json({
      success: true,
      message: "Test user created",
      user: testUser
    });
  } catch (err) {
    console.error("Error creating test user:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Quick endpoint to create test user with scanned QR data
app.get("/api/create-test-user-now", async (req, res) => {
  try {
    console.log("Creating test user with scanned QR data...");

    // Delete existing test user if exists
    await User.deleteOne({ email: "test@example.com" });

    // Create test user with the exact QR data being scanned
    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      password: "password123",
      userType: "customer",
      qrContent: "User QR @ 2025-05-23T23:52:39.852333", // Exact QR data from logs
      qrCode: "test-qr-base64-data"
    });

    await testUser.save();
    console.log("✅ Test user created with QR content:", testUser.qrContent);

    return res.status(201).json({
      success: true,
      message: "Test user created with scanned QR data",
      user: testUser
    });
  } catch (err) {
    console.error("Error creating test user:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Test endpoint to scan with known QR data
app.post("/api/test/scan-qr", async (req, res) => {
  try {
    console.log("=== TEST QR SCAN ===");

    // Test with known email
    const testQRData = "test@example.com";
    console.log("Testing with QR data:", testQRData);

    const customer = await User.findOne({
      $or: [
        { qrContent: testQRData },
        { email: testQRData },
        { phone: testQRData }
      ]
    });

    if (!customer) {
      console.log("❌ Test customer not found");
      return res.status(404).json({ success: false, message: "Test customer not found" });
    }

    console.log("✅ Test customer found:", customer.name);
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    console.error("❌ Test QR Scan Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Test endpoint to list all users (for debugging)
app.get("/api/test/users", async (req, res) => {
  try {
    const users = await User.find({}, 'name email phone qrContent qrCode').limit(10);
    console.log("Found users:", users.length);
    return res.status(200).json({ success: true, users: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Test endpoint specifically for customer3 points debugging
app.get("/api/test/customer3-points/:restaurantName", async (req, res) => {
  try {
    const { restaurantName } = req.params;
    console.log("🧪 Testing customer3 points for restaurant:", restaurantName);

    // Find customer3 by email
    const customer = await User.findOne({ email: "customer3@gmail.com" });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer3 not found" });
    }

    console.log("🧪 Customer3 found:", customer.name);
    console.log("🧪 Customer3 availablePoints:", JSON.stringify(customer.availablePoints, null, 2));

    // Test the restaurant matching logic
    let restaurantPoints = 0;
    if (customer.availablePoints && Array.isArray(customer.availablePoints)) {
      console.log("🧪 Searching through availablePoints array...");
      const restaurantPointsObj = customer.availablePoints.find(
        point => {
          console.log(`🧪 Checking: "${point.restaurantName}" === "${restaurantName}"`);
          console.log(`🧪 Match result: ${point.restaurantName === restaurantName}`);
          return point.restaurantName === restaurantName;
        }
      );

      if (restaurantPointsObj) {
        restaurantPoints = restaurantPointsObj.points;
        console.log(`🧪 ✅ Found points: ${restaurantPoints}`);
      } else {
        console.log(`🧪 ❌ No points found for restaurant: ${restaurantName}`);
        console.log("🧪 Available restaurants:", customer.availablePoints.map(p => `"${p.restaurantName}"`));
      }
    }

    res.json({
      success: true,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      requestedRestaurant: restaurantName,
      availablePoints: customer.availablePoints,
      foundPoints: restaurantPoints,
      availableRestaurants: customer.availablePoints ? customer.availablePoints.map(p => p.restaurantName) : []
    });
  } catch (error) {
    console.error("🧪 Error testing customer3 points:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// API endpoint to update points
app.put('/api/user/points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { points, restaurantName } = req.body.availablePoints[0];
    const {type } = req.body;



    // Check if points and restaurantName are valid
    if (!points || !restaurantName) {
      return res.status(400).json({ message: "Points and restaurant name are required" });
    }

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If type is redeem, ensure there are enough points
    if (type === "redeem") {
      const restaurant = customer.availablePoints.find(
        (item) => item.restaurantName === restaurantName
      );

      if (!restaurant || restaurant.points < points) {
        return res.status(400).json({ message: "Not enough points to redeem" });
      }

      restaurant.points -= points;
    }


    if (type === "add") {
      const restaurant = customer.availablePoints.find(
        (item) => item.restaurantName === restaurantName
      );


      if (!restaurant) {
        customer.availablePoints.push({ restaurantName, points });
      } else {
        restaurant.points += points; // Add points
      }
    }

    // Save the updated customer document
    await customer.save();

    res.status(200).json({
      message: `Points ${type === "add" ? "added" : "redeemed"} successfully`,
      customer,
    });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/user/:userId/points', async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from URL parameters

    // Find the user by ID
    const user = await User.findOne({ name: userId }); // If you're using `name` to find the user


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Map available points for each restaurant
    const availablePoints = user.availablePoints.reduce((acc, curr) => {
      acc[curr.restaurantName] = curr.points;
      return acc;
    }, {});

    return res.status(200).json(availablePoints); // Return available points
  } catch (error) {
    console.error("Error fetching user points:", error);
    return res.status(500).json({ message: 'Server error' });
  }
});
// Card Image Management APIs
// Get restaurant card image
app.get('/api/restaurant/:id/card-image', async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({
      cardImage: restaurant.cardImage || null
    });
  } catch (error) {
    console.error('Error fetching card image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update restaurant card image
app.put('/api/restaurant/:id/card-image', async (req, res) => {
  try {
    const { id } = req.params;
    const { cardImage } = req.body;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.cardImage = cardImage;
    await restaurant.save();

    res.status(200).json({
      message: 'Card image updated successfully',
      cardImage: restaurant.cardImage
    });
  } catch (error) {
    console.error('Error updating card image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get restaurant card image by name (for customer app)
app.get('/api/restaurant/by-name/:name/card-image', async (req, res) => {
  try {
    const { name } = req.params;
    const restaurant = await Restaurant.findOne({ name: name });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({
      name: restaurant.name,
      cardImage: restaurant.cardImage || null
    });
  } catch (error) {
    console.error('Error fetching card image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update restaurant card image by name (for restaurant dashboard)
app.put('/api/restaurant/by-name/:name/card-image', async (req, res) => {
  try {
    const { name } = req.params;
    const { cardImage } = req.body;

    console.log('PUT /api/restaurant/by-name/:name/card-image called');
    console.log('Restaurant name:', name);
    console.log('Card image:', cardImage);

    const restaurant = await Restaurant.findOne({ name: name });
    if (!restaurant) {
      console.log('Restaurant not found:', name);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    console.log('Found restaurant:', restaurant.name);
    restaurant.cardImage = cardImage;
    await restaurant.save();
    console.log('Card image saved successfully');

    res.status(200).json({
      message: 'Card image updated successfully',
      cardImage: restaurant.cardImage
    });
  } catch (error) {
    console.error('Error updating card image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





// console.log('🚀 Starting server...');
// console.log('📦 Express app created');
// console.log('🔧 Middleware configured');
// console.log('📊 Routes registered');

// app.listen(port, '0.0.0.0', () => {
//   console.log(`🎉 Server is running on port ${port} and accessible on your local network.`);
//   console.log(`🌐 Local: http://localhost:${port}`);
//   console.log(`🌐 Network: http://<YOUR_MACHINE_IP>:${port}`);
//   console.log('✅ Server startup complete!');
// });

if (require.main === module) {
   console.log('🚀 Starting server in LOCAL mode...');
   app.listen(port, '0.0.0.0', () => {
     console.log(`🎉 Server is running on port ${port}`);
   });
}

 // Export the Express app for Vercel’s serverless wrapper
 module.exports = app;
