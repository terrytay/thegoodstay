'use client';

import { useState } from 'react';
import { Calendar, CheckCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface CalendarStatus {
  success: boolean;
  error?: string;
  message?: string;
  calendarId?: string;
  status?: string;
  step?: string;
  instructions?: string[];
}

export default function CalendarManagementPage() {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calendar/test');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        error: 'Failed to test calendar connection',
      });
    }
    setIsLoading(false);
  };

  const setupCalendar = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calendar/setup', { method: 'POST' });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        error: 'Failed to setup calendar',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Google Calendar Integration
        </h1>
        <p className="text-gray-600">
          Manage your Google Calendar integration for booking availability.
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Connection Status</h2>
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          {status && (
            <div className={`p-4 rounded-lg ${
              status.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {status.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    status.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {status.success ? 'Connected' : 'Connection Failed'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    status.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {status.message || status.error}
                  </p>
                  
                  {status.calendarId && (
                    <p className="text-sm mt-2 text-gray-600">
                      <strong>Calendar ID:</strong> {status.calendarId}
                    </p>
                  )}

                  {status.instructions && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        To fix this issue:
                      </p>
                      <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
                        {status.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!status && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Click "Test Connection" to check your calendar integration</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin" />
              <p>Testing connection...</p>
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Instructions</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">1. Share Your Calendar</h3>
              <p className="text-gray-600 mt-1">
                Share your Google Calendar with your service account email and give it "Make changes and manage sharing" permission.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">2. Setup Calendar Access</h3>
              <p className="text-gray-600 mt-1 mb-2">
                Click the button below to automatically configure calendar access:
              </p>
              <button
                onClick={setupCalendar}
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Calendar className="h-4 w-4" />
                <span>Setup Calendar Access</span>
              </button>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-gray-900">3. Test Integration</h3>
              <p className="text-gray-600 mt-1">
                Use the "Test Connection" button above to verify everything is working correctly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Block Time Slots</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Block Specific Hours</h3>
              <p className="text-gray-600 text-sm mb-2">
                Create regular calendar events to block specific time periods.
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Example:</strong> Create event "Unavailable" from 2:00 PM - 4:00 PM
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Block Entire Days</h3>
              <p className="text-gray-600 text-sm mb-2">
                Create all-day events to block all booking slots for that day.
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Example:</strong> Create all-day event "Day Off"
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Google Calendar</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}