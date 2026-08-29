export class RadarTransmitterEngine {
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private angle: number = 0;
  private rings: { r: number; opacity: number; speed: number }[] = [];
  private blips: { angle: number; dist: number; alpha: number; pulse: number }[] = [];
  private isHovered: boolean = false;
  private animId: number | null = null;

  constructor(canvasId: string = 'radar-canvas') {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    if (!this.canvas || !this.ctx) return;

    this.initRings();
    this.initBlips();
    this.initEvents();
    this.startLoop();
  }

  private initRings() {
    this.rings = [
      { r: 25, opacity: 0.8, speed: 0.6 },
      { r: 55, opacity: 0.6, speed: 0.6 },
      { r: 85, opacity: 0.4, speed: 0.6 },
      { r: 115, opacity: 0.2, speed: 0.6 }
    ];
  }

  private initBlips() {
    this.blips = [
      { angle: 0.8, dist: 65, alpha: 0.9, pulse: 0 },
      { angle: 2.2, dist: 90, alpha: 0.85, pulse: 0 },
      { angle: 4.1, dist: 45, alpha: 0.95, pulse: 0 },
      { angle: 5.4, dist: 100, alpha: 0.75, pulse: 0 }
    ];
  }

  private initEvents() {
    if (!this.canvas) return;

    this.canvas.parentElement?.addEventListener('mouseenter', () => {
      this.isHovered = true;
    });

    this.canvas.parentElement?.addEventListener('mouseleave', () => {
      this.isHovered = false;
    });
  }

  private startLoop() {
    const render = () => {
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    render();
  }

  private draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Radar Background & Grid
    ctx.save();
    ctx.fillStyle = 'rgba(4, 8, 20, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Grid Crosshairs
    ctx.strokeStyle = 'rgba(79, 227, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.stroke();

    // Concentric Static Rings
    for (let r = 30; r <= maxRadius; r += 30) {
      ctx.strokeStyle = 'rgba(79, 227, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dynamic Expanding Pulse Wave
    for (const ring of this.rings) {
      ring.r += ring.speed * (this.isHovered ? 1.8 : 1.0);
      if (ring.r > maxRadius) {
        ring.r = 10;
      }
      const ringAlpha = Math.max(0, 1 - ring.r / maxRadius) * 0.4;
      ctx.strokeStyle = `rgba(57, 255, 136, ${ringAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Rotating Radar Sweep Beam
    const sweepSpeed = this.isHovered ? 0.045 : 0.025;
    this.angle = (this.angle + sweepSpeed) % (Math.PI * 2);

    const sweepGradient = ctx.createConicGradient(this.angle, cx, cy);
    sweepGradient.addColorStop(0, 'rgba(79, 227, 255, 0.45)');
    sweepGradient.addColorStop(0.12, 'rgba(79, 227, 255, 0.02)');
    sweepGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = sweepGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.fill();

    // Leading Sweep Line
    const lx = cx + Math.cos(this.angle) * maxRadius;
    const ly = cy + Math.sin(this.angle) * maxRadius;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    // 3. Target Satellite Blips
    for (const blip of this.blips) {
      const bx = cx + Math.cos(blip.angle) * (blip.dist * (maxRadius / 120));
      const by = cy + Math.sin(blip.angle) * (blip.dist * (maxRadius / 120));

      // Calculate angular distance to sweep beam
      let angleDiff = this.angle - blip.angle;
      while (angleDiff < 0) angleDiff += Math.PI * 2;
      while (angleDiff >= Math.PI * 2) angleDiff -= Math.PI * 2;

      // Glow bright when hit by sweep
      if (angleDiff < 0.25) {
        blip.alpha = 1.0;
        blip.pulse = 1.0;
      } else {
        blip.alpha = Math.max(0.2, blip.alpha - 0.01);
        blip.pulse = Math.max(0, blip.pulse - 0.03);
      }

      ctx.fillStyle = `rgba(57, 255, 136, ${blip.alpha})`;
      ctx.shadowColor = '#39ff88';
      ctx.shadowBlur = 8 * blip.alpha;
      ctx.beginPath();
      ctx.arc(bx, by, 3.5 + blip.pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Small target reticle box around blip
      if (blip.alpha > 0.4) {
        ctx.strokeStyle = `rgba(79, 227, 255, ${blip.alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx - 6, by - 6, 12, 12);
      }
    }

    // 4. Center Singularity Node
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#4fe3ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outer Border Frame
    ctx.strokeStyle = 'rgba(79, 227, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  public destroy() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
    }
  }
}
