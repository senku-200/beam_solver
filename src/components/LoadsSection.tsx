'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loads, BeamData, PointLoad, AngledLoad, UDLLoad, UVLLoad, MomentLoad } from '@/types/beam';
import { Plus, X } from 'lucide-react';

interface LoadsSectionProps {
  loads: Loads;
  beamData: BeamData;
  onLoadsChange: (loads: Loads) => void;
}

type LoadType = 'point' | 'angled' | 'udl' | 'uvl' | 'moment';

const ANGLE_OPTIONS = [
  { value: 15, label: '15°' },
  { value: 30, label: '30°' },
  { value: 45, label: '45°' },
  { value: 60, label: '60°' },
  { value: 90, label: '90°' },
];

export default function LoadsSection({ loads, beamData, onLoadsChange }: LoadsSectionProps) {
  const [activeTab, setActiveTab] = useState<LoadType>('point');

  const addLoad = (type: LoadType) => {
    const newLoads = { ...loads };
    const count = newLoads[type].length + 1;
    
    switch (type) {
      case 'point':
        newLoads.point.push({
          label: `P${count}`,
          x: beamData.length / 2,
          P: 10
        });
        break;
      case 'angled':
        newLoads.angled.push({
          label: `A${count}`,
          x: beamData.length / 2,
          P: 10,
          theta_deg: 45
        });
        break;
      case 'udl':
        newLoads.udl.push({
          label: `W${count}`,
          a: beamData.length * 0.2,
          b: beamData.length * 0.8,
          w: -3
        });
        break;
      case 'uvl':
        newLoads.uvl.push({
          label: `V${count}`,
          a: beamData.length * 0.2,
          b: beamData.length * 0.8,
          w1: 0,
          w2: -5
        });
        break;
      case 'moment':
        newLoads.moment.push({
          label: `M${count}`,
          x: beamData.length / 2,
          M: 20
        });
        break;
    }
    
    onLoadsChange(newLoads);
  };

  const updateLoad = (type: LoadType, index: number, field: string, value: string | number) => {
    const newLoads = { ...loads };
    (newLoads[type][index] as unknown as Record<string, string | number>)[field] = value;
    onLoadsChange(newLoads);
  };

  const removeLoad = (type: LoadType, index: number) => {
    const newLoads = { ...loads };
    newLoads[type].splice(index, 1);
    onLoadsChange(newLoads);
  };

  const getQuickPosition = (position: 'L' | 'M' | 'R') => {
    switch (position) {
      case 'L': return 0;
      case 'M': return beamData.length / 2;
      case 'R': return beamData.length;
    }
  };

  const setQuickPosition = (type: LoadType, index: number, position: 'L' | 'M' | 'R') => {
    const x = getQuickPosition(position);
    updateLoad(type, index, 'x', x);
  };

  const getLoadTypeInfo = (type: LoadType) => {
    switch (type) {
      case 'point':
        return { name: 'Point Loads', icon: '↓', color: 'emerald' };
      case 'angled':
        return { name: 'Angled Loads', icon: '↘', color: 'green' };
      case 'udl':
        return { name: 'Uniform Distributed Loads', icon: '▬', color: 'teal' };
      case 'uvl':
        return { name: 'Variable Distributed Loads', icon: '▽', color: 'emerald' };
      case 'moment':
        return { name: 'Moments', icon: '↻', color: 'green' };
    }
  };

  const loadTypeInfo = getLoadTypeInfo(activeTab);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-emerald-800">Loads</h2>
      </div>

      {/* Load Type Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {(['point', 'angled', 'udl', 'uvl', 'moment'] as LoadType[]).map((type) => {
            const info = getLoadTypeInfo(type);
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === type
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-500 shadow-lg'
                    : 'bg-white/80 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <span className="text-lg">{info.icon}</span>
                <span>{info.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="space-y-4">
        {/* Add Load Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{loadTypeInfo.icon}</span>
            <span className="text-sm font-semibold text-emerald-700">{loadTypeInfo.name}</span>
          </div>
          <button
            onClick={() => addLoad(activeTab)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add {loadTypeInfo.name}</span>
          </button>
        </div>

        {/* Loads List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {loads[activeTab].map((load, index) => (
              <motion.div
                key={`${activeTab}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{loadTypeInfo.icon}</span>
                    <span className="font-semibold text-emerald-800">{load.label}</span>
                  </div>
                  <button
                    onClick={() => removeLoad(activeTab, index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Load-specific fields */}
                {activeTab === 'point' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1 whitespace-nowrap">Position (x)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={beamData.length}
                          step="0.1"
                          value={(load as PointLoad).x}
                          onChange={(e) => updateLoad(activeTab, index, 'x', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.length}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Force (P)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={(load as PointLoad).P}
                          onChange={(e) => updateLoad(activeTab, index, 'P', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.force}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'angled' && (
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1 whitespace-nowrap">Position (x)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={beamData.length}
                          step="0.1"
                          value={(load as AngledLoad).x}
                          onChange={(e) => updateLoad(activeTab, index, 'x', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.length}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Force (P)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={(load as AngledLoad).P}
                          onChange={(e) => updateLoad(activeTab, index, 'P', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.force}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Angle (θ)</label>
                      <select
                        value={(load as AngledLoad).theta_deg}
                        onChange={(e) => updateLoad(activeTab, index, 'theta_deg', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                      >
                        {ANGLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'udl' && (
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Start (a)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={beamData.length}
                          step="0.1"
                          value={(load as UDLLoad).a}
                          onChange={(e) => updateLoad(activeTab, index, 'a', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.length}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">End (b)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={beamData.length}
                          step="0.1"
                          value={(load as UDLLoad).b}
                          onChange={(e) => updateLoad(activeTab, index, 'b', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.length}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Intensity (w)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={(load as UDLLoad).w}
                          onChange={(e) => updateLoad(activeTab, index, 'w', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.force}/{beamData.units.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'uvl' && (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">Start (a)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={beamData.length}
                            step="0.1"
                            value={(load as UVLLoad).a}
                            onChange={(e) => updateLoad(activeTab, index, 'a', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                            {beamData.units.length}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">End (b)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={beamData.length}
                            step="0.1"
                            value={(load as UVLLoad).b}
                            onChange={(e) => updateLoad(activeTab, index, 'b', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                            {beamData.units.length}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">Start Intensity (w₁)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={(load as UVLLoad).w1}
                            onChange={(e) => updateLoad(activeTab, index, 'w1', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                            {beamData.units.force}/{beamData.units.length}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-1">End Intensity (w₂)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={(load as UVLLoad).w2}
                            onChange={(e) => updateLoad(activeTab, index, 'w2', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                            {beamData.units.force}/{beamData.units.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'moment' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1 whitespace-nowrap">Position (x)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={beamData.length}
                          step="0.1"
                          value={(load as MomentLoad).x}
                          onChange={(e) => updateLoad(activeTab, index, 'x', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.length}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-1">Moment (M)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={(load as MomentLoad).M}
                          onChange={(e) => updateLoad(activeTab, index, 'M', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 text-xs">
                          {beamData.units.force}·{beamData.units.length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Position Buttons */}
                {(activeTab === 'point' || activeTab === 'angled' || activeTab === 'moment') && (
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => setQuickPosition(activeTab, index, 'L')}
                      className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors duration-200"
                    >
                      Left
                    </button>
                    <button
                      onClick={() => setQuickPosition(activeTab, index, 'M')}
                      className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors duration-200"
                    >
                      Middle
                    </button>
                    <button
                      onClick={() => setQuickPosition(activeTab, index, 'R')}
                      className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors duration-200"
                    >
                      Right
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {loads[activeTab].length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{loadTypeInfo.icon}</span>
            </div>
            <p className="text-emerald-600 font-medium">No {loadTypeInfo.name.toLowerCase()} added yet</p>
            <p className="text-emerald-500 text-sm mt-1">Click &quot;Add {loadTypeInfo.name}&quot; to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
