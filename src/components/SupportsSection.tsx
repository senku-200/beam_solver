'use client';

import { Support, BeamData } from '@/types/beam';

interface SupportsSectionProps {
  supports: Support;
  beamData: BeamData;
  onSupportsChange: (supports: Support) => void;
}

export default function SupportsSection({ supports, beamData, onSupportsChange }: SupportsSectionProps) {
  const updateSupportType = (type: 'pin+roller' | 'fixed') => {
    if (type === 'pin+roller') {
      onSupportsChange({
        type: 'pin+roller',
        pin_x: 0,
        roller_x: beamData.length
      });
    } else {
      onSupportsChange({
        type: 'fixed',
        fixed_pos: 'left'
      });
    }
  };

  const updatePinPosition = (x: number) => {
    onSupportsChange({
      ...supports,
      pin_x: x
    });
  };

  const updateRollerPosition = (x: number) => {
    onSupportsChange({
      ...supports,
      roller_x: x
    });
  };

  const updateFixedPosition = (position: 'left' | 'right') => {
    onSupportsChange({
      ...supports,
      fixed_pos: position
    });
  };

  const getDeterminacyInfo = () => {
    if (supports.type === 'pin+roller') {
      return {
        combination: 'Pin + Roller',
        reactions: 3,
        determinacy: 'Determinate'
      };
    } else {
      return {
        combination: 'Fixed Only',
        reactions: 3,
        determinacy: 'Determinate'
      };
    }
  };

  const determinacyInfo = getDeterminacyInfo();

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-emerald-800">Supports</h2>
      </div>
      
      {/* Static note */}
      <div className="text-sm text-emerald-600/80 italic mb-6 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/30">
        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Trial: Only statically determinate supports allowed.
      </div>



      {/* Support type selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Support Configuration
        </label>
        <select
          value={supports.type}
          onChange={(e) => updateSupportType(e.target.value as 'pin+roller' | 'fixed')}
          className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="pin+roller">
            Pin + Roller • {determinacyInfo.reactions} reactions • {determinacyInfo.determinacy}
          </option>
          <option value="fixed">
            Fixed Only • {determinacyInfo.reactions} reactions • {determinacyInfo.determinacy}
          </option>
        </select>
      </div>

      {/* Pin + Roller configuration */}
      {supports.type === 'pin+roller' && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-emerald-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pin Position (x)
              </label>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => updatePinPosition(0)}
                  className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors duration-200"
                >
                  L
                </button>
                <button
                  type="button"
                  onClick={() => updatePinPosition(beamData.length / 2)}
                  className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors duration-200"
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => updatePinPosition(beamData.length)}
                  className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors duration-200"
                >
                  R
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={beamData.length}
                step="0.1"
                value={supports.pin_x || 0}
                onChange={(e) => updatePinPosition(Number(e.target.value))}
                className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter pin position"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-medium text-sm">
                {beamData.units.length}
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-emerald-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Roller Position (x)
              </label>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => updateRollerPosition(0)}
                  className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors duration-200"
                >
                  L
                </button>
                <button
                  type="button"
                  onClick={() => updateRollerPosition(beamData.length / 2)}
                  className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors duration-200"
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => updateRollerPosition(beamData.length)}
                  className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors duration-200"
                >
                  R
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={beamData.length}
                step="0.1"
                value={supports.roller_x || beamData.length}
                onChange={(e) => updateRollerPosition(Number(e.target.value))}
                className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter roller position"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-medium text-sm">
                {beamData.units.length}
              </div>
            </div>
          </div>
          
          {/* Validation */}
          {supports.pin_x !== undefined && supports.roller_x !== undefined && (
            <div className="space-y-2">
              {supports.pin_x < 0 && (
                <div className="text-red-600 text-sm flex items-center p-3 bg-red-50 rounded-xl border border-red-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pin position must be ≥ 0
                </div>
              )}
              {supports.roller_x > beamData.length && (
                <div className="text-red-600 text-sm flex items-center p-3 bg-red-50 rounded-xl border border-red-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Roller position must be ≤ {beamData.length}
                </div>
              )}
              {supports.pin_x === supports.roller_x && (
                <div className="text-red-600 text-sm flex items-center p-3 bg-red-50 rounded-xl border border-red-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pin and roller positions must be different
                </div>
              )}
              {supports.pin_x > supports.roller_x && (
                <div className="text-amber-600 text-sm flex items-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Note: Pin is to the right of roller (overhang configuration)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fixed support configuration */}
      {supports.type === 'fixed' && (
        <div>
          <label className="block text-sm font-semibold text-emerald-700 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Fixed Support Position
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateFixedPosition('left')}
              className={`px-4 py-3 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                supports.fixed_pos === 'left'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-500 shadow-lg'
                  : 'bg-white/80 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                Left (x=0)
              </div>
            </button>
            <button
              onClick={() => updateFixedPosition('right')}
              className={`px-4 py-3 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                supports.fixed_pos === 'right'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-500 shadow-lg'
                  : 'bg-white/80 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Right (x={beamData.length})
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
