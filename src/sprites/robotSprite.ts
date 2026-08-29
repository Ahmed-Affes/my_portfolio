// Hand-coded SVG pixel sprite engine for UNIT_07 robot avatar and HUD icon

export const SPRITE_PALETTE: Record<string, string> = {
  '.': 'transparent',
  'O': '#04060d', // Crisp dark outline
  'C': '#4fe3ff', // Primary vibrant cyan
  'D': '#0f5f73', // Cyan shadow
  'V': '#ff2e88', // Magenta visor
  'W': '#ffffff', // Visor glare / white highlight
  'A': '#ffb238', // Amber core badge
  'J': '#080c18', // Dark joints / legs
  'L': '#04060d', // Feet outline
};

// 16x16 pixel grid definition matching 01_hero.png and 05_cabinet_approach.png
export const SPRITE_FRAMES = {
  IDLE_1: [
    "....OOOOOOOO....",
    "...OCCCCCCCCVO..",
    "...OCWWVVVVVVO..",
    "...OCVVVVVVVVO..",
    "...OOOOOOOOOOO..",
    "..ODCCCCCCCCCDO.",
    ".ODCCCCCCCCCCCDO",
    ".OCCCCCCCCCCCCCO",
    ".OCCCAAAAACCCCCO",
    ".OCCCADDDACCCCCO",
    ".ODCCCCCCCCCCCDO",
    "..OOOOOOOOOOOOO.",
    "....OJJJ.OJJJ...",
    "....OJJJ.OJJJ...",
    "....OJJJ.OJJJ...",
    "....OOOO.OOOO..."
  ],
  IDLE_2: [
    "................",
    "....OOOOOOOO....",
    "...OCCCCCCCCVO..",
    "...OCWWVVVVVVO..",
    "...OCVVVVVVVVO..",
    "...OOOOOOOOOOO..",
    "..ODCCCCCCCCCDO.",
    ".ODCCCCCCCCCCCDO",
    ".OCCCCCCCCCCCCCO",
    ".OCCCAAAAACCCCCO",
    ".OCCCADDDACCCCCO",
    ".ODCCCCCCCCCCCDO",
    "..OOOOOOOOOOOOO.",
    "....OJJJ.OJJJ...",
    "....OJJJ.OJJJ...",
    "....OOOO.OOOO..."
  ],
  WALK_1: [
    "....OOOOOOOO....",
    "...OCCCCCCCCVO..",
    "...OCWWVVVVVVO..",
    "...OCVVVVVVVVO..",
    "...OOOOOOOOOOO..",
    "..ODCCCCCCCCCDO.",
    ".ODCCCCCCCCCCCDO",
    ".OCCCCCCCCCCCCCO",
    ".OCCCAAAAACCCCCO",
    ".OCCCADDDACCCCCO",
    ".ODCCCCCCCCCCCDO",
    "..OOOOOOOOOOOOO.",
    "...OJJJ...OJJJ..",
    "...OJJJ.....OJJJ",
    "...OJJJ.....OJJJ",
    "...OOOO.....OOOO"
  ],
  WALK_2: [
    "....OOOOOOOO....",
    "...OCCCCCCCCVO..",
    "...OCWWVVVVVVO..",
    "...OCVVVVVVVVO..",
    "...OOOOOOOOOOO..",
    "..ODCCCCCCCCCDO.",
    ".ODCCCCCCCCCCCDO",
    ".OCCCCCCCCCCCCCO",
    ".OCCCAAAAACCCCCO",
    ".OCCCADDDACCCCCO",
    ".ODCCCCCCCCCCCDO",
    "..OOOOOOOOOOOOO.",
    "....OJJJ.OJJJ...",
    "....OJJJ.OJJJ...",
    "....OJJJ.OJJJ...",
    "....OOOO.OOOO..."
  ],
  WALK_3: [
    "....OOOOOOOO....",
    "...OCCCCCCCCVO..",
    "...OCWWVVVVVVO..",
    "...OCVVVVVVVVO..",
    "...OOOOOOOOOOO..",
    "..ODCCCCCCCCCDO.",
    ".ODCCCCCCCCCCCDO",
    ".OCCCCCCCCCCCCCO",
    ".OCCCAAAAACCCCCO",
    ".OCCCADDDACCCCCO",
    ".ODCCCCCCCCCCCDO",
    "..OOOOOOOOOOOOO.",
    ".....OJJJ.OJJJ..",
    "....OJJJ...OJJJ.",
    "....OJJJ...OJJJ.",
    "....OOOO...OOOO."
  ],
  INTERACT: [
    "....OOOOOOOO....",
    "...OCCCCCCCCVO..",
    "...OCWWAAAAAVO..",
    "...OCAAAAAAAAVO.",
    "...OOOOOOOOOOO..",
    "..ODCCCCCCCCCDOO",
    ".ODCCCCCCCCCCCCC",
    ".OCCCCCCCCCCCCCO",
    ".OCCCAAAAACCCCCO",
    ".OCCCADDDACCCCCO",
    ".ODCCCCCCCCCCCDO",
    "..OOOOOOOOOOOOO.",
    "....OJJJ.OJJJ...",
    "....OJJJ.OJJJ...",
    "....OJJJ.OJJJ...",
    "....OOOO.OOOO..."
  ]
};

