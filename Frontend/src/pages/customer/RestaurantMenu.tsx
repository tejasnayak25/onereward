import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Leaf, Flame, Star, DollarSign } from "lucide-react";
import axios from "axios";
<<<<<<< HEAD
import { API_BASE_URL } from "@/config/api";
=======
>>>>>>> upstream/master

interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  options: {
    isVeg: boolean;
    isNonVeg: boolean;
    isJain: boolean;
    isSwaminarayan: boolean;
    isSpicy: boolean;
  };
  available: boolean;
}

interface Restaurant {
  _id: string;
  name: string;
  email: string;
}

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantAndMenu();
    }
  }, [restaurantId]);

  const fetchRestaurantAndMenu = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant details
<<<<<<< HEAD
      const restaurantResponse = await axios.get(`${API_BASE_URL}/api/restaurants/${restaurantId}`);
      setRestaurant(restaurantResponse.data);
      
      // Fetch menu
      const menuResponse = await axios.get(`${API_BASE_URL}/api/customer/restaurant/${encodeURIComponent(restaurantResponse.data.name)}/menu`);
=======
      const restaurantResponse = await axios.get(`/api/restaurants/${restaurantId}`);
      setRestaurant(restaurantResponse.data);
      
      // Fetch menu
      const menuResponse = await axios.get(`/api/customer/restaurant/${encodeURIComponent(restaurantResponse.data.name)}/menu`);
>>>>>>> upstream/master
      setMenu(menuResponse.data);
      
      // Set first category as active
      if (menuResponse.data.length > 0) {
        setActiveCategory(menuResponse.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching restaurant menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getOptionBadges = (options: MenuItem['options']) => {
    const badges = [];
    
    if (options.isVeg) badges.push({ label: "Veg", color: "bg-green-100 text-green-800", icon: Leaf });
    if (options.isNonVeg) badges.push({ label: "Non-Veg", color: "bg-red-100 text-red-800", icon: null });
    if (options.isJain) badges.push({ label: "Jain", color: "bg-orange-100 text-orange-800", icon: null });
    if (options.isSwaminarayan) badges.push({ label: "Swaminarayan", color: "bg-purple-100 text-purple-800", icon: null });
    if (options.isSpicy) badges.push({ label: "Spicy", color: "bg-red-100 text-red-600", icon: Flame });
    
    return badges;
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
              <div className="grid gap-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-32 bg-muted rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-16">
        <h3 className="font-semibold mb-2 text-foreground text-lg">Restaurant not found</h3>
        <Link to="/customer/restaurants">
          <Button variant="outline">Back to Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-10 w-10">
          <Link to="/customer/restaurants">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">{restaurant.name}</h2>
          <p className="text-sm text-muted-foreground">Menu & Offerings</p>
        </div>
      </div>

      {menu.length === 0 ? (
        <div className="text-center py-16">
          <Star className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
          <h3 className="font-semibold mb-2 text-foreground text-lg">No menu available</h3>
          <p className="text-sm text-muted-foreground">
            This restaurant hasn't added their menu yet.
          </p>
        </div>
      ) : (
        <>
          {/* Category Navigation */}
          {menu.length > 1 && (
            <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {menu.map((category) => (
                  <Button
                    key={category._id}
                    variant={activeCategory === category._id ? "default" : "outline"}
                    size="sm"
                    onClick={() => scrollToCategory(category._id)}
                    className="whitespace-nowrap"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Menu Categories */}
          <div className="space-y-8">
            {menu.map((category) => (
              <div key={category._id} id={`category-${category._id}`} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                  )}
                </div>

                <div className="grid gap-4">
                  {category.items.map((item) => (
                    <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Item Image */}
                          {item.image && (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}

                          {/* Item Details */}
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-lg">{item.name}</h4>
                              <div className="flex items-center text-lg font-bold text-primary">
                                <DollarSign className="h-4 w-4" />
                                {item.price}
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {/* Option Badges */}
                            <div className="flex flex-wrap gap-1">
                              {getOptionBadges(item.options).map((badge, index) => (
                                <Badge key={index} className={`${badge.color} text-xs`}>
                                  {badge.icon && <badge.icon className="h-3 w-3 mr-1" />}
                                  {badge.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantMenu;
