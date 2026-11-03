import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Info, Gauge, Activity } from 'lucide-react';

interface Particle {
  id: number;
  type: 'fe' | 'scn' | 'complex' | 'ag' | 'ppt';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const MolecularInspector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [numFe, setNumFe] = useState<number>(24);
  const [numScn, setNumScn] = useState<number>(24);
  const [numAg, setNumAg] = useState<number>(0);
  const [keq, setKeq] = useState<number>(1.0); // nominal equilibrium ratio

  // Stats computed from particles
  const [counts, setCounts] = useState({
    fe: 24,
    scn: 24,
    complex: 8,
    ppt: 0,
    qVal: 1.0,
    forwardRate: 1.0,
    reverseRate: 1.0,
  });

  const particlesRef = useRef<Particle[]>([]);

  // Initialize particle population
  const initParticles = () => {
    const list: Particle[] = [];
    const width = 640;
    const height = 360;

    // Create Fe3+ (yellow)
    for (let i = 0; i < numFe; i++) {
      list.push({
        id: Math.random(),
        type: 'fe',
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 8,
      });
    }

    // Create SCN- (cyan)
    for (let i = 0; i < numScn; i++) {
      list.push({
        id: Math.random(),
        type: 'scn',
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 7,
      });
    }

    // Initial complex ions
    for (let i = 0; i < 8; i++) {
      list.push({
        id: Math.random(),
        type: 'complex',
        x: Math.random() * (width - 40) + 20,
        y: Math.random() * (height - 40) + 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: 12,
      });
    }

    particlesRef.current = list;
  };

  useEffect(() => {
    initParticles();
  }, []);

  // Main animation and chemical collision loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isPlaying) {
        const particles = particlesRef.current;
        const width = canvas.width;
        const height = canvas.height;

