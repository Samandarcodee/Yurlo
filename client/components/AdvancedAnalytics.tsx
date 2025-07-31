import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Activity,
  Droplets,
  Flame,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Share,
  Filter,
  Zap,
  Heart,
  Clock,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// === MOCK DATA ===
const generateMockData = () => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    return {
      date: date.toISOString().split('T')[0],
      dateShort: date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
      calories: Math.floor(Math.random() * 400) + 1800,
      caloriesBurned: Math.floor(Math.random() * 300) + 200,
      water: Math.floor(Math.random() * 4) + 6,
      steps: Math.floor(Math.random() * 5000) + 7000,
      weight: 70 + (Math.random() - 0.5) * 2,
      sleep: Math.floor(Math.random() * 2) + 7,
      mood: Math.floor(Math.random() * 3) + 3, // 3-5 scale
    };
  });

  return last30Days;
};

const nutritionData = [
  { name: 'Oqsillar', value: 25, color: '#22C55E' },
  { name: 'Yog\'lar', value: 30, color: '#EF4444' },
  { name: 'Uglevdalar', value: 45, color: '#3B82F6' },
];

const weeklyProgressData = [
  { day: 'Du', calories: 2100, target: 2200, burned: 300 },
  { day: 'Se', calories: 1980, target: 2200, burned: 450 },
  { day: 'Cho', calories: 2300, target: 2200, burned: 280 },
  { day: 'Pa', calories: 2150, target: 2200, burned: 380 },
  { day: 'Ju', calories: 1850, target: 2200, burned: 520 },
  { day: 'Sha', calories: 2400, target: 2200, burned: 200 },
  { day: 'Ya', calories: 2180, target: 2200, burned: 350 },
];

const goalProgressData = [
  { name: 'Calorie Goal', value: 85, color: '#22C55E' },
  { name: 'Water Goal', value: 92, color: '#3B82F6' },
  { name: 'Activity Goal', value: 78, color: '#F59E0B' },
  { name: 'Sleep Goal', value: 65, color: '#8B5CF6' },
];

// === UTILITY FUNCTIONS ===
const calculateTrend = (data: number[]) => {
  if (data.length < 2) return { direction: 'stable', percentage: 0 };
  
  const recent = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
  
  const change = ((recent - previous) / previous) * 100;
  
  return {
    direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
    percentage: Math.abs(change),
  };
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('uz-UZ').format(num);
};

// === COMPONENTS ===
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { direction: 'up' | 'down' | 'stable'; percentage: number };
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  color 
}) => (
  <Card className="glass-light hover-lift">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className="flex items-center space-x-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend.direction === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span className={`text-sm ${
                trend.direction === 'up' ? 'text-green-500' : 
                trend.direction === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {trend.percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  color: string;
  size?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  value, 
  max, 
  label, 
  color, 
  size = 120 
}) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">/ {max}</div>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-center">{label}</p>
    </div>
  );
};

