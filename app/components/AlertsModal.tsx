'use client';

import { useEffect, useState } from 'react';
import { SensorData } from '../types/sensor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlertRecord extends SensorData {
  timestamp: string;
}

export default function AlertsModal({ isOpen, onClose }: AlertsModalProps) {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAlerts = async () => {
      try {
        // Lấy cảnh báo từ database (chỉ có yellow và red)
        const response = await fetch('/api/esp32/alerts?limit=1000', {
          cache: 'no-store',
        });
        const data = await response.json();
        if (data.success) {
          // Lọc chỉ lấy RED và YELLOW (đảm bảo chắc chắn)
          const filtered = (data.data || []).filter(
            (item: SensorData) =>
              item.den_canhbao_nhom1 === 'YELLOW' ||
              item.den_canhbao_nhom1 === 'RED' ||
              item.den_canhbao_nhom2 === 'YELLOW' ||
              item.den_canhbao_nhom2 === 'RED'
          );
          setAlerts(filtered);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    // Refresh mỗi 5 giây khi modal mở
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 w-[calc(100%-2rem)] [&>button]:hidden">
        <DialogHeader className="p-6 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold">Lịch Sử Cảnh Báo</DialogTitle>
          <DialogDescription>
            Theo dõi các cảnh báo nguy hiểm (đỏ) và cảnh báo (vàng)
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Tổng</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Nguy Hiểm</p>
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.den_canhbao_nhom1 === 'RED' || a.den_canhbao_nhom2 === 'RED').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Cảnh Báo</p>
              <p className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a =>
                  (a.den_canhbao_nhom1 === 'YELLOW' || a.den_canhbao_nhom2 === 'YELLOW') &&
                  a.den_canhbao_nhom1 !== 'RED' && a.den_canhbao_nhom2 !== 'RED'
                ).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
