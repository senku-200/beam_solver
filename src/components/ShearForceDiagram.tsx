
'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { BeamData, AnalysisResult } from '@/types/beam';

interface ShearForceDiagramProps {
  beamData: BeamData;
  analysisResult: AnalysisResult;
}

export default function ShearForceDiagram({ beamData, analysisResult }: ShearForceDiagramProps) {
  if (!analysisResult.isValid) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shear Force Diagram</h3>
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-500">No valid analysis data available</p>
        </div>
      </div>
    );
  }

  // Enhanced data generation with proper handling of different load types
  const generateDataPoints = () => {
    const dataPoints: Array<{ x: number; shearForce: number }> = [];
    
    // HACK: Force convert all values by 0.001 since the analysis provides N but we want kN
    const conversionFactor = 0.001;
    
    analysisResult.V_segments.forEach((segment, segmentIndex) => {
      const segmentLength = segment.b - segment.a;
      
      // Determine number of points based on segment type for smooth curves
      let numPoints = 2; // For constant segments (point loads)
      if (segment.type === 'linear') numPoints = 15; // For UDL (linear variation)
      if (segment.type === 'quadratic') numPoints = 25; // For UVL (parabolic variation)
      
      // Add points for this segment
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = segment.a + segmentLength * t;
        const dx = x - segment.a;
        let shearForce = 0;
        
        // Calculate shear force based on segment type and coefficients
        if (segment.coeffs && segment.coeffs.length > 0) {
          switch (segment.type) {
            case 'const':
              // Constant shear (between point loads)
              shearForce = segment.coeffs[0];
              break;
              
            case 'linear':
              // Linear variation (UDL region)
              // V(x) = c0 + c1*(x-a)
              shearForce = segment.coeffs[0] + (segment.coeffs[1] || 0) * dx;
              break;
              
            case 'quadratic':
              // Quadratic variation (UVL region)
              // V(x) = c0 + c1*(x-a) + c2*(x-a)²
              shearForce = segment.coeffs[0] + 
                          (segment.coeffs[1] || 0) * dx + 
                          (segment.coeffs[2] || 0) * dx * dx;
              break;
          }
        } else {
          // Fallback: linear interpolation between endpoints
          shearForce = (segment.V_a || 0) + ((segment.V_b || 0) - (segment.V_a || 0)) * t;
        }
        
        // HACK: Force convert N to kN
        shearForce *= conversionFactor;
        
        dataPoints.push({
          x: Math.round(x * 1000) / 1000,
          shearForce: Math.round(shearForce * 1000) / 1000
        });
      }
    });
    
    // Remove duplicates while preserving discontinuities
    const uniquePoints: Array<{ x: number; shearForce: number }> = [];
    dataPoints.forEach((point, index) => {
      if (index === 0) {
        uniquePoints.push(point);
      } else {
        const prevPoint = dataPoints[index - 1];
        // Keep point if x is different OR if shear is significantly different (discontinuity)
        if (Math.abs(point.x - prevPoint.x) > 0.0001 || 
            Math.abs(point.shearForce - prevPoint.shearForce) > 0.1) {
          uniquePoints.push(point);
        }
      }
    });
    
    return uniquePoints;
  };

  // Determine the chart interpolation type
  const getChartType = () => {
    const hasOnlyPointLoads = analysisResult.V_segments.every(s => s.type === 'const');
    const hasDistributedLoads = analysisResult.V_segments.some(s => 
      s.type === 'linear' || s.type === 'quadratic'
    );
    
    // Use step function for point loads only, otherwise use linear
    // Note: We generate enough points that linear interpolation looks smooth for curves
    return hasOnlyPointLoads ? 'stepAfter' : 'linear';
  };

  const data = generateDataPoints();
  const chartType = getChartType();
  
  // Calculate y-axis domain with padding
  const shearValues = data.map(d => d.shearForce);
  const maxShear = Math.max(...shearValues, 0);
  const minShear = Math.min(...shearValues, 0);
  const shearRange = Math.max(maxShear - minShear, 1);
  const padding = shearRange * 0.15;
  
  const yMax = maxShear + padding;
  const yMin = minShear - padding;

  const formatTick = (value: number) => {
    if (Math.abs(value) < 0.01) return '0';
    // Show only 2-3 decimal places for cleaner y-axis labels
    if (Math.abs(value) >= 1000) return value.toFixed(1);
    if (Math.abs(value) >= 100) return value.toFixed(2);
    return value.toFixed(3);
  };

  const getForceUnit = () => beamData.units.force;
  const getLengthUnit = () => beamData.units.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shear Force Diagram</h3>
        
        {/* Legend */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50/80 border border-orange-200 rounded-xl">
            <div className="w-4 h-1 bg-orange-500 rounded"></div>
            <span className="text-sm font-semibold text-orange-800">
              Shear Force ({getForceUnit()})
            </span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={320}>
          <LineChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              opacity={0.7} 
            />
            <XAxis 
              dataKey="x" 
              type="number"
              domain={[0, beamData.length]}
              label={{ 
                value: `Position (${getLengthUnit()})`, 
                position: 'insideBottom', 
                offset: -10 
              }}
              tick={{ fontSize: 11, fill: '#374151' }}
              stroke="#6b7280"
              tickFormatter={formatTick}
            />
            <YAxis 
              domain={[yMin, yMax]}
              label={{ 
                value: `Shear Force (${getForceUnit()})`, 
                angle: -90, 
                position: 'insideLeft' 
              }}
              tick={{ fontSize: 11, fill: '#374151' }}
              stroke="#6b7280"
              tickFormatter={formatTick}
            />
            <ReferenceLine 
              y={0} 
              stroke="#374151" 
              strokeDasharray="2 2" 
              opacity={0.8} 
            />
            <Tooltip 
              formatter={(value: number) => [
                `${value.toFixed(3)} ${getForceUnit()}`, 
                'Shear Force'
              ]}
              labelFormatter={(label: number) => 
                `Position: ${label.toFixed(3)} ${getLengthUnit()}`
              }
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                fontSize: '12px'
              }}
            />
            <Line
              type={chartType}
              dataKey="shearForce"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, stroke: '#f97316', strokeWidth: 2, fill: 'white' }}
              animationDuration={1000}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Extrema Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Max Shear:</span>
              <span className="font-semibold text-orange-600">
                {(analysisResult.extrema.Vmax * 0.001).toFixed(3)} {getForceUnit()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">At Position:</span>
              <span className="font-semibold text-orange-600">
                {analysisResult.extrema.positions.Vmax_pos.toFixed(3)} {getLengthUnit()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Min Shear:</span>
              <span className="font-semibold text-orange-600">
                {(analysisResult.extrema.Vmin * 0.001).toFixed(3)} {getForceUnit()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">At Position:</span>
              <span className="font-semibold text-orange-600">
                {analysisResult.extrema.positions.Vmin_pos.toFixed(3)} {getLengthUnit()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Load Type Indicators */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {analysisResult.V_segments.some(s => s.type === 'const') && (
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
              Point Loads (Steps)
            </span>
          )}
          {analysisResult.V_segments.some(s => s.type === 'linear') && (
            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
              UDL (Linear Slope)
            </span>
          )}
          {analysisResult.V_segments.some(s => s.type === 'quadratic') && (
            <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
              UVL (Parabolic)
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}