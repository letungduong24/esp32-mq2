'use client';

import { SensorData } from '../types/sensor';

interface StatusBarProps {
  data: SensorData | null;
  lastUpdate: Date | null;
  isConnected: boolean;
}

export default function StatusBar({ data, lastUpdate, isConnected }: StatusBarProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Chưa có dữ liệu';
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <span className="text-sm text-gray-600">
            Cập nhật lần cuối: {formatTime(lastUpdate)}
          </span>
        </div>
        {data && (
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              data.den_canhbao_nhom1 === 'RED' || data.den_canhbao_nhom2 === 'RED'
                ? 'bg-red-100 text-red-700' 
                : data.den_canhbao_nhom1 === 'YELLOW' || data.den_canhbao_nhom2 === 'YELLOW'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {data.den_canhbao_nhom1 === 'RED' || data.den_canhbao_nhom2 === 'RED' 
                ? 'NGUY HIỂM' 
                : data.den_canhbao_nhom1 === 'YELLOW' || data.den_canhbao_nhom2 === 'YELLOW'
                ? 'CẢNH BÁO'
                : 'AN TOÀN'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