        // Collision & Movement
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // If precipitate, it sinks to the bottom floor
          if (p.type === 'ppt') {
            if (p.y < height - 16) {
              p.y += 0.8;
            }
            p.vx *= 0.9;
            p.vy *= 0.9;
            continue;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Wall bounce
          if (p.x - p.radius < 0) {
            p.x = p.radius;
            p.vx = -p.vx;
          } else if (p.x + p.radius > width) {
            p.x = width - p.radius;
            p.vx = -p.vx;
          }

          if (p.y - p.radius < 0) {
            p.y = p.radius;
            p.vy = -p.vy;
          } else if (p.y + p.radius > height - 12) {
            p.y = height - 12 - p.radius;
            p.vy = -p.vy;
          }

          // Spontaneous reverse reaction: [FeNCS]2+ -> Fe3+ + SCN-
          if (p.type === 'complex' && Math.random() < 0.0035) {
            p.type = 'fe';
            p.radius = 8;
            particles.push({
              id: Math.random(),
              type: 'scn',
              x: p.x + 14,
              y: p.y,
              vx: -p.vx,
              vy: -p.vy,
              radius: 7,
            });
          }

          // Pairwise collision reactions
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const dist = Math.hypot(dx, dy);

            if (dist < p.radius + q.radius) {
              // 1. Fe3+ + SCN- -> [FeNCS]2+
              if (
                (p.type === 'fe' && q.type === 'scn') ||
                (p.type === 'scn' && q.type === 'fe')
              ) {
                // Reaction probability
                if (Math.random() < 0.28) {
                  p.type = 'complex';
                  p.radius = 12;
                  particles.splice(j, 1);
                  j--;
                  continue;
                }
              }

              // 2. Ag+ + SCN- -> AgSCN (s) precipitate!
              if (
                (p.type === 'ag' && q.type === 'scn') ||
                (p.type === 'scn' && q.type === 'ag')
              ) {
                p.type = 'ppt';
                p.radius = 6;
                particles.splice(j, 1);
                j--;
                continue;
              }

              // Elastic bounce
              p.vx = -p.vx;
              p.vy = -p.vy;
              q.vx = -q.vx;
              q.vy = -q.vy;
            }
          }
        }

        // Tally statistics
        let feCount = 0;
        let scnCount = 0;
        let complexCount = 0;
        let pptCount = 0;

        for (const p of particles) {
          if (p.type === 'fe') feCount++;
          else if (p.type === 'scn') scnCount++;
          else if (p.type === 'complex') complexCount++;
          else if (p.type === 'ppt') pptCount++;
        }

        const denom = Math.max(1, (feCount * scnCount) / 30);
        const qVal = Number((complexCount / denom).toFixed(2));
        const forwardRate = Number(((feCount * scnCount) / 250).toFixed(2));
        const reverseRate = Number((complexCount / 12).toFixed(2));

        setCounts({
          fe: feCount,
          scn: scnCount,
          complex: complexCount,
          ppt: pptCount,
          qVal,
          forwardRate,
          reverseRate,
        });
      }

      // Drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background fluid gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor sediment boundary for precipitate
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, canvas.height - 12, canvas.width, 12);

      // Draw all particles
      for (const p of particlesRef.current) {
        ctx.beginPath();
        if (p.type === 'fe') {
          // Yellow hydrated Fe3+
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#ca8a04';
          ctx.stroke();

          // Label
          ctx.fillStyle = '#713f12';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('Fe³⁺', p.x - 7, p.y + 3);
        } else if (p.type === 'scn') {
          // Cyan SCN- ion
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#0891b2';
          ctx.stroke();

          ctx.fillStyle = '#164e63';
          ctx.font = 'bold 7px monospace';
          ctx.fillText('SCN⁻', p.x - 8, p.y + 2.5);
        } else if (p.type === 'complex') {
          // Orange-Red coordinate complex [FeNCS]2+
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#ea580c';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#9a3412';
          ctx.stroke();

          // Coordinate covalent bond visualization
          ctx.beginPath();
          ctx.arc(p.x - 3, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#fde047';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x + 4, p.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#67e8f9';
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px monospace';
          ctx.fillText('Fe-NCS', p.x - 11, p.y + 2.5);
        } else if (p.type === 'ag') {
          // Silver ion Ag+
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 7px monospace';
          ctx.fillText('Ag⁺', p.x - 5, p.y + 2.5);
        } else if (p.type === 'ppt') {
          // White AgSCN solid crystal precipitate
          ctx.rect(p.x - 4, p.y - 4, 8, 8);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Disturbance Injection actions
  const injectFe = () => {
    const list = [...particlesRef.current];
    for (let i = 0; i < 6; i++) {
      list.push({
        id: Math.random(),
        type: 'fe',
        x: Math.random() * 200 + 40,
        y: 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 0.5,
        radius: 8,
      });
    }
    particlesRef.current = list;
    setNumFe((prev) => prev + 6);
  };

  const injectScn = () => {
    const list = [...particlesRef.current];
    for (let i = 0; i < 6; i++) {
      list.push({
        id: Math.random(),
        type: 'scn',
        x: Math.random() * 200 + 40,
        y: 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 0.5,
        radius: 7,
      });
    }
    particlesRef.current = list;
    setNumScn((prev) => prev + 6);
  };

  const injectAg = () => {
    const list = [...particlesRef.current];
    for (let i = 0; i < 8; i++) {
      list.push({
        id: Math.random(),
        type: 'ag',
        x: Math.random() * 200 + 40,
        y: 40,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 1.5 + 0.5,
        radius: 6,
      });
    }
    particlesRef.current = list;
    setNumAg((prev) => prev + 8);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono uppercase px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold tracking-wider">
                Submicroscopic Level · Dynamic Equilibrium
              </span>
              <span className="text-2xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Optional Tab
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Particle Collision & Le Châtelier Restoration Simulation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-0.5">
              <em>Note: This tab is optional.</em> Use it for an intuitive submicroscopic visual of how forward collisions (Fe³⁺ + SCN⁻) and reverse complex dissociations occur simultaneously at equal rates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Motion' : 'Resume Motion'}</span>
            </button>

            <button
              onClick={initParticles}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Particle Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900">Reaction Chamber</span>
              <span className="font-mono text-slate-500">
                Fe³⁺(aq) + SCN⁻(aq) ⇌ [FeNCS]²⁺(aq)
              </span>
            </div>
            <div className="flex items-center gap-3 text-2xs font-mono">
              <span className="flex items-center gap-1 text-yellow-700">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Fe³⁺
              </span>
              <span className="flex items-center gap-1 text-cyan-700">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> SCN⁻
              </span>
              <span className="flex items-center gap-1 text-orange-700">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block" /> [FeNCS]²⁺
              </span>
              <span className="flex items-center gap-1 text-slate-700">
                <span className="w-2.5 h-2.5 border border-slate-400 bg-white inline-block" /> AgSCN(s)
              </span>
            </div>
          </div>

          <div className="relative my-3 rounded-lg overflow-hidden border border-slate-200">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-auto block bg-slate-50"
            />
          </div>

          {/* Interactive Disturbance Injector Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">Introduce Stress (Perturbation):</span>
            <div className="flex items-center gap-2">
              <button
                onClick={injectFe}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject +Fe³⁺ (A3/D3)</span>
              </button>

              <button
                onClick={injectScn}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 text-cyan-900 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject +SCN⁻ (B3)</span>
              </button>

              <button
                onClick={injectAg}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject +Ag⁺ (Precipitate C3)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Chemical Rates & Q vs K Gauges (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reaction Rates Balance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dynamic Rates Balance
              </h3>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Forward Rate (r_f = k_f[Fe³⁺][SCN⁻])</span>
                  <span className="font-mono font-bold text-slate-900">{counts.forwardRate}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, counts.forwardRate * 35)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Reverse Rate (r_r = k_r[[FeNCS]²⁺])</span>
                  <span className="font-mono font-bold text-slate-900">{counts.reverseRate}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, counts.reverseRate * 35)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-2xs text-slate-600 leading-normal">
              {Math.abs(counts.forwardRate - counts.reverseRate) < 0.25 ? (
                <span className="text-emerald-700 font-semibold">
                  ● DYNAMIC EQUILIBRIUM: Forward rate = Reverse rate. Total product and reactant concentrations remain steady.
                </span>
              ) : counts.forwardRate > counts.reverseRate ? (
                <span className="text-amber-700 font-semibold">
                  ▲ SHIFTING RIGHT (→): Forward rate exceeds reverse rate to consume excess reactants.
                </span>
              ) : (
                <span className="text-blue-700 font-semibold">
                  ▲ SHIFTING LEFT (←): Reverse rate exceeds forward rate to replenish consumed reactants.
                </span>
              )}
            </div>
          </div>

          {/* Reaction Quotient Q vs Keq */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Reaction Quotient (Q vs K_eq)
            </h3>

            <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-lg font-mono">
              <div>
                <div className="text-2xs text-slate-400">Current Q:</div>
                <div className="text-xl font-bold text-amber-400">{counts.qVal}</div>
              </div>
              <div className="text-right">
                <div className="text-2xs text-slate-400">Target K_eq:</div>
                <div className="text-xl font-bold text-white">1.00</div>
              </div>
            </div>

            <div className="text-2xs text-slate-500 leading-relaxed">
              {counts.qVal < 0.85 && (
                <div className="text-amber-600 font-medium">
                  Q &lt; K_eq: System shifts RIGHT (→) to produce more [FeNCS]²⁺ until Q = K_eq.
                </div>
              )}
              {counts.qVal > 1.25 && (
                <div className="text-blue-600 font-medium">
                  Q &gt; K_eq: System shifts LEFT (←) to break down [FeNCS]²⁺ until Q = K_eq.
                </div>
              )}
              {counts.qVal >= 0.85 && counts.qVal <= 1.25 && (
                <div className="text-emerald-600 font-medium">
                  Q ≈ K_eq: System is at equilibrium.
                </div>
              )}
            </div>
          </div>

          {/* Current Micro-Counts */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-800 mb-2">Active Species Count:</div>
            <div className="grid grid-cols-2 gap-2 text-2xs font-mono text-slate-600">
              <div>Fe³⁺ ions: <strong className="text-slate-900">{counts.fe}</strong></div>
              <div>SCN⁻ ions: <strong className="text-slate-900">{counts.scn}</strong></div>
              <div>[FeNCS]²⁺: <strong className="text-orange-700">{counts.complex}</strong></div>
              <div>AgSCN ppt: <strong className="text-slate-900">{counts.ppt}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
