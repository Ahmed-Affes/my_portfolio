export interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number; // in radians (~45 to 60 deg)
  thickness: number;
  color: string;
  glowColor: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

export class WarStarMeteorEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private meteors: Meteor[] = [];
  private sparkles: Sparkle[] = [];
  private isRunning: boolean = false;
  private velocityMultiplier: number = 1.0;
  private targetMultiplier: number = 1.0;

  private colors = [
    { main: '#ffffff', glow: 'rgba(79, 227, 255, 0.9)' }, // Cyan comet
    { main: '#4fe3ff', glow: 'rgba(79, 227, 255, 0.8)' }, // Electric Cyan
    { main: '#ff2e88', glow: 'rgba(255, 46, 136, 0.85)' }, // Cyber Magenta
    { main: '#ffb238', glow: 'rgba(255, 178, 56, 0.85)' }, // Solar Amber
    { main: '#cdeaff', glow: 'rgba(205, 234, 255, 0.7)' }  // White-blue star
  ];

  constructor(canvasId: string = 'meteors-canvas') {
    let existingCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!existingCanvas) {
      existingCanvas = document.createElement('canvas');
      existingCanvas.id = canvasId;
      existingCanvas.className = 'meteors-canvas-layer';
      const bgWrapper = document.querySelector('.parallax-bg-wrapper') || document.body;
      bgWrapper.appendChild(existingCanvas);
    }

    this.canvas = existingCanvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.stop();
      } else {
        this.start();
      }
    });

    window.addEventListener('resize', () => this.resize());
    this.start();
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public setScrollVelocity(velocity: number) {
    // Normal scroll velocity ranges from ~0 to ~50
    const normalizedSpeed = Math.min(6.0, 1.0 + Math.abs(velocity) * 0.08);
    this.targetMultiplier = normalizedSpeed;
  }

  private spawnMeteor() {
    const palette = this.colors[Math.floor(Math.random() * this.colors.length)];
    const angle = (Math.PI / 180) * (48 + (Math.random() - 0.5) * 15); // ~48 deg downward right
    const isMobile = window.innerWidth < 768;
    const baseSpeed = (Math.random() * (isMobile ? 3 : 5) + (isMobile ? 4 : 7)) * this.velocityMultiplier;
    const baseLength = (Math.random() * 60 + 90) * Math.min(2.0, this.velocityMultiplier * 1.0);

    this.meteors.push({
      x: Math.random() * (this.canvas.width + 400) - 200,
      y: -50,
      length: isMobile ? baseLength * 0.7 : baseLength,
      speed: baseSpeed,
      angle: angle,
      thickness: Math.random() * 1.5 + 1.0,
      color: palette.main,
      glowColor: palette.glow,
      alpha: Math.random() * 0.3 + 0.45,
      life: 0,
      maxLife: Math.random() * 80 + 100
    });
  }

  private spawnSparkle(x: number, y: number, color: string) {
    if (window.innerWidth < 768) return; // Skip heavy spark particles on mobile
    for (let i = 0; i < 2; i++) {
      this.sparkles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2 - 1,
        vy: (Math.random() - 0.5) * 2 + 1,
        size: Math.random() * 2 + 1,
        color: color,
        alpha: 0.8,
        life: 0
      });
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Seed initial meteors
    const initialCount = window.innerWidth < 768 ? 1 : 4;
    for (let i = 0; i < initialCount; i++) {
      this.spawnMeteor();
    }

    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    loop();
  }

  public stop() {
    this.isRunning = false;
  }

  private update() {
    // Lerp velocity multiplier towards target
    this.velocityMultiplier += (this.targetMultiplier - this.velocityMultiplier) * 0.05;
    this.targetMultiplier += (1.0 - this.targetMultiplier) * 0.04;

    // Spawn chance scaled by velocity multiplier and mobile threshold
    const isMobile = window.innerWidth < 768;
    const maxMeteors = isMobile ? 3 : 18;
    const spawnRate = (isMobile ? 0.015 : 0.04) * this.velocityMultiplier;
    if (Math.random() < spawnRate && this.meteors.length < maxMeteors) {
      this.spawnMeteor();
    }

    // Update meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.life++;

      const dx = Math.cos(m.angle) * m.speed;
      const dy = Math.sin(m.angle) * m.speed;
      m.x += dx;
      m.y += dy;

      // Spawn spark trail
      if (Math.random() < 0.35) {
        this.spawnSparkle(m.x, m.y, m.glowColor);
      }

      if (m.y > this.canvas.height + 150 || m.x > this.canvas.width + 150 || m.life > m.maxLife) {
        this.meteors.splice(i, 1);
      }
    }

    // Update sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      s.alpha = Math.max(0, 1 - s.life / 25);

      if (s.alpha <= 0 || s.life >= 25) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw meteors
    this.ctx.save();
    for (const m of this.meteors) {
      const tailX = m.x - Math.cos(m.angle) * m.length;
      const tailY = m.y - Math.sin(m.angle) * m.length;

      const grad = this.ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.7, m.glowColor);
      grad.addColorStop(1, m.color);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(m.x, m.y);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = m.thickness;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = m.glowColor;
      this.ctx.shadowBlur = 12 * m.thickness;
      this.ctx.stroke();

      // Bright comet head core
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.thickness * 1.2, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
    }
    this.ctx.restore();

    // Draw sparkles
    this.ctx.save();
    for (const s of this.sparkles) {
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = s.alpha;
      this.ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    }
    this.ctx.restore();
  }
}
