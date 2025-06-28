import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
<<<<<<< HEAD
import { Switch } from "@/components/ui/switch";
import { Loader2, Users, Search, Download, Phone, Mail, Calendar, Gift, Activity, RefreshCw } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
=======

import { Loader2, Users, Search, Download, Phone, Mail, Gift, RefreshCw } from "lucide-react";
import axios from "axios";
>>>>>>> upstream/master

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  currentPoints: number;
  totalRedeemed: number;
  redemptionCount: number;
  hasRedeemed: boolean;
  hasHighValueRedemption: boolean;
<<<<<<< HEAD
  lastRedemption: {
    points: number;
    description: string;
    date: string;
  } | null;
  joinDate: string;
=======
>>>>>>> upstream/master
  status: string;
}

interface CustomerStats {
  totalCustomers: number;
  customersWithPoints: number;
  customersWithRedemptions: number;
  customersWithHighValue: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
}

const RestaurantCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
    fetchCustomers();
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      // Set up auto-refresh every 1 minute when enabled
      interval = setInterval(fetchCustomers, 60000);
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

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Get restaurant name from localStorage
      const user = localStorage.getItem("user");
      const restaurantName = user ? JSON.parse(user).name || "" : "";

      if (!restaurantName) {
        console.error("No restaurant name found in localStorage");
        return;
      }

      console.log("👥 Fetching customers for:", restaurantName);

<<<<<<< HEAD
      const response = await axios.get(`${API_BASE_URL}/api/restaurant/${encodeURIComponent(restaurantName)}/all-customers`);
=======
      const response = await axios.get(`/api/restaurant/${encodeURIComponent(restaurantName)}/all-customers`);
>>>>>>> upstream/master

      console.log("✅ Customers data:", response.data);

      setCustomers(response.data.customers || []);
      setStats(response.data.stats || null);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCustomersCSV = async () => {
    try {
      const user = localStorage.getItem("user");
      const restaurantName = user ? JSON.parse(user).name || "" : "";

      if (!restaurantName) {
        console.error("No restaurant name found");
        return;
      }

      console.log("📥 Downloading customers CSV for:", restaurantName);

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add headers
<<<<<<< HEAD
      csvContent += "Name,Email,Phone,Current Points,Total Redeemed,Redemption Count,Has Redeemed,Join Date,Last Redemption Points,Last Redemption Description\n";

      // Add customer data
      filteredCustomers.forEach(customer => {
        csvContent += `"${customer.name}","${customer.email}","${customer.phone}",${customer.currentPoints},${customer.totalRedeemed},${customer.redemptionCount},"${customer.hasRedeemed ? 'Yes' : 'No'}","${new Date(customer.joinDate).toLocaleDateString()}","${customer.lastRedemption?.points || ''}","${customer.lastRedemption?.description || ''}"\n`;
=======
      csvContent += "Name,Email,Phone,Current Points,Total Redeemed,Redemption Count,Has Redeemed\n";

      // Add customer data
      filteredCustomers.forEach(customer => {
        csvContent += `"${customer.name}","${customer.email}","${customer.phone}",${customer.currentPoints},${customer.totalRedeemed},${customer.redemptionCount},"${customer.hasRedeemed ? 'Yes' : 'No'}"\n`;
>>>>>>> upstream/master
      });

      // Download file
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${restaurantName}_customers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Customers CSV downloaded successfully");
    } catch (error) {
      console.error("❌ Error downloading CSV:", error);
    }
  };

<<<<<<< HEAD
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
=======

>>>>>>> upstream/master

  const getPointsBadgeColor = (points: number) => {
    if (points > 150) return "bg-green-100 text-green-800";
    if (points >= 100) return "bg-blue-100 text-blue-800";
    if (points >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            All customers registered with your restaurant
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
          <Button onClick={fetchCustomers} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={downloadCustomersCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
          <CardDescription>Search by name, email, or phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <span className="text-sm text-muted-foreground">
              {filteredCustomers.length} of {customers.length} customers
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            Complete list of all customers (redeemed and non-redeemed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchTerm ? "No customers found matching your search." : "No customers found."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Current Points</TableHead>
                  <TableHead>Total Redeemed</TableHead>
                  <TableHead>Redemptions</TableHead>
<<<<<<< HEAD
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Redemption</TableHead>
=======
>>>>>>> upstream/master
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id} className={customer.hasHighValueRedemption ? "bg-red-50" : ""}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPointsBadgeColor(customer.currentPoints)}>
                        {customer.currentPoints} pts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{customer.totalRedeemed} pts</span>
                    </TableCell>
                    <TableCell>
                      <span className={customer.hasRedeemed ? "text-green-600" : "text-gray-500"}>
                        {customer.redemptionCount} times
                      </span>
                    </TableCell>
<<<<<<< HEAD
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(customer.joinDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.lastRedemption ? (
                        <div className="text-sm">
                          <div className="font-medium">{customer.lastRedemption.points} pts</div>
                          <div className="text-muted-foreground truncate max-w-32">
                            {customer.lastRedemption.description}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No redemptions</span>
                      )}
                    </TableCell>
=======
>>>>>>> upstream/master
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantCustomers;
