import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Loader2,
  Clock,
  Edit3,
  Package,
  TrendingUp,
  Award,
  Sparkles,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../lib/auth-context';
import { toast } from 'sonner';

export default function ShopProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    shopLocation: user?.shopLocation || '',
    waitTime: user?.waitTime || '15',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      shopLocation: formData.shopLocation,
      waitTime: formData.waitTime,
    });
    
    if (result.success) {
      toast.success('Shop profile updated successfully!');
      await refreshUser();
      setIsEditing(false);
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
    
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      shopLocation: user?.shopLocation || '',
      waitTime: user?.waitTime || '15',
    });
    setIsEditing(false);
  };

  const stats = {
    totalOrders: 128,
    completedOrders: 115,
    rating: 4.8,
    revenue: 15420
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FCFC] via-[#E6F1F0]/30 to-[#F8FCFC]">
      {/* Modern Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-[#80B9B6]/10 sticky top-0 z-50 shadow-lg shadow-[#00736D]/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/shop')}
                  className="hover:bg-[#E6F1F0] rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5 text-[#00736D]" />
                </Button>
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#002E2C] to-[#00736D] bg-clip-text text-transparent">
                  Shop Profile
                </h1>
                <p className="text-xs sm:text-sm text-[#00736D]/80 font-medium">Manage your shop information</p>
              </div>
            </div>
            {!isEditing && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="gap-2 bg-gradient-to-r from-[#00736D] to-[#002E2C] hover:shadow-xl hover:shadow-[#00736D]/20 rounded-xl font-semibold"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-white to-[#E6F1F0]/20 border-[#80B9B6]/20 shadow-xl shadow-[#00736D]/10 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00736D]/5 to-transparent rounded-full -mr-32 -mt-32"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00736D] to-[#002E2C] rounded-3xl blur-xl opacity-30"></div>
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-2xl relative">
                  <AvatarFallback className="bg-gradient-to-br from-[#00736D] to-[#002E2C] text-white text-4xl font-black">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#00736D] to-[#002E2C] rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-[#002E2C] mb-2">{user?.name}</h2>
                <p className="text-[#00736D] font-semibold mb-4 flex items-center justify-center sm:justify-start gap-2">
                  <Store className="w-4 h-4" />
                  Print Shop Partner
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">{stats.rating} Rating</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#E6F1F0] px-3 py-1 rounded-full">
                    <Package className="w-4 h-4 text-[#00736D]" />
                    <span className="text-sm font-bold text-[#002E2C]">{stats.totalOrders} Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase">Total</p>
                  <p className="text-2xl font-black text-blue-700">{stats.totalOrders}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase">Done</p>
                  <p className="text-2xl font-black text-emerald-700">{stats.completedOrders}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-5 bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-bold uppercase">Rating</p>
                  <p className="text-2xl font-black text-amber-700">{stats.rating}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-5 bg-gradient-to-br from-[#E6F1F0] to-white border-[#80B9B6]/20 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#00736D]/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-[#00736D]" />
                </div>
                <div>
                  <p className="text-xs text-[#00736D] font-bold uppercase">Revenue</p>
                  <p className="text-2xl font-black text-[#002E2C]">₱{stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Profile Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-[#80B9B6]/20 shadow-xl shadow-[#00736D]/5">
            <h3 className="text-xl font-bold text-[#002E2C] mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-[#00736D]" />
              Shop Information
            </h3>

            <div className="space-y-5">
              {/* Shop Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-[#002E2C] uppercase text-xs tracking-wide">
                  Shop Name
                </Label>
                {isEditing ? (
                  <div className="relative group">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#80B9B6] group-focus-within:text-[#00736D]" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-12 h-14 border-2 border-[#80B9B6]/20 focus:border-[#00736D] focus:ring-4 focus:ring-[#00736D]/10 rounded-xl font-semibold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-[#E6F1F0]/30 rounded-xl border-2 border-[#E6F1F0]">
                    <Store className="w-5 h-5 text-[#00736D]" />
                    <p className="text-[#002E2C] font-bold">{formData.name}</p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#002E2C] uppercase text-xs tracking-wide">
                  Email Address
                </Label>
                <div className="flex items-center gap-3 p-4 bg-[#E6F1F0]/30 rounded-xl border-2 border-[#E6F1F0]">
                  <Mail className="w-5 h-5 text-[#00736D]" />
                  <p className="text-[#002E2C] font-semibold">{formData.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold text-[#002E2C] uppercase text-xs tracking-wide">
                  Contact Number
                </Label>
                {isEditing ? (
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#80B9B6] group-focus-within:text-[#00736D]" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+63 912 345 6789"
                      className="pl-12 h-14 border-2 border-[#80B9B6]/20 focus:border-[#00736D] focus:ring-4 focus:ring-[#00736D]/10 rounded-xl font-semibold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-[#E6F1F0]/30 rounded-xl border-2 border-[#E6F1F0]">
                    <Phone className="w-5 h-5 text-[#00736D]" />
                    <p className="text-[#002E2C] font-bold">{formData.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-bold text-[#002E2C] uppercase text-xs tracking-wide">
                  Shop Address
                </Label>
                {isEditing ? (
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-[#80B9B6] group-focus-within:text-[#00736D]" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your shop address"
                      className="pl-12 h-14 border-2 border-[#80B9B6]/20 focus:border-[#00736D] focus:ring-4 focus:ring-[#00736D]/10 rounded-xl font-semibold"
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-[#E6F1F0]/30 rounded-xl border-2 border-[#E6F1F0]">
                    <MapPin className="w-5 h-5 text-[#00736D] mt-0.5" />
                    <p className="text-[#002E2C] font-bold">{formData.address || 'Not provided'}</p>
                  </div>
                )}
              </div>

              {/* Wait Time */}
              <div className="space-y-2">
                <Label htmlFor="waitTime" className="text-sm font-bold text-[#002E2C] uppercase text-xs tracking-wide">
                  Average Wait Time
                </Label>
                {isEditing ? (
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#80B9B6] group-focus-within:text-[#00736D]" />
                    <Select value={formData.waitTime} onValueChange={(value) => setFormData({ ...formData, waitTime: value })}>
                      <SelectTrigger className="pl-12 h-14 border-2 border-[#80B9B6]/20 focus:border-[#00736D] focus:ring-4 focus:ring-[#00736D]/10 rounded-xl font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-[#E6F1F0]/30 rounded-xl border-2 border-[#E6F1F0]">
                    <Clock className="w-5 h-5 text-[#00736D]" />
                    <p className="text-[#002E2C] font-bold">{formData.waitTime} minutes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mt-8"
              >
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 h-14 bg-gradient-to-r from-[#00736D] to-[#002E2C] hover:shadow-2xl hover:shadow-[#00736D]/30 text-white font-bold rounded-xl"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 h-14 border-2 border-[#80B9B6]/30 hover:bg-[#E6F1F0] font-bold rounded-xl"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
