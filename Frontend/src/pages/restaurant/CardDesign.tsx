import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Image as ImageIcon, Link } from "lucide-react";
import axios from 'axios';

const CardDesign = () => {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get restaurant info from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setRestaurantInfo({
          id: parsed._id,
          name: parsed.name
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurant information",
          variant: "destructive",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (restaurantInfo) {
      fetchCardImage();
    }
  }, [restaurantInfo]);

  const fetchCardImage = async () => {
    if (!restaurantInfo) return;

    setIsLoading(true);
    try {
      // Use restaurant ID for fetching card image and logo
      const response = await axios.get(`/api/restaurant/${restaurantInfo.id}/card-image`);
      const image = response.data.cardImage;
      const logoData = response.data.logo;

      setCardImage(image);
      setImageUrl(image || '');
      setLogo(logoData);
      setLogoUrl(logoData || '');
    } catch (error) {
      console.error('Error fetching card image:', error);
      // Don't show error toast for missing image, it's normal
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load card image",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!restaurantInfo) {
      toast({
        title: "Error",
        description: "Restaurant information not available",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving card image for restaurant:', restaurantInfo.name);
      console.log('Card image URL:', cardImage);

      // Use restaurant ID for updating card image
      const response = await axios.put(`/api/restaurant/${restaurantInfo.id}/card-image`, { cardImage });
      console.log('Save response:', response.data);

      toast({
        title: "Success",
        description: `Card image saved successfully for ${restaurantInfo.name}!`,
      });
    } catch (error) {
      console.error('Error saving card image:', error);
      console.error('Error details:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save card image",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyUrl = () => {
    if (imageUrl.trim()) {
      setCardImage(imageUrl.trim());
      toast({
        title: "Image Applied",
        description: "Card background image updated",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };

  const handleClearImage = () => {
    setCardImage(null);
    setImageUrl('');
    toast({
      title: "Image Removed",
      description: "Card background image cleared",
    });
  };

  const handleApplyLogo = () => {
    if (logoUrl.trim()) {
      setLogo(logoUrl.trim());
      toast({
        title: "Logo Applied",
        description: "Restaurant logo updated",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid logo URL",
        variant: "destructive",
      });
    }
  };

  const handleSaveLogo = async () => {
    if (!restaurantInfo) {
      toast({
        title: "Error",
        description: "Restaurant information not available",
        variant: "destructive",
      });
      return;
    }

    setLogoSaving(true);
    try {
      console.log('Saving logo for restaurant:', restaurantInfo.name);
      console.log('Logo URL:', logo);

      const response = await axios.put(`/api/restaurant/${restaurantInfo.name}/logo`, { logo });
      console.log('Logo save response:', response.data);

      toast({
        title: "Success",
        description: `Restaurant logo saved successfully for ${restaurantInfo.name}!`,
      });
    } catch (error) {
      console.error('Error saving logo:', error);
      console.error('Error details:', error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save logo",
        variant: "destructive",
      });
    } finally {
      setLogoSaving(false);
    }
  };

  const handleClearLogo = () => {
    setLogo(null);
    setLogoUrl('');
    toast({
      title: "Logo Removed",
      description: "Restaurant logo cleared",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Card Design</h2>
        <p className="text-muted-foreground">
          Paste an image URL to customize your loyalty card background
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Upload */}
        <div className="space-y-6">
          {/* Logo Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Restaurant Logo
              </CardTitle>
              <CardDescription>
                Upload your restaurant logo to display on customer app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Logo URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      type="url"
                      placeholder="Paste logo URL here..."
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyLogo}
                      disabled={!logoUrl.trim()}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Logo Preview */}
                {logo && (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden p-4 bg-gray-50 flex justify-center">
                      <img
                        src={logo}
                        alt="Restaurant logo preview"
                        className="w-24 h-24 object-contain"
                        onError={() => {
                          toast({
                            title: "Invalid Logo",
                            description: "The logo URL is not valid or accessible",
                            variant: "destructive",
                          });
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleClearLogo}
                      className="w-full"
                    >
                      Remove Logo
                    </Button>
                  </div>
                )}

                {/* Save Logo Button */}
                <Button
                  onClick={handleSaveLogo}
                  disabled={logoSaving || !logo}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {logoSaving ? 'Saving...' : 'Save Logo'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Card Background Image
              </CardTitle>
              <CardDescription>
                Paste an image URL to set a custom background for your loyalty cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Image URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="Paste image URL here..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyUrl}
                      disabled={!imageUrl.trim()}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Try these examples:
                    <button
                      className="text-blue-600 hover:underline ml-1"
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop')}
                    >
                      Restaurant 1
                    </button>
                    {" | "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1556040220-4096d522378d?w=400&h=250&fit=crop')}
                    >
                      Restaurant 2
                    </button>
                    {" | "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setImageUrl('https://images.unsplash.com/photo-1568376794508-ae52c6ab3929?w=400&h=250&fit=crop')}
                    >
                      Restaurant 3
                    </button>
                  </p>
                </div>

                {/* Image Preview */}
                {cardImage && (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={cardImage}
                        alt="Card background preview"
                        className="w-full h-32 object-cover"
                        onError={() => {
                          toast({
                            title: "Invalid Image",
                            description: "The image URL is not valid or accessible",
                            variant: "destructive",
                          });
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleClearImage}
                      className="w-full"
                    >
                      Remove Image
                    </Button>
                  </div>
                )}

                {/* Save Button */}
                <Button
                  onClick={handleSaveImage}
                  disabled={isSaving || !cardImage}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Card Design'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Card Preview
              </CardTitle>
              <CardDescription>
                How your loyalty card will appear to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Credit Card Preview */}
              <div className="relative w-full max-w-sm mx-auto">
                <div
                  className="aspect-[1.6/1] rounded-xl shadow-xl overflow-hidden relative border border-gray-200"
                  style={{
                    backgroundColor: '#FFD700',
                    backgroundImage: cardImage ? `url(${cardImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Subtle overlay for better text readability */}
                  {cardImage && (
                    <div className="absolute inset-0 bg-black/10"></div>
                  )}

                  {/* Card Content */}
                  <div className="relative h-full p-4 flex flex-col justify-between text-black">
                    {/* Top Section - Points only */}
                    <div className="flex justify-end">
                      <div className="bg-white px-3 py-1.5 rounded text-sm font-bold text-gray-800 shadow-sm">
                        100 PTS
                      </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex justify-between items-end">
                      <div className="space-y-2 max-w-[45%]">
                        <div className="bg-white/95 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-md backdrop-blur-sm">
                          {restaurantInfo?.name || "Restaurant"}
                        </div>
                        <div className="bg-white/95 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-md backdrop-blur-sm">
                          User Phone
                        </div>
                      </div>
                      <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <div className="w-28 h-28 bg-black rounded grid grid-cols-8 gap-px p-1">
                          {[...Array(64)].map((_, i) => (
                            <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CardDesign;
