<<<<<<< HEAD
=======

>>>>>>> upstream/master
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Switch } from "@/components/ui/switch";
import { Loader2, Users, Star, TrendingUp, Gift, AlertTriangle, Calendar, Activity, Target, Award, Clock, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
=======
import { Loader2, Users, Star, TrendingUp, Gift, AlertTriangle, Calendar, Target, Award, Clock, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from "axios";
>>>>>>> upstream/master

interface DashboardStats {
  totalUsers: number;
  totalPointsIssued: number;
  totalRedemptions: number;
  totalOffers: number;
  topCustomersOver150: Array<{
    name: string;
    email: string;
    phone: string;
    points: number;
  }>;
  topRedeemersOver150: Array<{
    name: string;
    email: string;
    phone: string;
    totalRedeemed: number;
    redemptionCount: number;
  }>;
  lastUpdated: string;
}

interface Analytics {
  dailyStats: Array<{
    date: string;
    newUsers: number;
    redemptions: number;
    day: string;
  }>;
  topCustomers: Array<{
    name: string;
    email: string;
    points: number;
    joinDate: string;
  }>;
  recentRedemptions: Array<{
    customerName: string;
    points: number;
    description: string;
    timestamp: string;
  }>;
  summary: {
    weeklyNewUsers: number;
    weeklyRedemptions: number;
    averageDailyUsers: number;
    averageDailyRedemptions: number;
  };
  lastUpdated: string;
}

interface Redemption {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  points: number;
  description: string;
  redeemedAt: string;
  isHighValue: boolean;
}

const RestaurantDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
<<<<<<< HEAD
  const [autoRefresh, setAutoRefresh] = useState(() => {
    // Load auto-refresh preference from localStorage
    const saved = localStorage.getItem('restaurant-auto-refresh');
    return saved !== null ? JSON.parse(saved) : true;
  });
=======
>>>>>>> upstream/master

  useEffect(() => {
    fetchDashboardData();
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      // Set up auto-refresh every 1 minute when enabled
      interval = setInterval(fetchDashboardData, 60000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const handleAutoRefreshToggle = (checked: boolean) => {
    setAutoRefresh(checked);
    // Save preference to localStorage
    localStorage.setItem('restaurant-auto-refresh', JSON.stringify(checked));
  };
=======

>>>>>>> upstream/master

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get restaurant name from localStorage
      const user = localStorage.getItem("user");
      const restaurantName = user ? JSON.parse(user).name || "" : "";

      if (!restaurantName) {
        console.error("No restaurant name found in localStorage");
        return;
      }

      console.log("📊 Fetching dashboard data for:", restaurantName);

      // Fetch stats and redemptions
      const [statsResponse, redemptionsResponse] = await Promise.all([
<<<<<<< HEAD
        axios.get(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/stats`),
        axios.get(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/redemptions`)
=======
        axios.get(`/api/restaurant/${encodeURIComponent(restaurantName)}/stats`),
        axios.get(`/api/restaurant/${encodeURIComponent(restaurantName)}/redemptions`)
>>>>>>> upstream/master
      ]);

      console.log("✅ Stats data:", statsResponse.data);
      console.log("✅ Redemptions data:", redemptionsResponse.data);

      setStats(statsResponse.data);
      setRedemptions(redemptionsResponse.data.redemptions || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      // Keep existing data on error, don't clear it
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    try {
      const user = localStorage.getItem("user");
      const restaurantName = user ? JSON.parse(user).name || "" : "";

      if (!restaurantName) {
        console.error("No restaurant name found");
        return;
      }

      console.log("📥 Downloading Excel data for:", restaurantName);

<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/download-excel`);
=======
      const response = await axios.get(`/api/restaurant/${encodeURIComponent(restaurantName)}/download-excel`);
>>>>>>> upstream/master

      // Convert to CSV format for easy Excel import
      const data = response.data.data;

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add summary
      csvContent += "DASHBOARD SUMMARY\n";
      csvContent += `Total Customers,${data.summary['Total Customers']}\n`;
      csvContent += `Total Points Issued,${data.summary['Total Points Issued']}\n`;
      csvContent += `Total Points Redeemed,${data.summary['Total Points Redeemed']}\n`;
      csvContent += `Customers Who Redeemed,${data.summary['Customers Who Redeemed']}\n`;
      csvContent += `Generated On,${data.summary['Generated On']}\n\n`;

      // Add customers data
      csvContent += "CUSTOMERS DATA\n";
      csvContent += "Name,Email,Phone,Current Points,Total Redeemed,Join Date,Has Redeemed\n";
      data.customers.forEach((customer: any) => {
        csvContent += `${customer.Name},${customer.Email},${customer.Phone},${customer['Current Points']},${customer['Total Redeemed']},${customer['Join Date']},${customer['Has Redeemed']}\n`;
      });

      csvContent += "\nREDEMPTIONS DATA\n";
      csvContent += "Customer Name,Customer Email,Customer Phone,Points Redeemed,Description,Date,Time\n";
      data.redemptions.forEach((redemption: any) => {
        csvContent += `${redemption['Customer Name']},${redemption['Customer Email']},${redemption['Customer Phone']},${redemption['Points Redeemed']},${redemption.Description},${redemption.Date},${redemption.Time}\n`;
      });

      // Download file
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${restaurantName}_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Excel file downloaded successfully");
    } catch (error) {
      console.error("❌ Error downloading Excel:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRedemptionBadgeColor = (points: number) => {
    if (points > 150) return "bg-red-100 text-red-800";
    if (points >= 100) return "bg-orange-100 text-orange-800";
    if (points >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h2>
          <p className="text-muted-foreground">
            Complete overview of your loyalty program
          </p>
          <p className="text-xs text-muted-foreground">
<<<<<<< HEAD
            Last updated: {lastRefresh.toLocaleTimeString()} • {autoRefresh ? 'Auto-refreshes every 1 minute' : 'Auto-refresh disabled'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${autoRefresh ? 'text-green-500' : 'text-gray-400'}`} />
            <span className={`text-sm ${autoRefresh ? 'text-green-600' : 'text-gray-500'}`}>
              {autoRefresh ? 'Live Data' : 'Manual Mode'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={handleAutoRefreshToggle}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-sm text-muted-foreground">Auto-refresh</span>
          </div>
=======
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
>>>>>>> upstream/master
          <Button onClick={fetchDashboardData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={downloadExcel} variant="outline" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Download Excel
          </Button>
        </div>
      </div>

      {/* Core Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redeemed Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRedemptions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Points used by customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPointsIssued?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total points distributed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Offers</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOffers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available offers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
