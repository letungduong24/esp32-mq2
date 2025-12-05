'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ScheduleControlProps {
  groupNumber: 1 | 2;
  isOpen: boolean;
  onClose: () => void;
  onLoginRequired?: () => void;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  action: 'on' | 'off';
}

interface Schedule {
  _id?: string;
  group: 1 | 2;
  enabled: boolean;
  timeSlots: TimeSlot[];
  daysOfWeek: number[];
}

const DAYS = [
  { value: 0, label: 'CN' },
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
];

export default function ScheduleControl({
  groupNumber,
  isOpen,
  onClose,
  onLoginRequired,
}: ScheduleControlProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [schedule, setSchedule] = useState<Schedule>({
    group: groupNumber,
    enabled: true,
    timeSlots: [{ startTime: '08:00', endTime: '18:00', action: 'on' }],
    daysOfWeek: [1, 2, 3, 4, 5], // Thứ 2-6
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadSchedule();
    }
  }, [isOpen, isAuthenticated, groupNumber]);

  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schedule?group=${groupNumber}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setSchedule(data.data[0] as Schedule);
      } else {
        // Reset to default
        setSchedule({
          group: groupNumber,
          enabled: true,
          timeSlots: [{ startTime: '08:00', endTime: '18:00', action: 'on' }],
          daysOfWeek: [1, 2, 3, 4, 5],
        });
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
      });

      const data = await response.json();
      if (data.success) {
        onClose();
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Đã xảy ra lỗi khi lưu schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    if (!confirm('Bạn có chắc muốn xóa schedule này?')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/schedule?group=${groupNumber}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        onClose();
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Đã xảy ra lỗi khi xóa schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const addTimeSlot = () => {
    setSchedule({
      ...schedule,
      timeSlots: [
        ...schedule.timeSlots,
        { startTime: '08:00', endTime: '18:00', action: 'on' },
      ],
    });
  };

  const removeTimeSlot = (index: number) => {
    setSchedule({
      ...schedule,
      timeSlots: schedule.timeSlots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const newTimeSlots = [...schedule.timeSlots];
    newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
    setSchedule({ ...schedule, timeSlots: newTimeSlots });
  };

  const toggleDay = (day: number) => {
    const newDays = schedule.daysOfWeek.includes(day)
      ? schedule.daysOfWeek.filter((d) => d !== day)
      : [...schedule.daysOfWeek, day].sort();
    setSchedule({ ...schedule, daysOfWeek: newDays });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Lịch Trình Nhóm {groupNumber}
          </DialogTitle>
          <DialogDescription>
            Thiết lập khung giờ tự động bật/tắt quạt & còi
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Vui lòng đăng nhập để quản lý lịch trình</p>
            <Button onClick={onLoginRequired}>Đăng Nhập</Button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Enable/Disable */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={schedule.enabled}
                onChange={(e) => setSchedule({ ...schedule, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="enabled" className="text-sm font-medium">
                Kích hoạt lịch trình
              </label>
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium mb-2">Chọn ngày trong tuần:</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      schedule.daysOfWeek.includes(day.value)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Khung giờ:</label>
                <Button type="button" onClick={addTimeSlot} variant="outline" size="sm">
                  + Thêm khung giờ
                </Button>
              </div>

              <div className="space-y-3">
                {schedule.timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-center p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Bắt đầu</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Kết thúc</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Hành động</label>
                        <select
                          value={slot.action}
                          onChange={(e) =>
                            updateTimeSlot(index, 'action', e.target.value as 'on' | 'off')
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="on">Bật</option>
                          <option value="off">Tắt</option>
                        </select>
                      </div>
                    </div>
                    {schedule.timeSlots.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 hover:text-red-700"
                disabled={isSaving}
              >
                Xóa
              </Button>
              <Button onClick={onClose} variant="outline" disabled={isSaving}>
                Hủy
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

