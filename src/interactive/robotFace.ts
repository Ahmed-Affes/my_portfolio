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

  private isSpeaking: boolean = false;

  private initMouthWaveform() {
    if (this.mouthBars.length === 0) return;
    
    const cpuEl = document.getElementById('face-cpu-stat');
    const tempEl = document.getElementById('face-temp-stat');

    // Speech & Standby Voice Synthesizer Loop
    setInterval(() => {
      this.mouthBars.forEach((bar, idx) => {
        if (this.isSpeaking) {
          // Dynamic high-energy vocal equalizer while talking
          const vocalHeight = Math.floor(Math.sin(Date.now() * 0.015 + idx) * 35 + 55);
          bar.style.height = `${Math.max(15, Math.min(100, vocalHeight))}%`;
          bar.style.background = '#ffffff';
          bar.style.boxShadow = '0 0 10px var(--cyan)';
        } else {
          // Subtle resting hum
          const heightPercent = Math.floor(Math.sin(Date.now() * 0.004 + idx * 0.5) * 20 + 25);
          bar.style.height = `${Math.max(10, Math.min(80, heightPercent))}%`;
          bar.style.background = 'var(--cyan)';
          bar.style.boxShadow = '0 0 6px var(--cyan)';
        }
      });

      if (cpuEl && Math.random() > 0.6) {
        const cpu = this.isSpeaking ? (Math.random() * 4.5 + 3.5).toFixed(1) : (Math.random() * 1.5 + 0.8).toFixed(1);
        cpuEl.textContent = `CPU: ${cpu}%`;
      }
      if (tempEl && Math.random() > 0.8) {
        const temp = this.isSpeaking ? (Math.random() * 2 + 34).toFixed(0) : (Math.random() * 2 + 31).toFixed(0);
        tempEl.textContent = `TEMP: ${temp}°C`;
      }
    }, 80);
  }

  public speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    if (sounds.getMuted()) return;

    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.85; // Robotic pitch
      utterance.volume = 0.9;

      // Select high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const cyberVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira'))) || voices[0];
      if (cyberVoice) {
        utterance.voice = cyberVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.containerEl?.classList.add('face-talking');
        sounds.playHoverBlip();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.containerEl?.classList.remove('face-talking');
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.containerEl?.classList.remove('face-talking');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable:', err);
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.containerEl?.classList.remove('face-talking');
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
    this.stopSpeaking();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
