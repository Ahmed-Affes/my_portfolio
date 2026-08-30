import { gsap } from '../motion/customEases';
import { sounds } from '../audio/soundEngine';

export class RobotFaceController {
  private containerEl: HTMLElement | null;
  private pupilLeftEl: HTMLElement | null;
  private pupilRightEl: HTMLElement | null;
  private eyeLeftEl: HTMLElement | null;
  private eyeRightEl: HTMLElement | null;
  private mouthBars: HTMLElement[] = [];
  private isBlinking: boolean = false;
  private currentMode: 'nominal' | 'stealth' | 'overclock' | 'quantum' = 'nominal';
  private isSpeaking: boolean = false;

  // GSAP quickTo functions for buttery 3D Sentinel head and pupil tracking
  private quickLeftX: gsap.QuickToFunc | null = null;
  private quickLeftY: gsap.QuickToFunc | null = null;
  private quickRightX: gsap.QuickToFunc | null = null;
  private quickRightY: gsap.QuickToFunc | null = null;
  private quickTiltX: gsap.QuickToFunc | null = null;
  private quickTiltY: gsap.QuickToFunc | null = null;

  constructor(containerId: string = 'about-robot-face') {
    this.containerEl = document.getElementById(containerId);
    this.pupilLeftEl = document.getElementById('robot-pupil-left');
    this.pupilRightEl = document.getElementById('robot-pupil-right');
    this.eyeLeftEl = document.getElementById('robot-eye-left');
    this.eyeRightEl = document.getElementById('robot-eye-right');

    if (!this.containerEl) return;

    // Collect mouth waveform bars
    this.mouthBars = Array.from(this.containerEl.querySelectorAll('.mouth-bar'));

    // Initialize GSAP quickTo for pupils
    if (this.pupilLeftEl) {
      this.quickLeftX = gsap.quickTo(this.pupilLeftEl, 'x', { duration: 0.35, ease: 'power2.out' });
      this.quickLeftY = gsap.quickTo(this.pupilLeftEl, 'y', { duration: 0.35, ease: 'power2.out' });
    }
    if (this.pupilRightEl) {
      this.quickRightX = gsap.quickTo(this.pupilRightEl, 'x', { duration: 0.25, ease: 'power2.out' });
      this.quickRightY = gsap.quickTo(this.pupilRightEl, 'y', { duration: 0.25, ease: 'power2.out' });
    }

    this.initMouseTracking();
    this.initBlinkingLoop();
    this.initMouthWaveform();
    this.initModeSelector();
    this.bindBioTabsReactivity();
    this.initOrbitingSatellites();
    this.initDiagnosticScanButton();
  }

