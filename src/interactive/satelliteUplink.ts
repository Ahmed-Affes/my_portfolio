import gsap from 'gsap';
import { sounds } from '../audio/soundEngine';

export class SatelliteUplinkController {
  private rig: HTMLElement | null = null;
  private aperture: HTMLElement | null = null;
  private laserCanvas: SVGSVGElement | null = null;
  private laserLine: SVGLineElement | null = null;
  private targetReticle: SVGCircleElement | null = null;
  private actContact: HTMLElement | null = null;
  
  private teleStatus: HTMLElement | null = null;
  private teleTarget: HTMLElement | null = null;
  private teleSignal: HTMLElement | null = null;
  private teleAzimuth: HTMLElement | null = null;

  private pingInput: HTMLInputElement | null = null;
  private pingBtn: HTMLButtonElement | null = null;
  private pingMsg: HTMLElement | null = null;

  private isLockedOnCard = false;
  private currentLockedStation: HTMLElement | null = null;
  private animFrameId: number | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.rig = document.getElementById('orbital-satellite-rig');
    this.aperture = document.getElementById('satellite-laser-aperture');
    this.laserCanvas = document.getElementById('satellite-laser-canvas') as unknown as SVGSVGElement;
    this.laserLine = document.getElementById('laser-beam-line') as unknown as SVGLineElement;
    this.targetReticle = document.getElementById('laser-target-reticle') as unknown as SVGCircleElement;
    this.actContact = document.getElementById('act-contact');

    this.teleStatus = document.getElementById('sat-tele-status');
    this.teleTarget = document.getElementById('sat-tele-target');
    this.teleSignal = document.getElementById('sat-tele-signal');
    this.teleAzimuth = document.getElementById('sat-tele-azimuth');

    this.pingInput = document.getElementById('quick-ping-input') as HTMLInputElement;
    this.pingBtn = document.getElementById('quick-ping-btn') as HTMLButtonElement;
    this.pingMsg = document.getElementById('ping-status-msg');

    if (!this.rig || !this.actContact) return;

