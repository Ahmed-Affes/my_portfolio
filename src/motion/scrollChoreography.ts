import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './customEases';
import { RobotSpriteController } from '../sprites/robotSprite';
import { sounds } from '../audio/soundEngine';
import { WarStarMeteorEngine } from '../canvas/meteorEngine';

export class ScrollChoreography {
  public lenis: Lenis;
  public meteorEngine: WarStarMeteorEngine;
  private hudRobotEl: HTMLElement;
  private hudTrackEl: HTMLElement;
  private checkpoints: HTMLElement[];
  private hudRobotController: RobotSpriteController;
  private sceneRobotController: RobotSpriteController;
  private sceneRobotWrapperEl: HTMLElement;
  private hudEnvLabelEl: HTMLElement | null;
  private envSkyTintEl: HTMLElement | null;
  private currentSectorIndex: number = -1;
  private isTypingDialogue: boolean = false;
  private isDecryptedBeacon: boolean = false;

  constructor(
    hudRobotController: RobotSpriteController,
    sceneRobotController: RobotSpriteController,
    meteorEngine: WarStarMeteorEngine
  ) {
    this.hudRobotController = hudRobotController;
    this.sceneRobotController = sceneRobotController;
    this.meteorEngine = meteorEngine;
    this.hudRobotEl = document.querySelector('.hud-robot-indicator') as HTMLElement;
    this.hudTrackEl = document.querySelector('.hud-track') as HTMLElement;
    this.sceneRobotWrapperEl = document.querySelector('#scene-robot-container') as HTMLElement;
    this.checkpoints = Array.from(document.querySelectorAll('.hud-track-checkpoint'));
    this.hudEnvLabelEl = document.querySelector('#hud-env-label');
    this.envSkyTintEl = document.querySelector('#env-sky-tint');

    // Initialize Lenis with enhanced smoothness & inertia
    this.lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    (window as any).__lenis = this.lenis;

    this.setupLenisWithGsap();
    this.setupMasterFullPageTimeline();
    this.setupCheckpointNavigation();
    this.setupScrollVelocityWalkAndMeteors();
    this.setup3DMouseParallax();
  }

  private setupLenisWithGsap() {
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  public setupMasterFullPageTimeline() {
    const actBoot = document.querySelector('#act-boot') as HTMLElement;
    const actTerminal = document.querySelector('#act-terminal') as HTMLElement;
    const actSkills = document.querySelector('#act-skills') as HTMLElement;
    const actProjects = document.querySelector('#act-projects') as HTMLElement;
    const actContact = document.querySelector('#act-contact') as HTMLElement;

    const radarWaves = document.querySelector('#radar-waves');
    const warpStreaks = document.querySelector('#warp-streaks');

    const farSkyline = document.querySelector('.far-skyline-layer');
    const midSkyline = document.querySelector('.mid-skyline-layer');
    const gridFloor = document.querySelector('.perspective-grid-floor');

    // Initial Full-Page 3D spatial staging positions
    // Act 0 starts active in viewport center
    gsap.set(actBoot, {
      yPercent: 0,
      scale: 1.0,
      rotateX: 0,
      opacity: 1,
      filter: 'blur(0px)',
      pointerEvents: 'auto',
      zIndex: 10
    });

    // Acts 1, 2, 3, 4 start primed below the viewport ready to sweep up
    gsap.set(actTerminal, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 9
    });

    gsap.set(actSkills, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 8
    });

