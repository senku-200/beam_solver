'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BeamData, 
  Support, 
  Loads
} from '@/types/beam';
import { calculateBeamAnalysis } from '@/utils/beamCalculations';
import BeamDiagram from '@/components/BeamDiagram';
import ShearForceDiagram from '@/components/ShearForceDiagram';
import BendingMomentDiagram from '@/components/BendingMomentDiagram';
import ResultsTable from '@/components/ResultsTable';
import BeamSettingsSection from '@/components/BeamSettingsSection';
import SupportsSection from '@/components/SupportsSection';
import LoadsSection from '@/components/LoadsSection';

export default function BeamSolver() {
  // Default values
  const defaultBeamData: BeamData = {
    length: 30,
    units: { length: 'm', force: 'kN' }
  };

  const defaultSupports: Support = {
    type: 'pin+roller',
    pin_x: 0,
    roller_x: 30
  };

  const defaultLoads: Loads = {
    point: [
      { label: 'P1', x: 6, P: 10 },  // Downward force (positive)
      { label: 'P2', x: 20, P: 50 }  // Downward force (positive)
    ],
    angled: [],
    udl: [],
    uvl: [],
    moment: []
  };

  const [beamData, setBeamData] = useState<BeamData>(defaultBeamData);
  const [supports, setSupports] = useState<Support>(defaultSupports);
  const [loads, setLoads] = useState<Loads>(defaultLoads);

  const resetAllConfigurations = () => {
    setBeamData(defaultBeamData);
    setSupports(defaultSupports);
    setLoads(defaultLoads);
  };

  const analysisResult = useMemo(() => {
    return calculateBeamAnalysis(beamData, supports, loads);
  }, [beamData, supports, loads]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-emerald-200/50 sticky top-0 z-50">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                Beam Solver
              </h1>
              <p className="text-sm text-emerald-600/70 font-medium">Structural Analysis Tool</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Modern Sidebar */}
        <div className="w-full lg:w-96 bg-white/90 backdrop-blur-sm shadow-xl border-r border-emerald-200/50 min-h-screen p-6 lg:p-8">
          <div className="space-y-8">
            <BeamSettingsSection 
              beamData={beamData} 
              onBeamDataChange={setBeamData}
              onResetAll={resetAllConfigurations}
            />
            
            <SupportsSection 
              supports={supports} 
              beamData={beamData} 
              onSupportsChange={setSupports} 
            />
            
            <LoadsSection 
              loads={loads} 
              beamData={beamData} 
              onLoadsChange={setLoads} 
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="space-y-8 lg:space-y-10 max-w-7xl mx-auto">
            {/* Beam Diagram */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">Beam Configuration</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
              </div>
              <BeamDiagram 
                beamData={beamData} 
                supports={supports} 
                loads={loads} 
              />
            </motion.div>

            {/* Analysis Results Grid */}
            <div className="grid gap-8">
              {/* Shear Force Diagram */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 hover:shadow-2xl transition-all duration-300"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-emerald-800 mb-2">Shear Force Diagram</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
                </div>
                <ShearForceDiagram 
                  beamData={beamData} 
                  analysisResult={analysisResult} 
                />
              </motion.div>
              
              {/* Bending Moment Diagram */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 hover:shadow-2xl transition-all duration-300"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-emerald-800 mb-2">Bending Moment Diagram</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
                </div>
                <BendingMomentDiagram 
                  beamData={beamData} 
                  analysisResult={analysisResult} 
                />
              </motion.div>
            </div>

            {/* Results Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200/50 p-8 hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">Analysis Results</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
              </div>
              <ResultsTable 
                beamData={beamData} 
                analysisResult={analysisResult} 
                loads={loads} 
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
