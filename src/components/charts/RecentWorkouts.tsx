'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Activity, Flame, Clock } from 'lucide-react'

interface RecentWorkoutsProps {
  workouts: any[]
}

export default function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'low': return 'เบา'
      case 'medium': return 'ปานกลาง'
      case 'high': return 'หนัก'
      default: return intensity
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การออกกำลังกายล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div 
                key={workout.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{workout.exerciseType}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getIntensityColor(workout.intensity)}`}>
                      {getIntensityLabel(workout.intensity)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {format(new Date(workout.exerciseDate), 'PPP', { locale: th })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      {workout.durationMinutes} นาที
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Flame className="h-3 w-3" />
                      {workout.caloriesBurned} cal
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">ยังไม่มีข้อมูล</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}