'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { 
  TrendingUp, 
  Activity, 
  Calendar,
  Target,
  Loader2
} from 'lucide-react'
import MonthlyChart from '@/components/charts/MonthlyChart'
import ExerciseBreakdown from '@/components/charts/ExerciseBreakdown'
import IntensityChart from '@/components/charts/IntensityChart'
import RecentWorkouts from '@/components/charts/RecentWorkouts'

export default function AnalyticsPage() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [breakdownData, setBreakdownData] = useState<any[]>([])
  const [intensityData, setIntensityData] = useState<any[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [totalStats, setTotalStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    averagePerWorkout: 0
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const headers = { 'Authorization': `Bearer ${token}` }

      // Fetch all data in parallel
      const [monthly, breakdown, intensity, recent] = await Promise.all([
        fetch('/api/analytics/monthly', { headers }).then(r => r.json()),
        fetch('/api/analytics/breakdown', { headers }).then(r => r.json()),
        fetch('/api/analytics/intensity', { headers }).then(r => r.json()),
        fetch('/api/analytics/recent', { headers }).then(r => r.json()),
      ])

      setMonthlyData(monthly.data || [])
      setBreakdownData(breakdown.data || [])
      setIntensityData(intensity.data || [])
      setRecentWorkouts(recent.workouts || [])

      // Calculate total stats
      const totalWorkouts = breakdownData.reduce((sum, item) => sum + item.count, 0)
      const totalCalories = breakdownData.reduce((sum, item) => sum + item.calories, 0)
      const totalDuration = breakdownData.reduce((sum, item) => sum + item.duration, 0)

      setTotalStats({
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        totalDuration,
        averagePerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0
      })

    } catch (error) {
      console.error('Fetch analytics error:', error)
      toast.error('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    suffix = '',
    color = 'text-blue-600'
  }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString()}{suffix}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">📊 สถิติและการวิเคราะห์</h1>
        <p className="text-gray-600 mt-1">
          ภาพรวมและวิเคราะห์การออกกำลังกายของคุณ
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="จำนวนครั้งทั้งหมด"
          value={totalStats.totalWorkouts}
          icon={Activity}
          color="text-blue-600"
        />
        <StatCard
          title="แคลอรี่ทั้งหมด"
          value={totalStats.totalCalories}
          icon={TrendingUp}
          suffix=" cal"
          color="text-orange-600"
        />
        <StatCard
          title="เวลาทั้งหมด"
          value={Math.floor(totalStats.totalDuration / 60)}
          icon={Calendar}
          suffix=" ชม."
          color="text-green-600"
        />
        <StatCard
          title="ค่าเฉลี่ย/ครั้ง"
          value={totalStats.averagePerWorkout}
          icon={Target}
          suffix=" cal"
          color="text-purple-600"
        />
      </div>

      {/* Monthly Chart */}
      <MonthlyChart data={monthlyData} />

      {/* Two Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExerciseBreakdown data={breakdownData} />
        <IntensityChart data={intensityData} />
      </div>

      {/* Recent Workouts */}
      <RecentWorkouts workouts={recentWorkouts} />

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🏆 สถิติที่น่าสนใจ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ประเภทที่ชอบที่สุด:</span>
              <span className="font-semibold">
                {breakdownData[0]?.exerciseType || '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">เวลาเฉลี่ย/ครั้ง:</span>
              <span className="font-semibold">
                {totalStats.totalWorkouts > 0 
                  ? Math.round(totalStats.totalDuration / totalStats.totalWorkouts)
                  : 0} นาที
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ความหนักที่ชอบ:</span>
              <span className="font-semibold">
                {intensityData.sort((a, b) => b.count - a.count)[0]?.intensity === 'low' ? 'เบา' :
                 intensityData.sort((a, b) => b.count - a.count)[0]?.intensity === 'medium' ? 'ปานกลาง' :
                 intensityData.sort((a, b) => b.count - a.count)[0]?.intensity === 'high' ? 'หนัก' : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📅 สถิติรายเดือน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">เดือนนี้:</span>
              <span className="font-semibold">
                {monthlyData[monthlyData.length - 1]?.workouts || 0} ครั้ง
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">แคลอรี่เดือนนี้:</span>
              <span className="font-semibold">
                {Math.round(monthlyData[monthlyData.length - 1]?.calories || 0)} cal
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">เฉลี่ย 6 เดือน:</span>
              <span className="font-semibold">
                {monthlyData.length > 0
                  ? Math.round(
                      monthlyData.reduce((sum, m) => sum + m.workouts, 0) / monthlyData.length
                    )
                  : 0} ครั้ง/เดือน
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">🎯 เป้าหมาย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">เป้าหมายรายสัปดาห์:</span>
                <span className="font-semibold">4/5 ครั้ง</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">แคลอรี่รายสัปดาห์:</span>
                <span className="font-semibold">1200/1500 cal</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '80%' }} />
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              *ฟีเจอร์เป้าหมายจะเปิดใช้งานเร็วๆ นี้
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}