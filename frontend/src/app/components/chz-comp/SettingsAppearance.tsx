import { Sun, Moon } from 'lucide-react';

import './SettingsBase.css';
import './SettingsAppearance.css';

interface SettingsAppearanceProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  use24HourTime: boolean;
  onUse24HourTimeChange: (use24Hour: boolean) => void;
}

export function SettingsAppearance({
  theme,
  onThemeChange,
  use24HourTime,
  onUse24HourTimeChange,
}: SettingsAppearanceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="settings-section-heading">Appearance</h2>
        <div className="space-y-4">
          <div className="settings-form-group">
            <label className="settings-label">Theme</label>
            <div className="settings-theme-grid">
              <button
                onClick={() => onThemeChange('light')}
                className={`settings-theme-btn ${
                  theme === 'light' ? 'settings-theme-btn-active' : ''
                }`}
              >
                <div className="settings-theme-preview bg-white border-gray-200">
                  <Sun className="h-6 w-6 text-gray-600" />
                </div>
                <span className="settings-theme-label">Light</span>
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`settings-theme-btn ${
                  theme === 'dark' ? 'settings-theme-btn-active' : ''
                }`}
              >
                <div className="settings-theme-preview bg-[#0d1117]">
                  <Moon className="h-6 w-6 text-gray-300" />
                </div>
                <span className="settings-theme-label">Dark</span>
              </button>
            </div>
          </div>
          <div className="settings-security-box">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Use military time</div>
                <div className="text-xs text-muted-foreground">
                  Toggle the navbar clock between 24-hour and 12-hour formats.
                </div>
              </div>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  className="settings-toggle-input"
                  checked={use24HourTime}
                  onChange={(event) => onUse24HourTimeChange(event.target.checked)}
                />
                <div className="settings-toggle-slider"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
