import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "~/client/api";
import { useAuth, useToast } from "~/client/utils";

import {
  Shield,
  User,
  LogOut,
  Calendar,
  Clock,
  Wifi,
  Database,
  Activity,
  ChevronRight,
  Zap,
  Globe,
  Tag,
  Gift,
  Percent,
  Plus,
  Trash,
  Edit,
  RefreshCw,
  Users,
  Mail,
  Eye,
  EyeOff,
  Image,
  FileText,
} from "lucide-react";
import Button from "~/components/Button";
import Card from "~/components/Card";
import Badge from "~/components/Badge";
import Navbar from "~/components/Navbar";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Alert,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Checkbox,
  Textarea,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui";

// Auth wrapper component
function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = useAuth({ required: true });

  if (auth.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Landing page with login/registration
// Promo Code Input Component
function PromoCodeInput({ onApply }: { onApply: (code: string) => void }) {
  const [promoCode, setPromoCode] = useState("");

  return (
    <div className="flex space-x-2 mt-4">
      <Input
        placeholder="Enter promo code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        className="flex-1"
      />
      <Button
        onClick={() => {
          if (promoCode.trim()) {
            onApply(promoCode.trim());
            setPromoCode("");
          }
        }}
        disabled={!promoCode.trim()}
      >
        Apply
      </Button>
    </div>
  );
}

function LandingPage() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const location = useLocation();
  const [promoCode, setPromoCode] = useState("");
  const { toast } = useToast();

  const applyPromoMutation = useMutation(apiClient.applyDiscountCode, {
    onSuccess: (data) => {
      if (data.success && data.discount) {
        toast({
          title: "Promo code applied!",
          description: `${data.discount.isGift ? "Gift" : "Discount"}: ${data.discount.isGift ? data.discount.giftDetails : `${data.discount.percentage}% off`}`,
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: "The promo code you entered is invalid or expired.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to dashboard if already logged in
  if (auth.status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="logo-container justify-center mb-6">
            <Shield className="h-6 w-6 logo-icon" />
            <span>X-Ray Core VPN</span>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Manage your VPN subscriptions in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
              <Button
                className="w-full"
                onClick={() => auth.signIn({ provider: "AC1" })}
              >
                Sign In
              </Button>

              <div className="mt-4">
                <Separator className="my-4" />
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Have a promo code?
                  </span>
                </div>
                <PromoCodeInput
                  onApply={(code) => {
                    setPromoCode(code);
                    applyPromoMutation.mutate({ code });
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="m@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button
                className="w-full"
                onClick={() => auth.signIn({ provider: "AC1" })}
              >
                Create Account
              </Button>

              <div className="mt-4">
                <Separator className="my-4" />
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Have a promo code?
                  </span>
                </div>
                <PromoCodeInput
                  onApply={(code) => {
                    setPromoCode(code);
                    applyPromoMutation.mutate({ code });
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Promo Code Section for Dashboard
function DashboardPromoSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = useState("");

  const { data: userDiscounts = [] } = useQuery(
    ["userDiscounts"],
    apiClient.getUserDiscounts,
  );

  const applyPromoMutation = useMutation(apiClient.applyDiscountCode, {
    onSuccess: (data) => {
      if (data.success && data.discount) {
        toast({
          title: "Promo code applied!",
          description: `${data.discount.isGift ? "Gift" : "Discount"}: ${data.discount.isGift ? data.discount.giftDetails : `${data.discount.percentage}% off`}`,
        });
        void queryClient.invalidateQueries(["userDiscounts"]);
        void queryClient.invalidateQueries(["subscriptions"]);
        void queryClient.invalidateQueries(["subscriptionStats"]);
        setPromoCode("");
      } else {
        toast({
          title: "Invalid promo code",
          description: "The promo code you entered is invalid or expired.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply promo code. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Promo Codes</CardTitle>
        <CardDescription>
          Apply a promo code to get discounts or special offers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userDiscounts.length > 0 ? (
            <div className="space-y-2">
              <Label>Your Available Discounts</Label>
              <div className="flex flex-wrap gap-2">
                {userDiscounts.map((discount) => (
                  <Badge
                    key={discount.id}
                    variant="outline"
                    className="flex items-center gap-1 p-2"
                  >
                    {discount.isGift ? (
                      <Gift className="h-3 w-3 text-primary" />
                    ) : (
                      <Percent className="h-3 w-3 text-primary" />
                    )}
                    <span>
                      {discount.code}:{" "}
                      {discount.isGift
                        ? discount.giftDetails
                        : `${discount.percentage}% off`}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="promo-code">Enter a Promo Code</Label>
            <div className="flex space-x-2">
              <Input
                id="promo-code"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (promoCode.trim()) {
                    applyPromoMutation.mutate({ code: promoCode.trim() });
                  }
                }}
                disabled={!promoCode.trim() || applyPromoMutation.isLoading}
              >
                {applyPromoMutation.isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Tag className="h-4 w-4 mr-2" />
                )}
                Apply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Admin Coupon Management Component
function AdminCouponManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    percentage: 10,
    expiresAt: "",
    targetRole: "",
    description: "",
    isGift: false,
    giftDetails: "",
    maxUsageCount: "", // Empty string means unlimited
  });

  const { data: discounts = [] } = useQuery(
    ["adminDiscounts"],
    apiClient.getAllDiscounts,
  );

  const { data: discountStats } = useQuery(
    ["discountStats"],
    apiClient.getDiscountStats,
  );

  const { data: users = [] } = useQuery(["users"], () => apiClient.getUsers());

  const generateCodeMutation = useMutation(apiClient.generatePromoCode, {
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, code: data.code }));
    },
  });

  const createDiscountMutation = useMutation(apiClient.setDiscount, {
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({
        code: "",
        percentage: 10,
        expiresAt: "",
        targetRole: "",
        description: "",
        isGift: false,
        giftDetails: "",
      });
      void queryClient.invalidateQueries(["adminDiscounts"]);
      void queryClient.invalidateQueries(["discountStats"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create coupon: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const updateDiscountMutation = useMutation(apiClient.updateDiscount, {
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedDiscount(null);
      void queryClient.invalidateQueries(["adminDiscounts"]);
      void queryClient.invalidateQueries(["discountStats"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update coupon: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const deleteDiscountMutation = useMutation(apiClient.deleteDiscount, {
    onSuccess: () => {
      toast({ title: "Success", description: "Coupon deleted successfully" });
      void queryClient.invalidateQueries(["adminDiscounts"]);
      void queryClient.invalidateQueries(["discountStats"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete coupon: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleEditDiscount = (discount: any) => {
    setSelectedDiscount(discount);
    setFormData({
      code: discount.code,
      percentage: discount.percentage,
      expiresAt: discount.expiresAt
        ? new Date(discount.expiresAt).toISOString().split("T")[0]
        : "",
      targetRole: discount.targetRole || "",
      description: discount.description || "",
      isGift: discount.isGift || false,
      giftDetails: discount.giftDetails || "",
      maxUsageCount: discount.maxUsageCount ? String(discount.maxUsageCount) : "",
    } as any);
    setIsEditDialogOpen(true);
  };

  const handleGenerateCode = () => {
    generateCodeMutation.mutate({});
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
                <p className="text-2xl font-bold">
                  {discountStats?.totalCount || 0}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Tag className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Coupons</p>
                <p className="text-2xl font-bold">
                  {discountStats?.activeCount || 0}
                </p>
              </div>
              <div className="p-2 bg-success/10 rounded-full">
                <Zap className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired Coupons</p>
                <p className="text-2xl font-bold">
                  {discountStats?.expiredCount || 0}
                </p>
              </div>
              <div className="p-2 bg-destructive/10 rounded-full">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">
                  {discountStats?.totalUsageCount || 0}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Coupon Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Coupon List */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No coupons found. Create your first coupon to get started.
                  </TableCell>
                </TableRow>
              ) : (
                discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      {discount.code}
                    </TableCell>
                    <TableCell>
                      {discount.isGift ? (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20"
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Gift
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          <Percent className="h-3 w-3 mr-1" />
                          Discount
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.isGift
                        ? discount.giftDetails
                        : `${discount.percentage}%`}
                    </TableCell>
                    <TableCell>
                      {discount.userId ? (
                        <Badge variant="outline" className="bg-secondary/50">
                          <User className="h-3 w-3 mr-1" />
                          Specific User
                        </Badge>
                      ) : discount.targetRole ? (
                        <Badge variant="outline" className="bg-secondary/50">
                          <Users className="h-3 w-3 mr-1" />
                          {discount.targetRole}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-secondary/50">
                          <Globe className="h-3 w-3 mr-1" />
                          All Users
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.expiresAt
                        ? new Date(discount.expiresAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {!discount.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20"
                        >
                          Inactive
                        </Badge>
                      ) : discount.expiresAt &&
                        new Date(discount.expiresAt) < new Date() ? (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20"
                        >
                          Expired
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{discount.usageCount || 0}</TableCell>
                    <TableCell>
                      {discount.maxUsageCount ? discount.maxUsageCount : "∞"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDiscount(discount)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this coupon?",
                              )
                            ) {
                              deleteDiscountMutation.mutate({
                                id: discount.id,
                              });
                            }
                          }}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a new coupon code for your users
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SUMMER2023"
                  className="uppercase"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateCode}
                disabled={generateCodeMutation.isLoading}
              >
                {generateCodeMutation.isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon-type">Coupon Type</Label>
                <Select
                  value={formData.isGift ? "gift" : "discount"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isGift: value === "gift" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-2" />
                        Discount
                      </div>
                    </SelectItem>
                    <SelectItem value="gift">
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 mr-2" />
                        Gift/Bonus
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.isGift ? (
                <div>
                  <Label htmlFor="gift-details">Gift Details</Label>
                  <Input
                    id="gift-details"
                    value={formData.giftDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, giftDetails: e.target.value })
                    }
                    placeholder="Free month of service"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="percentage">Discount Percentage</Label>
                  <div className="flex items-center">
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          percentage: Number(e.target.value),
                        })
                      }
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="expiration">Expiration Date (Optional)</Label>
              <Input
                id="expiration"
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="target-role">Target Role (Optional)</Label>
              <Select
                value={formData.targetRole || "all"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    targetRole: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter a description for this coupon"
              />
            </div>
            
            <div>
              <Label htmlFor="max-usage">Usage Limit (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="max-usage"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.maxUsageCount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsageCount: e.target.value })
                  }
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setFormData({ ...formData, maxUsageCount: "" })}
                >
                  Unlimited
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for unlimited uses until expiration
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => createDiscountMutation.mutate({
                ...formData,
                maxUsageCount: formData.maxUsageCount ? parseInt(formData.maxUsageCount) : undefined
              })}
              disabled={
                !formData.code.trim() || createDiscountMutation.isLoading
              }
            >
              {createDiscountMutation.isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-code">Coupon Code</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="SUMMER2023"
                className="uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-coupon-type">Coupon Type</Label>
                <Select
                  value={formData.isGift ? "gift" : "discount"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isGift: value === "gift" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 mr-2" />
                        Discount
                      </div>
                    </SelectItem>
                    <SelectItem value="gift">
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 mr-2" />
                        Gift/Bonus
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.isGift ? (
                <div>
                  <Label htmlFor="edit-gift-details">Gift Details</Label>
                  <Input
                    id="edit-gift-details"
                    value={formData.giftDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, giftDetails: e.target.value })
                    }
                    placeholder="Free month of service"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="edit-percentage">Discount Percentage</Label>
                  <div className="flex items-center">
                    <Input
                      id="edit-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          percentage: Number(e.target.value),
                        })
                      }
                    />
                    <span className="ml-2">%</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="edit-expiration">
                Expiration Date (Optional)
              </Label>
              <Input
                id="edit-expiration"
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-target-role">Target Role (Optional)</Label>
              <Select
                value={formData.targetRole || "all"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    targetRole: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter a description for this coupon"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-max-usage">Usage Limit (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="edit-max-usage"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formData.maxUsageCount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsageCount: e.target.value })
                  }
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setFormData({ ...formData, maxUsageCount: "" })}
                >
                  Unlimited
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for unlimited uses until expiration
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={selectedDiscount?.isActive}
                onCheckedChange={(checked) => {
                  if (selectedDiscount) {
                    updateDiscountMutation.mutate({
                      id: selectedDiscount.id,
                      isActive: checked,
                    });
                  }
                }}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedDiscount) {
                  updateDiscountMutation.mutate({
                    id: selectedDiscount.id,
                    ...formData,
                    expiresAt: formData.expiresAt || null,
                    targetRole: formData.targetRole || null,
                    description: formData.description || null,
                    giftDetails: formData.giftDetails || null,
                    maxUsageCount: formData.maxUsageCount ? parseInt(formData.maxUsageCount) : null,
                  });
                }
              }}
              disabled={
                !formData.code.trim() || updateDiscountMutation.isLoading
              }
            >
              {updateDiscountMutation.isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dashboard page
function Dashboard() {
  const { data: user } = useQuery(["currentUser"], apiClient.getCurrentUser);
  const { data: subscriptions = [] } = useQuery(
    ["subscriptions"],
    apiClient.getUserSubscriptions,
  );

  const { data: stats } = useQuery(
    ["subscriptionStats"],
    apiClient.getSubscriptionStats,
  );
  
  const { data: news = [] } = useQuery(
    ["news"],
    () => apiClient.getNews({ onlyPublished: true }),
  );

  // Determine number of stat cards to show based on user role
  const isAdmin = user?.isAdmin;

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 ${isAdmin ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4 mb-8`}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold">{stats?.activeCount || 0}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Subscriptions - only visible to admins */}
        {isAdmin && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Subscriptions
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.totalSubscriptions || 0}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Database className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bandwidth Used</p>
                <p className="text-2xl font-bold">
                  {stats?.totalBandwidth.toFixed(1) || 0} GB
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Wifi className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{stats?.expiredCount || 0}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* News Feed Section */}
      <h2 className="text-xl font-semibold mb-4">News Feed</h2>
      <Card className="mb-8">
        <CardContent className="p-4">
          {news.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No news available at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.slice(0, 3).map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(item.publishDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm">{item.content}</p>
                </div>
              ))}
              {news.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="link" size="sm">
                    View All News
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Promo Code Section */}
      <DashboardPromoSection />

      {/* Special Offers Section */}
      <h2 className="text-xl font-semibold mb-4">Special Offers</h2>
      <div className="mb-8">
        <OffersDisplay />
      </div>

      {/* Subscriptions List */}
      <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You don't have any subscriptions yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">
                        {subscription.planName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {subscription.ipAddress || "No IP assigned"}
                      </p>
                    </div>
                    <div
                      className={`status-badge status-${subscription.status.toLowerCase()}`}
                    >
                      {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Start Date
                        </p>
                        <p className="text-sm">
                          {new Date(
                            subscription.startDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          End Date
                        </p>
                        <p className="text-sm">
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Wifi className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Bandwidth Used
                        </p>
                        <p className="text-sm">
                          {subscription.bandwidth.toFixed(1)} GB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {subscription.status === "active"
                        ? `${Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining`
                        : "Subscription expired"}
                    </span>
                  </div>

                  <Button variant="ghost" size="sm" className="text-xs">
                    Details <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Profile page
function Profile() {
  const { data: user } = useQuery(["currentUser"], apiClient.getCurrentUser);

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user?.name || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="" disabled />
            <p className="text-xs text-muted-foreground">
              Email is managed through your account settings
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Layout component with navigation
function Layout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return (
    <div className="min-h-screen bg-background">
      {auth.status === "authenticated" && <Navbar />}

      <main className="py-6">{children}</main>

      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="logo-container mb-4 md:mb-0">
              <Shield className="h-4 w-4 logo-icon" />
              <span className="text-sm">X-Ray Core VPN</span>
            </div>
            <div className="flex items-center space-x-4">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                © 2023 X-Ray Core VPN. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Offers Display Component
function OffersDisplay() {
  const { data: offers = [] } = useQuery(["offers"], () =>
    apiClient.getAllOffers(),
  );

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No offers available at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <Card key={offer.id} className="overflow-hidden flex flex-col">
          {offer.imageUrl && (
            <div className="aspect-video overflow-hidden">
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle>{offer.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground mb-4">{offer.description}</p>
            <p className="text-lg font-bold">${offer.price.toFixed(2)}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">View Details</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Admin Offers Management Component
function AdminOffersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    price: 0,
    isVisible: true,
    priority: 0,
    startDate: "",
    endDate: "",
  });

  const { data: offers = [] } = useQuery(["adminOffers"], () =>
    apiClient.getAllOffers({ includeHidden: true }),
  );

  const createOfferMutation = useMutation(apiClient.createOffer, {
    onSuccess: () => {
      toast({ title: "Success", description: "Offer created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        price: 0,
        isVisible: true,
        priority: 0,
        startDate: "",
        endDate: "",
      });
      void queryClient.invalidateQueries(["adminOffers"]);
      void queryClient.invalidateQueries(["offers"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create offer: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const updateOfferMutation = useMutation(apiClient.updateOffer, {
    onSuccess: () => {
      toast({ title: "Success", description: "Offer updated successfully" });
      setIsEditDialogOpen(false);
      setSelectedOffer(null);
      void queryClient.invalidateQueries(["adminOffers"]);
      void queryClient.invalidateQueries(["offers"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update offer: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const deleteOfferMutation = useMutation(apiClient.deleteOffer, {
    onSuccess: () => {
      toast({ title: "Success", description: "Offer deleted successfully" });
      void queryClient.invalidateQueries(["adminOffers"]);
      void queryClient.invalidateQueries(["offers"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete offer: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  const handleEditOffer = (offer: any) => {
    setSelectedOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      imageUrl: offer.imageUrl || "",
      price: offer.price,
      isVisible: offer.isVisible,
      priority: offer.priority,
      startDate: offer.startDate
        ? new Date(offer.startDate).toISOString().split("T")[0]
        : "",
      endDate: offer.endDate
        ? new Date(offer.endDate).toISOString().split("T")[0]
        : "",
    } as any);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Offer Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {/* Offers List */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No offers found. Create your first offer to get started.
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>${offer.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {offer.isVisible ? (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/20"
                        >
                          Visible
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20"
                        >
                          Hidden
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{offer.priority}</TableCell>
                    <TableCell>
                      {offer.startDate || offer.endDate ? (
                        <span className="text-xs">
                          {offer.startDate
                            ? new Date(offer.startDate).toLocaleDateString()
                            : "Any"}{" "}
                          -{" "}
                          {offer.endDate
                            ? new Date(offer.endDate).toLocaleDateString()
                            : "Any"}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Always available
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOffer(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this offer?",
                              )
                            ) {
                              deleteOfferMutation.mutate({ id: offer.id });
                            }
                          }}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Offer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
            <DialogDescription>
              Create a new offer to display to users
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Premium VPN Package"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description of the offer"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-end space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVisible"
                    checked={formData.isVisible}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isVisible: checked === true })
                    }
                  />
                  <Label htmlFor="isVisible">Visible</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => createOfferMutation.mutate(formData)}
              disabled={
                !formData.title.trim() ||
                !formData.description.trim() ||
                createOfferMutation.isLoading
              }
            >
              {createOfferMutation.isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>Update offer details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-imageUrl">Image URL (Optional)</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  min="0"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-end space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isVisible"
                    checked={formData.isVisible}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isVisible: checked === true })
                    }
                  />
                  <Label htmlFor="edit-isVisible">Visible</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date (Optional)</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-endDate">End Date (Optional)</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedOffer) {
                  updateOfferMutation.mutate({
                    id: selectedOffer.id,
                    ...formData,
                  });
                }
              }}
              disabled={
                !formData.title.trim() ||
                !formData.description.trim() ||
                updateOfferMutation.isLoading
              }
            >
              {updateOfferMutation.isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Newsletter Component
function AdminNewsletterComponent() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    targetRole: "",
  });

  const sendNewsletterMutation = useMutation(apiClient.sendAdminNewsletter, {
    onSuccess: (data) => {
      toast({
        title: "Newsletter Sent",
        description: `Successfully sent to ${data.sentCount} of ${data.totalCount} users.`,
      });
      setFormData({
        subject: "",
        content: "",
        targetRole: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send newsletter: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Send Newsletter</h2>

      <Card>
        <CardHeader>
          <CardTitle>Email Newsletter</CardTitle>
          <CardDescription>
            Send an email newsletter to your users
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newsletter-subject">Subject</Label>
            <Input
              id="newsletter-subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Important Update: New VPN Features"
            />
          </div>

          <div>
            <Label htmlFor="newsletter-content">Content (Markdown)</Label>
            <Textarea
              id="newsletter-content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="# Hello Subscribers\n\nWe're excited to announce..."
              className="min-h-[200px] font-mono"
            />
          </div>

          <div>
            <Label htmlFor="newsletter-target">Target Audience</Label>
            <Select
              value={formData.targetRole || "all"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  targetRole: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="regular">Regular users</SelectItem>
                <SelectItem value="tester">Testers</SelectItem>
                <SelectItem value="VIP">VIP users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => sendNewsletterMutation.mutate(formData)}
            disabled={
              !formData.subject.trim() ||
              !formData.content.trim() ||
              sendNewsletterMutation.isLoading
            }
          >
            {sendNewsletterMutation.isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Send Newsletter
          </Button>
        </CardFooter>
      </Card>

      <Alert>
        <AlertDescription>
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Newsletters will only be sent to users who
            have:
            <ul className="list-disc ml-5 mt-2">
              <li>A verified email address</li>
              <li>Not opted out of newsletters</li>
              <li>The selected role (if specified)</li>
            </ul>
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Admin Panel
function AdminPanel() {
  const [activeTab, setActiveTab] = useState("coupons");

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="mt-6">
          <AdminCouponManagement />
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <AdminOffersManagement />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                User management features will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Subscription Management
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Subscription management features will be implemented in a future
                update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="mt-6">
          <AdminNewsletterComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
