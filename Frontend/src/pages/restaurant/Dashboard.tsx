
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Star, TrendingUp, Gift, AlertTriangle, Calendar, Activity, Target, Award, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from "axios";

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

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

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
        axios.get(`/api/restaurant/${encodeURIComponent(restaurantName)}/stats`),
        axios.get(`/api/restaurant/${encodeURIComponent(restaurantName)}/redemptions`)
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

      const response = await axios.get(`/api/restaurant/${encodeURIComponent(restaurantName)}/download-excel`);

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
            Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">Live Data</span>
          </div>
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
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
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
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
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

      {/* Top Customers Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers (150+ Points)</CardTitle>
            <CardDescription>Customers who currently have more than 150 points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topCustomersOver150?.slice(0, 10).map((customer, index) => (
                <div key={customer.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {customer.points} pts
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  No customers with 150+ points
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Redeemers (150+ Points)</CardTitle>
            <CardDescription>Customers who redeemed more than 150 points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topRedeemersOver150?.slice(0, 10).map((customer, index) => (
                <div key={customer.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-medium text-red-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      {customer.totalRedeemed} pts
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {customer.redemptionCount} redemptions
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  No high-value redeemers
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
          <CardDescription>Latest redemption activity from your customers</CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions && redemptions.length > 0 ? (
            <div className="space-y-3">
              {redemptions.slice(0, 10).map((redemption, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Gift className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{redemption.customerName}</p>
                      <p className="text-sm text-muted-foreground">{redemption.customerEmail}</p>
                      <p className="text-xs text-muted-foreground">{redemption.customerPhone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getRedemptionBadgeColor(redemption.points)}>
                      {redemption.points} pts
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(redemption.redeemedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent redemptions
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redemption History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Redemptions</CardTitle>
          <CardDescription>
            Complete redemption history with high-value transactions highlighted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redemptions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No redemptions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.slice(0, 10).map((redemption) => (
                  <TableRow key={redemption._id} className={redemption.isHighValue ? "bg-red-50" : ""}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {redemption.customerName}
                          {redemption.isHighValue && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {redemption.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {redemption.customerPhone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRedemptionBadgeColor(redemption.points)}>
                        {redemption.points} pts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {redemption.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(redemption.redeemedAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* High-Value Redemptions Alert */}
      {stats && stats.highValueRedemptions > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              High-Value Redemption Alert
            </CardTitle>
            <CardDescription className="text-red-700">
              You have {stats.highValueRedemptions} redemption(s) over 150 points that may require special attention.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default RestaurantDashboard;
