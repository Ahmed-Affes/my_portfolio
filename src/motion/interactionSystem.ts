import { gsap, EASE_UI, EASE_SNAP } from './customEases';
import { sounds } from '../audio/soundEngine';

export interface InteractionContent {
  statusBadge?: { text: string; type: 'shipped' | 'in-dev' | 'legendary' | 'rare' | 'common' };
  title: string;
  tagline?: string;
  metrics?: string;
  description: string;
  tags?: string[];
  primaryBtn?: { text: string; href?: string; onClick?: () => void };
  secondaryBtn?: { text: string; href?: string; onClick?: () => void };
}

export class InteractionSystem {
  private cameraEl: HTMLElement;
  private backdropEl: HTMLElement;
  private drawerEl: HTMLElement;
  private farLayerEl: HTMLElement | null;
  private midLayerEl: HTMLElement | null;
  private portalTunnelEl: HTMLElement | null;
  private portalBeamEl: HTMLElement | null;
  private isOpen: boolean = false;
  private currentTimeline: gsap.core.Timeline | null = null;
  private activeTargetEl: HTMLElement | null = null;
  private activeMaskEl: HTMLElement | null = null;
  private lastZoomOrigin: { x: number; y: number } = { x: 50, y: 50 };

  public isOpenState(): boolean {
    return this.isOpen;
  }

  public getActiveTarget(): HTMLElement | null {
    return this.activeTargetEl;
  }

  public getCurrentTimeline(): gsap.core.Timeline | null {
    return this.currentTimeline;
  }

  constructor(
    cameraSelector: string = '#scene-camera',
    backdropSelector: string = '#interaction-backdrop',
    drawerSelector: string = '#interaction-drawer'
  ) {
    this.cameraEl = document.querySelector(cameraSelector) as HTMLElement;
    this.backdropEl = document.querySelector(backdropSelector) as HTMLElement;
    this.drawerEl = document.querySelector(drawerSelector) as HTMLElement;
    this.farLayerEl = document.querySelector('.far-skyline-layer');
    this.midLayerEl = document.querySelector('.mid-skyline-layer');
    this.portalTunnelEl = document.querySelector('#portal-tunnel');
    this.portalBeamEl = document.querySelector('#portal-beam');

    if (this.drawerEl) {
      gsap.set(this.drawerEl, { yPercent: 100 });
    }

    this.bindEvents();
  }

  private bindEvents() {
    this.backdropEl?.addEventListener('click', () => this.close());
    
    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    const closeBtn = this.drawerEl?.querySelector('.drawer-close-btn');
    closeBtn?.addEventListener('click', () => this.close());
  }

  public open(targetElement: HTMLElement, content: InteractionContent) {
    if (this.isOpen) {
      this.close(() => this.open(targetElement, content));
      return;
    }

    this.isOpen = true;
    this.activeTargetEl = targetElement;
    this.populateDrawer(content);

    // 1. Calculate Target Coordinates for Portal Zoom
    const targetRect = targetElement.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const originXPercent = (targetCenterX / viewportWidth) * 100;
    const originYPercent = (targetCenterY / viewportHeight) * 100;
    this.lastZoomOrigin = { x: originXPercent, y: originYPercent };

    // Screen mask wipe inside target element
    this.activeMaskEl = targetElement.querySelector('.screen-mask');
    if (!this.activeMaskEl) {
      this.activeMaskEl = document.createElement('div');
      this.activeMaskEl.className = 'screen-mask';
      targetElement.appendChild(this.activeMaskEl);
    }

    // Build the master Portal Fly-Through timeline
    const tl = gsap.timeline();

    // 1. Instant 🌀 Camera 3D Portal Zoom (scale: 3.2x into the clicked card)
    tl.to(
      this.cameraEl,
      {
        scale: 3.2,
        transformOrigin: `${originXPercent}% ${originYPercent}%`,
        duration: 0.95,
        ease: 'power3.inOut'
      },
      0
    );

    // 2. Laser Beam Slit-Scan & Portal Shockwave Rings
    if (this.portalBeamEl) {
      tl.fromTo(
        this.portalBeamEl,
        { scaleX: 0, opacity: 1 },
        { scaleX: 1, opacity: 0, duration: 0.6, ease: 'power3.out' },
        0.05
      );
    }

    if (this.portalTunnelEl) {
      tl.set(this.portalTunnelEl, { opacity: 1 }, 0);
      tl.fromTo(
        '.portal-ring',
        { scale: 0.1, opacity: 1, rotate: 0 },
        {
          scale: 4.8,
          opacity: 0,
          rotate: 180,
          stagger: 0.1,
          duration: 1.1,
          ease: 'power2.out'
        },
        0.1
      );
    }

    // Far background depth blur
    if (this.farLayerEl) {
      tl.to(
        this.farLayerEl,
        { filter: 'blur(8px)', duration: 0.95, ease: 'power2.out' },
        0
      );
    }

    if (this.midLayerEl) {
      tl.to(
        this.midLayerEl,
        { filter: 'blur(4px)', y: -25, duration: 0.95, ease: 'power2.out' },
        0
      );
    }

    // 4. CRT Screen Mask Sweep
    tl.call(() => sounds.playCrtPower(), [], 0.2);
    tl.fromTo(
      this.activeMaskEl,
      { scaleY: 0, opacity: 0.9 },
      { scaleY: 1, opacity: 1, duration: 0.4, ease: 'power2.inOut' },
      0.25
    );

    // 5. Drawer & Backdrop Rise
    tl.call(() => {
      sounds.playPanelOpen();
      this.backdropEl.classList.add('open');
    }, [], 0.4);

    tl.to(
      this.backdropEl,
      { opacity: 1, duration: 0.45, ease: 'power1.out' },
      0.4
    );

    tl.to(
      this.drawerEl,
      { yPercent: 0, duration: 0.55, ease: EASE_UI },
      0.45
    );

    // 6. Staggered Telemetry Reveal
    const staggerItems = this.drawerEl.querySelectorAll('.stagger-item');
    tl.fromTo(
      staggerItems,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: EASE_UI,
        stagger: 0.05
      },
      0.55
    );

