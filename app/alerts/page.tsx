'use client';

import { useEffect, useState } from 'react';
import { SensorData } from '../types/sensor';
import { getHistory } from '../lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AlertRecord extends SensorData {
  timestamp: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Lấy cảnh báo từ database (chỉ có yellow và red)
        const response = await fetch('/api/esp32/alerts?limit=1000', {
          cache: 'no-store',
        });
        const data = await response.json();
        if (data.success) {
          setAlerts(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    // Refresh mỗi 5 giây
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (status: string) => {
    if (status === 'RED') return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'YELLOW') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getAlertText = (status: string) => {
    if (status === 'RED') return 'NGUY HIỂM';
    if (status === 'YELLOW') return 'CẢNH BÁO';
    return 'AN TOÀN';
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lịch Sử Cảnh Báo
          </h1>
          <p className="text-gray-600">
            Theo dõi các cảnh báo đèn vàng và đèn đỏ từ cảm biến
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Tổng Cảnh Báo</p>
            <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Nguy Hiểm (Đỏ)</p>
            <p className="text-3xl font-bold text-red-600">
              {alerts.filter(a => a.den_canhbao_nhom1 === 'RED' || a.den_canhbao_nhom2 === 'RED').length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Cảnh Báo (Vàng)</p>
            <p className="text-3xl font-bold text-yellow-600">
              {alerts.filter(a => 
                (a.den_canhbao_nhom1 === 'YELLOW' || a.den_canhbao_nhom2 === 'YELLOW') &&
                a.den_canhbao_nhom1 !== 'RED' && a.den_canhbao_nhom2 !== 'RED'
              ).length}
            </p>
          </div>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500 text-lg">Không có cảnh báo nào</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sensor 1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái Nhóm 1
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sensor 2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái Nhóm 2
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quạt & Còi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(alert.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.mq2_sensor1.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAlertColor(alert.den_canhbao_nhom1)}`}>
                          {getAlertText(alert.den_canhbao_nhom1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.mq2_sensor2.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAlertColor(alert.den_canhbao_nhom2)}`}>
                          {getAlertText(alert.den_canhbao_nhom2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          <span className={alert.quat_coi_nhom1 === 'ON' ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
                            Nhóm 1: {alert.quat_coi_nhom1}
                          </span>
                          <span className={alert.quat_coi_nhom2 === 'ON' ? 'text-blue-600 font-semibold' : 'text-gray-400'}>
                            Nhóm 2: {alert.quat_coi_nhom2}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-8">
          <Button asChild>
            <Link href="/">
              ← Quay lại trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

