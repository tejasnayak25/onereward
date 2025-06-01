
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Star, TrendingUp, Gift, AlertTriangle, Calendar } from "lucide-react";
import axios from "axios";

interface DashboardStats {
  totalPointsIssued: number;
  totalRedemptions: number;
  totalUsers: number;
  totalUsersRedeemed: number;
  highValueRedemptions: number;
  averagePointsPerUser: number;
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get restaurant name from localStorage
      const user = localStorage.getItem("user");
      const restaurantName = user ? JSON.parse(user).name || "" : "";

      // For now, use mock data since backend endpoints are having issues
      // TODO: Replace with actual API calls once backend is fixed
      const mockStats = {
        totalPointsIssued: 2450,
        totalRedemptions: 850,
        totalUsers: 45,
        totalUsersRedeemed: 12,
        highValueRedemptions: 3,
        averagePointsPerUser: 54
      };

      const mockRedemptions = [
        {
          _id: "1",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "555-0123",
          points: 200,
          description: "Free meal",
          redeemedAt: new Date().toISOString(),
          isHighValue: true
        },
        {
          _id: "2",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          customerPhone: "555-0456",
          points: 100,
          description: "Discount voucher",
          redeemedAt: new Date(Date.now() - 86400000).toISOString(),
          isHighValue: false
        }
      ];

      setStats(mockStats);
      setRedemptions(mockRedemptions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Complete overview of your loyalty program performance
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Issued</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPointsIssued || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg {stats?.averagePointsPerUser || 0} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRedemptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Points redeemed by customers
            </p>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Users Who Redeemed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsersRedeemed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalUsers ? Math.round((stats.totalUsersRedeemed / stats.totalUsers) * 100) : 0}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Value Redemptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.highValueRedemptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Redemptions over 150 points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPointsIssued ? Math.round((stats.totalRedemptions / stats.totalPointsIssued) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Points redeemed vs issued
            </p>
          </CardContent>
        </Card>
      </div>

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
