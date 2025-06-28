import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
<<<<<<< HEAD
import { Search, Store, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PersonalizedCard from "@/components/PersonalizedCard";
import { API_BASE_URL } from "@/config/api";
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Store, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PersonalizedCard from "@/components/PersonalizedCard";
>>>>>>> upstream/master

// Predefined image pool
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1599458252573-56ae36120de1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGZvb2R8ZW58MHx8MHx8fDA%3D",
  "https://plus.unsplash.com/premium_photo-1663036447682-8f0d918adbed?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudCUyMGZvb2R8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1556040220-4096d522378d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHJlc3RhdXJhbnQlMjBmb29kfGVufDB8fDB8fHww",
  "https://images.unsplash.com/photo-1568376794508-ae52c6ab3929?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHJlc3RhdXJhbnQlMjBmb29kfGVufDB8fDB8fHww",
];

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  status: string;
  join_date: string;
<<<<<<< HEAD
=======
  city?: string;
>>>>>>> upstream/master
  image?: string;
  category?: string;
  points?: number;
  redemptionThreshold?: number;
}

const CustomerCards = () => {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
<<<<<<< HEAD
=======
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
>>>>>>> upstream/master
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});

  // Retrieve user data from localStorage and parse it
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.name;

<<<<<<< HEAD
  // Fetch restaurant data
  const fetchRestaurants = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/restaurants`);
      const withImages = data.map((r: Restaurant) => ({
        ...r,
        image: IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)], // Random image from pool
        category: "Loyalty Partner", 
        points: userPoints[r.name] || 0, 
        redemptionThreshold: 1000, 
=======
  // Extract unique cities from restaurants
  const extractCitiesFromRestaurants = (restaurantData: Restaurant[]) => {
    const uniqueCities = [...new Set(restaurantData.map(r => r.city).filter(Boolean))];
    console.log("Extracted cities from restaurants:", uniqueCities);
    console.log("Restaurant data sample:", restaurantData.slice(0, 3));
    setCities(uniqueCities);
  };

  // Fetch restaurant data
  const fetchRestaurants = async () => {
    try {
      const { data } = await axios.get("/api/restaurants");
      const withImages = data.map((r: Restaurant) => ({
        ...r,
        image: IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)], // Random image from pool
        category: "Loyalty Partner",
        points: userPoints[r.name] || 0,
        redemptionThreshold: 1000,
>>>>>>> upstream/master
      }));
      setRestaurants(withImages);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
  };

  // Fetch user points from the API
  const fetchUserPoints = async () => {
    try {
<<<<<<< HEAD
      const { data } = await axios.get(`${API_BASE_URL}/api/user/${userId}/points`);
=======
      const { data } = await axios.get(`/api/user/${userId}/points`);
>>>>>>> upstream/master
      setUserPoints(data);
    } catch (error) {
      console.error("Failed to fetch user points:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserPoints(); // Fetch user points on component mount
    }
  }, [userId]);

  useEffect(() => {
    if (userPoints) {
      fetchRestaurants(); // Fetch restaurant data after user points are fetched
    }
  }, [userPoints]);

<<<<<<< HEAD
=======
  // Extract cities whenever restaurants data changes
  useEffect(() => {
    if (restaurants.length > 0) {
      extractCitiesFromRestaurants(restaurants);
    }
  }, [restaurants]);

>>>>>>> upstream/master
  // Handle image loading for smooth transition
  const handleImageLoad = (url: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [url]: true,
    }));
  };

<<<<<<< HEAD
  // Filter restaurants based on search query
  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
=======
  // Filter restaurants based on search query and city
  const filtered = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || r.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  // Debug logging
  console.log("Available cities:", cities);
  console.log("Selected city:", selectedCity);
  console.log("Total restaurants:", restaurants.length);
  console.log("Filtered restaurants:", filtered.length);
>>>>>>> upstream/master

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold mb-1 text-blue-600">My Loyalty Cards</h2>
        <p className="text-sm text-gray-600 mb-4">
          View and manage your points across all restaurants
        </p>
<<<<<<< HEAD
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search restaurants..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
=======
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search restaurants..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.length > 0 ? (
                  cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cities" disabled>
                    No cities available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
>>>>>>> upstream/master
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium mb-1 text-gray-700">No cards found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your search or visit a restaurant to earn points.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((card) => (
            <Link key={card._id} to={`/customer/cards/${card._id}`} className="block group">
              <div className="transform transition duration-200 hover:scale-105">
                <PersonalizedCard
                  restaurantName={card.name}
                  className="shadow-lg group-hover:shadow-2xl transition-shadow duration-200"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerCards;
