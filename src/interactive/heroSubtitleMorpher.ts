import { sounds } from '../audio/soundEngine';

export class HeroSubtitleMorpher {
  private element: HTMLElement | null = null;
  private titles: string[] = [
    "CREATIVE FULL-STACK ARCHITECT & MOTION DESIGN ENGINEER",
    "SYSTEMS ARCHITECT & DISTRIBUTED PERFORMANCE SPECIALIST",
    "HIGH-PERFORMANCE WEBGL, CANVAS & MOTION CRAFTSMAN",
    "INTERACTIVE CYBERPUNK EXPERIENCES & NEXTGEN UI/UX"
  ];
  private titleIndex = 0;
  private isRunning = false;
  private timeoutId: number | null = null;

  constructor(targetElementId: string = 'hero-typewriter-text') {
    this.element = document.getElementById(targetElementId);
  }

  public start() {
    if (!this.element || this.isRunning) return;
    this.isRunning = true;
    this.typeNextLetter(0);
  }

  public stop() {
    this.isRunning = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private typeNextLetter(charIdx: number) {
    if (!this.isRunning || !this.element) return;
    const currentTitle = this.titles[this.titleIndex];

    if (charIdx <= currentTitle.length) {
      this.element.textContent = currentTitle.slice(0, charIdx);
      if (charIdx % 3 === 0 && charIdx > 0) {
        sounds.playKeyType();
      }
      this.timeoutId = window.setTimeout(() => {
        this.typeNextLetter(charIdx + 1);
      }, 35);
    } else {
      // Hold completed title for 2.4s
      this.timeoutId = window.setTimeout(() => {
        this.eraseLetter(currentTitle.length);
      }, 2400);
    }
  }

  private eraseLetter(charIdx: number) {
    if (!this.isRunning || !this.element) return;
    const currentTitle = this.titles[this.titleIndex];

    if (charIdx >= 0) {
      this.element.textContent = currentTitle.slice(0, charIdx);
      this.timeoutId = window.setTimeout(() => {
        this.eraseLetter(charIdx - 1);
      }, 18);
    } else {
      // Advance to next title
      this.titleIndex = (this.titleIndex + 1) % this.titles.length;
      this.timeoutId = window.setTimeout(() => {
        this.typeNextLetter(0);
      }, 300);
    }
  }
}
