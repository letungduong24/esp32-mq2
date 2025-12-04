'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';

interface RelayControlProps {
  title: string;
  groupNumber: 1 | 2;
  currentStatus: string; // "ON" hoặc "OFF" từ sensor
  onControlChange: (group: 1 | 2, mode: 'auto' | 'off' | 'on') => void;
  onLoginRequired?: () => void;
}

export default function RelayControl({ 
  title, 
  groupNumber, 
  currentStatus,
  onControlChange,
  onLoginRequired
}: RelayControlProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [controlMode, setControlMode] = useState<'auto' | 'off' | 'on'>('auto');
  const isAuthenticated = status === 'authenticated';

  const handleModeChange = (mode: 'auto' | 'off' | 'on') => {
    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }
    setControlMode(mode);
    onControlChange(groupNumber, mode);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-600 mb-3">{title}</p>
      
      {!isAuthenticated ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-3">
            Vui lòng đăng nhập để điều khiển
          </p>
          <Button 
            onClick={() => {
              if (onLoginRequired) {
                onLoginRequired();
              }
            }} 
            className="w-full"
          >
            Đăng Nhập
          </Button>
        </div>
      ) : (
        <>
      {/* Buttons */}
      <ButtonGroup className="w-full mb-3">
        <Button
          onClick={() => handleModeChange('auto')}
          variant={controlMode === 'auto' ? 'default' : 'outline'}
          className="flex-1"
        >
          Auto
        </Button>
        <Button
          onClick={() => handleModeChange('off')}
          variant={controlMode === 'off' ? 'secondary' : 'outline'}
          className="flex-1"
        >
          Tắt
        </Button>
        <Button
          onClick={() => handleModeChange('on')}
          variant={controlMode === 'on' ? 'default' : 'outline'}
          className="flex-1"
        >
          Bật
        </Button>
      </ButtonGroup>
        </>
      )}

      {/* Status */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Trạng thái:</span>
        <span className={`font-semibold ${
          controlMode === 'auto' 
            ? currentStatus === 'ON' ? 'text-blue-600' : 'text-gray-400'
            : controlMode === 'on' 
            ? 'text-green-600' 
            : 'text-gray-400'
        }`}>
          {controlMode === 'auto' 
            ? `Auto (${currentStatus})` 
            : controlMode === 'on' 
            ? 'BẬT' 
            : 'TẮT'}
        </span>
      </div>
    </div>
  );
}

