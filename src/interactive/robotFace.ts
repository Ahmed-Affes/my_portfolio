import { sounds } from '../audio/soundEngine';

export class RobotFaceController {
  private containerEl: HTMLElement | null;
  private pupilLeftEl: HTMLElement | null;
  private pupilRightEl: HTMLElement | null;
  private eyeLeftEl: HTMLElement | null;
  private eyeRightEl: HTMLElement | null;
  private mouthBars: HTMLElement[] = [];
  private currentPupilX: number = 0;
  private currentPupilY: number = 0;
  private targetPupilX: number = 0;
  private targetPupilY: number = 0;
  private isBlinking: boolean = false;
  private animFrameId: number | null = null;

  constructor(containerId: string = 'about-robot-face') {
    this.containerEl = document.getElementById(containerId);
    this.pupilLeftEl = document.getElementById('robot-pupil-left');
    this.pupilRightEl = document.getElementById('robot-pupil-right');
    this.eyeLeftEl = document.getElementById('robot-eye-left');
    this.eyeRightEl = document.getElementById('robot-eye-right');

    if (!this.containerEl) return;

    // Collect mouth waveform bars
    this.mouthBars = Array.from(this.containerEl.querySelectorAll('.mouth-bar'));

    this.initMouseTracking();
    this.initBlinkingLoop();
    this.initMouthWaveform();
    this.startRenderLoop();
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
      const maxTravel = 12;
      const angle = Math.atan2(deltaY, deltaX);
      const intensity = Math.min(dist / 350, 1.0);

      this.targetPupilX = Math.cos(angle) * maxTravel * intensity;
      this.targetPupilY = Math.sin(angle) * maxTravel * intensity;
    });

    // When mouse enters face chassis, trigger audio blip & scanline speedup
    this.containerEl.addEventListener('mouseenter', () => {
      sounds.playHoverBlip();
      this.containerEl?.classList.add('face-active');
    });

    this.containerEl.addEventListener('mouseleave', () => {
      this.containerEl?.classList.remove('face-active');
      this.targetPupilX = 0;
      this.targetPupilY = 0;
    });

    // Click on face to trigger playful wink and audio chirp
    this.containerEl.addEventListener('click', () => {
      sounds.playPanelOpen();
      this.triggerWink();
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

      // Random next blink interval between 3 and 7 seconds
      const nextBlink = Math.random() * 4000 + 3000;
      setTimeout(triggerBlink, nextBlink);
    };

    setTimeout(triggerBlink, 2500);
  }

  private triggerWink() {
    this.eyeRightEl?.classList.add('blink');
    setTimeout(() => {
      this.eyeRightEl?.classList.remove('blink');
    }, 400);
  }

  private initMouthWaveform() {
    if (this.mouthBars.length === 0) return;
    
    // Simulate real-time audio voice synthesizer
    setInterval(() => {
      this.mouthBars.forEach((bar) => {
        const heightPercent = Math.floor(Math.random() * 85) + 15;
        bar.style.height = `${heightPercent}%`;
      });
    }, 120);
  }

  private startRenderLoop() {
    const loop = () => {
      // Smooth lerp for natural gaze tracking
      this.currentPupilX += (this.targetPupilX - this.currentPupilX) * 0.12;
      this.currentPupilY += (this.targetPupilY - this.currentPupilY) * 0.12;

      const transform = `translate(${this.currentPupilX.toFixed(2)}px, ${this.currentPupilY.toFixed(2)}px)`;
      if (this.pupilLeftEl) this.pupilLeftEl.style.transform = transform;
      if (this.pupilRightEl) this.pupilRightEl.style.transform = transform;

      this.animFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
