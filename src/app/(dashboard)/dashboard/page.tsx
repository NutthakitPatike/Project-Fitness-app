'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/authStore'
import { Activity, Flame, Clock, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'react-hot-toast'

interface Stats {
  total: {
    workouts: number
    calories: number
    duration: number
    distance: number
  }
  thisWeek: {
    workouts: number
    calories: number
    duration: number
  }
  changes: {
    workouts: number
    calories: number
    duration: number
  }
}

interface ChartData {
  date: string
  label: string
  calories: number
  workouts: number
}

export default function DashboardPage() {
  const { user, token } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch summary stats
      const statsRes = await fetch('/api/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      // Fetch chart data
      const chartRes = await fetch('/api/stats/chart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (chartRes.ok) {
        const chartResponse = await chartRes.json()
        setChartData(chartResponse.data)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    suffix = '' 
  }: { 
    title: string
    value: number
    icon: any
    change?: number
    suffix?: string
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString()}{suffix}
        </div>
        {change !== undefined && (
          <p className={`text-xs flex items-center gap-1 mt-1 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {Math.abs(change)}% จากสัปดาห์ที่แล้ว
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            สวัสดี, {user?.name || user?.username}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            ติดตามความก้าวหน้าการออกกำลังกายของคุณ
          </p>
        </div>
        <Link href="/workouts/new">
          <Button className="gap-2">
            <Plus size={20} />
            เพิ่มการออกกำลังกาย
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="การออกกำลังกายทั้งหมด"
          value={stats?.total.workouts || 0}
          icon={Activity}
          change={stats?.changes.workouts}
        />
        <StatCard
          title="แคลอรี่ที่เผาผลาญ"
          value={stats?.total.calories || 0}
          icon={Flame}
          change={stats?.changes.calories}
          suffix=" cal"
        />
        <StatCard
          title="เวลาออกกำลังกาย"
          value={stats?.total.duration || 0}
          icon={Clock}
          change={stats?.changes.duration}
          suffix=" นาที"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>แคลอรี่รายวัน (7 วันล่าสุด)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} cal`, 'แคลอรี่']}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>ยังไม่มีข้อมูลการออกกำลังกาย</p>
                <Link href="/workouts/new">
                  <Button className="mt-4" variant="outline">
                    เริ่มบันทึกเลย
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สัปดาห์นี้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">การออกกำลังกาย</span>
              <span className="font-bold">{stats?.thisWeek.workouts || 0} ครั้ง</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">แคลอรี่</span>
              <span className="font-bold">{stats?.thisWeek.calories.toLocaleString() || 0} cal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เวลา</span>
              <span className="font-bold">{stats?.thisWeek.duration || 0} นาที</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถิติรวม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ระยะทางรวม</span>
              <span className="font-bold">{stats?.total.distance.toFixed(2) || 0} km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เวลารวม</span>
              <span className="font-bold">
                {Math.floor((stats?.total.duration || 0) / 60)} ชั่วโมง {(stats?.total.duration || 0) % 60} นาที
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ค่าเฉลี่ย/ครั้ง</span>
              <span className="font-bold">
                {stats?.total.workouts ? Math.round(stats.total.calories / stats.total.workouts) : 0} cal
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}