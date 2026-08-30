import { sounds } from '../audio/soundEngine';
import { gsap } from '../motion/customEases';

export class HeroQuantumReactor {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private isRunning: boolean = false;
  private frame: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private surgeEnergy: number = 1.0;
  private clickStreak: number = 0;
  private lastClickTime: number = 0;
  private isMeltdown: boolean = false;
  private shockwaves: Array<{ radius: number; maxRadius: number; alpha: number; color: string }> = [];
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    life: number;
    maxLife: number;
    color: string;
  }> = [];

  constructor(canvasId: string = 'hero-reactor-canvas') {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.initCanvasSize();
    this.initParticles();
    this.initEventListeners();
    this.start();
  }

  private initCanvasSize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = 280 * dpr;
    this.canvas.height = 280 * dpr;

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
  }

  private initParticles() {
    this.particles = [];
    const count = window.innerWidth < 768 ? 14 : 36;
    for (let i = 0; i < count; i++) {
      this.spawnParticle();
    }

    // Auto-pause when reactor is scrolled out of viewport (Performance budget)
    if (this.canvas && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.start();
          } else {
            this.stop();
          }
        });
      }, { threshold: 0.05 });
      observer.observe(this.canvas);
    }
  }

  private spawnParticle() {
    if (!this.canvas) return;
    const cx = 140;
    const cy = 140;
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.4 + Math.random() * 1.2) * this.surgeEnergy;
    const colors = ['#4fe3ff', '#ffb238', '#39ff88', '#ff2e88'];

    this.particles.push({
      x: cx + Math.cos(angle) * (10 + Math.random() * 20),
      y: cy + Math.sin(angle) * (10 + Math.random() * 20),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.8 + Math.random() * 0.2,
      life: 0,
      maxLife: 60 + Math.random() * 80,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  public triggerSurge() {
    if (this.isMeltdown) return;

    const now = Date.now();
    if (now - this.lastClickTime < 1400) {
      this.clickStreak++;
    } else {
      this.clickStreak = 1;
    }
    this.lastClickTime = now;

    // Must reach 6 rapid clicks in a row to detonate countdown! 💥
    if (this.clickStreak >= 6) {
      this.triggerCountdownProtocol();
      return;
    }

    sounds.playQuantumSurge();
    this.surgeEnergy = 1.8 + this.clickStreak * 0.9;

    // Burst particles from center
    if (this.canvas) {
      const cx = 140;
      const cy = 140;
      const colors = ['#4fe3ff', '#ff2e88', '#ffffff', '#ffb238'];
      const burstCount = 18 * this.clickStreak;

      for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.3;
        const speed = (2.2 + Math.random() * 3.0) * (1 + this.clickStreak * 0.25);
        this.particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.0 + Math.random() * 2.5,
          alpha: 1.0,
          life: 0,
          maxLife: 35 + Math.random() * 30,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    // Add expanding shockwave ring
    this.shockwaves.push({
      radius: 10,
      maxRadius: 130,
      alpha: 1.0,
      color: this.clickStreak >= 4 ? '#ff2e88' : '#4fe3ff'
    });

    // Update status labels based on 1 to 5 streak count
    const statusEl = document.querySelector('.reactor-hud-status');
    const pillEl = document.querySelector('.reactor-interact-pill span:last-child');
    
    if (statusEl) {
      if (this.clickStreak === 1) {
        statusEl.textContent = 'FLUX: SURGE ⚡ [1/6]';
        (statusEl as HTMLElement).style.color = '#4fe3ff';
      } else if (this.clickStreak === 2) {
        statusEl.textContent = 'FLUX: OVERCHARGE ⚡ [2/6]';
        (statusEl as HTMLElement).style.color = '#ffb238';
      } else if (this.clickStreak === 3) {
        statusEl.textContent = 'FLUX: OVERLOAD ⚡ [3/6]';
        (statusEl as HTMLElement).style.color = '#ffb238';
      } else if (this.clickStreak === 4) {
        statusEl.textContent = 'FLUX: CRITICAL 85% ⚠️ [4/6]';
        (statusEl as HTMLElement).style.color = '#ff2e88';
      } else if (this.clickStreak === 5) {
        statusEl.textContent = 'FLUX: DETONATE IMMINENT 🔥 [5/6]';
        (statusEl as HTMLElement).style.color = '#ffffff';
      }
    }

    if (pillEl) {
      if (this.clickStreak === 1) pillEl.textContent = '⚡ ENERGY SURGE [1/6]';
      else if (this.clickStreak === 2) pillEl.textContent = '⚡ KEEP CLICKING [2/6]';
      else if (this.clickStreak === 3) pillEl.textContent = '⚠️ CORE COMPRESSION 50% [3/6]';
      else if (this.clickStreak === 4) pillEl.textContent = '⚠️ SINGULARITY CRACKING [4/6]';
      else if (this.clickStreak === 5) pillEl.textContent = '🔥 1 MORE CLICK TO DETONATE! [5/6]';
    }

    const frameEl = document.getElementById('hero-reactor-frame');
    if (frameEl) {
      frameEl.classList.add('reactor-pulsing');
      setTimeout(() => frameEl.classList.remove('reactor-pulsing'), 450);
    }
  }

  private triggerCountdownProtocol() {
    this.isMeltdown = true;
    sounds.playEmergencySiren();

    // 1. Create or get the Countdown Modal Container
    let modal = document.getElementById('quantum-meltdown-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quantum-meltdown-modal';
      modal.className = 'quantum-meltdown-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="meltdown-alert-frame">
        <div class="meltdown-siren-bar">
          <span class="siren-text">⚠️ CRITICAL SINGULARITY OVERLOAD ⚠️</span>
        </div>
        <div class="meltdown-sub-text">GRAVITATIONAL EQUILIBRIUM BREACHED // REALITY COLLAPSE IN:</div>
        <div class="meltdown-countdown-number" id="meltdown-countdown-num">5</div>
        <div class="meltdown-warning-tag">[HOLD ONTO YOUR INTERFACE · TIME-SPACE RUPTURE IMMINENT]</div>
      </div>
    `;

    gsap.fromTo(modal, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1.0, duration: 0.3, ease: 'back.out(1.5)' });

    const statusEl = document.querySelector('.reactor-hud-status');
    const pillEl = document.querySelector('.reactor-interact-pill span:last-child');
    const frameEl = document.getElementById('hero-reactor-frame');

    if (frameEl) frameEl.classList.add('reactor-meltdown');
    if (statusEl) {
      statusEl.textContent = '💥 DETONATION IN PROGRESS 💥';
      (statusEl as HTMLElement).style.color = '#ff2e88';
    }
    if (pillEl) {
      pillEl.textContent = '🔥 5S TO TOTAL VOID COLLAPSE 🔥';
    }

    let count = 5;
    sounds.playCountdownBeep(count);

    const countdownInterval = window.setInterval(() => {
      count--;
      const countNumEl = document.getElementById('meltdown-countdown-num');

      if (count > 0) {
        if (countNumEl) {
          countNumEl.textContent = `${count}`;
          gsap.fromTo(countNumEl, { scale: 1.8, color: '#ffffff' }, { scale: 1.0, color: count <= 2 ? '#ff2e88' : '#ffb238', duration: 0.3, ease: 'back.out(2)' });
        }
        if (pillEl) {
          pillEl.textContent = `🔥 ${count}S TO TOTAL VOID COLLAPSE 🔥`;
        }

        sounds.playCountdownBeep(count);
        this.surgeEnergy = 4.0 + (5 - count) * 3.0;

        // Camera shakes more violently with each tick
        const viewport = document.querySelector('.camera-parallax-rig') || document.body;
        gsap.fromTo(viewport, 
          { x: (Math.random() - 0.5) * (10 + (5 - count) * 4), y: (Math.random() - 0.5) * (8 + (5 - count) * 3) },
          { x: 0, y: 0, duration: 0.25, ease: 'power2.out' }
        );

        // Burst sparks and shockwave
        this.shockwaves.push({
          radius: 10,
          maxRadius: 140,
          alpha: 1.0,
          color: count <= 2 ? '#ff2e88' : '#ffb238'
        });
      } else {
        clearInterval(countdownInterval);
        if (countNumEl) countNumEl.textContent = '0';
        sounds.playCountdownBeep(0);
        // Execute the Void Gravity Fall!
        this.executeVoidGravityFall(modal);
      }
    }, 1000);
  }

  private executeVoidGravityFall(modal: HTMLElement | null) {
    sounds.playCoreDetonation();

    // 1. Create full-screen whiteout blast flash
    let flash = document.getElementById('void-detonation-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.id = 'void-detonation-flash';
      flash.className = 'void-detonation-flash';
      document.body.appendChild(flash);
    }
    gsap.fromTo(flash, { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power2.out' });

    // Remove countdown modal immediately
    if (modal) {
      gsap.to(modal, { opacity: 0, scale: 0.5, y: 300, duration: 0.4, onComplete: () => modal.remove() });
    }

    // 2. Select all primary UI containers and launch them down into the void
    const fallingElements = document.querySelectorAll(
      '.hud-top-bar, .hero-modern-header, .hero-hud-callout, .hero-reactor-frame, .floating-metric-card, .hero-scroll-directive, .perspective-grid-floor, .stars-layer, .hud-audio-visualizer'
    );

    fallingElements.forEach((el, index) => {
      const randomX = (Math.random() - 0.5) * 400;
      const randomRot = (Math.random() - 0.5) * 90;
      const randomDelay = index * 0.03;

      gsap.to(el, {
        y: window.innerHeight + 600,
        x: randomX,
        rotateZ: randomRot,
        opacity: 0,
        filter: 'blur(16px)',
        duration: 1.1 + Math.random() * 0.4,
        delay: randomDelay,
        ease: 'power3.in'
      });
    });

    // 3. Create the Pitch-Black VOID Screen with glitching terminal recovery logs
    let voidScreen = document.getElementById('void-screen-overlay');
    if (!voidScreen) {
      voidScreen = document.createElement('div');
      voidScreen.id = 'void-screen-overlay';
      voidScreen.className = 'void-screen-overlay';
      document.body.appendChild(voidScreen);
    }

    voidScreen.innerHTML = `
      <div class="void-terminal-box">
        <div class="void-glitch-header">[FATAL EXCEPTION: QUANTUM SINGULARITY RUPTURED]</div>
        <div class="void-glitch-body">
          <p class="void-line line-1">&gt; ERROR 0x000000FF: LOCAL REALITY HAS COLLAPSED INTO THE VOID.</p>
          <p class="void-line line-2">&gt; SYSTEM INTEGRITY: 0.00% · GRAVITATIONAL MATRIX DESTROYED.</p>
          <p class="void-line line-3">&gt; ENGAGING EMERGENCY QUANTUM TEMPORAL REWIND...</p>
          <p class="void-line line-4">&gt; RECONSTRUCTING TIME-SPACE INTERFACE IN <span id="void-restore-sec">3</span>...</p>
        </div>
      </div>
    `;

    gsap.fromTo(voidScreen, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.8 });

    // Countdown 3, 2, 1 in the void
    let restoreSec = 3;
    const restoreInterval = window.setInterval(() => {
      restoreSec--;
      const secEl = document.getElementById('void-restore-sec');
      if (secEl && restoreSec > 0) {
        secEl.textContent = `${restoreSec}`;
        sounds.playHoverBlip();
      } else if (restoreSec <= 0) {
        clearInterval(restoreInterval);
        this.executeRealityReboot(voidScreen, fallingElements);
      }
    }, 900);
  }

  private executeRealityReboot(voidScreen: HTMLElement | null, fallingElements: NodeListOf<Element>) {
    sounds.playSystemReboot();

    // 1. Create sweeping Matrix / CRT reboot scanline
    let scanline = document.getElementById('reality-reboot-scanline');
    if (!scanline) {
      scanline = document.createElement('div');
      scanline.id = 'reality-reboot-scanline';
      scanline.className = 'reality-reboot-scanline';
      document.body.appendChild(scanline);
    }

    gsap.fromTo(scanline, 
      { top: '-20%', opacity: 1 }, 
      { top: '120%', opacity: 1, duration: 1.2, ease: 'power2.inOut', onComplete: () => scanline?.remove() }
    );

    // Fade out void screen
    if (voidScreen) {
      gsap.to(voidScreen, { opacity: 0, duration: 0.5, onComplete: () => voidScreen.remove() });
    }

    // 2. Re-assemble all fallen elements flying back from sky with elastic bounce!
    fallingElements.forEach((el) => {
      gsap.fromTo(el,
        {
          y: -window.innerHeight - 300,
          x: (Math.random() - 0.5) * 150,
          rotateZ: (Math.random() - 0.5) * 45,
          opacity: 0,
          filter: 'blur(10px)'
        },
        {
          y: 0,
          x: 0,
          rotateZ: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          ease: 'back.out(1.4)',
          stagger: 0.04,
          clearProps: 'transform,opacity,filter'
        }
      );
    });

    // 3. Reset Reactor Core to pristine nominal state
    const statusEl = document.querySelector('.reactor-hud-status');
    const tagEl = document.querySelector('.reactor-hud-tag');
    const pillEl = document.querySelector('.reactor-interact-pill span:last-child');
    const frameEl = document.getElementById('hero-reactor-frame');

    if (frameEl) {
      frameEl.classList.remove('reactor-meltdown');
    }
    if (statusEl) {
      statusEl.textContent = 'FLUX: OPTIMAL';
      (statusEl as HTMLElement).style.color = 'var(--green)';
    }
    if (tagEl) {
      tagEl.textContent = 'QUANTUM_CORE // v2.6';
      (tagEl as HTMLElement).style.color = 'var(--cyan)';
    }
    if (pillEl) {
      pillEl.textContent = '⚡ CLICK TO OVERLOAD FLUX';
    }

    this.initCanvasSize();
    this.initParticles();
    this.shockwaves = [];
    this.clickStreak = 0;
    this.isMeltdown = false;
    this.surgeEnergy = 1.0;

    // 4. Show celebratory Reality Restored banner toast
    let toast = document.createElement('div');
    toast.className = 'reality-restored-toast';
    toast.innerHTML = `<span>⚡</span> SYSTEM REBOOT COMPLETE · TIME-SPACE RESTORED 100% <span>⚡</span>`;
    document.body.appendChild(toast);

    gsap.fromTo(toast, 
      { y: 50, opacity: 0, scale: 0.8 }, 
      { y: 0, opacity: 1, scale: 1.0, duration: 0.5, ease: 'back.out(1.5)' }
    );

    setTimeout(() => {
      gsap.to(toast, { y: -30, opacity: 0, duration: 0.4, onComplete: () => toast.remove() });
    }, 3500);
  }

  private initEventListeners() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left - rect.width / 2;
      this.mouseY = e.clientY - rect.top - rect.height / 2;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouseX = 0;
      this.mouseY = 0;
    });

    const parentFrame = document.getElementById('hero-reactor-frame');
    if (parentFrame) {
      parentFrame.addEventListener('click', () => {
        this.triggerSurge();
      });
    }

    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.render();
  }

  public stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  private render = () => {
    if (!this.isRunning || !this.ctx || !this.canvas) return;
    try {
      this.frame++;
      const dpr = window.devicePixelRatio || 1;

      // Decay surge energy back to baseline 1.0
      if (this.surgeEnergy > 1.0) {
        this.surgeEnergy -= 0.04;
        if (this.surgeEnergy < 1.0) this.surgeEnergy = 1.0;
      }

      // Hard reset transform matrix to exact DPR scale every frame!
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.clearRect(0, 0, 280, 280);

      const cx = 140;
      const cy = 140;
      const tiltX = Math.max(-15, Math.min(15, (this.mouseX || 0) * 0.12));
      const tiltY = Math.max(-15, Math.min(15, (this.mouseY || 0) * 0.12));

      this.ctx.save();
      this.ctx.translate(cx + tiltX, cy + tiltY);

      // 0. Draw expanding shockwaves
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += 4.5;
        sw.alpha = Math.max(0, 1 - sw.radius / (sw.maxRadius || 130));

        this.ctx.strokeStyle = sw.color;
        this.ctx.globalAlpha = sw.alpha;
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, Math.max(1, sw.radius), 0, Math.PI * 2);
        this.ctx.stroke();

        if (sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }
      this.ctx.globalAlpha = 1.0;

      // 1. Ambient Background Core Glow
      const pulseGlow = Math.sin(this.frame * 0.05) * 10 * (this.surgeEnergy || 1.0);
      const dynamicRadius = Math.max(12, 100 + pulseGlow);
      const radialGrad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, dynamicRadius);
      radialGrad.addColorStop(0, this.surgeEnergy > 1.5 ? 'rgba(255, 46, 136, 0.65)' : 'rgba(79, 227, 255, 0.45)');
      radialGrad.addColorStop(0.4, 'rgba(255, 178, 56, 0.2)');
      radialGrad.addColorStop(0.8, 'rgba(15, 95, 115, 0.08)');
      radialGrad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = radialGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, dynamicRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // 2. Outer Segmented Reticle Ring with Ticks
      this.ctx.save();
      this.ctx.rotate(this.frame * 0.008 * (this.surgeEnergy || 1.0));
      this.ctx.strokeStyle = this.surgeEnergy > 1.5 ? 'rgba(255, 46, 136, 0.7)' : 'rgba(79, 227, 255, 0.4)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([14, 8, 4, 8]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 95, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Outer Reticle Cardinal Ticks
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const x1 = Math.cos(angle) * 90;
        const y1 = Math.sin(angle) * 90;
        const x2 = Math.cos(angle) * 102;
        const y2 = Math.sin(angle) * 102;

        this.ctx.strokeStyle = '#ffb238';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
      this.ctx.restore();

      // 3. Counter-Rotating Hexagonal Matrix Core
      this.ctx.save();
      this.ctx.rotate(-this.frame * 0.012 * (this.surgeEnergy || 1.0));
      this.ctx.strokeStyle = 'rgba(255, 178, 56, 0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      const hexSides = 6;
      const hexRadius = Math.max(10, 72 + Math.sin(this.frame * 0.04) * 4 * (this.surgeEnergy || 1.0));
      for (let i = 0; i < hexSides; i++) {
        const angle = (i * 2 * Math.PI) / hexSides;
        const x = Math.cos(angle) * hexRadius;
        const y = Math.sin(angle) * hexRadius;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.stroke();

      // Vertices Nodes
      for (let i = 0; i < hexSides; i++) {
        const angle = (i * 2 * Math.PI) / hexSides;
        const x = Math.cos(angle) * hexRadius;
        const y = Math.sin(angle) * hexRadius;
        this.ctx.fillStyle = '#4fe3ff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();

      // 4. Multi-Axis 3D Gyroscopic Rings
      // Gyro Ring A
      this.ctx.save();
      this.ctx.rotate(this.frame * 0.015 * (this.surgeEnergy || 1.0));
      this.ctx.scale(1, Math.cos(this.frame * 0.02 * (this.surgeEnergy || 1.0)) * 0.8 + 0.2);
      this.ctx.strokeStyle = this.surgeEnergy > 1.5 ? '#ffffff' : '#4fe3ff';
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = '#4fe3ff';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 52, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      // Gyro Ring B (Perpendicular)
      this.ctx.save();
      this.ctx.rotate(-this.frame * 0.02 * (this.surgeEnergy || 1.0) + Math.PI / 4);
      this.ctx.scale(Math.sin(this.frame * 0.025 * (this.surgeEnergy || 1.0)) * 0.8 + 0.2, 1);
      this.ctx.strokeStyle = '#ff2e88';
      this.ctx.lineWidth = 1.5;
      this.ctx.shadowColor = '#ff2e88';
      this.ctx.shadowBlur = 6;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 42, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      // 5. Central Plasma Singularity / Micro-Core
      this.ctx.save();
      this.ctx.shadowColor = this.surgeEnergy > 1.5 ? '#ff2e88' : '#39ff88';
      this.ctx.shadowBlur = 16 * (this.surgeEnergy || 1.0);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      const corePulse = Math.max(4, (12 + Math.sin(this.frame * 0.1) * 3) * (this.surgeEnergy > 1.5 ? 1.4 : 1.0));
      this.ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
      this.ctx.fill();

      // Diamond Cross Energy Flares
      this.ctx.strokeStyle = this.surgeEnergy > 1.5 ? '#ff2e88' : '#39ff88';
      this.ctx.lineWidth = 2;
      const flareLen = Math.max(6, (22 + Math.sin(this.frame * 0.15) * 8) * (this.surgeEnergy || 1.0));
      this.ctx.beginPath();
      this.ctx.moveTo(-flareLen, 0);
      this.ctx.lineTo(flareLen, 0);
      this.ctx.moveTo(0, -flareLen);
      this.ctx.lineTo(flareLen, 0);
      this.ctx.stroke();
      this.ctx.restore();

      // 6. Particle Cloud Emission
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const progress = p.life / (p.maxLife || 60);
        const alpha = (1 - progress) * (p.alpha || 0.8);

        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, alpha);
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 4;
        this.ctx.beginPath();
        this.ctx.arc(p.x - cx, p.y - cy, Math.max(0.5, p.size * (1 - progress * 0.5)), 0, Math.PI * 2);
        this.ctx.fill();

        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1);
          const maxP = window.innerWidth < 768 ? 14 : 36;
          if (this.particles.length < maxP) {
            this.spawnParticle();
          }
        }
      }
      this.ctx.globalAlpha = 1.0;
      this.ctx.shadowBlur = 0;

      this.ctx.restore();
    } catch {
      // safe fallback
    }

    if (this.isRunning) {
      this.animId = requestAnimationFrame(this.render);
    }
  };
}
