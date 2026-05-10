import { useRef, useEffect, useCallback } from 'react';
import {
  Vehicle,
  TrafficSignal,
  CongestionZone,
  EmergencyVehicleState,
  WeatherType,
} from '../../hooks/useSimulationEngine';
import VehicleOverlay from './VehicleOverlay';

interface Props {
  vehicles: Vehicle[];
  signals: TrafficSignal[];
  congestionZones: CongestionZone[];
  emergencyVehicle: EmergencyVehicleState;
  weather: WeatherType;
  showCongestion: boolean;
  showWeather: boolean;
  showDensity: boolean;
}

const CANVAS_SIZE = 800;
const CENTER = CANVAS_SIZE / 2;
const ROAD_W = 120;
const HALF_ROAD = ROAD_W / 2;

/* Rain / fog particles */
interface Particle { x: number; y: number; speed: number; length: number; opacity: number; }
let rainParticles: Particle[] = [];
let fogParticles: Particle[] = [];
const initRain = () => {
  rainParticles = Array.from({ length: 450 }, () => ({
    x: Math.random() * CANVAS_SIZE,
    y: Math.random() * CANVAS_SIZE,
    speed: 6 + Math.random() * 8,
    length: 12 + Math.random() * 20,
    opacity: 0.1 + Math.random() * 0.3,
  }));
};
const initFog = () => {
  fogParticles = Array.from({ length: 60 }, () => ({
    x: Math.random() * CANVAS_SIZE,
    y: Math.random() * CANVAS_SIZE,
    speed: 0.1 + Math.random() * 0.3,
    length: 120 + Math.random() * 200,
    opacity: 0.03 + Math.random() * 0.06,
  }));
};
initRain();
initFog();

