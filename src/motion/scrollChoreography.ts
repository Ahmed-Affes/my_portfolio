import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './customEases';
import { RobotSpriteController } from '../sprites/robotSprite';
import { sounds } from '../audio/soundEngine';

export class ScrollChoreography {
  public lenis: Lenis;
  private hudRobotEl: HTMLElement;
  private hudTrackEl: HTMLElement;
  private checkpoints: HTMLElement[];
  private hudRobotController: RobotSpriteController;
  private sceneRobotController: RobotSpriteController;
  private sceneRobotWrapperEl: HTMLElement;
  private isTypingDialogue: boolean = false;
  private isDecryptedBeacon: boolean = false;

  constructor(
    hudRobotController: RobotSpriteController,
    sceneRobotController: RobotSpriteController
  ) {
    this.hudRobotController = hudRobotController;
    this.sceneRobotController = sceneRobotController;
    this.hudRobotEl = document.querySelector('.hud-robot-indicator') as HTMLElement;
    this.hudTrackEl = document.querySelector('.hud-track') as HTMLElement;
    this.sceneRobotWrapperEl = document.querySelector('#scene-robot-container') as HTMLElement;
    this.checkpoints = Array.from(document.querySelectorAll('.hud-track-checkpoint'));

    // Initialize Lenis with enhanced smoothness
    this.lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    (window as any).__lenis = this.lenis;

    this.setupLenisWithGsap();
    this.setupMasterPinnedTimeline();
    this.setupCheckpointNavigation();
    this.setupScrollVelocityWalk();
    this.setup3DMouseParallax();
  }