export type SpriteFrameKey = keyof typeof SPRITE_FRAMES;

export function renderSpriteSvg(
  frame: string[],
  pixelSize: number = 4,
  customPalette?: Record<string, string>
): string {
  const palette = { ...SPRITE_PALETTE, ...customPalette };
  const height = frame.length;
  const width = frame[0].length;
  const svgWidth = width * pixelSize;
  const svgHeight = height * pixelSize;

  let rects = '';
  for (let y = 0; y < height; y++) {
    const row = frame[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const color = palette[char];
      if (color && color !== 'transparent') {
        rects += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" shape-rendering="crispEdges"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" class="pixel-sprite" shape-rendering="crispEdges" style="image-rendering: pixelated; display: block;">${rects}</svg>`;
}

export class RobotSpriteController {
  private element: HTMLElement;
  private pixelSize: number;
  private currentFrameKey: SpriteFrameKey = 'IDLE_1';
  private walkInterval: number | null = null;
  private idleInterval: number | null = null;
  private walkStep = 0;
  private isWalking = false;

  constructor(container: HTMLElement, pixelSize: number = 4) {
    this.element = container;
    this.pixelSize = pixelSize;
    this.setFrame('IDLE_1');
    this.startIdleAnimation();
  }

  public setFrame(frameKey: SpriteFrameKey) {
    this.currentFrameKey = frameKey;
    const frameData = SPRITE_FRAMES[frameKey] || SPRITE_FRAMES.IDLE_1;
    this.element.innerHTML = renderSpriteSvg(frameData, this.pixelSize);
  }

  public startWalking(direction: 'left' | 'right' = 'right') {
    if (this.isWalking) return;
    this.isWalking = true;
    this.stopIdleAnimation();

    this.element.style.transform = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';

    const walkFrames: SpriteFrameKey[] = ['WALK_1', 'WALK_2', 'WALK_3', 'WALK_2'];
    this.walkInterval = window.setInterval(() => {
      this.walkStep = (this.walkStep + 1) % walkFrames.length;
      this.setFrame(walkFrames[this.walkStep]);
    }, 140);
  }

  public stopWalking() {
    this.isWalking = false;
    if (this.walkInterval !== null) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }
    this.setFrame('IDLE_1');
    this.startIdleAnimation();
  }

  public interact() {
    this.stopWalking();
    this.stopIdleAnimation();
    this.setFrame('INTERACT');
  }

  public resetToIdle() {
    this.setFrame('IDLE_1');
    this.startIdleAnimation();
  }

  private startIdleAnimation() {
    this.stopIdleAnimation();
    let toggle = false;
    this.idleInterval = window.setInterval(() => {
      if (!this.isWalking && this.currentFrameKey.startsWith('IDLE')) {
        toggle = !toggle;
        this.setFrame(toggle ? 'IDLE_2' : 'IDLE_1');
      }
    }, 900);
  }

  private stopIdleAnimation() {
    if (this.idleInterval !== null) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
  }

  public destroy() {
    this.stopWalking();
    this.stopIdleAnimation();
  }
}
