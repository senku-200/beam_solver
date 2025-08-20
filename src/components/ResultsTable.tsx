'use client';

import { motion } from 'framer-motion';
import { BeamData, AnalysisResult, Loads } from '@/types/beam';

interface ResultsTableProps {
  beamData: BeamData;
  analysisResult: AnalysisResult;
  loads: Loads;
}

export default function ResultsTable({ beamData, analysisResult, loads }: ResultsTableProps) {
  if (!analysisResult.isValid) {
    return (
      <div className="w-full">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center border border-emerald-200/50 shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-emerald-600 font-medium">No valid analysis data available</p>
        </div>
      </div>
    );
  }

  const getUnitLabel = () => {
    return beamData.units.force;
  };

  const getLengthUnitLabel = () => {
    return beamData.units.length;
  };

  const getMomentUnitLabel = () => {
    return `${beamData.units.force}·${beamData.units.length}`;
  };

  // Count total loads
  const totalLoads = loads.point.length + loads.angled.length + loads.udl.length + loads.uvl.length + loads.moment.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reactions Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600">
            <h4 className="text-lg font-bold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Reaction Forces
            </h4>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-200">
                  <th className="text-left py-3 text-sm font-semibold text-emerald-800">Support</th>
                  <th className="text-right py-3 text-sm font-semibold text-emerald-800">Type</th>
                  <th className="text-right py-3 text-sm font-semibold text-emerald-800">Value</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.reactions.map((reaction, index) => (
                  <motion.tr
                    key={`${reaction.at}-${reaction.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="border-b border-emerald-100 last:border-b-0 hover:bg-emerald-50/50 transition-colors duration-200"
                  >
                    <td className="py-3 text-sm text-emerald-900 font-medium">{reaction.at}</td>
                    <td className="py-3 text-sm text-right text-emerald-700 capitalize">{reaction.type}</td>
                    <td className="py-3 text-sm text-right font-bold text-emerald-800">
                      {reaction.type === 'vertical' && reaction.R !== undefined && `${reaction.R.toFixed(1)} ${getUnitLabel()}`}
                      {reaction.type === 'moment' && reaction.M !== undefined && `${reaction.M.toFixed(1)} ${getMomentUnitLabel()}`}
                      {reaction.type === 'horizontal' && reaction.H !== undefined && `${reaction.H.toFixed(1)} ${getUnitLabel()}`}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maximum Values Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600">
            <h4 className="text-lg font-bold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Maximum Values
            </h4>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-200">
                  <th className="text-left py-3 text-sm font-semibold text-emerald-800">Parameter</th>
                  <th className="text-right py-3 text-sm font-semibold text-emerald-800">Value</th>
                  <th className="text-right py-3 text-sm font-semibold text-emerald-800">Position ({getLengthUnitLabel()})</th>
                </tr>
              </thead>
              <tbody>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors duration-200"
                >
                  <td className="py-3 text-sm text-emerald-900 font-medium">Max Shear Force</td>
                  <td className="py-3 text-sm text-right font-bold text-emerald-600">
                    {analysisResult.extrema.Vmax.toFixed(1)} {getUnitLabel()}
                  </td>
                  <td className="py-3 text-sm text-right text-emerald-700">
                    {analysisResult.extrema.positions.Vmax_pos.toFixed(1)}
                  </td>
                </motion.tr>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors duration-200"
                >
                  <td className="py-3 text-sm text-emerald-900 font-medium">Min Shear Force</td>
                  <td className="py-3 text-sm text-right font-bold text-emerald-600">
                    {analysisResult.extrema.Vmin.toFixed(1)} {getUnitLabel()}
                  </td>
                  <td className="py-3 text-sm text-right text-emerald-700">
                    {analysisResult.extrema.positions.Vmin_pos.toFixed(1)}
                  </td>
                </motion.tr>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors duration-200"
                >
                  <td className="py-3 text-sm text-emerald-900 font-medium">Max Bending Moment</td>
                  <td className="py-3 text-sm text-right font-bold text-green-600">
                    {analysisResult.extrema.Mmax.toFixed(1)} {getMomentUnitLabel()}
                  </td>
                  <td className="py-3 text-sm text-right text-emerald-700">
                    {analysisResult.extrema.positions.Mmax_pos.toFixed(1)}
                  </td>
                </motion.tr>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="border-b border-emerald-100 last:border-b-0 hover:bg-emerald-50/50 transition-colors duration-200"
                >
                  <td className="py-3 text-sm text-emerald-900 font-medium">Min Bending Moment</td>
                  <td className="py-3 text-sm text-right font-bold text-green-600">
                    {analysisResult.extrema.Mmin.toFixed(1)} {getMomentUnitLabel()}
                  </td>
                  <td className="py-3 text-sm text-right text-emerald-700">
                    {analysisResult.extrema.positions.Mmin_pos.toFixed(1)}
                  </td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Load Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600">
          <h4 className="text-lg font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Load Summary
          </h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/30">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{loads.point.length}</div>
              <div className="text-sm text-emerald-700 font-medium">Point Loads</div>
            </div>
            <div className="text-center p-4 bg-green-50/50 rounded-xl border border-green-200/30">
              <div className="text-3xl font-bold text-green-600 mb-2">{loads.angled.length}</div>
              <div className="text-sm text-green-700 font-medium">Angled Loads</div>
            </div>
            <div className="text-center p-4 bg-teal-50/50 rounded-xl border border-teal-200/30">
              <div className="text-3xl font-bold text-teal-600 mb-2">{loads.udl.length}</div>
              <div className="text-sm text-teal-700 font-medium">UDL</div>
            </div>
            <div className="text-center p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/30">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{loads.uvl.length}</div>
              <div className="text-sm text-emerald-700 font-medium">UVL</div>
            </div>
            <div className="text-center p-4 bg-green-50/50 rounded-xl border border-green-200/30">
              <div className="text-3xl font-bold text-green-600 mb-2">{loads.moment.length}</div>
              <div className="text-sm text-green-700 font-medium">Moments</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-emerald-200 text-center">
            <div className="text-xl font-bold text-emerald-800 bg-emerald-50/50 rounded-xl py-3 px-6 inline-block">
              Total Loads: {totalLoads}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

