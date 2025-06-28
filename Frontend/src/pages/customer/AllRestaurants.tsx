import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Store, MapPin } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  status: string;
  join_date: string;
  cardImage?: string;
  logo?: string;
}

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Default restaurant images for variety
  const defaultImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&auto=format&fit=crop&q=60",
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    // Filter restaurants based on search query
    if (searchQuery.trim() === "") {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/restaurants`);
      
      // Filter only active restaurants
      const activeRestaurants = response.data.filter(
        (restaurant: Restaurant) => restaurant.status === "active"
      );
      
      setRestaurants(activeRestaurants);
      setFilteredRestaurants(activeRestaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantImage = (restaurant: Restaurant, index: number) => {
    return restaurant.logo || defaultImages[index % defaultImages.length];
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16 animate-fade-in">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-12 w-full bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-primary">All Restaurants</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Discover restaurants and explore their menus
        </p>
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            className="pl-10 h-12 rounded-xl border-2 focus:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-16">
          <Store className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
          <h3 className="font-semibold mb-2 text-foreground text-lg">No restaurants found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {searchQuery 
              ? "Try adjusting your search terms to find the restaurant you're looking for."
              : "No restaurants are currently available."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredRestaurants.map((restaurant, index) => (
            <Link
              key={restaurant._id}
              to={`/customer/restaurant/${restaurant._id}/menu`}
              className="block group"
            >
              <Card className="overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 shadow-lg">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={getRestaurantImage(restaurant, index)}
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultImages[index % defaultImages.length];
                    }}
                  />

                  {/* Restaurant Logo */}
                  {/* {restaurant.logo && (
                    <div className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full p-1 shadow-lg">
                      <img
                        src={restaurant.logo}
                        alt={`${restaurant.name} logo`}
                        className="w-full h-full object-contain rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )} */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Restaurant name overlay on hover */}
                  <div className="absolute bottom-2 left-2 right-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                    <h3 className="text-white font-bold text-sm sm:text-lg drop-shadow-lg">
                      {restaurant.name}
                    </h3>
                    <p className="text-white/90 text-xs sm:text-sm flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      View Menu
                    </p>
                  </div>
                </div>

                <CardContent className="p-2 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-lg mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tap to explore menu
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllRestaurants;
