'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface ProfileHeaderProps {
  user: any
  onUploadAvatar?: () => void
}

export default function ProfileHeader({ user, onUploadAvatar }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.username}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()
              )}
            </div>
            {onUploadAvatar && (
              <button
                onClick={onUploadAvatar}
                className="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">
              {user.name || user.username}
            </h2>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 justify-center md:justify-start">
              <Calendar className="h-4 w-4" />
              <span>
                เข้าร่วมเมื่อ {format(new Date(user.createdAt), 'PPP', { locale: th })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 md:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {user.totalWorkouts}
              </p>
              <p className="text-xs text-gray-600">การออกกำลังกาย</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(user.totalCalories).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">แคลอรี่</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(user.totalDuration / 60)}
              </p>
              <p className="text-xs text-gray-600">ชั่วโมง</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}