'use client';

import { motion } from 'framer-motion';
import { BeamData, Support, Loads } from '@/types/beam';

interface BeamDiagramProps {
  beamData: BeamData;
  supports: Support;
  loads: Loads;
}

export default function BeamDiagram({ beamData, supports, loads }: BeamDiagramProps) {
  const width = 900;
  const height = 280; // Increased height for scale at bottom
  const margin = 80;
  const beamHeight = 12;
  
  // Calculate beam width and position for perfect centering
  const beamWidth = width - 2 * margin;
  const scaleX = beamWidth / beamData.length;
  const centerY = height / 2 - 20; // Moved up slightly to make room for scale
  
  const getX = (position: number) => margin + position * scaleX;
  
  // Fixed arrow height for consistent styling
  const getArrowHeight = (magnitude: number) => {
    return 30; // Fixed height for all forces
  };

  // Collect all loads with their positions for grouping
  const allLoads: Array<{ type: string; label: string; x: number; magnitude: number; angle?: number }> = [];
  
  // Point loads
  loads.point.forEach(load => {
    allLoads.push({ type: 'point', label: load.label, x: load.x, magnitude: load.P });
  });
  
  // Angled loads
  loads.angled.forEach(load => {
    allLoads.push({ type: 'angled', label: load.label, x: load.x, magnitude: load.P, angle: load.theta_deg });
  });
  
  // Moment loads
  loads.moment.forEach(load => {
    allLoads.push({ type: 'moment', label: load.label, x: load.x, magnitude: load.M });
  });
  
  // Group loads by position to handle overlapping
  const groupedLoads = allLoads.reduce((groups, load) => {
    const pos = Math.round(load.x * 10) / 10;
    if (!groups[pos]) groups[pos] = [];
    groups[pos].push(load);
    return groups;
  }, {} as { [key: string]: typeof allLoads });

  // Get beam type description
  const getBeamTypeDescription = () => {
    if (supports.type === 'fixed') {
      return 'Cantilever Beam (Fixed Support)';
    } else if (supports.type === 'pin+roller') {
      return 'Simply Supported Beam (Pin + Roller)';
    }
    return 'Beam';
  };

  const renderLoad = (load: typeof allLoads[0], index: number) => {
    const x = getX(load.x);
    const arrowHeight = getArrowHeight(load.magnitude);
    const yOffset = index * 35; // Increased spacing between stacked loads
    
    if (load.type === 'point') {
      // For point loads: default to downward direction (negative = upward arrow, positive = downward arrow)
      const isUpward = load.magnitude < 0; // Inverted logic
      const arrowStartY = centerY - beamHeight / 2;
      const arrowEndY = isUpward ? arrowStartY - arrowHeight : arrowStartY + arrowHeight;
      
      return (
        <motion.g
          key={`${load.label}-${index}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
        >
          {/* Arrow shaft */}
          <line
            x1={x}
            y1={arrowStartY}
            x2={x}
            y2={arrowEndY}
            stroke="#dc2626"
            strokeWidth="2.5"
          />
          {/* Arrowhead - increased size */}
          <polygon
            points={`${x - 4},${arrowEndY + (isUpward ? 4 : -4)} ${x + 4},${arrowEndY + (isUpward ? 4 : -4)} ${x},${arrowEndY + (isUpward ? 0 : 0)}`}
            fill="#dc2626"
          />
          {/* Label above arrow tip */}
          <text
            x={x}
            y={arrowEndY + (isUpward ? -10 : 15)}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700"
          >
            {Math.abs(load.magnitude)} {beamData.units.force}
          </text>
        </motion.g>
      );
    } else if (load.type === 'angled') {
      const angle = load.angle! * Math.PI / 180;
      const arrowLength = getArrowHeight(load.magnitude);
      const endX = x + arrowLength * Math.cos(angle);
      const endY = centerY - beamHeight / 2 - arrowLength * Math.sin(angle);
      
      return (
        <motion.g
          key={`${load.label}-${index}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
        >
          {/* Angled arrow */}
          <line
            x1={x}
            y1={centerY - beamHeight / 2}
            x2={endX}
            y2={endY}
            stroke="#059669"
            strokeWidth="2.5"
          />
          {/* Arrowhead - increased size */}
          <polygon
            points={`${endX - 4 * Math.cos(angle - 0.3)},${endY + 4 * Math.sin(angle - 0.3)} ${endX - 4 * Math.cos(angle + 0.3)},${endY + 4 * Math.sin(angle + 0.3)} ${endX},${endY}`}
            fill="#059669"
          />
          {/* Label */}
          <text
            x={x + 15}
            y={centerY - beamHeight / 2 - 15}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700"
          >
            {Math.abs(load.magnitude)} {beamData.units.force}
          </text>
        </motion.g>
      );
    } else if (load.type === 'moment') {
      const isClockwise = load.magnitude < 0;
      const momentRadius = 20;
      const arrowY = centerY - beamHeight / 2 - momentRadius; // No offset - sits on beam
      
      // Create semi-circular arc path
      const startAngle = isClockwise ? 0 : Math.PI;
      const endAngle = isClockwise ? Math.PI : 0;
      const arcPath = `M ${x - momentRadius} ${arrowY} A ${momentRadius} ${momentRadius} 0 0 ${isClockwise ? 1 : 0} ${x + momentRadius} ${arrowY}`;
      
      return (
        <motion.g
          key={`${load.label}-${index}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
        >
          {/* Semi-circular arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2.5"
          />
          {/* Arrowhead at the end of the arc */}
          <polygon
            points={`${x + momentRadius - 4},${arrowY - 4} ${x + momentRadius - 4},${arrowY + 4} ${x + momentRadius + 4},${arrowY}`}
            fill="#7c3aed"
            transform={`rotate(${isClockwise ? 0 : 180}, ${x + momentRadius}, ${arrowY})`}
          />
          {/* Label outside the arc */}
          <text
            x={x}
            y={arrowY - momentRadius - 15}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700"
          >
            {Math.abs(load.magnitude)} {beamData.units.force}·{beamData.units.length}
          </text>
        </motion.g>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Beam Diagram</h3>
        <span className="text-sm text-gray-500 font-medium">{getBeamTypeDescription()}</span>
      </div>
      <div className="bg-white rounded-lg p-6 border border-gray-200 overflow-x-auto">
        <svg width={width} height={height} className="w-full min-w-max">
          {/* Definitions */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Beam - perfectly centered */}
          <motion.rect
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            x={margin}
            y={centerY - beamHeight / 2}
            width={beamWidth}
            height={beamHeight}
            fill="#16a34a"
            stroke="#15803d"
            strokeWidth="1.5"
            rx="2"
          />
          
          {/* Supports */}
          {supports.type === 'pin+roller' && (
            <>
              {/* Pin Support */}
              <motion.g
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {/* Pin Support - Triangle with circle */}
                <circle
                  cx={getX(supports.pin_x || 0)}
                  cy={centerY + beamHeight / 2 + 15}
                  r="6"
                  fill="#374151"
                  stroke="#111827"
                  strokeWidth="1"
                />
                <polygon
                  points={`${getX(supports.pin_x || 0) - 8},${centerY + beamHeight / 2 + 25} ${getX(supports.pin_x || 0) + 8},${centerY + beamHeight / 2 + 25} ${getX(supports.pin_x || 0)},${centerY + beamHeight / 2 + 15}`}
                  fill="#374151"
                  stroke="#111827"
                  strokeWidth="1"
                />
                <text
                  x={getX(supports.pin_x || 0)}
                  y={centerY + beamHeight / 2 + 45}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  Pin
                </text>
              </motion.g>
              
              {/* Roller Support */}
              <motion.g
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {/* Roller Support - Rectangle with circles */}
                <rect
                  x={getX(supports.roller_x || beamData.length) - 8}
                  y={centerY + beamHeight / 2 + 15}
                  width={16}
                  height={8}
                  fill="#374151"
                  stroke="#111827"
                  strokeWidth="1"
                  rx="2"
                />
                <circle
                  cx={getX(supports.roller_x || beamData.length) - 4}
                  cy={centerY + beamHeight / 2 + 25}
                  r="3"
                  fill="#374151"
                  stroke="#111827"
                  strokeWidth="1"
                />
                <circle
                  cx={getX(supports.roller_x || beamData.length) + 4}
                  cy={centerY + beamHeight / 2 + 25}
                  r="3"
                  fill="#374151"
                  stroke="#111827"
                  strokeWidth="1"
                />
                <text
                  x={getX(supports.roller_x || beamData.length)}
                  y={centerY + beamHeight / 2 + 45}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  Roller
                </text>
              </motion.g>
            </>
          )}
          
          {supports.type === 'fixed' && (
            <motion.g
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Fixed Support - Embedded beam end */}
              <rect
                x={getX(supports.fixed_pos === 'right' ? beamData.length : 0) - 20}
                y={centerY + beamHeight / 2 + 5}
                width={40}
                height={30}
                fill="#6b7280"
                stroke="#374151"
                strokeWidth="1"
                rx="3"
              />
              {/* Hatching pattern for embedded section */}
              {Array.from({ length: 8 }, (_, i) => (
                <line
                  key={i}
                  x1={getX(supports.fixed_pos === 'right' ? beamData.length : 0) - 18 + i * 2}
                  y1={centerY + beamHeight / 2 + 8}
                  x2={getX(supports.fixed_pos === 'right' ? beamData.length : 0) - 18 + i * 2}
                  y2={centerY + beamHeight / 2 + 28}
                  stroke="#4b5563"
                  strokeWidth="0.5"
                />
              ))}
              {/* Beam continuation into support */}
              <rect
                x={getX(supports.fixed_pos === 'right' ? beamData.length : 0) - 6}
                y={centerY + beamHeight / 2 + 5}
                width={12}
                height={beamHeight}
                fill="#16a34a"
                stroke="#15803d"
                strokeWidth="1"
              />
              {/* Foundation/base */}
              <rect
                x={getX(supports.fixed_pos === 'right' ? beamData.length : 0) - 25}
                y={centerY + beamHeight / 2 + 35}
                width={50}
                height={8}
                fill="#374151"
                stroke="#111827"
                strokeWidth="1"
                rx="2"
              />
              <text
                x={getX(supports.fixed_pos === 'right' ? beamData.length : 0)}
                y={centerY + beamHeight / 2 + 55}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                Fixed
              </text>
            </motion.g>
          )}
          
          {/* Loads */}
          {Object.entries(groupedLoads).map(([position, loadsAtPosition]) => (
            <g key={position}>
              {loadsAtPosition.map((load, index) => renderLoad(load, index))}
              {/* Badge for multiple loads */}
              {loadsAtPosition.length > 1 && (
                <motion.g
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <circle
                    cx={getX(parseFloat(position)) + 15}
                    cy={centerY - beamHeight / 2 - 15}
                    r="8"
                    fill="#ef4444"
                    stroke="#dc2626"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(parseFloat(position)) + 15}
                    y={centerY - beamHeight / 2 - 12}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    ×{loadsAtPosition.length}
                  </text>
                </motion.g>
              )}
            </g>
          ))}
          
          {/* Distributed loads */}
          {loads.udl.map((load, index) => (
            <motion.g
              key={`udl-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              {/* UDL arrows */}
              {Array.from({ length: 8 }, (_, i) => {
                const x = getX(load.a + (load.b - load.a) * i / 7);
                const isUpward = load.w > 0;
                const arrowHeight = getArrowHeight(load.w);
                const arrowStartY = centerY - beamHeight / 2;
                const arrowEndY = isUpward ? arrowStartY - arrowHeight : arrowStartY + arrowHeight;
                
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={arrowStartY}
                      x2={x}
                      y2={arrowEndY}
                      stroke="#dc2626"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`${x - 2},${arrowEndY + (isUpward ? 2 : -2)} ${x + 2},${arrowEndY + (isUpward ? 2 : -2)} ${x},${arrowEndY + (isUpward ? 0 : 0)}`}
                      fill="#dc2626"
                    />
                  </g>
                );
              })}
              {/* Label */}
              <text
                x={getX((load.a + load.b) / 2)}
                y={centerY - beamHeight / 2 - 35}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {Math.abs(load.w)} {beamData.units.force}/{beamData.units.length}
              </text>
            </motion.g>
          ))}
          
          {loads.uvl.map((load, index) => (
            <motion.g
              key={`uvl-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              {/* UVL arrows with varying heights */}
              {Array.from({ length: 8 }, (_, i) => {
                const x = getX(load.a + (load.b - load.a) * i / 7);
                const w = load.w1 + (load.w2 - load.w1) * i / 7;
                const isUpward = w > 0;
                const arrowHeight = getArrowHeight(w);
                const arrowStartY = centerY - beamHeight / 2;
                const arrowEndY = isUpward ? arrowStartY - arrowHeight : arrowStartY + arrowHeight;
                
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={arrowStartY}
                      x2={x}
                      y2={arrowEndY}
                      stroke="#059669"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`${x - 2},${arrowEndY + (isUpward ? 2 : -2)} ${x + 2},${arrowEndY + (isUpward ? 2 : -2)} ${x},${arrowEndY + (isUpward ? 0 : 0)}`}
                      fill="#059669"
                    />
                  </g>
                );
              })}
              {/* Label */}
              <text
                x={getX((load.a + load.b) / 2)}
                y={centerY - beamHeight / 2 - 35}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {Math.abs(load.w1)}-{Math.abs(load.w2)} {beamData.units.force}/{beamData.units.length}
              </text>
            </motion.g>
          ))}
          
          {/* Scale at the bottom */}
          <g>
            {/* Scale line */}
            <line
              x1={margin}
              y1={height - 30}
              x2={width - margin}
              y2={height - 30}
              stroke="#374151"
              strokeWidth="1"
            />
            
            {/* Left arrow */}
            <polygon
              points={`${margin - 8},${height - 30} ${margin},${height - 35} ${margin},${height - 25}`}
              fill="#374151"
            />
            
            {/* Right arrow */}
            <polygon
              points={`${width - margin + 8},${height - 30} ${width - margin},${height - 35} ${width - margin},${height - 25}`}
              fill="#374151"
            />
            
            {/* Force position ticks and labels */}
            {Object.entries(groupedLoads).map(([position, loadsAtPosition]) => {
              const x = getX(parseFloat(position));
              return (
                <g key={`scale-${position}`}>
                  {/* Tick mark */}
                  <line
                    x1={x}
                    y1={height - 35}
                    x2={x}
                    y2={height - 25}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  {/* Position value */}
                  <text
                    x={x}
                    y={height - 15}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {parseFloat(position)}
                  </text>
                </g>
              );
            })}
            
            {/* UDL start and end positions */}
            {loads.udl.map((load, index) => (
              <g key={`udl-scale-${index}`}>
                {/* Start position */}
                <g>
                  <line
                    x1={getX(load.a)}
                    y1={height - 35}
                    x2={getX(load.a)}
                    y2={height - 25}
                    stroke="#dc2626"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(load.a)}
                    y={height - 15}
                    textAnchor="middle"
                    className="text-xs font-medium fill-red-600"
                  >
                    {load.a}
                  </text>
                </g>
                {/* End position */}
                <g>
                  <line
                    x1={getX(load.b)}
                    y1={height - 35}
                    x2={getX(load.b)}
                    y2={height - 25}
                    stroke="#dc2626"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(load.b)}
                    y={height - 15}
                    textAnchor="middle"
                    className="text-xs font-medium fill-red-600"
                  >
                    {load.b}
                  </text>
                </g>
              </g>
            ))}
            
            {/* UVL start and end positions */}
            {loads.uvl.map((load, index) => (
              <g key={`uvl-scale-${index}`}>
                {/* Start position */}
                <g>
                  <line
                    x1={getX(load.a)}
                    y1={height - 35}
                    x2={getX(load.a)}
                    y2={height - 25}
                    stroke="#059669"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(load.a)}
                    y={height - 15}
                    textAnchor="middle"
                    className="text-xs font-medium fill-green-600"
                  >
                    {load.a}
                  </text>
                </g>
                {/* End position */}
                <g>
                  <line
                    x1={getX(load.b)}
                    y1={height - 35}
                    x2={getX(load.b)}
                    y2={height - 25}
                    stroke="#059669"
                    strokeWidth="1"
                  />
                  <text
                    x={getX(load.b)}
                    y={height - 15}
                    textAnchor="middle"
                    className="text-xs font-medium fill-green-600"
                  >
                    {load.b}
                  </text>
                </g>
              </g>
            ))}
            
            {/* Moment positions */}
            {loads.moment.map((load, index) => (
              <g key={`moment-scale-${index}`}>
                <line
                  x1={getX(load.x)}
                  y1={height - 35}
                  x2={getX(load.x)}
                  y2={height - 25}
                  stroke="#7c3aed"
                  strokeWidth="1"
                />
                <text
                  x={getX(load.x)}
                  y={height - 15}
                  textAnchor="middle"
                  className="text-xs font-medium fill-purple-600"
                >
                  {load.x}
                </text>
              </g>
            ))}
            
            {/* Total length label at right end */}
            <text
              x={width - margin + 10}
              y={height - 15}
              textAnchor="start"
              className="text-sm font-medium fill-gray-700"
            >
              L = {beamData.length} {beamData.units.length}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
