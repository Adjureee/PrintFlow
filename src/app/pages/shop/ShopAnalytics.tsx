import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Banknote,
  Package,
  Users,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

// Mock analytics data
const analyticsData = {
  daily: [
    { date: '2026-03-25', orders: 12, revenue: 580, bw: 8, color: 4 },
    { date: '2026-03-26', orders: 15, revenue: 720, bw: 10, color: 5 },
    { date: '2026-03-27', orders: 18, revenue: 890, bw: 12, color: 6 },
    { date: '2026-03-28', orders: 10, revenue: 450, bw: 7, color: 3 },
    { date: '2026-03-29', orders: 20, revenue: 1050, bw: 13, color: 7 },
    { date: '2026-03-30', orders: 16, revenue: 780, bw: 11, color: 5 },
    { date: '2026-04-01', orders: 22, revenue: 1180, bw: 14, color: 8 },
  ],
  topStudents: [
    { name: 'Maria Santos', studentId: 'STU-2024-001', orders: 15, spent: 750 },
    { name: 'John Dela Cruz', studentId: 'STU-2024-002', orders: 12, spent: 600 },
    { name: 'Sarah Johnson', studentId: 'STU-2024-003', orders: 10, spent: 520 },
    { name: 'Mike Chen', studentId: 'STU-2024-004', orders: 8, spent: 380 },
    { name: 'Anna Reyes', studentId: 'STU-2024-005', orders: 7, spent: 340 },
  ],
  summary: {
    totalOrders: 113,
    totalRevenue: 5650,
    avgOrderValue: 50,
    bwPercentage: 65,
    colorPercentage: 35,
    completionRate: 94,
  }
};

