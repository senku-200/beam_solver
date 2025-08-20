'use client';

import { BeamData, UNIT_PAIRS } from '@/types/beam';

interface BeamSettingsSectionProps {
  beamData: BeamData;
  onBeamDataChange: (beamData: BeamData) => void;
  onResetAll: () => void;
}

export default function BeamSettingsSection({ beamData, onBeamDataChange, onResetAll }: BeamSettingsSectionProps) {
  const updateLength = (length: number) => {
    onBeamDataChange({
      ...beamData,
      length
    });
  };

  const updateUnits = (unitPair: { length: string; force: string }) => {
    onBeamDataChange({
      ...beamData,
      units: unitPair
    });
  };

  const getCurrentUnitLabel = () => {
    return UNIT_PAIRS.find(
      pair => pair.length === beamData.units.length && pair.force === beamData.units.force
    )?.label || `${beamData.units.length}, ${beamData.units.force}`;
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all configurations to default values? This will clear all loads and supports.')) {
      onResetAll();
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-emerald-800">Beam Settings</h2>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          title="Reset all configurations to default"
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Beam Length
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={beamData.length}
              onChange={(e) => updateLength(Number(e.target.value))}
              className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              placeholder="Enter beam length"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-medium text-sm">
              {beamData.units.length}
            </div>
          </div>
          {beamData.length <= 0 && (
            <div className="text-red-600 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Length must be greater than 0
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Units
          </label>
          <select
            value={getCurrentUnitLabel()}
            onChange={(e) => {
              const selectedPair = UNIT_PAIRS.find(pair => pair.label === e.target.value);
              if (selectedPair) {
                updateUnits(selectedPair);
              }
            }}
            className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200 appearance-none cursor-pointer"
          >
            {UNIT_PAIRS.map((pair) => (
              <option key={pair.label} value={pair.label}>
                {pair.label}
              </option>
            ))}
          </select>
          <div className="absolute" style={{right: '30px', bottom:'38px'}}>
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