const TrafficJunctionCanvas = ({
  vehicles,
  signals,
  congestionZones,
  emergencyVehicle,
  weather,
  showCongestion,
  showWeather,
  showDensity,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const pulseRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    // Use the smaller dimension to keep square aspect ratio
    const size = Math.min(rect.width, rect.height);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const scale = size / CANVAS_SIZE;
    ctx.save();
    ctx.scale(scale, scale);

    pulseRef.current += 0.02;

    /* ===== Background ===== */
    ctx.fillStyle = '#080c1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < CANVAS_SIZE; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
    }

    /* ===== Roads ===== */
    const drawRoad = (x: number, y: number, w: number, h: number, vertical: boolean) => {
      // Road base with asphalt texture feel
      const roadGrd = ctx.createLinearGradient(x, y, vertical ? x + w : x, vertical ? y : y + h);
      roadGrd.addColorStop(0, '#111827');
      roadGrd.addColorStop(0.5, '#1f2937');
      roadGrd.addColorStop(1, '#111827');
      ctx.fillStyle = roadGrd;
      ctx.fillRect(x, y, w, h);

      // Fine grain noise for asphalt (subtle)
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 1, 1);
      }
      ctx.globalAlpha = 1;

      // Road edges — double neon glow
      ctx.shadowBlur = 15;
      ctx.lineWidth = 2;
      
      const drawEdge = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.shadowColor = '#00d4ff';
        ctx.strokeStyle = 'rgba(0,212,255,0.4)';
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      };

      if (vertical) {
        drawEdge(x, y, x, y + h);
        drawEdge(x + w, y, x + w, y + h);
      } else {
        drawEdge(x, y, x + w, y);
        drawEdge(x, y + h, x + w, y + h);
      }
    };

    // Vertical road
    drawRoad(CENTER - HALF_ROAD, 0, ROAD_W, CANVAS_SIZE, true);
    // Horizontal road
    drawRoad(0, CENTER - HALF_ROAD, CANVAS_SIZE, ROAD_W, false);

    // Lane dividers (Premium style)
    ctx.setLineDash([20, 15]);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    // Vertical center lines
    ctx.beginPath(); ctx.moveTo(CENTER, 0); ctx.lineTo(CENTER, CENTER - HALF_ROAD); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CENTER, CENTER + HALF_ROAD); ctx.lineTo(CENTER, CANVAS_SIZE); ctx.stroke();
    // Horizontal center lines
    ctx.beginPath(); ctx.moveTo(0, CENTER); ctx.lineTo(CENTER - HALF_ROAD, CENTER); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CENTER + HALF_ROAD, CENTER); ctx.lineTo(CANVAS_SIZE, CENTER); ctx.stroke();
    ctx.setLineDash([]);

    // Crosswalk markings
    const drawCrosswalk = (x: number, y: number, horizontal: boolean) => {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for (let i = 0; i < 6; i++) {
        if (horizontal) {
          ctx.fillRect(x + i * 18, y, 12, ROAD_W);
        } else {
          ctx.fillRect(x, y + i * 18, ROAD_W, 12);
        }
      }
    };
    drawCrosswalk(CENTER - HALF_ROAD - 110, CENTER - HALF_ROAD, false);
    drawCrosswalk(CENTER + HALF_ROAD + 2, CENTER - HALF_ROAD, false);
    drawCrosswalk(CENTER - HALF_ROAD, CENTER - HALF_ROAD - 110, true);
    drawCrosswalk(CENTER - HALF_ROAD, CENTER + HALF_ROAD + 2, true);

    /* ===== Junction center ===== */
    ctx.fillStyle = '#151a30';
    ctx.fillRect(CENTER - HALF_ROAD, CENTER - HALF_ROAD, ROAD_W, ROAD_W);

    // Junction glow border
    const junctionGlow = 0.2 + Math.sin(pulseRef.current) * 0.1;
    ctx.strokeStyle = `rgba(0,212,255,${junctionGlow})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(CENTER - HALF_ROAD, CENTER - HALF_ROAD, ROAD_W, ROAD_W);

    /* ===== Congestion Zones ===== */
    if (showCongestion) {
      congestionZones.forEach(zone => {
        if (zone.level < 15) return;
        const alpha = Math.min(0.4, zone.level / 250) + Math.sin(pulseRef.current * 1.5) * 0.05;
        const gradient_length = 200 * (zone.level / 100);

        let grd: CanvasGradient;
        switch (zone.direction) {
          case 'north':
            grd = ctx.createLinearGradient(CENTER, CENTER + HALF_ROAD, CENTER, CENTER + HALF_ROAD + gradient_length);
            break;
          case 'south':
            grd = ctx.createLinearGradient(CENTER, CENTER - HALF_ROAD, CENTER, CENTER - HALF_ROAD - gradient_length);
            break;
          case 'east':
            grd = ctx.createLinearGradient(CENTER - HALF_ROAD, CENTER, CENTER - HALF_ROAD - gradient_length, CENTER);
            break;
          case 'west':
            grd = ctx.createLinearGradient(CENTER + HALF_ROAD, CENTER, CENTER + HALF_ROAD + gradient_length, CENTER);
            break;
        }
        grd.addColorStop(0, `rgba(239,68,68,${alpha})`);
        grd.addColorStop(1, 'rgba(239,68,68,0)');

        ctx.fillStyle = grd;
        switch (zone.direction) {
          case 'north':
            ctx.fillRect(CENTER - HALF_ROAD, CENTER + HALF_ROAD, ROAD_W, gradient_length);
            break;
          case 'south':
            ctx.fillRect(CENTER - HALF_ROAD, CENTER - HALF_ROAD - gradient_length, ROAD_W, gradient_length);
            break;
          case 'east':
            ctx.fillRect(CENTER - HALF_ROAD - gradient_length, CENTER - HALF_ROAD, gradient_length, ROAD_W);
            break;
          case 'west':
            ctx.fillRect(CENTER + HALF_ROAD, CENTER - HALF_ROAD, gradient_length, ROAD_W);
            break;
        }
      });
    }

    /* ===== Density Overlay ===== */
    if (showDensity) {
      congestionZones.forEach(zone => {
        const barLength = 50 * (zone.level / 100);
        const barAlpha = 0.6;
        let bx = 0, by = 0, bw = 0, bh = 0;
        switch (zone.direction) {
          case 'north': bx = CENTER + HALF_ROAD + 8; by = CENTER + HALF_ROAD + 20; bw = 6; bh = barLength; break;
          case 'south': bx = CENTER - HALF_ROAD - 14; by = CENTER - HALF_ROAD - 20 - barLength; bw = 6; bh = barLength; break;
          case 'east': bx = CENTER - HALF_ROAD - 20 - barLength; by = CENTER + HALF_ROAD + 8; bw = barLength; bh = 6; break;
          case 'west': bx = CENTER + HALF_ROAD + 20; by = CENTER - HALF_ROAD - 14; bw = barLength; bh = 6; break;
        }

        const densityColor = zone.level > 70 ? '#ef4444' : zone.level > 40 ? '#f59e0b' : '#22c55e';
        ctx.fillStyle = `${densityColor}`;
        ctx.globalAlpha = barAlpha;
        ctx.fillRect(bx, by, bw, bh);
        ctx.globalAlpha = 1;

        // Label
        ctx.fillStyle = densityColor;
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        const labelX = bx + bw / 2;
        const labelY = zone.direction === 'north' || zone.direction === 'west' ? by + bh + 12 : by - 4;
        ctx.fillText(`${zone.level}%`, labelX, labelY);
      });
    }

    /* ===== Traffic Signals ===== */
    const signalPositions: Record<string, { x: number; y: number }> = {
      north: { x: CENTER + HALF_ROAD + 25, y: CENTER + HALF_ROAD + 25 },
      south: { x: CENTER - HALF_ROAD - 25, y: CENTER - HALF_ROAD - 25 },
      east:  { x: CENTER - HALF_ROAD - 25, y: CENTER + HALF_ROAD + 25 },
      west:  { x: CENTER + HALF_ROAD + 25, y: CENTER - HALF_ROAD - 25 },
    };

    signals.forEach(signal => {
      const pos = signalPositions[signal.direction];
      if (!pos) return;

      // Signal housing - Military grade
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      const housingW = 26;
      const housingH = 68;
      
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(pos.x - housingW / 2, pos.y - housingH / 2, housingW, housingH, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Three lights with individual glass effects
      const colors: { color: string; glow: string; state: string }[] = [
        { color: '#ef4444', glow: 'rgba(239,68,68,', state: 'red' },
        { color: '#f59e0b', glow: 'rgba(245,158,11,', state: 'yellow' },
        { color: '#22c55e', glow: 'rgba(34,197,94,', state: 'green' },
      ];

      colors.forEach((c, i) => {
        const ly = pos.y - 20 + i * 20;
        const isActive = signal.color === c.state;
        const radius = 7;

        // Light background (off state)
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.arc(pos.x, ly, radius, 0, Math.PI * 2);
        ctx.fill();

        if (isActive) {
          // Dynamic glow
          const glowSize = 15 + Math.sin(pulseRef.current * 5) * 5;
          ctx.shadowColor = c.color;
          ctx.shadowBlur = glowSize;
          ctx.fillStyle = c.color;
          
          // Lens reflection
          const lensGrd = ctx.createRadialGradient(pos.x - 2, ly - 2, 1, pos.x, ly, radius);
          lensGrd.addColorStop(0, '#ffffff');
          lensGrd.addColorStop(0.2, c.color);
          lensGrd.addColorStop(1, c.color);
          ctx.fillStyle = lensGrd;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
        }

        ctx.beginPath();
        ctx.arc(pos.x, ly, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Digital Timer Display
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = signal.color === 'green' ? 5 : 0;
      ctx.fillText(`${signal.timer}s`, pos.x, pos.y + housingH / 2 + 15);
      ctx.shadowBlur = 0;
    });

    /* ===== Emergency Vehicle ===== */
    if (emergencyVehicle.active) {
      const { x, y, direction, pathPoints } = emergencyVehicle;

      // Pulse background for priority route
      const priorityAlpha = 0.05 + Math.sin(pulseRef.current * 8) * 0.03;
      ctx.fillStyle = `rgba(239,68,68,${priorityAlpha})`;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Path trail - Refined
      if (pathPoints.length > 1) {
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        }
        ctx.strokeStyle = 'rgba(239,68,68,0.5)';
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Priority lane intensity
      const beamAlpha = 0.2 + Math.sin(pulseRef.current * 10) * 0.1;
      ctx.fillStyle = `rgba(239,68,68,${beamAlpha})`;
      switch (direction) {
        case 'north': ctx.fillRect(CENTER - HALF_ROAD, y, ROAD_W, CANVAS_SIZE - y); break;
        case 'south': ctx.fillRect(CENTER - HALF_ROAD, 0, ROAD_W, y); break;
        case 'east':  ctx.fillRect(0, CENTER - HALF_ROAD, x, ROAD_W); break;
        case 'west':  ctx.fillRect(x, CENTER - HALF_ROAD, CANVAS_SIZE - x, ROAD_W); break;
      }
    }

    /* ===== Weather Overlays ===== */
    if (showWeather) {
      if (weather === 'rain') {
        rainParticles.forEach(p => {
          p.y += p.speed;
          p.x += 0.5;
          if (p.y > CANVAS_SIZE) { p.y = -p.length; p.x = Math.random() * CANVAS_SIZE; }

          ctx.strokeStyle = `rgba(100,180,255,${p.opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 1, p.y + p.length);
          ctx.stroke();
        });

        // Puddle reflections at junction
        ctx.fillStyle = 'rgba(100,180,255,0.04)';
        ctx.beginPath();
        ctx.ellipse(CENTER, CENTER, 50, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (weather === 'fog') {
        fogParticles.forEach(p => {
          p.x += p.speed;
          if (p.x > CANVAS_SIZE + p.length) { p.x = -p.length; p.y = Math.random() * CANVAS_SIZE; }

          ctx.fillStyle = `rgba(200,200,220,${p.opacity})`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.length, p.length * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        // Overall fog tint
        ctx.fillStyle = 'rgba(150,160,180,0.08)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
    }

    /* ===== Direction labels ===== */
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', CENTER, 20);
    ctx.fillText('S', CENTER, CANVAS_SIZE - 10);
    ctx.fillText('E', CANVAS_SIZE - 15, CENTER + 4);
    ctx.fillText('W', 15, CENTER + 4);

    /* ===== Vehicle Hover Tooltip ===== */
    if (mouseRef.current) {
      const { x: mx, y: my } = mouseRef.current;
      
      // Find hovered vehicle (simple bounding box check)
      let hovered: Vehicle | null = null;
      for (let i = vehicles.length - 1; i >= 0; i--) {
        const v = vehicles[i];
        const sizes: Record<string, { w: number; h: number }> = {
          car: { w: 10, h: 20 },
          bus: { w: 12, h: 30 },
          truck: { w: 12, h: 26 },
          motorcycle: { w: 14, h: 8 },
        };
        const size = sizes[v.type] || sizes.car;
        
        // Simple radius check since vehicles rotate
        const hitRadius = Math.max(size.w, size.h);
        const dx = mx - v.x;
        const dy = my - v.y;
        if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
          hovered = v;
          break;
        }
      }

      if (hovered) {
        ctx.save();
        
        const tooltipX = mx + 15;
        const tooltipY = my + 15;
        
        // Tooltip Background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.roundRect(tooltipX, tooltipY, 130, 80, 6);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tooltip Content
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${hovered.type.toUpperCase()} - ID: ${hovered.id.substring(0,4)}`, tooltipX + 10, tooltipY + 20);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`Dir: ${hovered.direction}`, tooltipX + 10, tooltipY + 38);
        ctx.fillText(`Speed: ${Math.round(hovered.speed * 10)} km/h`, tooltipX + 10, tooltipY + 52);
        
        if (hovered.waiting) {
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`Status: Waiting`, tooltipX + 10, tooltipY + 68);
        } else {
          ctx.fillStyle = '#22c55e';
          ctx.fillText(`Status: Moving`, tooltipX + 10, tooltipY + 68);
        }

        ctx.restore();
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'crosshair';
      }
    } else {
       canvas.style.cursor = 'crosshair';
    }

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(draw);
  }, [vehicles, signals, congestionZones, emergencyVehicle, weather, showCongestion, showWeather, showDensity]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseOut = () => {
    mouseRef.current = null;
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
        className="w-full h-full bg-[#080c1a]"
        style={{ imageRendering: 'auto' }}
      />
      <VehicleOverlay vehicles={vehicles} emergencyVehicle={emergencyVehicle} />
    </div>
  );
};

export default TrafficJunctionCanvas;
