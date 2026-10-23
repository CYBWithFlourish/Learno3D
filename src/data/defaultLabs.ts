import { SimulationLab } from '../types/simulation';

export const DEFAULT_LABS: SimulationLab[] = [
  {
    id: 'gravity-physics',
    title: 'Planetary Gravity & Elastic Ballistics Lab',
    domain: 'physics',
    description: 'Compare gravitational acceleration and elastic collision dynamics across Earth, Mars, the Moon, and Jupiter with bounceable test spheres.',
    learningObjectives: [
      'Investigate gravitational acceleration: g_Earth = 9.81 m/s² vs g_Mars = 3.72 m/s² vs g_Moon = 1.62 m/s²',
      'Analyze conservation of mechanical energy: Potential Energy (m*g*h) converts into Kinetic Energy (0.5*m*v²)',
      'Observe coefficient of restitution (e) during elastic vs inelastic impacts on steel plates'
    ],
    physicsConfig: {
      gravity: [0, -9.81, 0],
      restitution: 0.85,
      friction: 0.2,
      airResistance: 0.02,
      timeScale: 1.0,
      damping: 0.995,
    },
    cameraPosition: [0, 2.5, 6.2],
    cameraTarget: [0, 1.2, 0],
    hasExplodedView: false,
    hasParticles: true,
    socraticPrompts: [
      'Welcome to the Planetary Ballistics Lab! Drop both spheres from 2 meters. Which one reaches peak kinetic energy first on Mars vs Earth?',
      'Notice the coefficient of restitution: why does each consecutive bounce lose a fraction of mechanical energy?',
      'Try switching gravity to Jupiter (24.79 m/s²). How does the bounce frequency and impact velocity change?'
    ],
    components: [
      // Lab Floor & Base Table
      {
        id: 'lab-pedestal',
        name: 'Anti-Vibration Granite Optical Table',
        type: 'box',
        position: [0, 0.15, 0],
        rotation: [0, 0, 0],
        scale: [4.4, 0.3, 2.6],
        color: '#1e293b',
        roughness: 0.4,
        metalness: 0.3,
        mass: 0,
        description: 'Heavy granite optical damping surface calibrated for precision kinematic measurements.'
      },
      // Earth Drop Tower Gantry
      {
        id: 'gantry-earth',
        name: 'Earth Sensor Gantry Pillar',
        type: 'cylinder',
        position: [-1.2, 1.7, 0],
        rotation: [0, 0, 0],
        scale: [0.08, 2.8, 0.08],
        color: '#38bdf8',
        roughness: 0.2,
        metalness: 0.8,
        mass: 0,
        description: 'Vertical laser telemetry rail calibrated for Earth gravitational field (g = 9.81 m/s²).'
      },
      // Earth Target Pad
      {
        id: 'target-earth',
        name: 'Earth Piezoelectric Impact Plate',
        type: 'cylinder',
        position: [-1.2, 0.32, 0],
        rotation: [0, 0, 0],
        scale: [0.55, 0.04, 0.55],
        color: '#0284c7',
        roughness: 0.3,
        metalness: 0.9,
        mass: 0,
        description: 'Force transducer plate measuring peak deceleration during impact.'
      },
      // Earth Test Sphere
      {
        id: 'sphere-earth',
        name: 'Earth Test Sphere (Steel alloy, 1.0 kg)',
        type: 'sphere',
        position: [-1.2, 2.8, 0],
        rotation: [0, 0, 0],
        scale: [0.32, 0.32, 0.32],
        color: '#06b6d4',
        roughness: 0.15,
        metalness: 0.85,
        mass: 1.0,
        restitution: 0.85,
        description: 'Spherical rigid body subject to Earth gravitational acceleration g = 9.81 m/s².',
        metadata: {
          formula: 'PE = m * g * h | v = √(2*g*h)',
          keyMetric: 'Mass: 1.0 kg | Initial Height: 2.8 m',
          quizQuestion: 'If height h is doubled, by what factor does impact velocity increase?',
          quizOptions: ['2x (Double)', '√2 ≈ 1.41x', '4x', 'Remains identical'],
          correctOptionIndex: 1,
          explanation: 'Since v = √(2*g*h), doubling h increases impact velocity by the square root of 2 (≈ 1.414).'
        }
      },
      // Mars Drop Tower Gantry
      {
        id: 'gantry-mars',
        name: 'Mars Sensor Gantry Pillar',
        type: 'cylinder',
        position: [1.2, 1.7, 0],
        rotation: [0, 0, 0],
        scale: [0.08, 2.8, 0.08],
        color: '#f97316',
        roughness: 0.2,
        metalness: 0.8,
        mass: 0,
        description: 'Simulated Martian surface gantry tracking objects under 38% of Earth gravity (g = 3.72 m/s²).'
      },
      // Mars Target Pad
      {
        id: 'target-mars',
        name: 'Mars Regolith Impact Plate',
        type: 'cylinder',
        position: [1.2, 0.32, 0],
        rotation: [0, 0, 0],
        scale: [0.55, 0.04, 0.55],
        color: '#c2410c',
        roughness: 0.6,
        metalness: 0.4,
        mass: 0,
        description: 'Simulated basaltic Martian bedrock impact surface.'
      },
      // Mars Test Sphere
      {
        id: 'sphere-mars',
        name: 'Mars Test Sphere (Titanium-regolith, 1.0 kg)',
        type: 'sphere',
        position: [1.2, 2.8, 0],
        rotation: [0, 0, 0],
        scale: [0.32, 0.32, 0.32],
        color: '#ea580c',
        roughness: 0.25,
        metalness: 0.75,
        mass: 1.0,
        restitution: 0.85,
        description: 'Subject to Martian gravity (g = 3.72 m/s²). Demonstrates prolonged flight time and gentle recoil.',
        metadata: {
          formula: 't_fall = √(2*h / g) ≈ 1.22s on Mars vs 0.75s on Earth',
          keyMetric: 'Gravity: 3.72 m/s² (0.38g)',
          quizQuestion: 'Why does the Mars sphere take longer to hit the plate than the Earth sphere?',
          quizOptions: [
            'Mars sphere is heavier',
            'Downward acceleration g is 62% smaller on Mars',
            'Air resistance is higher on Mars',
            'Centrifugal force pushes it upward'
          ],
          correctOptionIndex: 1,
          explanation: 'Because gravitational acceleration g on Mars is only 3.72 m/s² compared to Earth 9.81 m/s², downward acceleration is lower and fall time is ~1.62x longer.'
        }
      },
      // Central Digital Telemetry Display
      {
        id: 'telemetry-display',
        name: 'Spatial Laser Caliper & Chronometer HUD',
        type: 'box',
        position: [0, 2.2, -0.6],
        rotation: [0, 0, 0],
        scale: [1.4, 0.8, 0.08],
        color: '#0f172a',
        roughness: 0.2,
        metalness: 0.9,
        mass: 0,
        description: 'High-speed holographic telemetry module plotting real-time kinetic vs potential energy.'
      }
    ]
  },
  {
    id: 'cardiac-anatomy',
    title: 'Human Heart Biomechanics & Dissection Studio',
    domain: 'anatomy',
    description: 'Interactive 3D procedural Human Heart model featuring active myocardial contraction (Systole/Diastole), blood cell particle streams, and an exploded anatomical dissection mode.',
    learningObjectives: [
      'Examine the 4 chambers: Right Atrium, Right Ventricle, Left Atrium, and thick-walled Left Ventricle',
      'Trace pulmonary vs systemic circulation: deoxygenated venous return vs oxygenated aortic outflow',
      'Understand cardiac hemodynamics: stroke volume, heart rate (BPM), and valve mechanics (Mitral & Tricuspid)'
    ],
    physicsConfig: {
      gravity: [0, 0, 0],
      restitution: 0.1,
      friction: 0.5,
      airResistance: 0.1,
      timeScale: 1.0,
      damping: 0.98,
    },
    cameraPosition: [0, 1.8, 4.2],
    cameraTarget: [0, 1.4, 0],
    hasExplodedView: true,
    hasParticles: true,
    socraticPrompts: [
      'Welcome to the Cardiac Anatomy Studio! Notice how the Left Ventricle wall is noticeably thicker than the Right Ventricle. Why does the left side require so much more muscle mass?',
      'Drag the "Exploded Dissection" slider to expand the chambers and inspect the inner atrioventricular valve boundaries.',
      'How would an increase in heart rate to 140 BPM affect ventricular filling time (diastole)?'
    ],
    components: [
      // Left Ventricle (Hero Muscle Chamber)
      {
        id: 'left-ventricle',
        name: 'Left Ventricle (Myocardium)',
        type: 'capsule',
        position: [0.35, 1.25, 0.1],
        rotation: [0.2, 0, -0.25],
        scale: [0.55, 0.8, 0.55],
        color: '#e11d48',
        roughness: 0.45,
        metalness: 0.1,
        mass: 0,
        explodedOffset: [0.9, -0.4, 0.3],
        description: 'The thickest muscular chamber of the heart; contracts with high pressure (≈ 120 mmHg) to pump oxygenated blood into the systemic circulation via the Aorta.',
        metadata: {
          formula: 'Cardiac Output = Stroke Volume × Heart Rate (CO = SV × HR)',
          keyMetric: 'Wall thickness: ~12-15mm | Systolic Pressure: 120 mmHg',
          quizQuestion: 'Why is the Left Ventricle muscle wall roughly 3x thicker than the Right Ventricle?',
          quizOptions: [
            'It handles deoxygenated blood which is heavier',
            'It pumps against high systemic vascular resistance across the entire body',
            'It receives electrical impulses first',
            'It stores excess oxygenated glycogen'
          ],
          correctOptionIndex: 1,
          explanation: 'The left ventricle pumps blood through the high-resistance systemic arterial tree, whereas the right ventricle pumps only through the short low-resistance pulmonary circuit.'
        }
      },
      // Right Ventricle
      {
        id: 'right-ventricle',
        name: 'Right Ventricle',
        type: 'capsule',
        position: [-0.35, 1.2, 0.25],
        rotation: [0.15, 0.1, 0.2],
        scale: [0.48, 0.72, 0.45],
        color: '#0284c7',
        roughness: 0.45,
        metalness: 0.1,
        mass: 0,
        explodedOffset: [-0.9, -0.3, 0.5],
        description: 'Pumps deoxygenated blood under lower pressure (≈ 25 mmHg) into the Pulmonary Artery toward the lungs for gas exchange.',
        metadata: {
          formula: 'P_pulmonary ≈ 25/10 mmHg',
          keyMetric: 'Wall thickness: ~3-5mm',
          quizQuestion: 'Which valve prevents backflow from the Right Ventricle into the Right Atrium?',
          quizOptions: ['Tricuspid Valve', 'Mitral (Bicuspid) Valve', 'Aortic Valve', 'Pulmonary Valve'],
          correctOptionIndex: 0,
          explanation: 'The Tricuspid valve (with three cusps) guards the right atrioventricular orifice.'
        }
      },
      // Left Atrium
      {
        id: 'left-atrium',
        name: 'Left Atrium',
        type: 'sphere',
        position: [0.32, 1.85, -0.15],
        rotation: [0, 0, 0],
        scale: [0.42, 0.38, 0.42],
        color: '#f43f5e',
        roughness: 0.4,
        metalness: 0.1,
        mass: 0,
        explodedOffset: [0.6, 0.7, -0.4],
        description: 'Receives freshly oxygenated blood from the four pulmonary veins and delivers it to the left ventricle.',
        metadata: {
          keyMetric: 'Pressure: 8-10 mmHg | Normal volume: 50-60 mL'
        }
      },
      // Right Atrium
      {
        id: 'right-atrium',
        name: 'Right Atrium (SA Node Pacemaker Location)',
        type: 'sphere',
        position: [-0.42, 1.78, 0.05],
        rotation: [0, 0, 0],
        scale: [0.45, 0.42, 0.42],
        color: '#0369a1',
        roughness: 0.4,
        metalness: 0.1,
        mass: 0,
        explodedOffset: [-0.8, 0.6, 0.2],
        description: 'Receives deoxygenated blood returning from the Superior and Inferior Vena Cava. Houses the Sinoatrial (SA) node, the natural pacemaker of the heart.',
        metadata: {
          formula: 'Intrinsic SA Node firing: 60 - 100 action potentials/min',
          keyMetric: 'Resting firing rate: 72 bpm'
        }
      },
      // Ascending Aorta & Arch
      {
        id: 'aorta-arch',
        name: 'Aortic Arch & Trunk',
        type: 'torus',
        position: [0.08, 2.2, 0.0],
        rotation: [Math.PI / 2, 0.25, 0],
        scale: [0.42, 0.42, 0.18],
        color: '#dc2626',
        roughness: 0.3,
        metalness: 0.2,
        mass: 0,
        explodedOffset: [0.1, 0.9, -0.1],
        description: 'The primary systemic artery. Elastic recoil (Windkessel effect) maintains diastolic blood flow throughout the coronary arteries and body.',
        metadata: {
          formula: 'Windkessel compliance: C = ΔV / ΔP',
          keyMetric: 'Peak velocity: ~1.2 m/s'
        }
      },
      // Superior Vena Cava
      {
        id: 'vena-cava',
        name: 'Superior Vena Cava Trunk',
        type: 'cylinder',
        position: [-0.45, 2.25, -0.1],
        rotation: [0, 0, -0.1],
        scale: [0.16, 0.75, 0.16],
        color: '#0284c7',
        roughness: 0.3,
        metalness: 0.2,
        mass: 0,
        explodedOffset: [-0.5, 0.8, -0.3],
        description: 'Large vein carrying deoxygenated blood from the upper half of the body back to the right atrium.'
      },
      // Pulmonary Artery Trunk
      {
        id: 'pulmonary-artery',
        name: 'Pulmonary Artery Trunk',
        type: 'cylinder',
        position: [-0.1, 2.05, 0.2],
        rotation: [0.4, 0.1, -0.4],
        scale: [0.18, 0.65, 0.18],
        color: '#0ea5e9',
        roughness: 0.3,
        metalness: 0.2,
        mass: 0,
        explodedOffset: [-0.2, 0.7, 0.6],
        description: 'Transports deoxygenated blood exiting the right ventricle toward the lungs.'
      }
    ]
  },
  {
    id: 'circuits-electronics',
    title: 'Vocational Electronics & DC Breadboard Lab',
    domain: 'circuits',
    description: 'Interactive electrical engineering breadboard with DC power supply, knife switch, tungsten filament lamp, resistors, and multimeter probes with live Ohm’s Law calculation and electron flow.',
    learningObjectives: [
      'Master Ohm’s Law: V = I × R and electrical power dissipation P = V × I = I² × R',
      'Observe electron drift velocity vs conventional current flow in a closed closed circuit',
      'Analyze the effect of series resistance on incandescent filament luminous intensity'
    ],
    physicsConfig: {
      gravity: [0, 0, 0],
      restitution: 0.1,
      friction: 0.4,
      airResistance: 0.0,
      timeScale: 1.0,
      damping: 0.99,
    },
    cameraPosition: [0, 2.8, 4.5],
    cameraTarget: [0, 0.5, 0],
    hasExplodedView: false,
    hasParticles: true,
    socraticPrompts: [
      'Toggle the knife switch to close the circuit. What happens to the electron flow particles and the filament glow?',
      'If the DC supply voltage is set to 12V and total resistance is 6Ω, calculate the expected current using Ohm’s Law (V = I * R).',
      'Why does the filament bulb temperature rise when electric current passes through a resistive tungsten coil?'
    ],
    components: [
      // Chassis Breadboard
      {
        id: 'circuit-chassis',
        name: 'Electro-Static Insulated Breadboard Chassis',
        type: 'box',
        position: [0, 0.1, 0],
        rotation: [0, 0, 0],
        scale: [3.8, 0.2, 2.4],
        color: '#0f172a',
        roughness: 0.3,
        metalness: 0.5,
        mass: 0,
        description: 'Standard laboratory prototyping chassis with shielded copper buses and terminal blocks.'
      },
      // 9V DC Battery Unit
      {
        id: 'dc-battery',
        name: 'Chemical DC Power Cell (9.0 V)',
        type: 'box',
        position: [-1.2, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [0.65, 0.8, 0.45],
        color: '#eab308',
        roughness: 0.25,
        metalness: 0.8,
        mass: 0,
        description: 'Electrochemical voltage source supplying direct current with 9.0 V potential difference across terminals.',
        metadata: {
          formula: 'V_source = 9.0 Volts',
          keyMetric: 'Voltage: 9.0V | Capacity: 550 mAh',
          quizQuestion: 'In a battery, which terminal has excess electrons waiting to flow through an external load?',
          quizOptions: ['Negative cathode/terminal (-)', 'Positive anode/terminal (+)', 'Neutral casing', 'Dielectric barrier'],
          correctOptionIndex: 0,
          explanation: 'Electrons carry a negative charge and accumulate at the negative terminal, flowing toward the positive terminal in a closed circuit.'
        }
      },
      // Single-Pole Knife Switch
      {
        id: 'knife-switch',
        name: 'Heavy-Duty Copper Knife Switch',
        type: 'box',
        position: [-0.2, 0.4, -0.6],
        rotation: [0, 0, 0],
        scale: [0.6, 0.3, 0.3],
        color: '#f59e0b',
        roughness: 0.15,
        metalness: 0.9,
        mass: 0,
        description: 'Mechanical circuit breaker. Click to toggle between OPEN (zero current) and CLOSED (active electron conduction).',
        metadata: {
          formula: 'Switch State: CLOSED (R_contact ≈ 0.01 Ω)',
          keyMetric: 'Status: CONDUCTING'
        }
      },
      // Ceramic Resistor
      {
        id: 'ceramic-resistor',
        name: 'Precision Metal Film Resistor (100 Ω)',
        type: 'cylinder',
        position: [0.4, 0.35, 0.6],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.14, 0.7, 0.14],
        color: '#a16207',
        roughness: 0.6,
        metalness: 0.2,
        mass: 0,
        description: 'Limits current flow and drops electric potential in accordance with Ohm’s Law.',
        metadata: {
          formula: 'R = 100 Ω | V_drop = I * R',
          keyMetric: 'Resistance: 100 Ohms'
        }
      },
      // Incandescent Light Bulb
      {
        id: 'filament-bulb',
        name: 'Vacuum Glass Filament Bulb (Load)',
        type: 'sphere',
        position: [1.2, 0.65, 0],
        rotation: [0, 0, 0],
        scale: [0.55, 0.7, 0.55],
        color: '#fef08a',
        roughness: 0.05,
        metalness: 0.1,
        mass: 0,
        description: 'Tungsten filament encased in vacuum. Converts electric potential energy into radiant light and Joule heat.',
        metadata: {
          formula: 'P = I² * R | Luminous efficacy: ~15 lm/W',
          keyMetric: 'Status: ILLUMINATED | Filament Temp: 2400 K',
          quizQuestion: 'If the resistance of the circuit is halved while voltage remains constant at 9V, what happens to the current (I)?',
          quizOptions: ['Current doubles (2x)', 'Current is halved (0.5x)', 'Current remains identical', 'Current becomes zero'],
          correctOptionIndex: 0,
          explanation: 'From Ohm’s Law I = V / R: current is inversely proportional to resistance. Halving R doubles current I.'
        }
      },
      // Digital Multimeter HUD
      {
        id: 'digital-multimeter',
        name: 'Auto-Ranging Benchtop Multimeter',
        type: 'box',
        position: [0, 0.8, -0.9],
        rotation: [-0.3, 0, 0],
        scale: [1.2, 0.7, 0.2],
        color: '#1e293b',
        roughness: 0.2,
        metalness: 0.8,
        mass: 0,
        description: 'Monitors real-time Voltage, Current (Amperes), and Power (Watts).'
      }
    ]
  },
  {
    id: 'turbofan-aerospace',
    title: 'High-Bypass Turbofan Jet Engine Studio',
    domain: 'aerospace',
    description: 'Procedural 3D Turbofan Jet Engine with high-pressure compressor, annular combustion chamber, and multi-stage turbine. Features throttle RPM control and exploded assembly inspection.',
    learningObjectives: [
      'Examine the Brayton thermodynamic cycle: Compression, Combustion at constant pressure, and Isentropic Expansion',
      'Compare high-bypass cold duct airflow (80% of thrust) vs hot core core airflow (20% of thrust)',
      'Analyze compressor rotor blade velocity and gas temperature gradient from intake to exhaust nozzle'
    ],
    physicsConfig: {
      gravity: [0, 0, 0],
      restitution: 0.1,
      friction: 0.1,
      airResistance: 0.0,
      timeScale: 1.0,
      damping: 0.99,
    },
    cameraPosition: [0, 2.2, 5.2],
    cameraTarget: [0, 1.2, 0],
    hasExplodedView: true,
    hasParticles: true,
    socraticPrompts: [
      'Welcome to the Jet Engine Propulsion Studio! Slide the throttle up to observe how rotational RPM and exhaust temperature rise.',
      'Use the Exploded View slider to pull apart the titanium fan blades, compressor stages, and combustion liner.',
      'Why do modern commercial airliners use high-bypass turbofans instead of pure turbojets?'
    ],
    components: [
      // Fan Spinner Nose Cone
      {
        id: 'spinner-cone',
        name: 'Titanium Fan Spinner Nose Cone',
        type: 'cone',
        position: [-1.8, 1.2, 0],
        rotation: [0, 0, -Math.PI / 2],
        scale: [0.45, 0.8, 0.45],
        color: '#38bdf8',
        roughness: 0.15,
        metalness: 0.95,
        mass: 0,
        explodedOffset: [-1.5, 0, 0],
        description: 'Aerodynamic nose cone preventing flow separation and anti-icing during high-subsonic flight.'
      },
      // Front Titanium Fan Stage (Hero component)
      {
        id: 'fan-blades',
        name: 'Wide-Chord Titanium Fan Rotor (Stage 1)',
        type: 'cylinder',
        position: [-1.3, 1.2, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [1.3, 0.25, 1.3],
        color: '#94a3b8',
        roughness: 0.1,
        metalness: 0.98,
        mass: 0,
        explodedOffset: [-1.0, 0, 0],
        description: 'Accelerates massive mass flow of ambient air into the bypass duct, providing ~80% of total takeoff thrust.',
        metadata: {
          formula: 'Thrust = ṁ_air * (v_exit - v_inlet)',
          keyMetric: 'Diameter: 2.8 m | Takeoff RPM: 3,200 | Bypass Ratio: 10:1',
          quizQuestion: 'In a modern high-bypass turbofan, where does the majority of takeoff thrust come from?',
          quizOptions: [
            'The bypass air pushed by the giant front fan',
            'The core jet combustion exhaust gas',
            'The fuel injection afterburners',
            'Ram pressure on the wing pylon'
          ],
          correctOptionIndex: 0,
          explanation: 'In high-bypass engines (ratio 10:1 or higher), ~80-85% of total thrust is generated by the bypass fan air bypassing the core engine.'
        }
      },
      // Low Pressure Compressor (LPC)
      {
        id: 'compressor-lpc',
        name: 'Low-Pressure Compressor (LPC - 4 Stages)',
        type: 'cylinder',
        position: [-0.6, 1.2, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.95, 0.5, 0.95],
        color: '#64748b',
        roughness: 0.2,
        metalness: 0.9,
        mass: 0,
        explodedOffset: [-0.4, 0, 0],
        description: 'Initial axial compression stages boosting static pressure before entering the high-pressure spool.'
      },
      // High Pressure Compressor (HPC)
      {
        id: 'compressor-hpc',
        name: 'High-Pressure Compressor (HPC - 9 Stages)',
        type: 'cylinder',
        position: [0.1, 1.2, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.72, 0.6, 0.72],
        color: '#475569',
        roughness: 0.2,
        metalness: 0.9,
        mass: 0,
        explodedOffset: [0.2, 0, 0],
        description: 'Compresses air up to 45 atmospheres (pressure ratio 45:1), driving gas temperatures above 600°C before ignition.'
      },
      // Annular Combustion Chamber
      {
        id: 'combustor-annular',
        name: 'Annular Combustion Chamber (Igniter Core)',
        type: 'cylinder',
        position: [0.85, 1.2, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.75, 0.5, 0.75],
        color: '#f97316',
        roughness: 0.35,
        metalness: 0.8,
        mass: 0,
        explodedOffset: [0.7, 0, 0],
        description: 'Aviation kerosene (Jet-A) is sprayed into compressed air and combusted, reaching thermal peaks exceeding 1,700°C.',
        metadata: {
          formula: 'Q_in = ṁ_fuel * LHV (Lower Heating Value ≈ 43 MJ/kg)',
          keyMetric: 'Combustor Exit Temp: ~1,750 °C (2,020 K)',
          quizQuestion: 'Why must high-pressure turbine blades immediately downstream of the combustor be cooled with internal air channels?',
          quizOptions: [
            'Gas temperature exceeds the melting point of nickel superalloys',
            'To prevent acoustic vibration noise',
            'To lubricate the rotating bearings',
            'To oxygenate the exhaust plume'
          ],
          correctOptionIndex: 0,
          explanation: 'Turbine inlet temperatures (often >1600°C) exceed the melting point of uncooled metals; bleed air film cooling and thermal barrier ceramic coatings prevent catastrophic melting.'
        }
      },
      // High & Low Pressure Turbines
      {
        id: 'turbine-stages',
        name: 'Single-Crystal Nickel Superalloy Turbine Spool',
        type: 'cylinder',
        position: [1.45, 1.2, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.82, 0.45, 0.82],
        color: '#0284c7',
        roughness: 0.15,
        metalness: 0.95,
        mass: 0,
        explodedOffset: [1.2, 0, 0],
        description: 'Extracts kinetic and thermal energy from expansion gas to spin the concentric shafts driving the compressors and front fan.'
      },
      // Exhaust Nozzle & Centerbody
      {
        id: 'exhaust-nozzle',
        name: 'Convergent-Divergent Exhaust Nozzle & Plug',
        type: 'cone',
        position: [2.1, 1.2, 0],
        rotation: [0, 0, Math.PI / 2],
        scale: [0.65, 0.7, 0.65],
        color: '#334155',
        roughness: 0.3,
        metalness: 0.85,
        mass: 0,
        explodedOffset: [1.8, 0, 0],
        description: 'Accelerates hot core exhaust gases to high subsonic velocity, contributing residual core thrust.'
      }
    ]
  }
];
