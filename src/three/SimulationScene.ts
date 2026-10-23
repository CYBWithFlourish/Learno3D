import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SimulationLab, SimulationComponent } from '../types/simulation';
import { soundEngine } from '../audio/soundEngine';

// Module-level reusable math helpers to prevent garbage collection stalls in render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _colorA = new THREE.Color();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _listenerPos = new THREE.Vector3();
const _listenerForward = new THREE.Vector3();
const _listenerUp = new THREE.Vector3();

export interface SceneCallbacks {
  onSelectComponent: (component: SimulationComponent | null) => void;
  onTelemetryUpdate: (stats: {
    timeElapsed: number;
    kineticEnergy: number;
    potentialEnergy: number;
    activeVelocity: number;
    impactCount: number;
  }) => void;
  onSimulationEvent?: (eventName: string, details?: any) => void;
}

export class SimulationScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private isSoftwareGl: boolean = false;
  private callbacks: SceneCallbacks;

  private currentLab: SimulationLab | null = null;
  private componentMeshes: Map<string, THREE.Group | THREE.Mesh> = new Map();
  private dynamicBodies: Array<{
    comp: SimulationComponent;
    mesh: THREE.Object3D;
    initialPos: THREE.Vector3;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    mass: number;
    restitution: number;
    radius: number;
    hasLanded?: boolean;
  }> = [];

  // Procedural PBR Texture Cache (Zero 404s, 100% mathematical generation)
  private metalNormalTex: THREE.CanvasTexture | null = null;
  private organicNormalTex: THREE.CanvasTexture | null = null;
  private graniteDiffTex: THREE.CanvasTexture | null = null;
  private circuitTex: THREE.CanvasTexture | null = null;

  // Dedicated Lighting Rig
  private keyLight: THREE.DirectionalLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;
  private filamentLight: THREE.PointLight | null = null;

  // Particle systems for circuits, blood flow, jet engine, and impacts
  private particleGroup: THREE.Group = new THREE.Group();
  private flowParticles: THREE.Points | null = null;
  private flowPositions: Float32Array | null = null;
  private flowCount = 350;

  // Spatial AI Avatar Mentor ("Dr. Nova")
  private avatarGroup: THREE.Group = new THREE.Group();
  private avatarHead: THREE.Group = new THREE.Group();
  private avatarEyeGlow: THREE.Mesh | null = null;
  private avatarRing1: THREE.Mesh | null = null;
  private avatarRing2: THREE.Mesh | null = null;
  private avatarCoreLight: THREE.PointLight | null = null;
  private avatarSpeaking: boolean = false;

  // Simulation state
  private isRunning: boolean = true;
  private isPaused: boolean = false;
  private timeElapsed: number = 0;
  private impactCount: number = 0;
  private explodedAmount: number = 0;
  private targetExplodedAmount: number = 0;
  private throttleAmount: number = 0.5;
  private switchClosed: boolean = true;
  private bpm: number = 72;

  // Raycasting & Interaction
  private hoveredObject: THREE.Object3D | null = null;
  private selectedComponentId: string | null = null;

  // Frame pacing
  private frameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Detect software WebGL safely
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0b); // 71UI dark canvas
    this.scene.fog = new THREE.FogExp2(0x0a0a0b, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    this.camera.position.set(0, 2.5, 6.0);

    // 3. Modern Renderer setup with ACESFilmic PBR Color Pipeline
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Enable WebXR support
    this.renderer.xr.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Environment Reflection (RoomEnvironment PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. OrbitControls with smooth damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.04;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 16;
    this.controls.target.set(0, 1.2, 0);

    // 6. Pre-generate procedural high-frequency textures
    this.initProceduralTextures();

    // 7. Lighting Rig (3-Point Studio + Silhouette Rim Light)
    this.setupLighting();

    // 8. Grounding Environment & Optical Breadboard
    this.setupEnvironment();

    // 9. Build Procedural AI Avatar Mentor ("Dr. Nova")
    this.buildAvatarMentor();

    // 10. Attach particle system
    this.scene.add(this.particleGroup);

    // 11. Event listeners
    this.handleResize = this.handleResize.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.handlePointerMove);

    // 12. Start animation loop
    this.clock.start();
    this.tick = this.tick.bind(this);

    if (this.renderer.xr.enabled) {
      this.renderer.setAnimationLoop(this.tick);
    } else {
      this.tick();
    }
  }

  /**
   * Generates mathematical procedural textures with max anisotropy
   */
  private initProceduralTextures() {
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // 1. Brushed Metal Normal Map (radial lathe grooves for turbine and titanium cylinders)
    const metalCanvas = document.createElement('canvas');
    metalCanvas.width = 512;
    metalCanvas.height = 512;
    const mCtx = metalCanvas.getContext('2d')!;
    mCtx.fillStyle = '#8080ff'; // flat tangent space normal
    mCtx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 2) {
      const noise = (Math.random() - 0.5) * 40;
      const r = Math.min(255, Math.max(0, 128 + noise));
      const g = Math.min(255, Math.max(0, 128 + noise * 0.5));
      mCtx.fillStyle = `rgb(${r},${g},255)`;
      mCtx.fillRect(0, y, 512, 1);
    }
    this.metalNormalTex = new THREE.CanvasTexture(metalCanvas);
    this.metalNormalTex.wrapS = THREE.RepeatWrapping;
    this.metalNormalTex.wrapT = THREE.RepeatWrapping;
    this.metalNormalTex.repeat.set(4, 8);
    this.metalNormalTex.anisotropy = maxAnisotropy;

    // 2. Organic Myocardial Muscle Fiber Normal Map
    const organCanvas = document.createElement('canvas');
    organCanvas.width = 512;
    organCanvas.height = 512;
    const oCtx = organCanvas.getContext('2d')!;
    oCtx.fillStyle = '#8080ff';
    oCtx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const len = 30 + Math.random() * 80;
      const angle = (Math.random() - 0.5) * 0.4;
      oCtx.strokeStyle = Math.random() > 0.5 ? 'rgb(160,110,255)' : 'rgb(100,140,255)';
      oCtx.lineWidth = 1 + Math.random() * 2;
      oCtx.beginPath();
      oCtx.moveTo(x, y);
      oCtx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      oCtx.stroke();
    }
    this.organicNormalTex = new THREE.CanvasTexture(organCanvas);
    this.organicNormalTex.wrapS = THREE.RepeatWrapping;
    this.organicNormalTex.wrapT = THREE.RepeatWrapping;
    this.organicNormalTex.repeat.set(3, 3);
    this.organicNormalTex.anisotropy = maxAnisotropy;

    // 3. Dark Granite Optical Table Texture with Precision Laser Markings
    const graniteCanvas = document.createElement('canvas');
    graniteCanvas.width = 1024;
    graniteCanvas.height = 1024;
    const gCtx = graniteCanvas.getContext('2d')!;
    gCtx.fillStyle = '#11141a'; // deep laboratory granite
    gCtx.fillRect(0, 0, 1024, 1024);

    // Micro-granite grain flecks
    for (let i = 0; i < 15000; i++) {
      const gx = Math.random() * 1024;
      const gy = Math.random() * 1024;
      const val = 20 + Math.floor(Math.random() * 35);
      gCtx.fillStyle = `rgb(${val},${val + 4},${val + 10})`;
      gCtx.fillRect(gx, gy, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }

    // Laser-etched calibration grid lines
    gCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    gCtx.lineWidth = 1.5;
    for (let p = 0; p <= 1024; p += 64) {
      gCtx.beginPath();
      gCtx.moveTo(p, 0);
      gCtx.lineTo(p, 1024);
      gCtx.stroke();

      gCtx.beginPath();
      gCtx.moveTo(0, p);
      gCtx.lineTo(1024, p);
      gCtx.stroke();
    }

    this.graniteDiffTex = new THREE.CanvasTexture(graniteCanvas);
    this.graniteDiffTex.colorSpace = THREE.SRGBColorSpace;
    this.graniteDiffTex.wrapS = THREE.RepeatWrapping;
    this.graniteDiffTex.wrapT = THREE.RepeatWrapping;
    this.graniteDiffTex.repeat.set(2, 2);
    this.graniteDiffTex.anisotropy = maxAnisotropy;
  }

  private setupLighting() {
    // 1. Warm Key Light (physical sunlight/studio main)
    this.keyLight = new THREE.DirectionalLight(0xfff5eb, 2.4);
    this.keyLight.position.set(4, 7, 4);
    this.keyLight.castShadow = !this.isSoftwareGl;
    if (this.keyLight.castShadow) {
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 22;
      this.keyLight.shadow.camera.left = -4.5;
      this.keyLight.shadow.camera.right = 4.5;
      this.keyLight.shadow.camera.top = 4.5;
      this.keyLight.shadow.camera.bottom = -4.5;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.keyLight);

    // 2. Cool Fill Light (balances shadows)
    this.fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    this.fillLight.position.set(-4, 3, -2);
    this.scene.add(this.fillLight);

    // 3. Cyber/Studio Rim Backlight (crucial for hyper-real silhouette edge separation)
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    this.rimLight.position.set(0, 4, -5);
    this.scene.add(this.rimLight);

    // 4. Cool sky / warm floor hemisphere light
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.75);
    this.scene.add(hemiLight);

    // 5. Dynamic point light for electrical circuit tungsten bulb
    this.filamentLight = new THREE.PointLight(0xffedd5, 0, 5);
    this.filamentLight.position.set(1.2, 0.65, 0);
    this.scene.add(this.filamentLight);
  }

  private setupEnvironment() {
    // Laboratory floor with subtle radial coordinate rings
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f17,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(floorMesh);

    // High-fidelity contact shadow grounding plane
    const shadowGeo = new THREE.PlaneGeometry(6, 4.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(256, 256, 40, 256, 256, 240);
    grad.addColorStop(0, 'rgba(0,0,0,0.75)');
    grad.addColorStop(0.4, 'rgba(0,0,0,0.4)');
    grad.addColorStop(0.8, 'rgba(0,0,0,0.1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 512, 512);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.015, 0);
    this.scene.add(shadowMesh);
  }

  /**
   * Procedural 3D Spatial AI Avatar Mentor ("Dr. Nova") with ceramic PBR materials
   */
  private buildAvatarMentor() {
    this.avatarGroup = new THREE.Group();
    this.avatarGroup.position.set(-2.8, 1.4, 0.2);

    // Heavy anti-gravity emitter base
    const emitterGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.16, 32);
    const emitterMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.4,
    });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.y = -1.35;
    emitter.receiveShadow = !this.isSoftwareGl;
    this.avatarGroup.add(emitter);

    // Floating robotic torso with white polished ceramic PBR
    const torsoGeo = new THREE.CylinderGeometry(0.2, 0.14, 0.52, 24);
    const torsoMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.82,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = -0.2;
    torso.castShadow = !this.isSoftwareGl;
    this.avatarGroup.add(torso);

    // Glowing core reactor
    const coreGeo = new THREE.SphereGeometry(0.08, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, -0.15, 0.12);
    this.avatarGroup.add(core);

    this.avatarCoreLight = new THREE.PointLight(0x38bdf8, 1.8, 2.5);
    this.avatarCoreLight.position.set(0, -0.15, 0.2);
    this.avatarGroup.add(this.avatarCoreLight);

    // Floating spherical head with visor
    this.avatarHead = new THREE.Group();
    this.avatarHead.position.set(0, 0.26, 0);

    const headGeo = new THREE.SphereGeometry(0.18, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, torsoMat);
    headMesh.castShadow = !this.isSoftwareGl;
    this.avatarHead.add(headMesh);

    // Curved holographic eye visor
    const visorGeo = new THREE.CylinderGeometry(0.182, 0.182, 0.1, 32, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
    });
    this.avatarEyeGlow = new THREE.Mesh(visorGeo, visorMat);
    this.avatarEyeGlow.rotation.y = Math.PI / 2;
    this.avatarHead.add(this.avatarEyeGlow);

    this.avatarGroup.add(this.avatarHead);

    // Outer gyro holographic levitation rings with physical metallic sheen
    const ring1Geo = new THREE.TorusGeometry(0.38, 0.012, 16, 64);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      clearcoat: 1.0,
    });
    this.avatarRing1 = new THREE.Mesh(ring1Geo, ringMat);
    this.avatarRing1.rotation.x = Math.PI / 3;
    this.avatarGroup.add(this.avatarRing1);

    const ring2Geo = new THREE.TorusGeometry(0.44, 0.008, 16, 64);
    this.avatarRing2 = new THREE.Mesh(ring2Geo, ringMat);
    this.avatarRing2.rotation.y = Math.PI / 4;
    this.avatarGroup.add(this.avatarRing2);

    // Holographic floating badge "Dr. Nova - Spatial AI"
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 64;
    const bCtx = badgeCanvas.getContext('2d')!;
    bCtx.fillStyle = '#0070e0';
    bCtx.fillRect(0, 0, 256, 64);
    bCtx.fillStyle = '#ffffff';
    bCtx.font = 'bold 22px Inter, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('DR. NOVA [SPATIAL AI]', 128, 40);

    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, opacity: 0.85 });
    const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.16), badgeMat);
    badgeMesh.position.set(0, 0.6, 0);
    this.avatarGroup.add(badgeMesh);

    this.scene.add(this.avatarGroup);
  }

  public setAvatarSpeaking(isSpeaking: boolean) {
    this.avatarSpeaking = isSpeaking;
  }

  /**
   * Load any SimulationLab into the 3D scene with photorealistic material specialization
   */
  public loadLab(lab: SimulationLab) {
    this.currentLab = lab;
    this.timeElapsed = 0;
    this.impactCount = 0;
    this.explodedAmount = 0;
    this.targetExplodedAmount = 0;
    this.selectedComponentId = null;

    // Reset camera target
    _vec3A.set(lab.cameraTarget[0], lab.cameraTarget[1], lab.cameraTarget[2]);
    this.controls.target.copy(_vec3A);

    _vec3B.set(lab.cameraPosition[0], lab.cameraPosition[1], lab.cameraPosition[2]);
    this.camera.position.copy(_vec3B);

    // Clean previous components
    this.componentMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      this.disposeObject(mesh);
    });
    this.componentMeshes.clear();
    this.dynamicBodies = [];

    // Clear particle group
    while (this.particleGroup.children.length > 0) {
      const child = this.particleGroup.children[0];
      this.particleGroup.remove(child);
      this.disposeObject(child);
    }

    // Build components with domain-specific PBR physical materials
    lab.components.forEach(comp => {
      const meshGroup = this.createComponentMesh(comp, lab.domain);
      this.scene.add(meshGroup);
      this.componentMeshes.set(comp.id, meshGroup);

      if (comp.mass > 0) {
        const radius = Math.max(comp.scale[0], comp.scale[1], comp.scale[2]) * 0.5;
        this.dynamicBodies.push({
          comp,
          mesh: meshGroup,
          initialPos: new THREE.Vector3(...comp.position),
          pos: new THREE.Vector3(...comp.position),
          vel: new THREE.Vector3(0, 0, 0),
          mass: comp.mass,
          restitution: comp.restitution ?? lab.physicsConfig.restitution,
          radius,
        });
      }
    });

    // Build specialized procedural particle streams (cardiac blood or electron flow)
    this.setupLabParticles(lab);

    // Sound spools
    soundEngine.stopTurbineLoop();
    if (lab.domain === 'aerospace') {
      soundEngine.startTurbineLoop(this.throttleAmount, { x: 0, y: 1.2, z: 0 });
    }
  }

  /**
   * Creates 3D component with domain-specialized MeshPhysicalMaterial
   */
  private createComponentMesh(comp: SimulationComponent, domain: string): THREE.Group {
    const group = new THREE.Group();
    group.name = comp.id;
    group.position.set(...comp.position);
    group.rotation.set(...comp.rotation);

    let geometry: THREE.BufferGeometry;

    switch (comp.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(...comp.scale);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(comp.scale[0] * 0.5, 36, 36);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(comp.scale[0] * 0.5, comp.scale[2] * 0.5, comp.scale[1], 36);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(comp.scale[0] * 0.5, comp.scale[2] * 0.25, 28, 54);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(comp.scale[0] * 0.5, comp.scale[1], 36);
        break;
      case 'capsule':
        geometry = new THREE.CapsuleGeometry(comp.scale[0] * 0.45, comp.scale[1] * 0.5, 12, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(...comp.scale);
    }

    // Domain-Adaptive Advanced PBR Material Factory
    let material: THREE.Material;

    if (comp.id === 'lab-pedestal') {
      // Granite Optical Calibration Bench with procedural engraved map
      material = new THREE.MeshPhysicalMaterial({
        map: this.graniteDiffTex || undefined,
        roughness: 0.35,
        metalness: 0.25,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
      });
    } else if (comp.id === 'filament-bulb') {
      // Real Optical Glass Envelope with physical transmission & refractive index
      material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: this.isSoftwareGl ? 0.35 : 1.0,
        transmission: this.isSoftwareGl ? 0 : 0.94,
        ior: 1.52,
        roughness: 0.04,
        metalness: 0.05,
        clearcoat: 1.0,
        depthWrite: false,
      });

      // Internal glowing tungsten filament helix
      const filamentGeo = new THREE.TorusGeometry(0.12, 0.015, 12, 32);
      const filamentMat = new THREE.MeshStandardMaterial({
        color: 0xffd54f,
        emissive: 0xffaa00,
        emissiveIntensity: this.switchClosed ? 2.5 : 0.1,
        roughness: 0.2,
      });
      const filamentMesh = new THREE.Mesh(filamentGeo, filamentMat);
      filamentMesh.name = 'tungsten-filament';
      filamentMesh.rotation.x = Math.PI / 2;
      group.add(filamentMesh);

    } else if (domain === 'anatomy') {
      // Living biological myocardium with fibrous normal map & moist organic clearcoat
      material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(comp.color),
        roughness: 0.38,
        metalness: 0.04,
        normalMap: this.organicNormalTex || undefined,
        normalScale: new THREE.Vector2(0.6, 0.6),
        clearcoat: 0.75,
        clearcoatRoughness: 0.18,
      });
    } else if (domain === 'aerospace' || comp.metalness > 0.6) {
      // Aviation Titanium & Superalloys with anisotropic brushed lathe normal map
      material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(comp.color),
        roughness: Math.max(0.08, comp.roughness),
        metalness: Math.max(0.85, comp.metalness),
        normalMap: this.metalNormalTex || undefined,
        normalScale: new THREE.Vector2(0.4, 0.4),
        clearcoat: 0.4,
        clearcoatRoughness: 0.15,
      });
    } else {
      // High-precision engineering plastic/resin
      material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(comp.color),
        roughness: comp.roughness,
        metalness: comp.metalness,
        clearcoat: 0.2,
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = !this.isSoftwareGl;
    mesh.receiveShadow = !this.isSoftwareGl;
    mesh.userData = { componentId: comp.id, compData: comp };
    group.add(mesh);

    // Decorative accent telemetry ring to satisfy 3-scale composite read
    if (comp.mass > 0 || comp.metadata?.keyMetric) {
      const ringGeo = new THREE.RingGeometry(comp.scale[0] * 0.52, comp.scale[0] * 0.56, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0070e0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    }

    return group;
  }

  private setupLabParticles(lab: SimulationLab) {
    if (!lab.hasParticles) return;

    const count = this.flowCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const isCardiac = lab.domain === 'anatomy';
    const isCircuits = lab.domain === 'circuits';
    const isAero = lab.domain === 'aerospace';

    for (let i = 0; i < count; i++) {
      if (isCardiac) {
        // Red (oxygenated aorta) or Blue (deoxygenated vena cava)
        const isOxygenated = i % 2 === 0;
        positions[i * 3 + 0] = (Math.random() - 0.5) * 0.8 + (isOxygenated ? 0.2 : -0.2);
        positions[i * 3 + 1] = 1.0 + Math.random() * 1.4;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

        colors[i * 3 + 0] = isOxygenated ? 0.95 : 0.08;
        colors[i * 3 + 1] = isOxygenated ? 0.12 : 0.45;
        colors[i * 3 + 2] = isOxygenated ? 0.22 : 0.95;
      } else if (isCircuits) {
        // Circuit electron blue-yellow dots
        positions[i * 3 + 0] = (Math.random() - 0.5) * 2.8;
        positions[i * 3 + 1] = 0.35 + (Math.random() - 0.5) * 0.1;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;

        colors[i * 3 + 0] = 0.2;
        colors[i * 3 + 1] = 0.75;
        colors[i * 3 + 2] = 1.0;
      } else if (isAero) {
        // Combustor fire & bypass smoke particles
        positions[i * 3 + 0] = 0.8 + Math.random() * 1.6;
        positions[i * 3 + 1] = 1.2 + (Math.random() - 0.5) * 0.6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

        colors[i * 3 + 0] = 1.0;
        colors[i * 3 + 1] = 0.25 + Math.random() * 0.55;
        colors[i * 3 + 2] = 0.04;
      } else {
        // Ambient spatial telemetry dust
        positions[i * 3 + 0] = (Math.random() - 0.5) * 6;
        positions[i * 3 + 1] = Math.random() * 3;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

        colors[i * 3 + 0] = 0.2;
        colors[i * 3 + 1] = 0.45;
        colors[i * 3 + 2] = 0.85;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isCircuits ? 0.045 : 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.flowParticles = new THREE.Points(geometry, material);
    this.flowPositions = positions;
    this.particleGroup.add(this.flowParticles);
  }

  // Setters for UI controls
  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public resetSimulation() {
    this.timeElapsed = 0;
    this.impactCount = 0;
    this.dynamicBodies.forEach(b => {
      b.pos.copy(b.initialPos);
      b.vel.set(0, 0, 0);
      b.hasLanded = false;
      b.mesh.position.copy(b.initialPos);
    });
  }

  public setExplodedAmount(amount: number) {
    this.targetExplodedAmount = Math.max(0, Math.min(1, amount));
  }

  public setGravityMultiplier(gx: number, gy: number, gz: number) {
    if (this.currentLab) {
      this.currentLab.physicsConfig.gravity = [gx, gy, gz];
    }
  }

  public setThrottle(val: number) {
    this.throttleAmount = Math.max(0, Math.min(1, val));
    soundEngine.startTurbineLoop(this.throttleAmount, { x: 0, y: 1.2, z: 0 });
  }

  public toggleSwitch(val?: boolean) {
    this.switchClosed = val !== undefined ? val : !this.switchClosed;
    soundEngine.playSpatialSwitch({ x: -0.2, y: 0.4, z: -0.6 }, this.switchClosed);

    // Update tungsten filament glow and light
    const filament = this.scene.getObjectByName('tungsten-filament') as THREE.Mesh | undefined;
    if (filament && (filament.material as THREE.MeshStandardMaterial).emissiveIntensity !== undefined) {
      (filament.material as THREE.MeshStandardMaterial).emissiveIntensity = this.switchClosed ? 2.5 : 0.05;
    }
    if (this.filamentLight) {
      this.filamentLight.intensity = this.switchClosed ? 2.0 : 0.0;
    }
  }

  // Pointer interactions
  private handlePointerDown(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);
    const intersects = _raycaster.intersectObjects(this.scene.children, true);

    const hit = intersects.find(i => i.object.userData?.componentId);
    if (hit) {
      const compId = hit.object.userData.componentId;
      this.selectedComponentId = compId;
      const comp = this.currentLab?.components.find(c => c.id === compId) || null;
      this.callbacks.onSelectComponent(comp);

      // Make avatar look toward clicked component
      _vec3A.copy(hit.point);
      this.avatarHead.lookAt(_vec3A);

      soundEngine.playSpatialAvatarChime({ x: -2.8, y: 1.4, z: 0.2 });
    } else {
      this.selectedComponentId = null;
      this.callbacks.onSelectComponent(null);
    }
  }

  private handlePointerMove(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);
    const intersects = _raycaster.intersectObjects(this.scene.children, true);
    const hit = intersects.find(i => i.object.userData?.componentId);

    if (hit) {
      this.renderer.domElement.style.cursor = 'pointer';
      if (this.hoveredObject !== hit.object) {
        this.hoveredObject = hit.object;
      }
    } else {
      this.renderer.domElement.style.cursor = 'default';
      this.hoveredObject = null;
    }
  }

  // Main Animation & Physics Loop
  private tick() {
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const now = performance.now();

    // Synchronize 3D AudioListener coordinates & orientation with active camera / WebXR view
    this.camera.getWorldPosition(_listenerPos);
    this.camera.getWorldDirection(_listenerForward);
    _listenerUp.set(
      this.camera.matrixWorld.elements[4],
      this.camera.matrixWorld.elements[5],
      this.camera.matrixWorld.elements[6]
    ).normalize();
    soundEngine.updateListener(_listenerPos, _listenerForward, _listenerUp);

    if (!this.isPaused && this.currentLab) {
      this.timeElapsed += delta;
      this.updatePhysics(delta);
    }

    // Smoothly interpolate exploded view with exponential damping
    this.explodedAmount = THREE.MathUtils.damp(this.explodedAmount, this.targetExplodedAmount, 6.0, delta);
    this.updateExplodedMeshes();

    // Animate procedural mechanisms & particles
    this.updateSimEffects(delta);

    // Animate AI Avatar Mentor
    this.updateAvatar(delta, now);

    // Update camera controls
    this.controls.update();

    // Render frame
    this.renderer.render(this.scene, this.camera);

    if (!this.renderer.xr.isPresenting && !this.renderer.xr.enabled) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private updatePhysics(dt: number) {
    if (!this.currentLab) return;
    const gravity = this.currentLab.physicsConfig.gravity;
    const damping = this.currentLab.physicsConfig.damping || 0.995;
    const groundY = 0.32; // impact plate level

    let totalKineticEnergy = 0;
    let totalPotentialEnergy = 0;
    let maxVel = 0;

    this.dynamicBodies.forEach(body => {
      // Apply gravity: v += g * dt
      body.vel.x += gravity[0] * dt;
      body.vel.y += gravity[1] * dt;
      body.vel.z += gravity[2] * dt;

      // Air resistance damping
      body.vel.multiplyScalar(damping);

      // Integrate position: pos += v * dt
      body.pos.addScaledVector(body.vel, dt);

      // Floor collision check
      const bottomY = body.pos.y - body.radius;
      if (bottomY <= groundY) {
        body.pos.y = groundY + body.radius;

        // Invert velocity with restitution
        if (body.vel.y < -0.1) {
          const impactSpeed = Math.abs(body.vel.y);
          body.vel.y = -body.vel.y * body.restitution;
          body.vel.x *= body.restitution;
          body.vel.z *= body.restitution;

          this.impactCount++;
          soundEngine.playSpatialBounce({ x: body.pos.x, y: groundY, z: body.pos.z }, impactSpeed, body.mass > 1.5 ? 0.8 : 1.2);

          if (this.callbacks.onSimulationEvent) {
            this.callbacks.onSimulationEvent('impact', {
              speed: impactSpeed,
              restitution: body.restitution,
            });
          }
        } else {
          body.vel.y = 0;
        }
      }

      body.mesh.position.copy(body.pos);

      // Energy calculations
      const speedSq = body.vel.lengthSq();
      const ke = 0.5 * body.mass * speedSq;
      const height = Math.max(0, body.pos.y - groundY);
      const pe = body.mass * Math.abs(gravity[1]) * height;

      totalKineticEnergy += ke;
      totalPotentialEnergy += pe;
      maxVel = Math.max(maxVel, Math.sqrt(speedSq));
    });

    this.callbacks.onTelemetryUpdate({
      timeElapsed: this.timeElapsed,
      kineticEnergy: totalKineticEnergy,
      potentialEnergy: totalPotentialEnergy,
      activeVelocity: maxVel,
      impactCount: this.impactCount,
    });
  }

  private updateExplodedMeshes() {
    if (!this.currentLab) return;

    this.currentLab.components.forEach(comp => {
      const mesh = this.componentMeshes.get(comp.id);
      if (!mesh) return;

      if (comp.explodedOffset && this.explodedAmount > 0.001) {
        _vec3A.set(...comp.position);
        _vec3B.set(...comp.explodedOffset).multiplyScalar(this.explodedAmount);
        mesh.position.copy(_vec3A).add(_vec3B);
      } else if (comp.mass === 0) {
        mesh.position.set(...comp.position);
      }
    });
  }

  private updateSimEffects(delta: number) {
    if (!this.currentLab) return;

    // 1. Cardiac pulsating cycle
    if (this.currentLab.domain === 'anatomy') {
      const beatCycle = (this.timeElapsed * (this.bpm / 60)) % 1;
      const pulse = Math.sin(beatCycle * Math.PI * 2);
      const contraction = pulse > 0 ? 1 + pulse * 0.08 : 1 + pulse * 0.03;

      const lv = this.componentMeshes.get('left-ventricle');
      if (lv) lv.scale.set(contraction, 1 / Math.sqrt(contraction), contraction);

      const rv = this.componentMeshes.get('right-ventricle');
      if (rv) rv.scale.set(contraction, 1 / Math.sqrt(contraction), contraction);

      if (beatCycle < 0.05 && this.timeElapsed > 1.0) {
        soundEngine.playSpatialHeartbeat({ x: 0, y: 1.4, z: 0 });
      }
    }

    // 2. Turbofan engine continuous rotation
    if (this.currentLab.domain === 'aerospace') {
      const rotSpeed = this.throttleAmount * 25 * delta;
      const fan = this.componentMeshes.get('fan-blades');
      if (fan) fan.rotation.x += rotSpeed;

      const lpc = this.componentMeshes.get('compressor-lpc');
      if (lpc) lpc.rotation.x += rotSpeed * 1.2;

      const hpc = this.componentMeshes.get('compressor-hpc');
      if (hpc) hpc.rotation.x += rotSpeed * 1.8;

      const turbine = this.componentMeshes.get('turbine-stages');
      if (turbine) turbine.rotation.x += rotSpeed * 1.8;
    }

    // 3. Flow particles animation
    if (this.flowParticles && this.flowPositions) {
      const positions = this.flowPositions;
      const count = this.flowCount;

      for (let i = 0; i < count; i++) {
        if (this.currentLab.domain === 'anatomy') {
          positions[i * 3 + 1] += delta * 0.85;
          if (positions[i * 3 + 1] > 2.6) positions[i * 3 + 1] = 0.9;
        } else if (this.currentLab.domain === 'circuits') {
          if (this.switchClosed) {
            positions[i * 3 + 0] += delta * 1.4;
            if (positions[i * 3 + 0] > 1.8) positions[i * 3 + 0] = -1.8;
          }
        } else if (this.currentLab.domain === 'aerospace') {
          positions[i * 3 + 0] += delta * (1.6 + this.throttleAmount * 4.2);
          if (positions[i * 3 + 0] > 2.6) positions[i * 3 + 0] = 0.7;
        }
      }
      this.flowParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  private updateAvatar(delta: number, now: number) {
    const bob = Math.sin(now * 0.002) * 0.04;
    this.avatarGroup.position.y = 1.4 + bob;

    if (this.avatarRing1) this.avatarRing1.rotation.z += delta * 1.2;
    if (this.avatarRing2) this.avatarRing2.rotation.y += delta * 0.8;

    if (this.avatarSpeaking && this.avatarEyeGlow) {
      const flicker = 0.8 + Math.sin(now * 0.02) * 0.3;
      (this.avatarEyeGlow.material as THREE.MeshBasicMaterial).color.setRGB(0, flicker, 1);
    } else if (this.avatarEyeGlow) {
      (this.avatarEyeGlow.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
    }
  }

  private handleResize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private disposeObject(obj: THREE.Object3D) {
    obj.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
  }

  public getRenderer() {
    return this.renderer;
  }

  public getCamera() {
    return this.camera;
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('pointermove', this.handlePointerMove);
    this.controls.dispose();
    this.renderer.dispose();
    soundEngine.stopTurbineLoop();

    if (this.metalNormalTex) this.metalNormalTex.dispose();
    if (this.organicNormalTex) this.organicNormalTex.dispose();
    if (this.graniteDiffTex) this.graniteDiffTex.dispose();
  }
}