// === MAIN COMPONENT ===
export default function AdvancedAnalytics() {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  const mockData = useMemo(() => generateMockData(), []);
  
  const caloriesTrend = useMemo(() => 
    calculateTrend(mockData.map(d => d.calories)), [mockData]
  );
  
  const weightTrend = useMemo(() => 
    calculateTrend(mockData.map(d => d.weight)), [mockData]
  );

  const averageCalories = useMemo(() => 
    Math.round(mockData.reduce((sum, d) => sum + d.calories, 0) / mockData.length), [mockData]
  );

  const averageSteps = useMemo(() => 
    Math.round(mockData.reduce((sum, d) => sum + d.steps, 0) / mockData.length), [mockData]
  );

  const currentWeight = mockData[mockData.length - 1]?.weight || 70;
  const targetWeight = user?.goal === 'lose' ? 65 : user?.goal === 'gain' ? 75 : 70;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-water-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-mint-600 to-water-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Sog'ligingiz holati haqida batafsil ma'lumot</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">So'nggi 7 kun</SelectItem>
                <SelectItem value="30days">So'nggi 30 kun</SelectItem>
                <SelectItem value="90days">So'nggi 3 oy</SelectItem>
                <SelectItem value="1year">So'nggi yil</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="O'rtacha Kaloriya"
            value={formatNumber(averageCalories)}
            subtitle="kunlik"
            trend={caloriesTrend}
            icon={Flame}
            color="bg-gradient-to-r from-red-500 to-orange-500"
          />
          
          <StatCard
            title="Joriy Vazn"
            value={currentWeight.toFixed(1)}
            subtitle="kg"
            trend={weightTrend}
            icon={Target}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
          />
          
          <StatCard
            title="O'rtacha Qadamlar"
            value={formatNumber(averageSteps)}
            subtitle="kunlik"
            icon={Activity}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          
          <StatCard
            title="Suv Iste'moli"
            value="8.2"
            subtitle="litr/kun"
            icon={Droplets}
            color="bg-gradient-to-r from-cyan-500 to-blue-500"
          />
        </div>

        {/* Main Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Umumiy</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4" />
              <span>Ovqatlanish</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Faollik</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Maqsadlar</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calorie Trends */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChartIcon className="w-5 h-5" />
                    <span>Kaloriya Tendentsiyasi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateShort" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value} kaloriya`, 
                          name === 'calories' ? 'Iste\'mol' : 'Yoqilgan'
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#22C55E" 
                        strokeWidth={3}
                        dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
                        name="Iste'mol"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="caloriesBurned" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                        name="Yoqilgan"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weight Progress */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Vazn O'zgarishi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateShort" />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip formatter={(value) => [`${value} kg`, 'Vazn']} />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#8B5CF6"
                        fill="url(#weightGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Overview */}
            <Card className="glass-medium">
              <CardHeader>
                <CardTitle>Haftalik Ko'rsatkichlar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calories" fill="#22C55E" name="Iste'mol" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#94A3B8" name="Maqsad" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="burned" fill="#EF4444" name="Yoqilgan" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nutrition Breakdown */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle>Ovqat Tarkibi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={nutritionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {nutritionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily Progress Rings */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle>Bugungi Maqsadlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <ProgressRing
                      value={1850}
                      max={2200}
                      label="Kaloriya"
                      color="#22C55E"
                    />
                    <ProgressRing
                      value={7.2}
                      max={8}
                      label="Suv (litr)"
                      color="#3B82F6"
                    />
                    <ProgressRing
                      value={8500}
                      max={10000}
                      label="Qadamlar"
                      color="#F59E0B"
                    />
                    <ProgressRing
                      value={6.5}
                      max={8}
                      label="Uyqu (soat)"
                      color="#8B5CF6"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Steps Chart */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Kunlik Qadamlar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateShort" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${formatNumber(value as number)}`, 'Qadamlar']} />
                      <Area
                        type="monotone"
                        dataKey="steps"
                        stroke="#F59E0B"
                        fill="url(#stepsGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle>Faollik Xulasasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-activity-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-activity-500 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Jami Qadam</p>
                        <p className="text-sm text-muted-foreground">So'nggi 7 kun</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatNumber(65432)}</p>
                      <p className="text-sm text-activity-600">+12% o'sish</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Yoqilgan Kaloriya</p>
                        <p className="text-sm text-muted-foreground">So'nggi 7 kun</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatNumber(2450)}</p>
                      <p className="text-sm text-red-600">+8% o'sish</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Faol Vaqt</p>
                        <p className="text-sm text-muted-foreground">Kunlik o'rtacha</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">2.5</p>
                      <p className="text-sm text-purple-600">soat</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Goal Progress */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle>Maqsadlar Jarayoni</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart data={goalProgressData} innerRadius="20%" outerRadius="90%">
                      <RadialBar
                        dataKey="value"
                        cornerRadius={8}
                        fill={(entry: any) => entry.color}
                      />
                      <Legend />
                      <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Achievement Cards */}
              <Card className="glass-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Yutuqlar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-xl">
                    <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Haftalik Maqsad</p>
                      <p className="text-sm text-muted-foreground">7 kun ketma-ket calorie goal</p>
                    </div>
                    <Badge variant="secondary">Yangi!</Badge>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xl">💧</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Suv Qahramoni</p>
                      <p className="text-sm text-muted-foreground">14 kun ketma-ket hydration goal</p>
                    </div>
                    <Badge variant="outline">2 kun qoldi</Badge>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-activity-50 rounded-xl">
                    <div className="w-12 h-12 bg-activity-500 rounded-full flex items-center justify-center">
                      <span className="text-xl">🚶</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Step Master</p>
                      <p className="text-sm text-muted-foreground">10,000+ qadamlar</p>
                    </div>
                    <Badge variant="secondary">3/7</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weight Goal Progress */}
            <Card className="glass-medium">
              <CardHeader>
                <CardTitle>Vazn Maqsadi Jarayoni</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Joriy vazn</p>
                      <p className="text-2xl font-bold">{currentWeight.toFixed(1)} kg</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Maqsad</p>
                      <p className="text-2xl font-bold">{targetWeight} kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Qolgan</p>
                      <p className="text-2xl font-bold text-mint-600">
                        {Math.abs(currentWeight - targetWeight).toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={Math.min(100, Math.abs(currentWeight - targetWeight) * 20)} 
                    className="h-3"
                  />
                  
                  <p className="text-sm text-center text-muted-foreground">
                    {user?.goal === 'lose' ? 'Yoqish' : user?.goal === 'gain' ? 'Olish' : 'Saqlash'} maqsadi
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}