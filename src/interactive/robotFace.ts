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
  private isOverclocked: boolean = false;
  private isSpeaking: boolean = false;

  // GSAP quickTo functions for buttery pupil tracking
  private quickLeftX: gsap.QuickToFunc | null = null;
  private quickLeftY: gsap.QuickToFunc | null = null;
  private quickRightX: gsap.QuickToFunc | null = null;
  private quickRightY: gsap.QuickToFunc | null = null;

  constructor(containerId: string = 'about-robot-face') {
    this.containerEl = document.getElementById(containerId);
    this.pupilLeftEl = document.getElementById('robot-pupil-left');
    this.pupilRightEl = document.getElementById('robot-pupil-right');
    this.eyeLeftEl = document.getElementById('robot-eye-left');
    this.eyeRightEl = document.getElementById('robot-eye-right');

    if (!this.containerEl) return;

    // Collect mouth waveform bars
    this.mouthBars = Array.from(this.containerEl.querySelectorAll('.mouth-bar'));

    // Initialize GSAP quickTo for each pupil axis
    if (this.pupilLeftEl) {
      this.quickLeftX = gsap.quickTo(this.pupilLeftEl, 'x', { duration: 0.35, ease: 'power2.out' });
      this.quickLeftY = gsap.quickTo(this.pupilLeftEl, 'y', { duration: 0.35, ease: 'power2.out' });
    }
    if (this.pupilRightEl) {
      this.quickRightX = gsap.quickTo(this.pupilRightEl, 'x', { duration: 0.35, ease: 'power2.out' });
      this.quickRightY = gsap.quickTo(this.pupilRightEl, 'y', { duration: 0.35, ease: 'power2.out' });
    }

    this.initMouseTracking();
    this.initBlinkingLoop();
    this.initMouthWaveform();
    this.initOverclockToggle();
    this.bindBioTabsReactivity();
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

      // Maximum pupil travel in pixels inside eye socket
      const maxTravel = this.isOverclocked ? 16 : 12;
      const angle = Math.atan2(deltaY, deltaX);
      const intensity = Math.min(dist / 350, 1.0);

      const targetX = Math.cos(angle) * maxTravel * intensity;
      const targetY = Math.sin(angle) * maxTravel * intensity;

      // Drive both pupils via quickTo
      this.quickLeftX?.(targetX);
      this.quickLeftY?.(targetY);
      this.quickRightX?.(targetX);
      this.quickRightY?.(targetY);
    });

    // When mouse enters face chassis, trigger audio blip
    this.containerEl.addEventListener('mouseenter', () => {
      sounds.playHoverBlip();
      this.containerEl?.classList.add('face-active');
      this.triggerSpeech(600);
    });

    this.containerEl.addEventListener('mouseleave', () => {
      this.containerEl?.classList.remove('face-active');
      // Reset pupils to center
      this.quickLeftX?.(0);
      this.quickLeftY?.(0);
      this.quickRightX?.(0);
      this.quickRightY?.(0);
    });

    // Click on face to trigger playful wink and audio chirp
    this.containerEl.addEventListener('click', (e) => {
      // Don't trigger if clicked on the overclock button
      if ((e.target as HTMLElement).closest('#face-overclock-btn')) return;
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

  public setMode(tabIndex: number) {
    this.triggerSpeech(1000);
    const statusText = document.getElementById('face-status-text');

    // Reset pupil colors
    this.pupilLeftEl?.classList.remove('pupil-amber', 'pupil-magenta');
    this.pupilRightEl?.classList.remove('pupil-amber', 'pupil-magenta');

    if (tabIndex === 0) {
      if (statusText) statusText.textContent = 'STATUS: NOMINAL';
    } else if (tabIndex === 1) {
      this.pupilLeftEl?.classList.add('pupil-amber');
      this.pupilRightEl?.classList.add('pupil-amber');
      if (statusText) statusText.textContent = 'STATUS: CHRONO_SYNC';
    } else if (tabIndex === 2) {
      this.pupilLeftEl?.classList.add('pupil-magenta');
      this.pupilRightEl?.classList.add('pupil-magenta');
      if (statusText) statusText.textContent = 'STATUS: MAX_CLOCK';
    }
  }

  private initOverclockToggle() {
    const overclockBtn = document.getElementById('face-overclock-btn');
    const label = document.getElementById('overclock-status-label');
    const cpuEl = document.getElementById('face-cpu-stat');
    const tempEl = document.getElementById('face-temp-stat');

    if (!overclockBtn) return;

    overclockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isOverclocked = !this.isOverclocked;

      sounds.playQuantumSurge();
      this.triggerSpeech(1200);

      if (this.isOverclocked) {
        this.containerEl?.classList.add('overclock-mode');
        if (label) label.textContent = 'CORE: OVERCLOCKED';
        if (cpuEl) cpuEl.textContent = 'CPU: 99.9%';
        if (tempEl) tempEl.textContent = 'TEMP: 78°C';
      } else {
        this.containerEl?.classList.remove('overclock-mode');
        if (label) label.textContent = 'CORE: NOMINAL';
        if (cpuEl) cpuEl.textContent = 'CPU: 1.2%';
        if (tempEl) tempEl.textContent = 'TEMP: 32°C';
      }
    });
  }

  private bindBioTabsReactivity() {
    const tabs = document.querySelectorAll('#bio-tabs .bio-tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabIndex = parseInt(tab.getAttribute('data-tab') || '0', 10);
        this.setMode(tabIndex);
      });
    });
  }

  private initMouthWaveform() {
    if (this.mouthBars.length === 0) return;
    
    const cpuEl = document.getElementById('face-cpu-stat');
    const tempEl = document.getElementById('face-temp-stat');

    setInterval(() => {
      const isSpeaking = this.isSpeaking;
      const isOverclocked = this.isOverclocked;

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

      if (!isOverclocked) {
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
