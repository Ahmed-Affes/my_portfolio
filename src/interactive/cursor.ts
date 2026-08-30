import { gsap } from '../motion/customEases';

export class CustomCursorController {
  private cursorEl: HTMLElement | null;
  private hudModeEl: HTMLElement | null = null;
  private hudCoordsEl: HTMLElement | null = null;
  private pulseWaveEl: HTMLElement | null = null;
  private isHovering = false;

  constructor(cursorId: string = 'custom-cursor') {
    this.cursorEl = document.getElementById(cursorId);
    if (!this.cursorEl) return;

    this.hudModeEl = document.getElementById('cursor-hud-mode');
    this.hudCoordsEl = document.getElementById('cursor-hud-coords');
    this.pulseWaveEl = document.getElementById('cursor-pulse-wave');

    document.documentElement.classList.add('custom-cursor-active');
    document.body.classList.add('custom-cursor-active');
    this.bindEvents();
  }

  private bindEvents() {
    if (!this.cursorEl) return;

    // Instant 0ms hardware accelerated mouse tracking
    window.addEventListener('mousemove', (e) => {
      if (this.cursorEl) {
        this.cursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Update micro HUD telemetry coordinates (every few frames)
      if (this.hudCoordsEl && (e.clientX % 2 === 0)) {
        const xStr = String(e.clientX).padStart(4, '0');
        const yStr = String(e.clientY).padStart(4, '0');
        this.hudCoordsEl.textContent = `${xStr}.${yStr}`;
      }
    }, { passive: true });

    // Click Shockwave Recoil Burst
    window.addEventListener('pointerdown', () => {
      if (this.cursorEl) {
        this.cursorEl.classList.add('cursor-click');
        setTimeout(() => this.cursorEl?.classList.remove('cursor-click'), 150);
      }

      if (this.pulseWaveEl) {
        gsap.fromTo(this.pulseWaveEl, 
          { scale: 0.8, opacity: 1, borderColor: this.isHovering ? '#39ff88' : 'var(--cyan)' },
          { scale: 3.2, opacity: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    });

    const interactiveSelector = 'a, button, .skill-card, .arcade-cabinet, .comms-conduit-card, .floating-metric-card, .bio-tab-btn, .hud-track-checkpoint, .cli-pill-btn, .conduit-btn, .terminal-interactive-kiosk, .orbit-satellite, .sentinel-mode-pill, [role="button"]';

    // Global Hover Detection
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.closest(interactiveSelector)) {
        this.enterHover();
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.closest(interactiveSelector)) {
        const related = e.relatedTarget as HTMLElement;
        if (!related || !related.closest(interactiveSelector)) {
          this.leaveHover();
        }
      }
    }, { passive: true });

    // Hide on mouse leave window
    document.addEventListener('mouseleave', () => {
      if (this.cursorEl) gsap.to(this.cursorEl, { opacity: 0, duration: 0.1 });
    });
    document.addEventListener('mouseenter', () => {
      if (this.cursorEl) gsap.to(this.cursorEl, { opacity: 1, duration: 0.1 });
    });
  }

  private enterHover() {
    if (this.isHovering || !this.cursorEl) return;
    this.isHovering = true;
    this.cursorEl.classList.add('cursor-hover');

    if (this.hudModeEl) {
      this.hudModeEl.textContent = 'LOCK_ON';
    }
  }

  private leaveHover() {
    if (!this.isHovering || !this.cursorEl) return;
    this.isHovering = false;
    this.cursorEl.classList.remove('cursor-hover');

    if (this.hudModeEl) {
      this.hudModeEl.textContent = 'SYS_AIM';
    }
  }
}
