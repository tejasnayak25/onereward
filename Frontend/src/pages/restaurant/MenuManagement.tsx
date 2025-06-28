import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  ChefHat,
  Utensils,
  DollarSign,
  Leaf,
  Flame,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
<<<<<<< HEAD
import { API_BASE_URL } from "@/config/api";
=======
>>>>>>> upstream/master

interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  order: number;
  active: boolean;
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string | { _id: string; name: string };
  options: {
    isVeg: boolean;
    isNonVeg: boolean;
    isJain: boolean;
    isSwaminarayan: boolean;
    isSpicy: boolean;
  };
  available: boolean;
  order: number;
}

const MenuManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("");
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    order: 0
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    categoryId: "",
    options: {
      isVeg: false,
      isNonVeg: false,
      isJain: false,
      isSwaminarayan: false,
      isSpicy: false
    },
    order: 0
  });

  useEffect(() => {
    // Get restaurant name from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setRestaurantName(parsed.name);
      fetchMenuData(parsed.name);
    }
  }, []);

  const fetchMenuData = async (name: string) => {
    try {
      setLoading(true);
      const encodedName = encodeURIComponent(name);
      console.log('Fetching menu data for restaurant:', name, 'encoded as:', encodedName);

      const [categoriesRes, itemsRes] = await Promise.all([
<<<<<<< HEAD
        axios.get(`${API_BASE_URL}/api/restaurant/${encodedName}/menu/categories`),
        axios.get(`${API_BASE_URL}/api/restaurant/${encodedName}/menu/items`)
=======
        axios.get(`/api/restaurant/${encodedName}/menu/categories`),
        axios.get(`/api/restaurant/${encodedName}/menu/items`)
>>>>>>> upstream/master
      ]);

      console.log('Categories fetched:', categoriesRes.data);
      console.log('Items fetched:', itemsRes.data);

      setCategories(categoriesRes.data);
      setItems(itemsRes.data);

      // Debug: Log category IDs and item categoryIds for comparison
      console.log('Category IDs:', categoriesRes.data.map((cat: any) => ({ id: cat._id, name: cat.name })));
      console.log('Item categoryIds:', itemsRes.data.map((item: any) => ({
        name: item.name,
        categoryId: item.categoryId,
        categoryIdType: typeof item.categoryId,
        categoryIdString: item.categoryId?.toString ? item.categoryId.toString() : item.categoryId
      })));
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch menu data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      console.log('Creating category:', categoryForm);
      console.log('Restaurant name:', restaurantName);

      if (!categoryForm.name.trim()) {
        toast({
          title: "Error",
          description: "Category name is required",
          variant: "destructive"
        });
        return;
      }

<<<<<<< HEAD
      const response = await axios.post(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/menu/categories`, categoryForm);
=======
      const response = await axios.post(`/api/restaurant/${encodeURIComponent(restaurantName)}/menu/categories`, categoryForm);
>>>>>>> upstream/master
      console.log('Category created:', response.data);

      setCategories([...categories, response.data]);
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", description: "", order: 0 });
      toast({
        title: "Success",
        description: "Category created successfully"
      });
    } catch (error: any) {
      console.error('Error creating category:', error);
      console.error('Error response:', error.response?.data);

      toast({
        title: "Error",
        description: error.response?.data?.error || error.response?.data?.details || "Failed to create category",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      const response = await axios.put(
<<<<<<< HEAD
        `${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/menu/categories/${editingCategory._id}`,
=======
        `/api/restaurant/${encodeURIComponent(restaurantName)}/menu/categories/${editingCategory._id}`,
>>>>>>> upstream/master
        categoryForm
      );
      setCategories(categories.map(cat => 
        cat._id === editingCategory._id ? response.data : cat
      ));
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", order: 0 });
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure? This will delete all items in this category.")) return;
    
    try {
<<<<<<< HEAD
      await axios.delete(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/menu/categories/${categoryId}`);
=======
      await axios.delete(`/api/restaurant/${encodeURIComponent(restaurantName)}/menu/categories/${categoryId}`);
>>>>>>> upstream/master
      setCategories(categories.filter(cat => cat._id !== categoryId));
      setItems(items.filter(item => item.categoryId !== categoryId));
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleCreateItem = async () => {
    try {
      console.log('Creating menu item:', itemForm);
      console.log('Restaurant name:', restaurantName);

      if (!itemForm.name.trim()) {
        toast({
          title: "Error",
          description: "Item name is required",
          variant: "destructive"
        });
        return;
      }

      if (!itemForm.categoryId) {
        toast({
          title: "Error",
          description: "Please select a category",
          variant: "destructive"
        });
        return;
      }

      if (itemForm.price <= 0) {
        toast({
          title: "Error",
          description: "Price must be greater than 0",
          variant: "destructive"
        });
        return;
      }

<<<<<<< HEAD
      const response = await axios.post(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/menu/items`, itemForm);
=======
      const response = await axios.post(`/api/restaurant/${encodeURIComponent(restaurantName)}/menu/items`, itemForm);
>>>>>>> upstream/master
      console.log('Menu item created:', response.data);

      setItems([...items, response.data]);
      setItemDialogOpen(false);
      resetItemForm();
      toast({
        title: "Success",
        description: "Menu item created successfully"
      });
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      console.error('Error response:', error.response?.data);

      toast({
        title: "Error",
        description: error.response?.data?.error || error.response?.data?.details || "Failed to create menu item",
        variant: "destructive"
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    
    try {
      const response = await axios.put(
<<<<<<< HEAD
        `${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/menu/items/${editingItem._id}`,
=======
        `/api/restaurant/${encodeURIComponent(restaurantName)}/menu/items/${editingItem._id}`,
>>>>>>> upstream/master
        itemForm
      );
      setItems(items.map(item => 
        item._id === editingItem._id ? response.data : item
      ));
      setItemDialogOpen(false);
      setEditingItem(null);
      resetItemForm();
      toast({
        title: "Success",
        description: "Menu item updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
<<<<<<< HEAD
      await axios.delete(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/menu/items/${itemId}`);
=======
      await axios.delete(`/api/restaurant/${encodeURIComponent(restaurantName)}/menu/items/${itemId}`);
>>>>>>> upstream/master
      setItems(items.filter(item => item._id !== itemId));
      toast({
        title: "Success",
        description: "Menu item deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  const resetItemForm = () => {
    setItemForm({
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: "",
      options: {
        isVeg: false,
        isNonVeg: false,
        isJain: false,
        isSwaminarayan: false,
        isSpicy: false
      },
      order: 0
    });
  };

  const openCategoryDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || "",
        order: category.order
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", order: categories.length });
    }
    setCategoryDialogOpen(true);
  };

  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || "",
        price: item.price,
        image: item.image || "",
        categoryId: typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId,
        options: item.options,
        order: item.order
      });
    } else {
      setEditingItem(null);
      resetItemForm();
    }
    setItemDialogOpen(true);
  };

  const getItemsByCategory = (categoryId: string) => {
    console.log('Filtering items for category:', categoryId);
    const filteredItems = items.filter(item => {
      // Handle both string and ObjectId comparisons
      const itemCategoryId = typeof item.categoryId === 'object' && item.categoryId?._id
        ? item.categoryId._id
        : item.categoryId;
      const match = itemCategoryId === categoryId || itemCategoryId?.toString() === categoryId;
      console.log(`Item "${item.name}" categoryId: ${itemCategoryId} (${typeof itemCategoryId}) vs ${categoryId} = ${match}`);
      return match;
    });
    console.log(`Found ${filteredItems.length} items for category ${categoryId}`);
    return filteredItems;
  };

  const getOptionBadges = (options: MenuItem['options']) => {
    const badges = [];
    if (options.isVeg) badges.push({ label: "Veg", color: "bg-green-100 text-green-800" });
    if (options.isNonVeg) badges.push({ label: "Non-Veg", color: "bg-red-100 text-red-800" });
    if (options.isJain) badges.push({ label: "Jain", color: "bg-orange-100 text-orange-800" });
    if (options.isSwaminarayan) badges.push({ label: "Swaminarayan", color: "bg-purple-100 text-purple-800" });
    if (options.isSpicy) badges.push({ label: "Spicy", color: "bg-red-100 text-red-600" });
    return badges;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">
            Manage your restaurant's menu categories and items
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCategoryDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => openItemDialog()} disabled={categories.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Items ({items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ChefHat className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No categories yet</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Create your first menu category to start organizing your items
                </p>
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category._id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.description && (
                        <CardDescription>{category.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.active ? "default" : "secondary"}>
                        {category.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openCategoryDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {getItemsByCategory(category._id).length} items in this category
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Utensils className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No menu items yet</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Add your first menu item to start building your menu
                </p>
                <Button onClick={() => openItemDialog()} disabled={categories.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Create a category first to add items
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => {
                const categoryItems = getItemsByCategory(category._id);
                if (categoryItems.length === 0) return null;
                
                return (
                  <Card key={category._id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categoryItems.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold">{item.name}</h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center text-sm font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  {item.price}
                                </div>
                                <div className="flex gap-1">
                                  {getOptionBadges(item.options).map((badge, index) => (
                                    <Badge key={index} className={`${badge.color} text-xs`}>
                                      {badge.label}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.available ? "default" : "secondary"}>
                              {item.available ? "Available" : "Unavailable"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openItemDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Update the category details below" 
                : "Add a new menu category to organize your items"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="e.g., Appetizers, Main Course"
              />
            </div>
            <div>
              <Label htmlFor="category-description">Description (Optional)</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="Brief description of this category"
              />
            </div>
            <div>
              <Label htmlFor="category-order">Display Order</Label>
              <Input
                id="category-order"
                type="number"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({...categoryForm, order: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}>
                <Save className="h-4 w-4 mr-2" />
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Create Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Update the menu item details below" 
                : "Add a new item to your menu"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                  placeholder="e.g., Butter Chicken"
                />
              </div>
              <div>
                <Label htmlFor="item-price">Price ($)</Label>
                <Input
                  id="item-price"
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({...itemForm, price: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="item-category">Category</Label>
              <select
                id="item-category"
                className="w-full p-2 border rounded-md"
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({...itemForm, categoryId: e.target.value})}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="item-description">Description (Optional)</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                placeholder="Brief description of the dish"
              />
            </div>

            <div>
              <Label htmlFor="item-image">Image URL (Optional)</Label>
              <Input
                id="item-image"
                value={itemForm.image}
                onChange={(e) => setItemForm({...itemForm, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label>Food Options</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={itemForm.options.isVeg}
                    onCheckedChange={(checked) => 
                      setItemForm({
                        ...itemForm, 
                        options: {...itemForm.options, isVeg: checked, isNonVeg: checked ? false : itemForm.options.isNonVeg}
                      })
                    }
                  />
                  <Label className="flex items-center gap-1">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Vegetarian
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={itemForm.options.isNonVeg}
                    onCheckedChange={(checked) => 
                      setItemForm({
                        ...itemForm, 
                        options: {...itemForm.options, isNonVeg: checked, isVeg: checked ? false : itemForm.options.isVeg}
                      })
                    }
                  />
                  <Label>Non-Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={itemForm.options.isJain}
                    onCheckedChange={(checked) => 
                      setItemForm({...itemForm, options: {...itemForm.options, isJain: checked}})
                    }
                  />
                  <Label>Jain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={itemForm.options.isSwaminarayan}
                    onCheckedChange={(checked) => 
                      setItemForm({...itemForm, options: {...itemForm.options, isSwaminarayan: checked}})
                    }
                  />
                  <Label>Swaminarayan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={itemForm.options.isSpicy}
                    onCheckedChange={(checked) => 
                      setItemForm({...itemForm, options: {...itemForm.options, isSpicy: checked}})
                    }
                  />
                  <Label className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-red-600" />
                    Spicy
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="item-order">Display Order</Label>
              <Input
                id="item-order"
                type="number"
                value={itemForm.order}
                onChange={(e) => setItemForm({...itemForm, order: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={editingItem ? handleUpdateItem : handleCreateItem}
                disabled={!itemForm.name || !itemForm.categoryId || itemForm.price <= 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
