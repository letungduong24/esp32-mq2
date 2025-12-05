'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { SensorData } from './types/sensor';
import SensorCard from './components/SensorCard';
import StatusBar from './components/StatusBar';
import AlertBanner from './components/AlertBanner';
import RelayControl from './components/RelayControl';
import RealtimeChart from './components/RealtimeChart';
import AlertsModal from './components/AlertsModal';
import LoginDialog from './components/LoginDialog';
import ScheduleControl from './components/ScheduleControl';
import { setRelayControl, getLatestData } from './lib/api';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data: session } = useSession();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<1 | 2>(1);

  useEffect(() => {
    // Fetch dữ liệu lần đầu
    const fetchData = async () => {
      try {
        const data = await getLatestData();
        setSensorData(data);
          setLastUpdate(new Date());
          setIsConnected(true);
        setIsLoading(false);
          setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
      setIsConnected(false);
        setError('Không thể kết nối với server. Đang thử lại...');
        setIsLoading(false);
      }
    };

    // Fetch ngay lập tức
    fetchData();

    // Polling mỗi 2 giây để cập nhật dữ liệu
    const interval = setInterval(fetchData, 2000);

    // Cleanup khi component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  const isAlarm = sensorData?.den_canhbao_nhom1 === 'RED' || sensorData?.den_canhbao_nhom2 === 'RED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-col gap-2 md:flex-row">
          <div>
            <h1 className="md:text-4xl text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">
              Hệ Thống Giám Sát Khí Độc ESP32
            </h1>
            <p className="text-gray-600 text-center md:text-left">
              Theo dõi trực tuyến dữ liệu từ cảm biến MQ2
            </p>
          </div>
          <div className="flex gap-2">
          <Button
            onClick={() => setIsAlertsModalOpen(true)}
            variant="default"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            Lịch Sử Cảnh Báo
          </Button>
            {session ? (
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                variant="outline"
              >
                Đăng Xuất
              </Button>
            ) : (
              <Button
                onClick={() => setIsLoginDialogOpen(true)}
                variant="outline"
              >
                Đăng Nhập
              </Button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar 
          data={sensorData} 
          lastUpdate={lastUpdate} 
          isConnected={isConnected} 
        />

        {/* Alert Banner */}
        <AlertBanner isAlarm={isAlarm || false} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Sensor Cards */}
        {sensorData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <SensorCard
              title="Nhóm 1 - Cảm Biến MQ2 #1"
              sensorData={sensorData}
              sensorKey="mq2_sensor1"
              groupNumber={1}
            />
            <SensorCard
              title="Nhóm 2 - Cảm Biến MQ2 #2"
              sensorData={sensorData}
              sensorKey="mq2_sensor2"
              groupNumber={2}
            />
          </div>
        )}

        {/* Real-time Chart & Relay Controls */}
        {sensorData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <RealtimeChart data={sensorData} />
            </div>
            <div className="flex flex-col gap-4">
              <RelayControl
                title="Điều Khiển Quạt & Còi Nhóm 1"
                groupNumber={1}
                currentStatus={sensorData.quat_coi_nhom1}
                onControlChange={async (group, mode) => {
                  await setRelayControl(group, mode);
                }}
                onLoginRequired={() => setIsLoginDialogOpen(true)}
              />
              <RelayControl
                title="Điều Khiển Quạt & Còi Nhóm 2"
                groupNumber={2}
                currentStatus={sensorData.quat_coi_nhom2}
                onControlChange={async (group, mode) => {
                  await setRelayControl(group, mode);
                }}
                onLoginRequired={() => setIsLoginDialogOpen(true)}
              />
              {/* Schedule Controls */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    setSelectedGroup(1);
                    setIsScheduleOpen(true);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  ⏰ Lịch Nhóm 1
                </Button>
                <Button
                  onClick={() => {
                    setSelectedGroup(2);
                    setIsScheduleOpen(true);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  ⏰ Lịch Nhóm 2
                </Button>
              </div>
              {/* Connection Status */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-center text-sm text-gray-500">
                <p className="flex items-center justify-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                </p>
                {lastUpdate && (
                  <p className="text-xs">
                    Cập nhật: {new Intl.DateTimeFormat('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }).format(lastUpdate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Modal */}
        <AlertsModal
          isOpen={isAlertsModalOpen}
          onClose={() => setIsAlertsModalOpen(false)}
        />

        {/* Login Dialog */}
        <LoginDialog
          isOpen={isLoginDialogOpen}
          onClose={() => setIsLoginDialogOpen(false)}
        />

        {/* Schedule Control */}
        <ScheduleControl
          groupNumber={selectedGroup}
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          onLoginRequired={() => {
            setIsScheduleOpen(false);
            setIsLoginDialogOpen(true);
          }}
        />
      </div>
    </div>
  );
}
