export class HeroQuantumReactor {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private isRunning: boolean = false;
  private frame: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
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
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 280;
    const height = rect.height || 280;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;

    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  private initParticles() {
    this.particles = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      this.spawnParticle();
    }
  }

  private spawnParticle() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const cx = (rect.width || 280) / 2;
    const cy = (rect.height || 280) / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1.2;
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
    this.frame++;

    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 280;
    const height = rect.height || 280;
    const cx = width / 2;
    const cy = height / 2;

    this.ctx.clearRect(0, 0, width, height);

    // Dynamic tilt offset based on mouse
    const tiltX = this.mouseX * 0.15;
    const tiltY = this.mouseY * 0.15;

    this.ctx.save();
    this.ctx.translate(cx + tiltX, cy + tiltY);

    // 1. Ambient Background Core Glow
    const pulseGlow = Math.sin(this.frame * 0.05) * 10;
    const dynamicRadius = 100 + pulseGlow;
    const radialGrad = this.ctx.createRadialGradient(0, 0, 5, 0, 0, dynamicRadius);
    radialGrad.addColorStop(0, 'rgba(79, 227, 255, 0.45)');
    radialGrad.addColorStop(0.4, 'rgba(255, 178, 56, 0.18)');
    radialGrad.addColorStop(0.8, 'rgba(15, 95, 115, 0.08)');
    radialGrad.addColorStop(1, 'transparent');

    this.ctx.fillStyle = radialGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, dynamicRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Outer Segmented Reticle Ring with Ticks
    this.ctx.save();
    this.ctx.rotate(this.frame * 0.008);
    this.ctx.strokeStyle = 'rgba(79, 227, 255, 0.4)';
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
    this.ctx.rotate(-this.frame * 0.012);
    this.ctx.strokeStyle = 'rgba(255, 178, 56, 0.6)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    const hexSides = 6;
    const hexRadius = 72 + Math.sin(this.frame * 0.04) * 4;
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
    this.ctx.rotate(this.frame * 0.015);
    this.ctx.scale(1, Math.cos(this.frame * 0.02) * 0.8 + 0.2);
    this.ctx.strokeStyle = '#4fe3ff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#4fe3ff';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 52, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // Gyro Ring B (Perpendicular)
    this.ctx.save();
    this.ctx.rotate(-this.frame * 0.02 + Math.PI / 4);
    this.ctx.scale(Math.sin(this.frame * 0.025) * 0.8 + 0.2, 1);
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
    this.ctx.shadowColor = '#39ff88';
    this.ctx.shadowBlur = 16;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    const corePulse = 12 + Math.sin(this.frame * 0.1) * 3;
    this.ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
    this.ctx.fill();

    // Diamond Cross Energy Flares
    this.ctx.strokeStyle = '#39ff88';
    this.ctx.lineWidth = 2;
    const flareLen = 22 + Math.sin(this.frame * 0.15) * 8;
    this.ctx.beginPath();
    this.ctx.moveTo(-flareLen, 0);
    this.ctx.lineTo(flareLen, 0);
    this.ctx.moveTo(0, -flareLen);
    this.ctx.lineTo(0, flareLen);
    this.ctx.stroke();
    this.ctx.restore();

    // 6. Particle Cloud Emission
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      const progress = p.life / p.maxLife;
      const alpha = (1 - progress) * p.alpha;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, alpha);
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.arc(p.x - (cx + tiltX), p.y - (cy + tiltY), p.size * (1 - progress * 0.5), 0, Math.PI * 2);
      this.ctx.fill();

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        this.spawnParticle();
      }
    }
    this.ctx.globalAlpha = 1.0;
    this.ctx.shadowBlur = 0;

    this.ctx.restore();

    this.animId = requestAnimationFrame(this.render);
  };
}