  private initMouseTracking() {
    if (!this.containerEl) return;

    window.addEventListener('mousemove', (e) => {
      if (!this.containerEl) return;
      const rect = this.containerEl.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - faceCenterX;
      const deltaY = e.clientY - faceCenterY;
      const dist = Math.hypot(deltaX, deltaY);

      // Maximum pupil travel inside eye socket
      const maxTravel = this.currentMode === 'overclock' ? 14 : 10;
      const angle = Math.atan2(deltaY, deltaX);
      const intensity = Math.min(dist / 400, 1.0);

      const targetX = Math.cos(angle) * maxTravel * intensity;
      const targetY = Math.sin(angle) * maxTravel * intensity;

      // Drive pupils smoothly with zero container shifting
      this.quickLeftX?.(targetX);
      this.quickLeftY?.(targetY);
      this.quickRightX?.(targetX);
      this.quickRightY?.(targetY);
    }, { passive: true });

    this.containerEl.addEventListener('mouseenter', () => {
      sounds.playHoverBlip();
      this.containerEl?.classList.add('face-active');
      this.triggerSpeech(600);
    });

    this.containerEl.addEventListener('mouseleave', () => {
      this.containerEl?.classList.remove('face-active');
      this.quickLeftX?.(0);
      this.quickLeftY?.(0);
      this.quickRightX?.(0);
      this.quickRightY?.(0);
      this.quickTiltX?.(0);
      this.quickTiltY?.(0);
    });

    this.containerEl.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.sentinel-mode-pill')) return;
      sounds.playPanelOpen();
      this.triggerWink();
      this.triggerSpeech(800);
    });
  }

  private initBlinkingLoop() {
    const triggerBlink = () => {
      if (this.isBlinking) return;
      this.isBlinking = true;
      this.eyeLeftEl?.classList.add('blink');
      this.eyeRightEl?.classList.add('blink');

      setTimeout(() => {
        this.eyeLeftEl?.classList.remove('blink');
        this.eyeRightEl?.classList.remove('blink');
        this.isBlinking = false;
      }, 180);

      const nextBlink = Math.random() * 4000 + 3000;
      setTimeout(triggerBlink, nextBlink);
    };

    setTimeout(triggerBlink, 2500);
  }

  public triggerWink() {
    this.eyeRightEl?.classList.add('blink');
    setTimeout(() => {
      this.eyeRightEl?.classList.remove('blink');
    }, 400);
  }

  public triggerSpeech(durationMs = 800) {
    this.isSpeaking = true;
    setTimeout(() => {
      this.isSpeaking = false;
    }, durationMs);
  }

  private initModeSelector() {
    const modePills = document.querySelectorAll('#sentinel-mode-strip .sentinel-mode-pill');
    const statusText = document.getElementById('face-status-text');
    const cpuEl = document.getElementById('face-cpu-stat');
    const tempEl = document.getElementById('face-temp-stat');

    modePills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        modePills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const mode = pill.getAttribute('data-mode') as 'nominal' | 'stealth' | 'overclock' | 'quantum';
        this.currentMode = mode;
        this.triggerSpeech(1000);

        // Reset theme classes on chassis
        this.containerEl?.classList.remove('mode-stealth', 'mode-overclock', 'mode-quantum');
        this.pupilLeftEl?.classList.remove('pupil-amber', 'pupil-magenta', 'pupil-green');
        this.pupilRightEl?.classList.remove('pupil-amber', 'pupil-magenta', 'pupil-green');

        if (mode === 'nominal') {
          sounds.playHoverBlip();
          if (statusText) statusText.textContent = 'STATUS: NOMINAL';
          if (cpuEl) cpuEl.textContent = 'CPU: 1.2%';
          if (tempEl) tempEl.textContent = 'TEMP: 32°C';
        } else if (mode === 'stealth') {
          sounds.playPanelOpen();
          this.containerEl?.classList.add('mode-stealth');
          this.pupilLeftEl?.classList.add('pupil-green');
          this.pupilRightEl?.classList.add('pupil-green');
          if (statusText) statusText.textContent = 'STATUS: ENCRYPTED';
          if (cpuEl) cpuEl.textContent = 'CPU: 0.4%';
          if (tempEl) tempEl.textContent = 'TEMP: 26°C';
        } else if (mode === 'overclock') {
          sounds.playQuantumSurge();
          this.containerEl?.classList.add('mode-overclock');
          this.pupilLeftEl?.classList.add('pupil-magenta');
          this.pupilRightEl?.classList.add('pupil-magenta');
          if (statusText) statusText.textContent = 'STATUS: OVERCLOCKED';
          if (cpuEl) cpuEl.textContent = 'CPU: 99.9%';
          if (tempEl) tempEl.textContent = 'TEMP: 78°C';
        } else if (mode === 'quantum') {
          sounds.playCrtPower();
          this.containerEl?.classList.add('mode-quantum');
          this.pupilLeftEl?.classList.add('pupil-amber');
          this.pupilRightEl?.classList.add('pupil-amber');
          if (statusText) statusText.textContent = 'STATUS: QUANTUM_FLUX';
          if (cpuEl) cpuEl.textContent = 'CPU: 48.2%';
          if (tempEl) tempEl.textContent = 'TEMP: 44°C';
        }
      });
    });
  }

  private activeTypeInterval: number | null = null;

  public typeTextIntoTerminal(text: string) {
    const terminalBioBody = document.getElementById('terminal-bio-body');
    if (!terminalBioBody) return;

    if (this.activeTypeInterval !== null) {
      clearInterval(this.activeTypeInterval);
      this.activeTypeInterval = null;
    }

    terminalBioBody.textContent = '';
    let charIdx = 0;
    this.triggerSpeech(Math.min(2500, text.length * 15));

    this.activeTypeInterval = window.setInterval(() => {
      if (charIdx < text.length) {
        terminalBioBody.textContent = text.slice(0, charIdx + 1);
        if (charIdx % 4 === 0) sounds.playKeyType();
        charIdx++;
      } else {
        if (this.activeTypeInterval !== null) {
          clearInterval(this.activeTypeInterval);
          this.activeTypeInterval = null;
        }
      }
    }, 12);
  }

  private bindBioTabsReactivity() {
    const tabs = document.querySelectorAll('#bio-tabs .bio-tab-btn');
    const tabViews = document.querySelectorAll('.terminal-tab-view');
    const portStatus = document.getElementById('terminal-port-status');

    const defaultBioText = "Boot sequence initiated. I am UNIT_07 — the personal avatar and telemetry core for Ahmed Affes. For 6+ years, we have engineered responsive distributed systems, crisp interactive web experiences, and microsecond-latency client tools. Everything here is code-driven, hand-tuned, and built to survive production loads. Step into the Data Core or approach an Arcade Cabinet to inspect live archives.";

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        sounds.playPanelOpen();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        // Deactivate active satellites
        const satellites = document.querySelectorAll('#orbiting-satellites .orbit-satellite');
        satellites.forEach((s) => s.classList.remove('active'));

        const tabIdx = parseInt(tab.getAttribute('data-tab') || '0', 10);

        // Hide all tab views and show selected
        tabViews.forEach((view, idx) => {
          if (idx === tabIdx) view.classList.add('active');
          else view.classList.remove('active');
        });

        if (portStatus) {
          if (tabIdx === 0) portStatus.textContent = 'TELEMETRY_PORT // 2026 · [AUTHENTICATED]';
          else if (tabIdx === 1) portStatus.textContent = 'CHRONO_RADAR // 2020–2026 · [DECRYPTED]';
          else if (tabIdx === 2) portStatus.textContent = 'HARDWARE_DIAGNOSTICS // LIVE SPECS · [SYNCED]';
        }

        if (tabIdx === 0) {
          this.typeTextIntoTerminal(defaultBioText);
        } else if (tabIdx === 2) {
          // Animate gauge bars on Tab 2 view
          const fills = document.querySelectorAll('.gauge-bar-fill');
          fills.forEach((fill) => {
            const el = fill as HTMLElement;
            const targetWidth = el.style.width;
            el.style.width = '0%';
            setTimeout(() => {
              el.style.width = targetWidth;
            }, 50);
          });
        }
      });
    });

    (window as any).__typeBioText = (text: string) => this.typeTextIntoTerminal(text);
  }

  private initOrbitingSatellites() {
    const satellites = document.querySelectorAll('#orbiting-satellites .orbit-satellite');
    const tabs = document.querySelectorAll('#bio-tabs .bio-tab-btn');
    const tabViews = document.querySelectorAll('.terminal-tab-view');
    const portStatus = document.getElementById('terminal-port-status');

    const satPayloads: { [key: string]: string } = {
      fullstack: "MODULE [MOD_01: FULLSTACK ARCHITECTURE]\n• Core Focus: High-performance TypeScript, React component hierarchies, Node.js microservices.\n• Clean modular architecture with strict typing, zero bloat, and enterprise resilience.",
      latency: "MODULE [MOD_02: 0ms INPUT LATENCY]\n• Optimization: 60fps render pipelines, hardware-accelerated transforms, zero-allocation render loops.\n• Precision event batching and microsecond interactive response times.",
      creative: "MODULE [MOD_03: WEBGL & CREATIVE TECH]\n• Canvas Systems: Procedural 2D/3D physics, GSAP timeline choreography, custom pixel art shaders.\n• Game-grade visual fidelity and rich tactile audio feedback.",
      cloud: "MODULE [MOD_04: DISTRIBUTED CLOUD & SCALE]\n• Infrastructure: Docker containerization, automated CI/CD pipelines, resilient cloud endpoints.\n• Built to sustain high concurrency and survive real-world production stress."
    };

    satellites.forEach((sat) => {
      sat.addEventListener('mouseenter', () => sounds.playHoverBlip());
      sat.addEventListener('click', () => {
        sounds.playQuantumSurge();
        
        // Highlight clicked satellite
        satellites.forEach((s) => s.classList.remove('active'));
        sat.classList.add('active');

        // Switch to Tab 0 smoothly without firing competing events
        tabs.forEach((t, idx) => {
          if (idx === 0) t.classList.add('active');
          else t.classList.remove('active');
        });
        tabViews.forEach((view, idx) => {
          if (idx === 0) view.classList.add('active');
          else view.classList.remove('active');
        });

        const chip = sat.getAttribute('data-chip') || '';
        const payload = satPayloads[chip];

        if (portStatus) {
          portStatus.textContent = `SATELLITE_FEED // ${chip.toUpperCase()} · [STREAMING]`;
        }

        if (payload) {
          this.typeTextIntoTerminal(payload);
        }
      });
    });
  }

  private initDiagnosticScanButton() {
    const scanBtn = document.getElementById('run-neural-scan-btn');
    if (!scanBtn) return;

    scanBtn.addEventListener('click', () => {
      sounds.playCoreDetonation();
      this.triggerSpeech(1500);

      // Create sweeping holographic laser grid over stage
      let laserScan = document.getElementById('neural-diag-laser-line');
      if (!laserScan) {
        laserScan = document.createElement('div');
        laserScan.id = 'neural-diag-laser-line';
        laserScan.className = 'reality-reboot-scanline';
        document.body.appendChild(laserScan);
      }

      gsap.fromTo(laserScan, 
        { top: '20%', opacity: 1 }, 
        { top: '80%', opacity: 1, duration: 1.0, ease: 'power2.inOut', onComplete: () => laserScan?.remove() }
      );

      // Flash gauges
      const fills = document.querySelectorAll('.gauge-bar-fill');
      fills.forEach((fill) => {
        gsap.fromTo(fill, { opacity: 0.3 }, { opacity: 1.0, duration: 0.6, repeat: 2, yoyo: true });
      });
    });
  }

  private initMouthWaveform() {
    if (this.mouthBars.length === 0) return;
    
    const cpuEl = document.getElementById('face-cpu-stat');
    const tempEl = document.getElementById('face-temp-stat');

    setInterval(() => {
      const isSpeaking = this.isSpeaking;
      const isOverclocked = this.currentMode === 'overclock';

      this.mouthBars.forEach((bar, idx) => {
        let heightPercent: number;
        if (isSpeaking) {
          heightPercent = Math.floor(Math.random() * 75 + 25);
        } else if (isOverclocked) {
          heightPercent = Math.floor(Math.sin(Date.now() * 0.012 + idx * 0.8) * 35 + 45);
        } else {
          heightPercent = Math.floor(Math.sin(Date.now() * 0.004 + idx * 0.5) * 20 + 25);
        }

        bar.style.height = `${Math.max(10, Math.min(95, heightPercent))}%`;
      });

      if (!isOverclocked && this.currentMode === 'nominal') {
        if (cpuEl && Math.random() > 0.7) {
          const cpu = (Math.random() * 1.5 + 0.8).toFixed(1);
          cpuEl.textContent = `CPU: ${cpu}%`;
        }
        if (tempEl && Math.random() > 0.85) {
          const temp = (Math.random() * 2 + 31).toFixed(0);
          tempEl.textContent = `TEMP: ${temp}°C`;
        }
      }
    }, 70);
  }
}