    gsap.set(actProjects, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 7
    });

    gsap.set(actContact, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 6
    });

    gsap.set(warpStreaks, { opacity: 0 });
    gsap.set(radarWaves, { opacity: 0 });

    // Master Timeline with 12 units total duration (Full-Page Continuous Staging)
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-track',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
        onUpdate: (self) => {
          this.updateHudProgress(self.progress);
          this.updateEnvironmentAndStory(self.progress);
        }
      }
    });

    // Continuous world parallax & speed
    masterTl
      .to(farSkyline, { xPercent: -20, duration: 12, ease: 'none' }, 0)
      .to(midSkyline, { xPercent: -40, duration: 12, ease: 'none' }, 0)
      .to(gridFloor, { backgroundPosition: '0 2800px', duration: 12, ease: 'none' }, 0);

    // =========================================================================
    // 🌌 CHAPTER 0 -> 1: HERO OUT -> MAINFRAME UNFOLD (ABOUT & ROBOT FACE)
    // =========================================================================
    masterTl
      // Act 0 peels apart in parallax layers
      .to('.hero-hud-callout.left-callout', {
        xPercent: -40,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 1.1,
        ease: 'power2.inOut'
      }, 0.8)
      .to('.hero-hud-callout.right-callout', {
        xPercent: 40,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 1.1,
        ease: 'power2.inOut'
      }, 0.8)
      .to('.hero-reactor-frame', {
        scale: 0.7,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.2,
        ease: 'power2.inOut'
      }, 0.8)
      .to('.hero-bottom-floating-row', {
        y: 40,
        opacity: 0,
        duration: 1.0,
        ease: 'power2.inOut'
      }, 0.8)
      .to(actBoot, {
        opacity: 0,
        duration: 1.2,
        ease: 'power2.inOut'
      }, 0.8)
      .set(actBoot, { pointerEvents: 'none' }, 1.8)
      // Warp speed lines flash
      .fromTo(warpStreaks, { opacity: 0, scaleX: 0.5 }, { opacity: 0.8, scaleX: 1.4, duration: 0.6, yoyo: true, repeat: 1 }, 1.0)
      // Robot moves toward center console
      .to(this.sceneRobotWrapperEl, { right: '45%', duration: 1.6, ease: 'power1.inOut' }, 0.8)
      // Act 1 (Neural Mainframe) enters cleanly from bottom
      .set(actTerminal, { pointerEvents: 'auto' }, 1.3)
      .to(actTerminal, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.3,
        ease: 'power3.out'
      }, 1.2)
      .fromTo('.robot-face-chassis', {
        xPercent: -30,
        scale: 0.85,
        opacity: 0,
        filter: 'blur(8px)'
      }, {
        xPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out'
      }, 1.4)
      .fromTo('.terminal-dossier-column', {
        xPercent: 30,
        scale: 0.85,
        opacity: 0,
        filter: 'blur(8px)'
      }, {
        xPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out'
      }, 1.4)
      .call(() => this.triggerTypewriter(), [], 2.4);

    // =========================================================================
    // 🚪 CHAPTER 1 -> 2: MAINFRAME OUT -> DATA CORE (SKILLS)
    // =========================================================================
    masterTl
      // Act 1 Robot Face & Dossier split apart
      .to('.robot-face-chassis', {
        xPercent: -40,
        scale: 0.8,
        opacity: 0,
        duration: 1.1,
        ease: 'power2.in'
      }, 3.6)
      .to('.terminal-dossier-column', {
        xPercent: 40,
        scale: 0.8,
        opacity: 0,
        duration: 1.1,
        ease: 'power2.in'
      }, 3.6)
      .to(actTerminal, {
        opacity: 0,
        duration: 1.1,
        ease: 'power2.in'
      }, 3.6)
      .set(actTerminal, { pointerEvents: 'none' }, 4.6)
      // Robot moves to inventory position
      .to(this.sceneRobotWrapperEl, { right: '16%', duration: 1.5, ease: 'power1.inOut' }, 3.6)
      // Act 2 (Data Core) enters cleanly
      .set(actSkills, { pointerEvents: 'auto' }, 3.9)
      .to(actSkills, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.3,
        ease: 'power3.out'
      }, 3.8)
      // Initial appearance of horizontal runway track & jumping robot
      .fromTo('.skills-horizontal-track', {
        x: 100,
        opacity: 0
      }, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
      }, 3.9)
      .fromTo('#skills-jumping-robot', {
        y: -120,
        opacity: 0,
        scale: 0.5
      }, {
        y: 0,
        opacity: 1,
        scale: 1.0,
        duration: 0.6,
        ease: 'back.out(1.7)'
      }, 4.0)

      // =========================================================================
      // 🚀 ACT 2 KINETIC SCRUB: HORIZONTAL RUNWAY + SYNCHRONIZED JUMPING ROBOT
      // =========================================================================
      // 1. Horizontal track scrubs across the screen from right to left
      .to('.skills-horizontal-track', {
        x: () => {
          const track = document.getElementById('skills-grid');
          const viewport = document.getElementById('skills-runway-viewport');
          if (track && viewport) {
            return -(track.scrollWidth - viewport.clientWidth + 80);
          }
          return -1550;
        },
        ease: 'none',
        duration: 2.2
      }, 4.1)

      // 2. Parabolic jumps of the companion robot hopping across the 8 cards
      // Hop 1: Card 0 -> Card 1
      .to('#skills-jumping-robot', { y: -70, scaleY: 1.2, scaleX: 0.85, duration: 0.15, ease: 'power2.out' }, 4.15)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power2.in' }, 4.30)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.05 }, 4.45)

      // Hop 2: Card 1 -> Card 2
      .to('#skills-jumping-robot', { y: -70, scaleY: 1.2, scaleX: 0.85, duration: 0.15, ease: 'power2.out' }, 4.46)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power2.in' }, 4.61)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.05 }, 4.76)

      // Hop 3: Card 2 -> Card 3
      .to('#skills-jumping-robot', { y: -70, scaleY: 1.2, scaleX: 0.85, duration: 0.15, ease: 'power2.out' }, 4.77)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power2.in' }, 4.92)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.05 }, 5.07)

      // Hop 4: Card 3 -> Card 4
      .to('#skills-jumping-robot', { y: -70, scaleY: 1.2, scaleX: 0.85, duration: 0.15, ease: 'power2.out' }, 5.08)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power2.in' }, 5.23)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.05 }, 5.38)

      // Hop 5: Card 4 -> Card 5
      .to('#skills-jumping-robot', { y: -70, scaleY: 1.2, scaleX: 0.85, duration: 0.15, ease: 'power2.out' }, 5.39)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power2.in' }, 5.54)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.05 }, 5.69)

      // Hop 6: Card 5 -> Card 6
      .to('#skills-jumping-robot', { y: -70, scaleY: 1.2, scaleX: 0.85, duration: 0.15, ease: 'power2.out' }, 5.70)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power2.in' }, 5.85)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.05 }, 6.00)

      // Hop 7: Card 6 -> Card 7
      .to('#skills-jumping-robot', { y: -70, scaleY: 1.2, scaleX: 0.85, duration: 0.15, ease: 'power2.out' }, 6.01)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power2.in' }, 6.16)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.05 }, 6.25);

    // =========================================================================
    // 🕹️ CHAPTER 2 -> 3: DATA CORE OUT -> ARCADE LEVEL SELECT (PROJECTS)
    // =========================================================================
    masterTl
      // Skill cards fade out cleanly
      .to('.skill-card', {
        scale: 0.8,
        y: -40,
        opacity: 0,
        stagger: 0.02,
        filter: 'blur(8px)',
        duration: 0.8,
        ease: 'power2.in'
      }, 6.2)
      .to(actSkills, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.in'
      }, 6.3)
      .set(actSkills, { pointerEvents: 'none' }, 7.3)
      // Robot moves to arcade alley
      .to(this.sceneRobotWrapperEl, { right: '55%', duration: 1.5, ease: 'power1.inOut' }, 6.4)
      // Act 3 (Arcade Runway) enters level and crisp
      .set(actProjects, { pointerEvents: 'auto' }, 6.7)
      .to(actProjects, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.3,
        ease: 'power3.out'
      }, 6.6)
      .fromTo('#arcade-runway', {
        scale: 0.9,
        y: 60,
        opacity: 0
      }, {
        scale: 1.0,
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out'
      }, 6.7)
      // 4 Cabinets rise in smoothly
      .fromTo('.arcade-cabinet', {
        y: 60,
        scale: 0.9,
        opacity: 0
      }, {
        y: 0,
        scale: 1.0,
        opacity: 1,
        stagger: 0.07,
        duration: 1.0,
        ease: 'power3.out'
      }, 6.9);

    // =========================================================================
    // 📡 CHAPTER 3 -> 4: ARCADE OUT -> SECURE UPLINK TERMINAL (CONTACT)
    // =========================================================================
    masterTl
      // Cabinets slide up and out
      .to('.arcade-cabinet', {
        yPercent: -60,
        scale: 0.85,
        opacity: 0,
        stagger: 0.03,
        filter: 'blur(8px)',
        duration: 0.8,
        ease: 'power2.in'
      }, 9.2)
      .to(actProjects, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.in'
      }, 9.3)
      .set(actProjects, { pointerEvents: 'none' }, 10.3)
      // Radar transmission pulses
      .set(radarWaves, { opacity: 1 }, 9.8)
      .fromTo('.radar-circle', { scale: 0.1, opacity: 1 }, { scale: 2.4, opacity: 0, stagger: 0.15, duration: 1.4, ease: 'power2.out' }, 9.9)
      // Robot stands beneath orbital uplink
      .to(this.sceneRobotWrapperEl, { right: '40%', duration: 1.5, ease: 'power1.inOut' }, 9.4)
      // Act 4 (Direct Neural Uplink) drops in straight and crisp
      .set(actContact, { pointerEvents: 'auto' }, 9.6)
      .to(actContact, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.3,
        ease: 'power3.out'
      }, 9.6)
      .fromTo('.quick-link-card', {
        y: 45,
        scale: 0.92,
        opacity: 0
      }, {
        y: 0,
        scale: 1.0,
        opacity: 1,
        stagger: 0.08,
        duration: 1.0,
        ease: 'power3.out'
      }, 9.8)
      .call(() => this.triggerMatrixDecryption(), [], 10.4);

    ScrollTrigger.refresh();
  }

  private setup3DMouseParallax() {
    const farSkyline = document.querySelector('.far-skyline-layer') as HTMLElement;
    const midSkyline = document.querySelector('.mid-skyline-layer') as HTMLElement;
    if (!farSkyline && !midSkyline) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = normX * 18;
      targetY = normY * 10;
    });

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (midSkyline) {
        midSkyline.style.transform = `translate(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px)`;
      }
      if (farSkyline) {
        farSkyline.style.transform = `translate(${(currentX * 0.5).toFixed(1)}px, ${(currentY * 0.5).toFixed(1)}px)`;
      }
      requestAnimationFrame(updateParallax);
    };
    updateParallax();
  }

  private updateHudProgress(progress: number) {
    if (this.hudRobotEl && this.hudTrackEl) {
      const currentTrackWidth = this.hudTrackEl.offsetWidth - 28;
      const targetLeft = 14 + progress * currentTrackWidth;
      this.hudRobotEl.style.left = `${targetLeft}px`;
    }

    // Determine active checkpoint (0 to 4)
    const activeIndex = Math.min(
      this.checkpoints.length - 1,
      Math.floor(progress * this.checkpoints.length + 0.15)
    );

    this.checkpoints.forEach((cp, idx) => {
      if (idx === activeIndex) {
        cp.classList.add('active');
      } else {
        cp.classList.remove('active');
      }
    });
  }

  private updateEnvironmentAndStory(progress: number) {
    let sectorIdx = 0;
    let envLabel = 'SECTOR: 00 // CITY_SUB';
    let envClass = 'env-act-0';
    let tintColor = 'rgba(79, 227, 255, 0.04)';

    if (progress < 0.20) {
      sectorIdx = 0;
      envLabel = 'SECTOR: 00 // CITY_SUB';
      envClass = 'env-act-0';
      tintColor = 'rgba(79, 227, 255, 0.04)';
    } else if (progress < 0.45) {
      sectorIdx = 1;
      envLabel = 'SECTOR: 01 // ARCHIVE_VAULT';
      envClass = 'env-act-1';
      tintColor = 'rgba(57, 255, 136, 0.08)';
    } else if (progress < 0.70) {
      sectorIdx = 2;
      envLabel = 'SECTOR: 02 // DATA_CORE';
      envClass = 'env-act-2';
      tintColor = 'rgba(79, 227, 255, 0.1)';
    } else if (progress < 0.90) {
      sectorIdx = 3;
      envLabel = 'SECTOR: 03 // ARCADE_ROW';
      envClass = 'env-act-3';
      tintColor = 'rgba(255, 46, 136, 0.09)';
    } else {
      sectorIdx = 4;
      envLabel = 'SECTOR: 04 // ORBITAL_UPLINK';
      envClass = 'env-act-4';
      tintColor = 'rgba(255, 178, 56, 0.08)';
    }

    if (this.currentSectorIndex !== sectorIdx) {
      this.currentSectorIndex = sectorIdx;
      document.body.className = envClass;

      if (this.hudEnvLabelEl) this.hudEnvLabelEl.textContent = envLabel;
      if (this.envSkyTintEl) this.envSkyTintEl.style.backgroundColor = tintColor;
    }
  }

  private setupCheckpointNavigation() {
    this.checkpoints.forEach((cp) => {
      cp.addEventListener('click', (e) => {
        e.preventDefault();
        sounds.playHoverBlip();
        const targetProgress = parseFloat(cp.getAttribute('data-progress') || '0');
        const scrollTrack = document.getElementById('scroll-track');
        if (scrollTrack) {
          const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
          this.lenis.scrollTo(targetProgress * maxScroll, { duration: 1.4 });
        }
      });
    });
  }

  private setupScrollVelocityWalkAndMeteors() {
    let scrollTimeout: number | null = null;
    let lastScrollY = window.scrollY;

    this.lenis.on('scroll', (e: { scroll: number; velocity: number }) => {
      const currentScroll = e.scroll;
      const direction = currentScroll >= lastScrollY ? 'right' : 'left';
      lastScrollY = currentScroll;

      // Feed scroll velocity into Meteor Engine for hyperdrive shooting stars!
      this.meteorEngine.setScrollVelocity(e.velocity);

      this.hudRobotController.startWalking(direction);
      this.sceneRobotController.startWalking(direction);

      if (scrollTimeout !== null) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = window.setTimeout(() => {
        this.hudRobotController.stopWalking();
        this.sceneRobotController.stopWalking();
      }, 150);
    });
  }

  private triggerTypewriter() {
    const dialogueEl = document.querySelector('.terminal-text-body') as HTMLElement;
    if (!dialogueEl || this.isTypingDialogue) return;

    this.isTypingDialogue = true;
    sounds.playCrtPower();

    const fullText = dialogueEl.getAttribute('data-full-text') || dialogueEl.textContent || '';
    dialogueEl.textContent = '';

    let charIndex = 0;
    const interval = window.setInterval(() => {
      if (charIndex < fullText.length) {
        dialogueEl.textContent = fullText.slice(0, charIndex + 1);
        if (charIndex % 3 === 0) {
          sounds.playKeyType();
        }
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 16);
  }

  private triggerMatrixDecryption() {
    if (this.isDecryptedBeacon) return;
    this.isDecryptedBeacon = true;
    sounds.playCrtPower();

    const cursorLabel = document.getElementById('beacon-cursor-label');
    if (!cursorLabel) return;

    const targetText = 'awaiting input';
    const binaryChars = '01#@$%&*<>~/[]{}';
    let iteration = 0;

    const decryptInterval = window.setInterval(() => {
      cursorLabel.innerText = targetText
        .split('')
        .map((_, index) => {
          if (index < iteration) {
            return targetText[index];
          }
          return binaryChars[Math.floor(Math.random() * binaryChars.length)];
        })
        .join('');

      if (iteration >= targetText.length) {
        clearInterval(decryptInterval);
      }
      iteration += 1 / 3;
    }, 30);
  }
}
