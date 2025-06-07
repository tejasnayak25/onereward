import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, UserCircle, Scan, Plus, Minus, RotateCcw, ArrowRight, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import jsQR from "jsqr";
import { API_BASE_URL } from "@/config/api";

const ScannerApp = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("scan");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pointsValue, setPointsValue] = useState("50");
  const [transactionType, setTransactionType] = useState<"add" | "redeem">("add");
  const [customer, setCustomer] = useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // API_BASE_URL is now imported from config

  const user = JSON.parse(localStorage.getItem("user"));  // Retrieve the user from localStorage

  const findCustomerByPhone = async (phone: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customer/by-phone/${phone}`);
      setCustomer(response.data.data);
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      toast({
        title: "Customer not found",
        description: "No customer found with that phone number.",
        variant: "destructive",
      });
    }
  };

  const handleLookup = () => {
    if (phoneNumber.trim() === "") {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    findCustomerByPhone(phoneNumber);
  };

  const scanForQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Use jsQR to detect QR code
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
      console.log("QR Code detected:", qrCode.data);

      // Stop automatic scanning
      setIsScanning(false);
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }

      try {
        console.log("Sending QR data to backend:", qrCode.data);

        // Send the QR code data to backend to find customer
        const response = await axios.post(`${API_BASE_URL}/api/customer/scan-qr`, {
          qrCodeData: qrCode.data
        });

        console.log("Backend response:", response.data);
        setCustomer(response.data.data);
        toast({
          title: "QR Scan Successful",
          description: `Customer: ${response.data.data.name}`,
        });
      } catch (err) {
        console.error("QR Scan Error:", err);
        console.error("Error response:", err?.response?.data);
        console.error("Error status:", err?.response?.status);
        console.error("Error config:", err?.config);

        let errorMessage = "Customer not found.";

        if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.message) {
          errorMessage = err.message;
        } else if (err?.response?.status) {
          errorMessage = `Server error: ${err.response.status}`;
        }

        toast({
          title: "QR Scan Failed",
          description: `QR Data: "${qrCode.data}" - Error: ${errorMessage}`,
          variant: "destructive",
        });

        // Show detailed error in console
        console.log("=== QR SCAN DEBUG INFO ===");
        console.log("QR Code Data:", qrCode.data);
        console.log("API URL:", `${API_BASE_URL}/api/customer/scan-qr`);
        console.log("Request payload:", { qrCodeData: qrCode.data });
        console.log("========================");

        // Restart scanning after failed attempt
        setTimeout(() => startAutoScan(), 1000);
      }
    }
  };

  const handleScan = async () => {
    await scanForQRCode();
    if (!customer) {
      toast({
        title: "No QR Code Detected",
        description: "Please position the QR code within the scanning area.",
        variant: "destructive",
      });
    }
  };

  const startAutoScan = () => {
    if (scanIntervalRef.current) return; // Already scanning

    setIsScanning(true);
    scanIntervalRef.current = setInterval(() => {
      scanForQRCode();
    }, 500); // Scan every 500ms
  };

  const stopAutoScan = () => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const handleConfirmTransaction = () => {
    setConfirmDialogOpen(true);
  };

  console.log("******* " , user.name);

  const processTransaction = async () => {
    if (!customer) return;
  
    setConfirmDialogOpen(false);
  
    try {
      const updatedPoints = {
        points: parseInt(pointsValue),  
        restaurantName: user.name,     
      };
  

      const requestBody = {
        availablePoints: [updatedPoints],  // Add updated points to the availablePoints array
        type: transactionType,             // Include the transaction type ("add" or "redeem")
      };
  
      // Update the user with the new points and restaurant name
      const response = await fetch(`${API_BASE_URL}/api/user/points/${customer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),  // Send the updated request body
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update points");
      }
  
      const updatedCustomer = await response.json();
      setCustomer(updatedCustomer.customer);
  
      setSuccessDialogOpen(true);
  
      setTimeout(() => {
        setSuccessDialogOpen(false);
        setCustomer(null);
        setPhoneNumber("");
        setPointsValue("50");
      }, 3000);
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  

  const resetTransaction = () => {
    setCustomer(null);
    setPhoneNumber("");
    setPointsValue("50");
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result;
      if (!result) return;

      // Create an image element to load the dropped image
      const img = new Image();
      img.onload = () => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        // Get image data for QR code detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Use jsQR to detect QR code
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrCode) {
          console.log("QR Code detected from dropped image:", qrCode.data);

          // Send the QR code data to backend to find customer
          axios.post(`${API_BASE_URL}/api/customer/scan-qr`, {
            qrCodeData: qrCode.data
          })
          .then((response) => {
            setCustomer(response.data.data);
            toast({
              title: "QR Scan Successful",
              description: `Customer: ${response.data.data.name}`,
            });
          })
          .catch((err) => {
            toast({
              title: "QR Scan Failed",
              description: err?.response?.data?.message || "Customer not found.",
              variant: "destructive",
            });
          });
        } else {
          toast({
            title: "No QR Code Found",
            description: "Could not detect a QR code in the uploaded image.",
            variant: "destructive",
          });
        }
      };

      img.src = result.toString();
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Start auto-scanning when video is ready
            videoRef.current.onloadedmetadata = () => {
              setTimeout(() => startAutoScan(), 1000);
            };
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          toast({
            title: "Camera Error",
            description: "Unable to access camera. Please check permissions.",
            variant: "destructive",
          });
        }
      }
    };

    if (activeTab === "scan") {
      setIsCameraActive(true);
      setupCamera();
    } else {
      setIsCameraActive(false);
      stopAutoScan();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }

    return () => {
      stopAutoScan();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeTab, isCameraActive, toast]);

  return (
    <div className="container mx-auto max-w-md animate-fade-in">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">Point Scanner</CardTitle>
          <CardDescription className="text-center">
            Scan QR codes or enter phone numbers to add or redeem points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="scan">
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR
              </TabsTrigger>
              <TabsTrigger value="phone">
                <UserCircle className="mr-2 h-4 w-4" />
                Phone Lookup
              </TabsTrigger>
            </TabsList>

            {/* Scan QR Content */}
            <TabsContent value="scan" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <div className="flex flex-col items-center space-y-4">
                {/* QR Scanner Camera View */}
                <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                  {isCameraActive ? (
                    <>
                      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
                      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "none" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 border-2 border-primary rounded-lg border-opacity-50"></div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Scan className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleScan}>
                    <Scan className="mr-2 h-4 w-4" />
                    Scan Once
                  </Button>
                  <Button
                    variant={isScanning ? "destructive" : "outline"}
                    onClick={isScanning ? stopAutoScan : startAutoScan}
                  >
                    {isScanning ? "Stop Auto" : "Auto Scan"}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  {isScanning ? "🔍 Auto-scanning for QR codes..." : "Position the QR code within the scanning area"}
                </p>

                {/* Drag and Drop Area */}
                <div
                  className={`w-full p-4 text-center border-2 border-dashed rounded-lg transition ${dragOver ? "border-primary bg-muted" : "border-muted"}`}
                >
                  <p className="text-sm text-muted-foreground">Or drag and drop a QR code image here</p>
                </div>
              </div>
            </TabsContent>

            {/* Phone Lookup */}
            <TabsContent value="phone">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter customer's phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handleLookup}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Look Up Customer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Customer Details and Transaction Form */}
      {customer && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Customer Found</CardTitle>
            <CardDescription>Manage points for this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-800">{customer.name}</div>
                  <div className="text-sm text-green-600">{customer.phone}</div>
                  <div className="text-sm text-green-600">
                    {(() => {
                      const restaurantPoints = customer?.availablePoints?.find(
                        point => point.restaurantName === user?.name
                      );
                      return restaurantPoints ? `${restaurantPoints.points} Available points` : "0 Available points";
                    })()}
                  </div>
                  <div className="text-xs text-green-500 mt-1">✓ Customer Found</div>
                </div>
              </div>



              {customer.qrCode && (
                <div className="flex flex-col items-center">
                  <img src={`data:image/png;base64,${customer.qrCode}`} alt="Customer QR Code" className="w-32 h-32 border rounded mb-2" />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:image/png;base64,${customer.qrCode}`;
                      link.download = `${customer.name}_qr.png`;
                      link.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="points">Points Amount</Label>
                  <Input
                    id="points"
                    type="number"
                    value={pointsValue}
                    onChange={(e) => setPointsValue(e.target.value)}
                    min="1"
                    placeholder="Enter points amount"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Transaction Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={transactionType === "add" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setTransactionType("add")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Points
                    </Button>
                    <Button
                      variant={transactionType === "redeem" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setTransactionType("redeem")}
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Redeem Points
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetTransaction}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleConfirmTransaction}>
              {transactionType === "add" ? "Add Points" : "Redeem Points"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review the details before confirming
            </DialogDescription>
          </DialogHeader>

          {customer && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="font-medium">{customer.name}</div>

                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{customer.phone}</div>

                <div className="text-sm text-muted-foreground">Transaction Type</div>
                <div className="font-medium capitalize">
                  <span className={transactionType === "add" ? "text-green-600" : "text-red-600"}>
                    {transactionType === "add" ? "Add" : "Redeem"} Points
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">Points Amount</div>
                <div className="font-medium">{pointsValue}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processTransaction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-4">
              <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="mb-2">Transaction Complete</DialogTitle>
            <DialogDescription>
              {transactionType === "add"
                ? `${pointsValue} points have been added`
                : `${pointsValue} points have been redeemed`}
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScannerApp;
