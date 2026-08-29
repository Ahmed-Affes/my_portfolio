import { gsap } from '../motion/customEases';

export class CustomCursorController {
  private cursorEl: HTMLElement | null;
  private ringEl: HTMLElement | null = null;
  private dotEl: HTMLElement | null = null;
  private quickX: gsap.QuickToFunc | null = null;
  private quickY: gsap.QuickToFunc | null = null;
  private isHovering = false;

  constructor(cursorId: string) {
    this.cursorEl = document.getElementById(cursorId);
    if (!this.cursorEl) return;

    this.ringEl = this.cursorEl.querySelector('.cursor-ring');
    this.dotEl = this.cursorEl.querySelector('.cursor-dot');

    // GSAP quickTo for buttery 60fps tracking with natural lag
    this.quickX = gsap.quickTo(this.cursorEl, 'x', { duration: 0.15, ease: 'power2.out' });
    this.quickY = gsap.quickTo(this.cursorEl, 'y', { duration: 0.15, ease: 'power2.out' });

    document.body.classList.add('custom-cursor-active');
    this.bindEvents();
  }

  private bindEvents() {
    if (!this.cursorEl) return;

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
      this.quickX?.(e.clientX);
      this.quickY?.(e.clientY);
    });

    const interactiveSelector = 'a, button, .skill-card, .arcade-cabinet, .comms-conduit-card, .floating-metric-card, .bio-tab-btn, .hud-track-checkpoint, .cli-pill-btn, .conduit-btn, .terminal-interactive-kiosk, [role="button"]';

    // Global Event Delegation for 100% reliable hover detection
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.closest(interactiveSelector)) {
        this.enterHover();
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.closest(interactiveSelector)) {
        const related = e.relatedTarget as HTMLElement;
        if (!related || !related.closest(interactiveSelector)) {
          this.leaveHover();
        }
      }
    });

    // Magnetic pull on primary CTAs
    document.querySelectorAll('.hero-cta-cyan-btn, .dossier-action-btn.primary, .conduit-btn.primary').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const me = e as MouseEvent;
        const rect = (btn as HTMLElement).getBoundingClientRect();
        const relX = me.clientX - rect.left - rect.width / 2;
        const relY = me.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: relX * 0.15,
          y: relY * 0.15,
          duration: 0.25,
          ease: 'power2.out'
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });

    // Hide on mouse leave window
    document.addEventListener('mouseleave', () => {
      if (this.cursorEl) gsap.to(this.cursorEl, { opacity: 0, duration: 0.15 });
    });
    document.addEventListener('mouseenter', () => {
      if (this.cursorEl) gsap.to(this.cursorEl, { opacity: 1, duration: 0.15 });
    });
  }

  private enterHover() {
    if (this.isHovering || !this.cursorEl) return;
    this.isHovering = true;
    this.cursorEl.classList.add('cursor-hover');
    if (this.ringEl) {
      gsap.to(this.ringEl, {
        scale: 1.8,
        borderColor: 'rgba(79, 227, 255, 0.9)',
        duration: 0.25,
        ease: 'power2.out'
      });
    }
    if (this.dotEl) {
      gsap.to(this.dotEl, {
        scale: 0.5,
        duration: 0.25,
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
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (this.dotEl) {
      gsap.to(this.dotEl, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }
}