  private setupLenisWithGsap() {
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  public setupMasterPinnedTimeline() {
    const actBoot = document.querySelector('#act-boot');
    const actTerminal = document.querySelector('#act-terminal');
    const actSkills = document.querySelector('#act-skills');
    const actProjects = document.querySelector('#act-projects');
    const actContact = document.querySelector('#act-contact');

    const heroTextBlock = document.querySelector('#hero-text-block');
    const heroRpgBlock = document.querySelector('#hero-rpg-block');
    const warpStreaks = document.querySelector('#warp-streaks');
    const radarWaves = document.querySelector('#radar-waves');
    const blastDoorLeft = document.querySelector('#blast-door-left');
    const blastDoorRight = document.querySelector('#blast-door-right');
    const terminalConsole = document.querySelector('#terminal-console-wrapper');
    const skillsGrid = document.querySelector('#skills-grid');
    const arcadeRunway = document.querySelector('#arcade-runway');

    const farSkyline = document.querySelector('.far-skyline-layer');
    const midSkyline = document.querySelector('.mid-skyline-layer');
    const gridFloor = document.querySelector('.perspective-grid-floor');

    // Initial Act visibility states
    gsap.set(actBoot, { opacity: 1, pointerEvents: 'auto', zIndex: 10 });
    gsap.set(actTerminal, { opacity: 0, pointerEvents: 'none', zIndex: 9 });
    gsap.set(actSkills, { opacity: 0, pointerEvents: 'none', zIndex: 8 });
    gsap.set(actProjects, { opacity: 0, pointerEvents: 'none', zIndex: 7 });
    gsap.set(actContact, { opacity: 0, pointerEvents: 'none', zIndex: 6 });

    gsap.set(terminalConsole, { rotateX: 55, yPercent: 35, opacity: 0, transformOrigin: 'bottom center' });
    gsap.set(warpStreaks, { opacity: 0 });
    gsap.set(radarWaves, { opacity: 0 });

    // Master Timeline with 10 units total duration
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-track',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
        onUpdate: (self) => {
          this.updateHudProgress(self.progress);
        }
      }
    });

    // Continuous world parallax & speed
    masterTl
      .to(farSkyline, { xPercent: -20, duration: 10, ease: 'none' }, 0)
      .to(midSkyline, { xPercent: -40, duration: 10, ease: 'none' }, 0)
      .to(gridFloor, { backgroundPosition: '0 2400px', duration: 10, ease: 'none' }, 0);

    // =========================================================================
    // 🌌 ARCHETYPE 1: 3D WARP SPEED ZOOM & CONSOLE UNFOLD (Act 0 -> Act 1)
    // =========================================================================
    // Hero texts scale through the camera lens with warp streaks
    masterTl
      .to(heroTextBlock, {
        scale: 2.2,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.9,
        ease: 'power2.in'
      }, 0.8)
      .to(heroRpgBlock, {
        x: 180,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.in'
      }, 0.8)
      .set(actBoot, { pointerEvents: 'none' }, 1.2)
      // Warp speed lines flash
      .fromTo(warpStreaks, { opacity: 0, scaleX: 0.5 }, { opacity: 0.8, scaleX: 1.4, duration: 0.5, yoyo: true, repeat: 1 }, 1.0)
      // Robot walks toward center
      .to(this.sceneRobotWrapperEl, { right: '45%', duration: 1.6, ease: 'power1.inOut' }, 0.8)
      // Act 1 Terminal unfolds in 3D perspective
      .set(actTerminal, { opacity: 1, pointerEvents: 'auto' }, 1.4)
      .to(terminalConsole, {
        rotateX: 0,
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'power3.out'
      }, 1.5)
      .call(() => this.triggerTypewriter(), [], 2.2);

    // =========================================================================
    // 🚪 ARCHETYPE 2: MECHANICAL BLAST DOOR WIPE & 3D ORBITAL MATRIX (Act 1 -> Act 2)
    // =========================================================================
    // Blast doors slam shut and open
    masterTl
      .fromTo([blastDoorLeft, blastDoorRight], { opacity: 0 }, { opacity: 1, duration: 0.1 }, 3.3)
      .fromTo(blastDoorLeft, { xPercent: -100 }, { xPercent: 0, duration: 0.5, ease: 'power2.inOut' }, 3.3)
      .fromTo(blastDoorRight, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'power2.inOut' }, 3.3)
      // Hide Act 1 & reveal Act 2 behind doors
      .set(actTerminal, { opacity: 0, pointerEvents: 'none' }, 3.8)
      .set(actSkills, { opacity: 1, pointerEvents: 'auto' }, 3.8)
      .to(blastDoorLeft, { xPercent: -100, duration: 0.55, ease: 'power3.out' }, 3.85)
      .to(blastDoorRight, { xPercent: 100, duration: 0.55, ease: 'power3.out' }, 3.85)
      .to([blastDoorLeft, blastDoorRight], { opacity: 0, duration: 0.2 }, 4.3)
      // 8 Skill cards fly in via 3D Cylindrical Orbital Spread
      .fromTo('.skill-card', {
        rotateY: (idx) => (idx % 2 === 0 ? -45 : 45),
        z: -350,
        y: 40,
        opacity: 0.2
      }, {
        rotateY: 0,
        z: 0,
        y: 0,
        opacity: 1,
        stagger: 0.04,
        duration: 0.9,
        ease: 'power3.out'
      }, 3.9)
      // Robot moves to inventory position
      .to(this.sceneRobotWrapperEl, { right: '16%', duration: 1.5, ease: 'power1.inOut' }, 3.6);

    // =========================================================================
    // 🕹️ ARCHETYPE 3: DATA CORE IMPLOSION & ISOMETRIC RUNWAY DOCK (Act 2 -> Act 3)
    // =========================================================================
    // Skills collapse inward into a data core point
    masterTl
      .to(skillsGrid, {
        scale: 0.35,
        opacity: 0,
        rotateZ: 25,
        duration: 0.8,
        ease: 'power3.in'
      }, 5.8)
      .set(actSkills, { opacity: 0, pointerEvents: 'none' }, 6.5)
      // Act 3 Arcade Runway unmasks and 4 cabinets fly in along isometric runway
      .set(actProjects, { opacity: 1, pointerEvents: 'auto' }, 6.2)
      .fromTo('.arcade-cabinet', {
        rotateX: 25,
        rotateY: -20,
        z: -450,
        y: 80,
        opacity: 0.2
      }, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        y: 0,
        opacity: 1,
        stagger: 0.06,
        duration: 1.0,
        ease: 'back.out(1.3)'
      }, 6.3)
      // Robot moves to arcade alley
      .to(this.sceneRobotWrapperEl, { right: '55%', duration: 1.5, ease: 'power1.inOut' }, 5.8);

    // =========================================================================
    // 📡 ARCHETYPE 4: RADAR SHOCKWAVES & MATRIX WIREFRAME DECRYPTION (Act 3 -> Act 4)
    // =========================================================================
    // Cabinets power down and sink
    masterTl
      .to(arcadeRunway, {
        y: 100,
        opacity: 0,
        scale: 0.88,
        duration: 0.8,
        ease: 'power2.in'
      }, 8.2)
      .set(actProjects, { opacity: 0, pointerEvents: 'none' }, 8.9)
      // Radar transmission shockwaves expand from center beacon
      .set(radarWaves, { opacity: 1 }, 8.4)
      .fromTo('.radar-circle', { scale: 0.1, opacity: 1 }, { scale: 2.4, opacity: 0, stagger: 0.15, duration: 1.4, ease: 'power2.out' }, 8.5)
      // Act 4 Contact ascends
      .set(actContact, { opacity: 1, pointerEvents: 'auto' }, 8.6)
      .fromTo('#beacon-kiosk', {
        scale: 0.9,
        opacity: 0,
        y: 40
      }, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out'
      }, 8.7)
      .call(() => this.triggerMatrixDecryption(), [], 9.1)
      // Robot stands beneath the beacon
      .to(this.sceneRobotWrapperEl, { right: '40%', duration: 1.5, ease: 'power1.inOut' }, 8.2);

    ScrollTrigger.refresh();
  }

  private setup3DMouseParallax() {
    const parallaxRig = document.querySelector('#camera-parallax-rig') as HTMLElement;
    if (!parallaxRig) return;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      targetRotateY = normX * 3.5; // Max 3.5 deg Y rotation
      targetRotateX = -normY * 2.5; // Max 2.5 deg X rotation
    });

    const updateParallax = () => {
      currentRotateX += (targetRotateX - currentRotateX) * 0.08;
      currentRotateY += (targetRotateY - currentRotateY) * 0.08;

      parallaxRig.style.transform = `perspective(1200px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
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

  private setupScrollVelocityWalk() {
    let scrollTimeout: number | null = null;
    let lastScrollY = window.scrollY;

    this.lenis.on('scroll', (e: { scroll: number }) => {
      const currentScroll = e.scroll;
      const direction = currentScroll >= lastScrollY ? 'right' : 'left';
      lastScrollY = currentScroll;

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