    this.bindParallaxTracking();
    this.bindStationTargeting();
    this.bindQuickPing();
  }

  private bindParallaxTracking(): void {
    if (!this.actContact || !this.rig) return;

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.rig || this.isLockedOnCard) return;

      const rect = this.actContact?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) return;

      const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      const clampedX = Math.max(-1, Math.min(1, normX));
      const clampedY = Math.max(-1, Math.min(1, normY));

      gsap.to(this.rig, {
        rotateY: clampedX * 18,
        rotateX: -clampedY * 12,
        x: clampedX * 24,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (this.teleAzimuth) {
        const angle = Math.round(180 + clampedX * 35);
        this.teleAzimuth.textContent = `${angle}°`;
      }
    });
  }

  private bindStationTargeting(): void {
    const stations = document.querySelectorAll('.ground-receiver-dock');
    stations.forEach((station) => {
      const el = station as HTMLElement;

      el.addEventListener('pointerenter', () => {
        if (this.currentLockedStation && this.currentLockedStation !== el) {
          this.unlockStation(this.currentLockedStation);
        }
        this.lockOnStation(el);
      });

      el.addEventListener('pointerleave', (e: PointerEvent) => {
        const related = e.relatedTarget as HTMLElement | null;
        if (related && el.contains(related)) return;
        if (this.currentLockedStation === el) {
          this.unlockStation(el);
        }
      });
    });
  }

  private updateLaserBeamCoordinates(): void {
    if (!this.isLockedOnCard || !this.currentLockedStation || !this.aperture || !this.laserCanvas || !this.laserLine || !this.targetReticle) {
      return;
    }

    const canvasRect = this.laserCanvas.getBoundingClientRect();
    const apertureRect = this.aperture.getBoundingClientRect();
    
    // Check if station has antenna spike element
    const antenna = this.currentLockedStation.querySelector('.receiver-antenna-spike') as HTMLElement;
    const targetRect = antenna ? antenna.getBoundingClientRect() : this.currentLockedStation.getBoundingClientRect();

    const startX = apertureRect.left + apertureRect.width / 2 - canvasRect.left;
    const startY = apertureRect.top + apertureRect.height / 2 - canvasRect.top;

    const targetX = antenna
      ? targetRect.left + targetRect.width / 2 - canvasRect.left
      : targetRect.left + targetRect.width * 0.85 - canvasRect.left;
    const targetY = antenna
      ? targetRect.top + 2 - canvasRect.top
      : targetRect.top + 6 - canvasRect.top;

    this.laserLine.setAttribute('x1', `${startX}`);
    this.laserLine.setAttribute('y1', `${startY}`);
    this.laserLine.setAttribute('x2', `${targetX}`);
    this.laserLine.setAttribute('y2', `${targetY}`);

    this.targetReticle.setAttribute('cx', `${targetX}`);
    this.targetReticle.setAttribute('cy', `${targetY}`);

    this.animFrameId = requestAnimationFrame(() => this.updateLaserBeamCoordinates());
  }

  private lockOnStation(station: HTMLElement): void {
    this.isLockedOnCard = true;
    this.currentLockedStation = station;
    station.classList.add('station-locked');

    sounds.playQuantumSurge();

    const stationName = station.getAttribute('data-station-name') || 'GROUND_NODE';
    const stationFreq = station.getAttribute('data-station-freq') || '433.92 MHz';

    if (this.teleStatus) {
      this.teleStatus.textContent = `TARGET LOCKED // ${stationFreq}`;
      this.teleStatus.style.color = '#39ff88';
    }
    if (this.teleTarget) this.teleTarget.textContent = stationName;
    if (this.teleSignal) this.teleSignal.textContent = '100% [LOCKED]';

    // Highlight all signal meter bars
    station.querySelectorAll('.meter-bar').forEach((bar) => bar.classList.add('active'));

    // Aim satellite dish toward the station
    if (this.rig && this.actContact && this.laserCanvas && this.laserLine && this.targetReticle && this.aperture) {
      const contactRect = this.actContact.getBoundingClientRect();
      const stationRect = station.getBoundingClientRect();

      const normX = (stationRect.left + stationRect.width / 2 - (contactRect.left + contactRect.width / 2)) / (contactRect.width / 2);
      gsap.to(this.rig, {
        rotateY: normX * 28,
        rotateX: 8,
        x: normX * 36,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      gsap.to([this.laserLine, this.targetReticle], {
        opacity: 1,
        duration: 0.15,
        ease: 'power1.out'
      });

      // Add laser beam pulsation
      gsap.fromTo(this.laserLine, { strokeWidth: 2.5 }, { strokeWidth: 5, duration: 0.2, yoyo: true, repeat: 3, ease: 'sine.inOut' });

      // Start continuous coordinate tracking loop immediately
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.updateLaserBeamCoordinates();
    }
  }

  private unlockStation(station: HTMLElement): void {
    this.isLockedOnCard = false;
    this.currentLockedStation = null;
    station.classList.remove('station-locked');

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.laserLine && this.targetReticle) {
      gsap.to([this.laserLine, this.targetReticle], {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      });
    }

    if (this.rig) {
      gsap.to(this.rig, {
        rotateY: 0,
        rotateX: 0,
        x: 0,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }

    if (this.teleStatus) {
      this.teleStatus.textContent = 'SATELLITE ORBITAL // TRACKING';
      this.teleStatus.style.color = '';
    }
    if (this.teleTarget) this.teleTarget.textContent = 'READY';
    if (this.teleSignal) this.teleSignal.textContent = '99.8%';

    // Reset last signal bar if was inactive
    const bars = station.querySelectorAll('.meter-bar');
    if (bars.length > 3) bars[3].classList.remove('active');
  }

  private bindQuickPing(): void {
    if (!this.pingBtn || !this.pingInput) return;

    const handleSend = () => {
      const text = this.pingInput?.value.trim();
      if (!text) {
        if (this.pingMsg) {
          this.pingMsg.textContent = 'ERR: TRANSMISSION BUFFER EMPTY';
          this.pingMsg.style.color = '#ff2e88';
          setTimeout(() => { if (this.pingMsg) this.pingMsg.textContent = ''; }, 2000);
        }
        return;
      }

      sounds.playTerminalExec();
      if (this.pingMsg) {
        this.pingMsg.textContent = 'ENCRYPTING & FIRING ORBITAL PULSE...';
        this.pingMsg.style.color = '#4fe3ff';
      }

      // Flash aperture & launch particle flare
      if (this.aperture) {
        gsap.fromTo(this.aperture, {
          scale: 1,
          boxShadow: '0 0 14px #ffffff, 0 0 24px #4fe3ff, 0 0 35px #ff2e88'
        }, {
          scale: 2.4,
          boxShadow: '0 0 40px #ffffff, 0 0 60px #4fe3ff, 0 0 80px #ff2e88',
          duration: 0.35,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
        });
      }

      setTimeout(() => {
        sounds.playQuantumSurge();
        if (this.pingMsg) {
          this.pingMsg.textContent = `✓ PING DISPATCHED TO AHMED AFFES // 200 OK`;
          this.pingMsg.style.color = '#39ff88';
        }
        if (this.pingInput) this.pingInput.value = '';
        setTimeout(() => {
          if (this.pingMsg) this.pingMsg.textContent = '';
        }, 4000);
      }, 500);
    };

    this.pingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSend();
    });

    this.pingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }
}
