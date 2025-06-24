import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from "@/config/api";

interface PersonalizedCardProps {
  restaurantName: string;
  className?: string;
}

const PersonalizedCard: React.FC<PersonalizedCardProps> = ({
  restaurantName,
  className = ""
}) => {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string>('');
  const [userPoints, setUserPoints] = useState<number>(0);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCardData();
  }, [restaurantName]);

  const fetchCardData = async () => {
    try {
      // Get user data from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Set initial values - use actual user data from localStorage (now includes phone from Users table)
      setUserPoints(0); // Start with 0, will be updated if data is found
      setUserPhone(user.phone || 'No Phone'); // Phone number from Users table via login API

      // Try to fetch card image
      try {
        const cardImageRes = await axios.get(`${API_BASE_URL}/api/restaurant/by-name/${encodeURIComponent(restaurantName)}/card-image`);
        setCardImage(cardImageRes.data.cardImage);
        console.log('✅ Card image fetched successfully:', cardImageRes.data.cardImage);
      } catch (error) {
        console.log('❌ Could not fetch card image for restaurant:', restaurantName);
        console.error('Card image fetch error:', error);
      }

      // Try to fetch QR code and phone from Users table
      if (user.email) {
        try {
          const qrCodeRes = await axios.get(`${API_BASE_URL}/api/user-qr/${user.email}`);
          if (qrCodeRes.data && qrCodeRes.data.success) {
            // Set QR code
            if (qrCodeRes.data.qrCode) {
              setQrCode(qrCodeRes.data.qrCode);
            }
            // If phone not in localStorage, get it from Users table
            if (!user.phone && qrCodeRes.data.user && qrCodeRes.data.user.phone) {
              setUserPhone(qrCodeRes.data.user.phone);
            }
          }
        } catch (error) {
          console.log('Could not fetch QR code');
        }
      }

      // Try to fetch actual points (no default fallback)
      if (user.name) {
        try {
          const userPointsRes = await axios.get(`${API_BASE_URL}/api/user/${user.name}/points`);
          // Only set points if we actually get data, otherwise keep 0
          if (userPointsRes.data && userPointsRes.data[restaurantName] !== undefined) {
            setUserPoints(userPointsRes.data[restaurantName]);
          }
        } catch (error) {
          console.log('Could not fetch points, keeping 0');
        }
      }

    } catch (error) {
      console.error('Error fetching card data:', error);
      // Set fallback data
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserPhone(user.phone || 'No Phone');
      setUserPoints(0); // Keep 0 instead of any default
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`aspect-[1.6/1] rounded-lg bg-gray-200 animate-pulse ${className}`}>
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full group ${className}`}>
      <div
        className="aspect-[1.6/1] rounded-xl shadow-xl overflow-hidden relative border border-gray-200 transition-all duration-300 group-hover:shadow-2xl"
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

        {/* Continuous shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent card-shine"></div>

        {/* Card Content */}
        <div className="relative h-full p-4 flex flex-col justify-between text-black">
          {/* Top Section - Points only */}
          <div className="flex justify-end">
            <div className="bg-white px-3 py-1.5 rounded text-sm font-bold text-gray-800 shadow-sm">
              {userPoints} PTS
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-end">
            <div className="space-y-2 max-w-[40%]">
              <div className="bg-white/95 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-md backdrop-blur-sm">
                {restaurantName}
              </div>
              <div className="bg-white/95 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 shadow-md backdrop-blur-sm">
                {userPhone}
              </div>
            </div>
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center shadow-lg p-0.5">
              {qrCode ? (
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="User QR Code"
                  className="h-31 w-31 rounded"
                />
              ) : (
                <QrCode className="h-28 w-28 text-black" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedCard;
