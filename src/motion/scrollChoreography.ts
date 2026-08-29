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
    const skillsGrid = document.querySelector('#skills-grid');
    const arcadeRunway = document.querySelector('#arcade-runway');

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
      scale: 0.85,
      rotateX: 20,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 9
    });

    gsap.set(actSkills, {
      yPercent: 110,
      scale: 0.85,
      rotateX: 20,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 8
    });

    gsap.set(actProjects, {
      yPercent: 110,
      scale: 0.85,
      rotateX: 20,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 7
    });

    gsap.set(actContact, {
      yPercent: 110,
      scale: 0.85,
      rotateX: 20,
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
    // 🌌 CHAPTER 0 -> 1: ACT 0 RECEDES UP, ACT 1 SWEEPS UP FROM BOTTOM
    // =========================================================================
    masterTl
      // Act 0 recedes upward into distance with 3D tilt & blur
      .to(actBoot, {
        yPercent: -75,
        scale: 0.82,
        rotateX: -14,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.2,
        ease: 'power2.inOut'
      }, 0.8)
      .set(actBoot, { pointerEvents: 'none' }, 1.8)
      // Warp speed lines flash
      .fromTo(warpStreaks, { opacity: 0, scaleX: 0.5 }, { opacity: 0.8, scaleX: 1.4, duration: 0.6, yoyo: true, repeat: 1 }, 1.0)
      // Robot moves toward center console
      .to(this.sceneRobotWrapperEl, { right: '45%', duration: 1.6, ease: 'power1.inOut' }, 0.8)
      // Act 1 (Terminal Vault) sweeps majestically up from the bottom!
      .set(actTerminal, { pointerEvents: 'auto' }, 1.4)
      .to(actTerminal, {
        yPercent: 0,
        scale: 1.0,
        rotateX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power3.out'
      }, 1.2)
      .call(() => this.triggerTypewriter(), [], 2.4);

    // =========================================================================
    // 🚪 CHAPTER 1 -> 2: ACT 1 RECEDES UP, ACT 2 SWEEPS UP FROM BOTTOM (3D ORBITAL)
    // =========================================================================
    masterTl
      // Act 1 recedes upward into matrix mist
      .to(actTerminal, {
        yPercent: -75,
        scale: 0.82,
        rotateX: -14,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.2,
        ease: 'power2.inOut'
      }, 3.6)
      .set(actTerminal, { pointerEvents: 'none' }, 4.6)
      // Robot moves to inventory position
      .to(this.sceneRobotWrapperEl, { right: '16%', duration: 1.5, ease: 'power1.inOut' }, 3.6)
      // Act 2 (Data Core) sweeps up from the bottom!
      .set(actSkills, { pointerEvents: 'auto' }, 4.0)
      .to(actSkills, {
        yPercent: 0,
        scale: 1.0,
        rotateX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power3.out'
      }, 3.8)
      // 8 Skill cards fly in via 3D Cylindrical Orbital Spread
      .fromTo('.skill-card', {
        rotateY: (idx) => (idx % 2 === 0 ? -40 : 40),
        z: -320,
        y: 50,
        opacity: 0.2
      }, {
        rotateY: 0,
        z: 0,
        y: 0,
        opacity: 1,
        stagger: 0.04,
        duration: 1.0,
        ease: 'power3.out'
      }, 4.2);

    // =========================================================================
    // 🕹️ CHAPTER 2 -> 3: ACT 2 IMPLODES UP, ACT 3 SWEEPS UP (ARCADE ARENA)
    // =========================================================================
    masterTl
      // Skills collapse & Act 2 recedes upward
      .to(skillsGrid, {
        scale: 0.35,
        opacity: 0,
        rotateZ: 25,
        duration: 0.9,
        ease: 'power3.in'
      }, 6.2)
      .to(actSkills, {
        yPercent: -75,
        scale: 0.82,
        rotateX: -14,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.2,
        ease: 'power2.inOut'
      }, 6.4)
      .set(actSkills, { pointerEvents: 'none' }, 7.4)
      // Robot moves to arcade alley
      .to(this.sceneRobotWrapperEl, { right: '55%', duration: 1.5, ease: 'power1.inOut' }, 6.4)
      // Act 3 (Arcade Alley) sweeps up from the bottom!
      .set(actProjects, { pointerEvents: 'auto' }, 6.8)
      .to(actProjects, {
        yPercent: 0,
        scale: 1.0,
        rotateX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power3.out'
      }, 6.6)
      // 4 Cabinets dock along 3D isometric runway
      .fromTo('.arcade-cabinet', {
        rotateX: 25,
        rotateY: -20,
        z: -400,
        y: 80,
        opacity: 0.2
      }, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        y: 0,
        opacity: 1,
        stagger: 0.06,
        duration: 1.1,
        ease: 'back.out(1.3)'
      }, 7.0);

    // =========================================================================
    // 📡 CHAPTER 3 -> 4: ACT 3 SINKS, ACT 4 ASCENDS INTO ORBITAL SPACE
    // =========================================================================
    masterTl
      // Act 3 recedes upward / powers down
      .to(arcadeRunway, {
        y: 80,
        opacity: 0,
        scale: 0.88,
        duration: 0.9,
        ease: 'power2.in'
      }, 9.2)
      .to(actProjects, {
        yPercent: -75,
        scale: 0.82,
        rotateX: -14,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 1.2,
        ease: 'power2.inOut'
      }, 9.4)
      .set(actProjects, { pointerEvents: 'none' }, 10.4)
      // Radar transmission shockwaves pulse
      .set(radarWaves, { opacity: 1 }, 9.8)
      .fromTo('.radar-circle', { scale: 0.1, opacity: 1 }, { scale: 2.4, opacity: 0, stagger: 0.15, duration: 1.4, ease: 'power2.out' }, 9.9)
      // Robot stands beneath orbital beacon
      .to(this.sceneRobotWrapperEl, { right: '40%', duration: 1.5, ease: 'power1.inOut' }, 9.4)
      // Act 4 (Stratosphere Beacon) sweeps up into the starry ionosphere!
      .set(actContact, { pointerEvents: 'auto' }, 9.8)
      .to(actContact, {
        yPercent: 0,
        scale: 1.0,
        rotateX: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.4,
        ease: 'power3.out'
      }, 9.6)
      .call(() => this.triggerMatrixDecryption(), [], 10.6);

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
