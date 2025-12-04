'use client';

interface AlertBannerProps {
  isAlarm: boolean;
}

export default function AlertBanner({ isAlarm }: AlertBannerProps) {
  if (!isAlarm) return null;

  return (
    <div className="mb-6 animate-pulse rounded-lg border-2 border-red-500 bg-red-50 p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-800">CẢNH BÁO!</h3>
          <p className="text-sm text-red-600">Phát hiện khí độc vượt ngưỡng an toàn</p>
        </div>
      </div>
    </div>
  );
}

