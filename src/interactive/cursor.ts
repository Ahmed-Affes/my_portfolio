import { gsap } from '../motion/customEases';

export class CustomCursorController {
  private cursorEl: HTMLElement | null;
  private ringEl: HTMLElement | null = null;
  private dotEl: HTMLElement | null = null;
  private isHovering = false;

  constructor(cursorId: string) {
    this.cursorEl = document.getElementById(cursorId);
    if (!this.cursorEl) return;

    this.ringEl = this.cursorEl.querySelector('.cursor-ring');
    this.dotEl = this.cursorEl.querySelector('.cursor-dot');

    document.body.classList.add('custom-cursor-active');
    this.bindEvents();
  }

  private bindEvents() {
    if (!this.cursorEl) return;

    // Track mouse position with instant 0ms latency hardware acceleration
    window.addEventListener('mousemove', (e) => {
      if (this.cursorEl) {
        this.cursorEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    }, { passive: true });

    const interactiveSelector = 'a, button, .skill-card, .arcade-cabinet, .comms-conduit-card, .floating-metric-card, .bio-tab-btn, .hud-track-checkpoint, .cli-pill-btn, .conduit-btn, .terminal-interactive-kiosk, .orbit-satellite, .sentinel-mode-pill, [role="button"]';

    // Global Event Delegation for 100% reliable hover detection
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
    if (this.ringEl) {
      gsap.to(this.ringEl, {
        scale: 1.5,
        borderColor: 'rgba(79, 227, 255, 0.95)',
        duration: 0.15,
        ease: 'power2.out'
      });
    }
    if (this.dotEl) {
      gsap.to(this.dotEl, {
        scale: 0.6,
        duration: 0.15,
        ease: 'power2.out'
      });
    }
  }

  private leaveHover() {
    if (!this.isHovering || !this.cursorEl) return;
    this.isHovering = false;
    this.cursorEl.classList.remove('cursor-hover');
    if (this.ringEl) {
      gsap.to(this.ringEl, {
        scale: 1,
        borderColor: 'rgba(79, 227, 255, 0.5)',
        duration: 0.18,
        ease: 'power2.out'
      });
    }
    if (this.dotEl) {
      gsap.to(this.dotEl, {
        scale: 1,
        duration: 0.18,
        ease: 'power2.out'
      });
    }
  }
}
