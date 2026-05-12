import { useState, useEffect, useMemo } from 'react';

export type TimeRange = '1H' | '24H' | '7D' | '30D';
export type JunctionFilter = 'all' | 'j1' | 'j2' | 'j3' | 'j4';

export const useAnalyticsMockData = (timeRange: TimeRange, junction: JunctionFilter) => {
  const [liveKpis, setLiveKpis] = useState({
    activeVehicles: 1245,
    avgWaitTime: 42,
    efficiency: 87,
    emergencyIncidents: 3,
  });

  // Simulate live updating KPIs
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveKpis(prev => ({
        activeVehicles: Math.max(0, prev.activeVehicles + Math.floor(Math.random() * 21) - 10),
        avgWaitTime: Math.max(10, prev.avgWaitTime + Math.floor(Math.random() * 5) - 2),
        efficiency: Math.min(100, Math.max(50, prev.efficiency + Math.floor(Math.random() * 3) - 1)),
        emergencyIncidents: prev.emergencyIncidents, // rarely changes
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const dataMultiplier = useMemo(() => {
    switch (timeRange) {
      case '1H': return 1;
      case '24H': return 24;
      case '7D': return 168;
      case '30D': return 720;
    }
  }, [timeRange]);

  // Traffic Density Trends
  const trafficDensityData = useMemo(() => {
    const points = timeRange === '1H' ? 12 : timeRange === '24H' ? 24 : 14;
    return Array.from({ length: points }).map((_, i) => ({
      time: timeRange === '1H' ? `-${(points - i) * 5}m` : timeRange === '24H' ? `${i}:00` : `Day ${i + 1}`,
      density: Math.floor((Math.random() * 40 + 20) * dataMultiplier),
      capacity: 80 * dataMultiplier,
    }));
  }, [timeRange, dataMultiplier]);

  // Average Wait Time
  const waitTimeData = useMemo(() => {
    return [
      { junction: 'North St', wait: 35 + Math.random() * 15 },
      { junction: 'South Ave', wait: 25 + Math.random() * 10 },
      { junction: 'East Blvd', wait: 45 + Math.random() * 20 },
      { junction: 'West Pkwy', wait: 30 + Math.random() * 10 },
    ];
  }, [timeRange, junction]);

  // Emergency Response
  const emergencyData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      responseTime: 4.5 + Math.random() * 3,
      targetTime: 5.0,
    }));
  }, [timeRange]);

  // Congestion Prediction (Past + Future)
  const predictionData = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const isFuture = i >= 7;
      return {
        time: `${i + 8}:00`,
        actual: isFuture ? null : 30 + Math.random() * 40,
        predicted: 35 + Math.random() * 35,
      };
    });
  }, [timeRange, junction]);

  // Vehicle Type Distribution
  const vehicleTypeData = useMemo(() => {
    return [
      { name: 'Car', value: 65 },
      { name: 'Bus', value: 15 },
      { name: 'Truck', value: 12 },
      { name: 'Motorcycle', value: 8 },
    ];
  }, [timeRange, junction]);

  // Weather Impact
  const weatherImpactData = useMemo(() => {
    return [
      { subject: 'Traffic Volume', clear: 100, rain: 85, fog: 70 },
      { subject: 'Wait Time', clear: 100, rain: 130, fog: 150 },
      { subject: 'Accident Rate', clear: 100, rain: 140, fog: 180 },
      { subject: 'Avg Speed', clear: 100, rain: 80, fog: 65 },
      { subject: 'Signal Efficiency', clear: 100, rain: 90, fog: 85 },
    ];
  }, [timeRange]);

  // Signal Optimization Efficiency
  const optimizationData = useMemo(() => {
    const points = timeRange === '1H' ? 12 : timeRange === '24H' ? 24 : 14;
    let baseEff = 60;
    return Array.from({ length: points }).map((_, i) => {
      baseEff = Math.min(98, baseEff + Math.random() * 5 - 1);
      return {
        time: timeRange === '1H' ? `-${(points - i) * 5}m` : timeRange === '24H' ? `${i}:00` : `Day ${i + 1}`,
        efficiency: baseEff,
        baseline: 65,
      };
    });
  }, [timeRange, junction]);

  // Heatmap Data (Junctions vs Hours)
  const heatmapData = useMemo(() => {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    const junctions = ['North St', 'South Ave', 'East Blvd', 'West Pkwy'];
    const data = [];
    for (let j = 0; j < junctions.length; j++) {
      for (let h = 0; h < hours.length; h++) {
        // Higher values during rush hours (08:00 and 16:00/18:00)
        let intensity = Math.random() * 50 + 20;
        if (h === 0 || h >= 4) intensity += 30;
        data.push({
          junction: junctions[j],
          hour: hours[h],
          intensity: Math.min(100, Math.round(intensity)),
        });
      }
    }
    return { hours, junctions, data };
  }, [timeRange]);

  return {
    liveKpis,
    trafficDensityData,
    waitTimeData,
    emergencyData,
    predictionData,
    vehicleTypeData,
    weatherImpactData,
    optimizationData,
    heatmapData,
  };
};
