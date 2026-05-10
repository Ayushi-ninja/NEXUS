import { useState, useEffect, useRef, useCallback } from 'react';
import { WeatherType } from './useSimulationEngine';

export const useAmbientAudio = (weather: WeatherType, isEmergencyActive: boolean) => {
  const [isMuted, setIsMuted] = useState(true); // Default to muted to prevent autoplay issues
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio Nodes
  const rainGainRef = useRef<GainNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const trafficGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Siren state
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const sirenIntervalRef = useRef<number | null>(null);

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    masterGainRef.current = ctx.createGain();
    masterGainRef.current.connect(ctx.destination);
    masterGainRef.current.gain.value = isMuted ? 0 : 0.5;

    // --- Traffic Drone (Brown Noise approximation) ---
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for gain
    }
    const trafficSource = ctx.createBufferSource();
    trafficSource.buffer = noiseBuffer;
    trafficSource.loop = true;
    
    const trafficFilter = ctx.createBiquadFilter();
    trafficFilter.type = 'lowpass';
    trafficFilter.frequency.value = 400; // Low rumble
    
    trafficGainRef.current = ctx.createGain();
    trafficGainRef.current.gain.value = 0.3; // Base traffic volume
    
    trafficSource.connect(trafficFilter);
    trafficFilter.connect(trafficGainRef.current);
    trafficGainRef.current.connect(masterGainRef.current);
    trafficSource.start();

    // --- Rain (Pink Noise) ---
    const rainBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const rainOutput = rainBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        rainOutput[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        rainOutput[i] *= 0.11;
        b6 = white * 0.115926;
    }
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;
    
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.value = 400;
    
    rainGainRef.current = ctx.createGain();
    rainGainRef.current.gain.value = 0; // Starts muted
    
    rainSource.connect(rainFilter);
    rainFilter.connect(rainGainRef.current);
    rainGainRef.current.connect(masterGainRef.current);
    rainSource.start();

    // --- Siren Setup (European Yelp) ---
    sirenGainRef.current = ctx.createGain();
    sirenGainRef.current.gain.value = 0;
    sirenGainRef.current.connect(masterGainRef.current);
    
    const startSiren = () => {
      if (!ctx || !sirenGainRef.current) return;
      sirenOscRef.current = ctx.createOscillator();
      sirenOscRef.current.type = 'square';
      sirenOscRef.current.connect(sirenGainRef.current);
      sirenOscRef.current.start();
      
      let high = false;
      sirenIntervalRef.current = window.setInterval(() => {
        if (!sirenOscRef.current) return;
        sirenOscRef.current.frequency.setValueAtTime(high ? 650 : 900, ctx.currentTime);
        high = !high;
      }, 500); // 500ms toggle European style siren
    };
    
    // Store siren starter for later
    (audioCtxRef.current as any)._startSiren = startSiren;
    
  }, [isMuted]);

  // Handle Mute Toggle
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      masterGainRef.current.gain.setTargetAtTime(isMuted ? 0 : 0.5, now, 0.1);
      
      // If unmuted and context is suspended (browser policy), resume it
      if (!isMuted && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    }
  }, [isMuted]);

  // Handle Weather changes (Rain)
  useEffect(() => {
    if (!audioCtxRef.current || !rainGainRef.current) return;
    const now = audioCtxRef.current.currentTime;
    
    if (weather === 'rain') {
      rainGainRef.current.gain.setTargetAtTime(0.5, now, 1.0); // Fade in over 1 sec
    } else {
      rainGainRef.current.gain.setTargetAtTime(0, now, 1.0); // Fade out over 1 sec
    }
  }, [weather]);

  // Handle Emergency Siren
  useEffect(() => {
    if (!audioCtxRef.current || !sirenGainRef.current) return;
    const now = audioCtxRef.current.currentTime;

    if (isEmergencyActive) {
      sirenGainRef.current.gain.setTargetAtTime(0.15, now, 0.5);
      const ctx = audioCtxRef.current as any;
      if (ctx._startSiren && !sirenOscRef.current) {
        ctx._startSiren();
      }
    } else {
      sirenGainRef.current.gain.setTargetAtTime(0, now, 0.5);
      
      // Stop siren osc after fade out
      setTimeout(() => {
        if (sirenOscRef.current) {
          try { sirenOscRef.current.stop(); } catch(e) {}
          sirenOscRef.current.disconnect();
          sirenOscRef.current = null;
        }
        if (sirenIntervalRef.current) {
          clearInterval(sirenIntervalRef.current);
          sirenIntervalRef.current = null;
        }
      }, 1000);
    }
  }, [isEmergencyActive]);

  const toggleMute = useCallback(() => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    setIsMuted(m => !m);
  }, [initAudio]);

  return { isMuted, toggleMute };
};