export default function ShopAnalytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7days');

  const handleExportCSV = (type: 'orders' | 'students' | 'daily') => {
    let csvContent = '';
    let filename = '';

    if (type === 'orders') {
      // Export all orders
      csvContent = 'Date,Order ID,Student Name,Student ID,File Name,Type,Copies,Amount,Status\\n';
      // Mock order data for export
      const orders = [
        ['2026-04-01', 'ORD-001', 'John Doe', 'STU-2024-001', 'Assignment.pdf', 'B&W', '5', '25', 'Completed'],
        ['2026-04-01', 'ORD-002', 'Jane Smith', 'STU-2024-002', 'Research.docx', 'Color', '10', '150', 'Completed'],
        ['2026-04-01', 'ORD-003', 'Mike Johnson', 'STU-2024-003', 'Slides.pdf', 'Color', '3', '45', 'Ready'],
      ];
      orders.forEach(order => {
        csvContent += order.join(',') + '\\n';
      });
      filename = 'orders_export.csv';
    } else if (type === 'students') {
      // Export student analytics
      csvContent = 'Student Name,Student ID,Total Orders,Total Spent\\n';
      analyticsData.topStudents.forEach(student => {
        csvContent += `${student.name},${student.studentId},${student.orders},₱${student.spent}\\n`;
      });
      filename = 'student_analytics.csv';
    } else if (type === 'daily') {
      // Export daily summary
      csvContent = 'Date,Orders,Revenue,B&W Orders,Color Orders\\n';
      analyticsData.daily.forEach(day => {
        csvContent += `${day.date},${day.orders},₱${day.revenue},${day.bw},${day.color}\\n`;
      });
      filename = 'daily_summary.csv';
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filename} downloaded successfully!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-white to-[#E6F1F0]">
      {/* Modern Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-[#80B9B6]/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/shop')}
                className="gap-2 hover:bg-[#E6F1F0] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00736D] to-[#002E2C] bg-clip-text text-transparent">
                  Analytics & Reports
                </h1>
                <p className="text-sm text-gray-600 font-medium">View performance metrics and export data</p>
              </div>
            </div>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] border-[#80B9B6]/30 focus:border-[#00736D]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-200/40 rounded-xl">
                    <Package className="w-6 h-6 text-blue-700" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-blue-700">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-bold">+12%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-700 font-semibold mb-2">Total Orders</p>
                <p className="text-4xl font-bold text-blue-800 mb-1">{analyticsData.summary.totalOrders}</p>
                <p className="text-xs text-blue-600">from last period</p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-200/40 rounded-xl">
                    <Banknote className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-bold">+18%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-emerald-700 font-semibold mb-2">Total Revenue</p>
                <p className="text-4xl font-bold text-emerald-800 mb-1">₱{analyticsData.summary.totalRevenue}</p>
                <p className="text-xs text-emerald-600">from last period</p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/30 border-[#80B9B6]/30 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#80B9B6]/20 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#80B9B6]/40 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-[#00736D]" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[#00736D]">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-bold">+5%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#00736D] font-semibold mb-2">Avg Order Value</p>
                <p className="text-4xl font-bold text-[#002E2C] mb-1">₱{analyticsData.summary.avgOrderValue}</p>
                <p className="text-xs text-[#00736D]">from last period</p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200/50 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-violet-200/40 rounded-xl">
                    <PieChart className="w-6 h-6 text-violet-700" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-violet-700">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-bold">+3%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-violet-700 font-semibold mb-2">Completion Rate</p>
                <p className="text-4xl font-bold text-violet-800 mb-1">{analyticsData.summary.completionRate}%</p>
                <p className="text-xs text-violet-600">from last period</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#80B9B6]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-xl">
                <Download className="w-6 h-6 text-[#00736D]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#002E2C]">Export Data</h2>
                <p className="text-sm text-gray-600">Download your reports as CSV files</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleExportCSV('orders')}
                variant="outline"
                className="h-auto py-6 flex-col items-start gap-3 border-[#80B9B6]/30 hover:bg-[#E6F1F0] hover:border-[#80B9B6] transition-all group"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-5 h-5 text-blue-700" />
                  </div>
                  <span className="font-bold text-base">All Orders</span>
                </div>
                <span className="text-xs text-gray-500 text-left">Export complete order history with details</span>
              </Button>

              <Button
                onClick={() => handleExportCSV('students')}
                variant="outline"
                className="h-auto py-6 flex-col items-start gap-3 border-[#80B9B6]/30 hover:bg-[#E6F1F0] hover:border-[#80B9B6] transition-all group"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
                    <Users className="w-5 h-5 text-violet-700" />
                  </div>
                  <span className="font-bold text-base">Student Analytics</span>
                </div>
                <span className="text-xs text-gray-500 text-left">Export top customers and spending data</span>
              </Button>

              <Button
                onClick={() => handleExportCSV('daily')}
                variant="outline"
                className="h-auto py-6 flex-col items-start gap-3 border-[#80B9B6]/30 hover:bg-[#E6F1F0] hover:border-[#80B9B6] transition-all group"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Calendar className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="font-bold text-base">Daily Summary</span>
                </div>
                <span className="text-xs text-gray-500 text-left">Export daily performance metrics</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Daily Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#80B9B6]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-xl">
                <Calendar className="w-6 h-6 text-[#00736D]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#002E2C]">Daily Performance</h2>
                <p className="text-sm text-gray-600">Track your day-to-day operations</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#80B9B6]/30">
                    <th className="text-left py-4 px-4 font-bold text-sm text-[#002E2C]">Date</th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-[#002E2C]">Orders</th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-[#002E2C]">Revenue</th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-[#002E2C]">B&W</th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-[#002E2C]">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.daily.map((day, index) => (
                    <tr key={index} className="border-b border-[#80B9B6]/10 hover:bg-[#E6F1F0]/30 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-blue-700">{day.orders}</td>
                      <td className="py-4 px-4 text-right font-bold text-emerald-600">₱{day.revenue}</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-700">{day.bw}</td>
                      <td className="py-4 px-4 text-right font-medium text-gray-700">{day.color}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-[#E6F1F0] to-[#80B9B6]/10 font-bold">
                    <td className="py-4 px-4 text-sm text-[#002E2C]">Total</td>
                    <td className="py-4 px-4 text-right text-blue-700">
                      {analyticsData.daily.reduce((sum, day) => sum + day.orders, 0)}
                    </td>
                    <td className="py-4 px-4 text-right text-emerald-600">
                      ₱{analyticsData.daily.reduce((sum, day) => sum + day.revenue, 0)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700">
                      {analyticsData.daily.reduce((sum, day) => sum + day.bw, 0)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700">
                      {analyticsData.daily.reduce((sum, day) => sum + day.color, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Top Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#80B9B6]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-xl">
                <Users className="w-6 h-6 text-[#00736D]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#002E2C]">Top Customers</h2>
                <p className="text-sm text-gray-600">Your most valuable students</p>
              </div>
            </div>
            <div className="space-y-3">
              {analyticsData.topStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-5 bg-gradient-to-r from-[#E6F1F0]/50 to-transparent rounded-xl border border-[#80B9B6]/20 hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00736D] to-[#002E2C] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-[#002E2C]">{student.name}</p>
                      <p className="text-sm text-gray-600 font-medium">{student.studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-emerald-600">₱{student.spent}</p>
                    <p className="text-sm text-gray-600">{student.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Print Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#80B9B6]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-xl">
                <PieChart className="w-6 h-6 text-[#00736D]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#002E2C]">Print Type Distribution</h2>
                <p className="text-sm text-gray-600">Breakdown of print preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-600 to-gray-700"></div>
                    <span className="text-sm font-bold text-gray-700">Black & White</span>
                  </div>
                  <span className="text-2xl font-bold text-[#002E2C]">{analyticsData.summary.bwPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-gray-600 to-gray-700 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${analyticsData.summary.bwPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-[#00736D] to-[#002E2C]"></div>
                    <span className="text-sm font-bold text-gray-700">Color</span>
                  </div>
                  <span className="text-2xl font-bold text-[#002E2C]">{analyticsData.summary.colorPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00736D] to-[#002E2C] h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${analyticsData.summary.colorPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}