    this.currentTimeline = tl;
  }

  public close(onClosedCallback?: () => void) {
    if (!this.isOpen) {
      onClosedCallback?.();
      return;
    }

    this.isOpen = false;
    sounds.playClose();

    const tl = gsap.timeline({
      onComplete: () => {
        this.backdropEl.classList.remove('open');
        this.activeTargetEl = null;
        if (this.activeMaskEl) {
          gsap.set(this.activeMaskEl, { scaleY: 0 });
        }
        if (this.portalTunnelEl) {
          gsap.set(this.portalTunnelEl, { opacity: 0 });
        }
        onClosedCallback?.();
      }
    });

    // 1. Hide Drawer Stagger items
    const staggerItems = this.drawerEl.querySelectorAll('.stagger-item');
    tl.to(staggerItems, {
      opacity: 0,
      y: 10,
      duration: 0.16,
      ease: EASE_SNAP
    });

    // 2. Drop Drawer Down & Fade Backdrop
    tl.to(
      this.drawerEl,
      { yPercent: 100, duration: 0.3, ease: EASE_SNAP },
      "-=0.1"
    );

    tl.to(
      this.backdropEl,
      { opacity: 0, duration: 0.3, ease: 'power1.in' },
      "-=0.2"
    );

    // 3. 🌀 Camera zooms back out from 3.2x to 1.0x!
    tl.to(
      this.cameraEl,
      {
        scale: 1.0,
        transformOrigin: `${this.lastZoomOrigin.x}% ${this.lastZoomOrigin.y}%`,
        duration: 0.75,
        ease: 'power3.inOut'
      },
      "-=0.25"
    );

    if (this.farLayerEl) {
      tl.to(
        this.farLayerEl,
        { filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' },
        "<"
      );
    }

    if (this.midLayerEl) {
      tl.to(
        this.midLayerEl,
        { filter: 'blur(0px)', y: 0, duration: 0.7, ease: 'power2.out' },
        "<"
      );
    }

    this.currentTimeline = tl;
  }

  private populateDrawer(content: InteractionContent) {
    // 1. Badge
    const badgeContainer = this.drawerEl.querySelector('.drawer-badge-container') as HTMLElement;
    if (badgeContainer) {
      if (content.statusBadge) {
        badgeContainer.innerHTML = `<span class="pixel-badge badge-${content.statusBadge.type}">${content.statusBadge.text}</span>`;
      } else {
        badgeContainer.innerHTML = '';
      }
    }

    // 2. Title & Tagline
    const titleEl = this.drawerEl.querySelector('.drawer-title') as HTMLElement;
    const taglineEl = this.drawerEl.querySelector('.drawer-tagline') as HTMLElement;
    if (titleEl) titleEl.textContent = content.title;
    if (taglineEl) taglineEl.textContent = content.tagline || '';

    // 3. Metrics
    const metricsEl = this.drawerEl.querySelector('.drawer-metrics') as HTMLElement;
    if (metricsEl) {
      if (content.metrics) {
        metricsEl.textContent = content.metrics;
        metricsEl.style.display = 'block';
      } else {
        metricsEl.style.display = 'none';
      }
    }

    // 4. Description
    const descEl = this.drawerEl.querySelector('.drawer-description') as HTMLElement;
    if (descEl) descEl.textContent = content.description;

    // 5. Tags
    const tagsEl = this.drawerEl.querySelector('.drawer-tags') as HTMLElement;
    if (tagsEl) {
      if (content.tags && content.tags.length > 0) {
        tagsEl.innerHTML = content.tags
          .map((tag) => `<span class="tag-chip">${tag}</span>`)
          .join('');
        tagsEl.style.display = 'flex';
      } else {
        tagsEl.style.display = 'none';
      }
    }

    // 6. Action Buttons
    const footerActionsEl = this.drawerEl.querySelector('.drawer-footer-actions') as HTMLElement;
    if (footerActionsEl) {
      footerActionsEl.innerHTML = '';

      if (content.primaryBtn) {
        const pBtn = document.createElement('a');
        pBtn.className = 'btn-pixel primary';
        pBtn.textContent = content.primaryBtn.text;
        if (content.primaryBtn.href) {
          pBtn.setAttribute('href', content.primaryBtn.href);
          pBtn.setAttribute('target', '_blank');
          pBtn.setAttribute('rel', 'noopener noreferrer');
        }
        if (content.primaryBtn.onClick) {
          pBtn.addEventListener('click', (e) => {
            e.preventDefault();
            content.primaryBtn?.onClick?.();
          });
        }
        footerActionsEl.appendChild(pBtn);
      }

      if (content.secondaryBtn) {
        const sBtn = document.createElement('a');
        sBtn.className = 'btn-pixel secondary';
        sBtn.textContent = content.secondaryBtn.text;
        if (content.secondaryBtn.href) {
          sBtn.setAttribute('href', content.secondaryBtn.href);
          sBtn.setAttribute('target', '_blank');
          sBtn.setAttribute('rel', 'noopener noreferrer');
        }
        if (content.secondaryBtn.onClick) {
          sBtn.addEventListener('click', (e) => {
            e.preventDefault();
            content.secondaryBtn?.onClick?.();
          });
        }
        footerActionsEl.appendChild(sBtn);
      }
    }
  }
}
