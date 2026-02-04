'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Edit, Trash2, Clock, Flame, Route } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '@/lib/store/authStore'

interface WorkoutCardProps {
  workout: any
  onDelete: () => void
}

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const router = useRouter()
  const { token } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/workouts/${workout.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('ลบสำเร็จ')
        onDelete()
      } else {
        toast.error('ไม่สามารถลบได้')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {workout.exerciseType}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getIntensityColor(workout.intensity)}`}>
                  {getIntensityLabel(workout.intensity)}
                </span>
              </div>

              {/* Date */}
              <p className="text-sm text-gray-600 mb-3">
                {format(new Date(workout.exerciseDate), 'PPP - HH:mm น.', { locale: th })}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{workout.durationMinutes} นาที</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{workout.caloriesBurned} cal</span>
                </div>
                {workout.distanceKm && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Route className="h-4 w-4 text-blue-500" />
                    <span>{workout.distanceKm} km</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {workout.notes && (
                <p className="text-sm text-gray-600 italic line-clamp-2">
                  "{workout.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/workouts/${workout.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบการออกกำลังกาย "{workout.exerciseType}" นี้?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}