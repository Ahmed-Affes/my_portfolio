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
  private hudRobotController: RobotSpriteController | null;
  private hudEnvLabelEl: HTMLElement | null;
  private envSkyTintEl: HTMLElement | null;
  private currentSectorIndex: number = -1;
  private isTypingDialogue: boolean = false;
  private isDecryptedBeacon: boolean = false;

  constructor(
    hudRobotController: RobotSpriteController,
    meteorEngine: WarStarMeteorEngine
  ) {
    this.hudRobotController = hudRobotController;
    this.meteorEngine = meteorEngine;
    this.hudRobotEl = document.querySelector('.hud-robot-indicator') as HTMLElement;
    this.hudTrackEl = document.querySelector('.hud-track') as HTMLElement;
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
    // Scroll-velocity-driven text skew (B2)
    const skewTargets = document.querySelectorAll('.zone-title');
    skewTargets.forEach((el) => el.classList.add('velocity-skew'));
    let currentSkew = 0;

    this.lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();

      // Apply velocity-based skew to zone titles
      const velocity = e.velocity || 0;
      const targetSkew = Math.max(-3, Math.min(3, velocity * 0.003));
      currentSkew += (targetSkew - currentSkew) * 0.15;
      skewTargets.forEach((el) => {
        (el as HTMLElement).style.transform = `skewX(${currentSkew}deg)`;
      });
    });

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
      zIndex: 20
    });

    // Acts 1, 2, 3, 4 start primed below the viewport ready to sweep up
    gsap.set(actTerminal, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 1
    });

    gsap.set(actSkills, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 1
    });

    gsap.set(actProjects, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 1
    });

    gsap.set(actContact, {
      yPercent: 110,
      scale: 0.92,
      opacity: 0,
      filter: 'blur(6px)',
      pointerEvents: 'none',
      zIndex: 1
    });

    gsap.set('#orbital-satellite-rig', {
      x: 480,
      y: -340,
      scale: 0.15,
      rotateZ: -45,
      rotateY: 60,
      opacity: 0
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
        duration: 0.8,
        ease: 'power2.in'
      }, 0.8)
      .to(actBoot, {
        opacity: 0,
        duration: 1.0,
        ease: 'power2.inOut'
      }, 0.8)
      .set(actBoot, { pointerEvents: 'none' }, 1.8)

      // Warp speed lines flash
      .fromTo(warpStreaks, { opacity: 0, scaleX: 0.5 }, { opacity: 0.8, scaleX: 1.4, duration: 0.6, yoyo: true, repeat: 1 }, 1.0)

      // Act 1 (Neural Mainframe) enters: 3D Holographic Unfold
      .set(actBoot, { pointerEvents: 'none', zIndex: 1 }, 1.2)
      .set(actTerminal, { pointerEvents: 'auto', zIndex: 20 }, 1.2)
      .to(actTerminal, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'power3.out'
      }, 1.2)
      // Biometric Avatar Pod sweeps in from left with dramatic 3D isometric rotation
      .fromTo('.biometric-avatar-pod', {
        x: -140,
        rotateY: -35,
        scale: 0.85,
        opacity: 0,
        filter: 'blur(8px)'
      }, {
        x: 0,
        rotateY: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'back.out(1.5)'
      }, 1.3)
      // Holographic Dossier Terminal expands vertically from top emitter laser
      .fromTo('.holographic-dossier-pod', {
        scaleY: 0.2,
        y: -40,
        opacity: 0,
        transformOrigin: 'top center',
        filter: 'blur(8px)'
      }, {
        scaleY: 1.0,
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power3.out'
      }, 1.4)
      // Full-Stage Biometric Laser Scanline sweeps down
      .fromTo('#mainframe-laser-scanline', {
        top: '0%',
        opacity: 1
      }, {
        top: '100%',
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 1.5)
      .to('#mainframe-laser-scanline', {
        opacity: 0,
        duration: 0.2
      }, 2.3)
      .call(() => this.triggerTypewriter(), [], 2.2);

    // =========================================================================
    // 🚪 CHAPTER 1 -> 2: MAINFRAME OUT -> KINETIC MAG-LEV DATA RUNWAY (SKILLS)
    // Motion: Mag-lev rail extrusion & magnetic skill cartridge docking
    // =========================================================================
    masterTl
      // Act 1 terminal dissolves and sweeps left into data buffers
      .to('.biometric-avatar-pod', {
        x: -120,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.6,
        ease: 'power2.in'
      }, 2.8)
      .to('.holographic-dossier-pod', {
        x: 120,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.6,
        ease: 'power2.in'
      }, 2.8)
      .to(actTerminal, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in'
      }, 2.8)
      .set(actTerminal, { pointerEvents: 'none', zIndex: 1 }, 3.1)

      // Act 2 (Data Core Runway) enters with Mag-Lev Extrusion
      .set(actSkills, { pointerEvents: 'auto', zIndex: 20 }, 3.1)
      .to(actSkills, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power3.out'
      }, 3.4)
      .set('.skills-horizontal-track', { x: 0 }, 3.4)
      .fromTo('.skills-horizontal-track', {
        scaleX: 0.85,
        opacity: 0
      }, {
        scaleX: 1.0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
      }, 3.4)
      // 8 Skill cartridges fly in from right with magnetic stagger
      .fromTo('.skill-card', {
        x: 160,
        scale: 0.88,
        opacity: 0
      }, {
        x: 0,
        scale: 1.0,
        opacity: 1,
        stagger: 0.04,
        duration: 0.6,
        ease: 'back.out(1.6)'
      }, 3.4)
      // Companion Robot drops in from the ceiling directly onto Card 0 (160px)
      .set('#skills-jumping-robot', { x: 160, y: 0, scale: 1.0, opacity: 1 }, 3.4)
      .fromTo('#skills-jumping-robot', {
        y: -120,
        opacity: 0,
        scale: 0.3
      }, {
        y: 0,
        opacity: 1,
        scale: 1.0,
        duration: 0.6,
        ease: 'bounce.out'
      }, 3.5)

      // =========================================================================
      // 🚀 ACT 2 KINETIC SCRUB: HORIZONTAL RUNWAY + SYNCHRONIZED JUMPING ROBOT
      // (Scroll window 4.2 to 6.8 gives clear pause at start + full scrub of all 8 cards)
      // =========================================================================
      // 1. Horizontal track scrubs smoothly across the screen from right to left
      .to('.skills-horizontal-track', {
        x: () => {
          const track = document.getElementById('skills-grid');
          const viewport = document.getElementById('skills-runway-viewport');
          if (track && viewport) {
            return -(track.scrollWidth - viewport.clientWidth + 180);
          }
          return -2050;
        },
        ease: 'none',
        duration: 2.6,
        onUpdate: function() {
          // A5: Drive the runway progress bar from scrub progress
          const pulseEl = document.querySelector('.bus-data-pulse') as HTMLElement;
          if (pulseEl) {
            const progress = this.progress();
            pulseEl.style.width = `${progress * 100}%`;
          }
        }
      }, 4.2)

      // 2. Parabolic hops of the companion robot hopping across all 8 cards (cardStep = 348px)
      // Hop 1: Card 0 (JS/TS - 160px) -> Card 1 (React - 508px)
      .to('#skills-jumping-robot', { x: 508, duration: 0.32, ease: 'power1.inOut' }, 4.26)
      .to('#skills-jumping-robot', { y: -80, scaleY: 1.25, scaleX: 0.85, duration: 0.16, ease: 'power2.out' }, 4.26)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.85, scaleX: 1.15, duration: 0.16, ease: 'power2.in' }, 4.42)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.04 }, 4.58)

      // Hop 2: Card 1 (React - 508px) -> Card 2 (Node.js - 856px)
      .to('#skills-jumping-robot', { x: 856, duration: 0.32, ease: 'power1.inOut' }, 4.62)
      .to('#skills-jumping-robot', { y: -80, scaleY: 1.25, scaleX: 0.85, duration: 0.16, ease: 'power2.out' }, 4.62)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.85, scaleX: 1.15, duration: 0.16, ease: 'power2.in' }, 4.78)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.04 }, 4.94)

      // Hop 3: Card 2 (Node.js - 856px) -> Card 3 (Flutter - 1204px)
      .to('#skills-jumping-robot', { x: 1204, duration: 0.32, ease: 'power1.inOut' }, 4.98)
      .to('#skills-jumping-robot', { y: -80, scaleY: 1.25, scaleX: 0.85, duration: 0.16, ease: 'power2.out' }, 4.98)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.85, scaleX: 1.15, duration: 0.16, ease: 'power2.in' }, 5.14)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.04 }, 5.30)

      // Hop 4: Card 3 (Flutter - 1204px) -> Card 4 (PostgreSQL - 1552px)
      .to('#skills-jumping-robot', { x: 1552, duration: 0.32, ease: 'power1.inOut' }, 5.34)
      .to('#skills-jumping-robot', { y: -80, scaleY: 1.25, scaleX: 0.85, duration: 0.16, ease: 'power2.out' }, 5.34)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.85, scaleX: 1.15, duration: 0.16, ease: 'power2.in' }, 5.50)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.04 }, 5.66)

      // Hop 5: Card 4 (PostgreSQL - 1552px) -> Card 5 (Electron - 1900px)
      .to('#skills-jumping-robot', { x: 1900, duration: 0.32, ease: 'power1.inOut' }, 5.70)
      .to('#skills-jumping-robot', { y: -80, scaleY: 1.25, scaleX: 0.85, duration: 0.16, ease: 'power2.out' }, 5.70)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.85, scaleX: 1.15, duration: 0.16, ease: 'power2.in' }, 5.86)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.04 }, 6.02)

      // Hop 6: Card 5 (Electron - 1900px) -> Card 6 (Docker - 2248px)
      .to('#skills-jumping-robot', { x: 2248, duration: 0.32, ease: 'power1.inOut' }, 6.06)
      .to('#skills-jumping-robot', { y: -80, scaleY: 1.25, scaleX: 0.85, duration: 0.16, ease: 'power2.out' }, 6.06)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.85, scaleX: 1.15, duration: 0.16, ease: 'power2.in' }, 6.22)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.04 }, 6.38)

      // Hop 7: Card 6 (Docker - 2248px) -> Card 7 (Figma - 2596px - Final Card!)
      .to('#skills-jumping-robot', { x: 2596, duration: 0.32, ease: 'power1.inOut' }, 6.42)
      .to('#skills-jumping-robot', { y: -80, scaleY: 1.25, scaleX: 0.85, duration: 0.16, ease: 'power2.out' }, 6.42)
      .to('#skills-jumping-robot', { y: 0, scaleY: 0.85, scaleX: 1.15, duration: 0.16, ease: 'power2.in' }, 6.58)
      .to('#skills-jumping-robot', { scaleY: 1.0, scaleX: 1.0, duration: 0.04 }, 6.74)
      .to('#skills-jumping-robot', { y: -12, duration: 0.08, yoyo: true, repeat: 2 }, 6.75);

    // Helper to calculate exact horizontal center of each cabinet relative to #arcade-runway
    const getCabinetCenter = (index: number): number => {
      const runway = document.getElementById('arcade-runway');
      const cabinets = document.querySelectorAll<HTMLElement>('.arcade-cabinet');
      if (!runway || cabinets.length === 0) return 0;
      if (!cabinets[index]) {
        return (runway.clientWidth / 4) * (index + 0.5);
      }
      const runwayRect = runway.getBoundingClientRect();
      const cardRect = cabinets[index].getBoundingClientRect();
      return (cardRect.left - runwayRect.left) + cardRect.width / 2;
    };

    // =========================================================================
    // 🕹️ CHAPTER 2 -> 3: DATA CORE OUT -> 🛸 CYBER UFO TRACTOR BEAM DROP (PROJECTS)
    // Motion: Orbital Dropship flight across 4 stations, beaming down each cabinet
    // =========================================================================
    masterTl
      // Act 2 slides into digital floor
      .to(actSkills, {
        opacity: 0,
        yPercent: 35,
        filter: 'blur(8px)',
        duration: 0.6,
        ease: 'power2.in'
      }, 6.9)
      .set(actSkills, { pointerEvents: 'none', zIndex: 1 }, 7.1)

      // Act 3 (Arcade Runway) enters and settles
      .set(actProjects, { pointerEvents: 'auto', zIndex: 20 }, 7.1)
      .to(actProjects, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out'
      }, 7.1)

      // Prime all 4 cabinets hidden above ready for tractor beam deployment
      .set('#arcade-row .arcade-cabinet', {
        y: -140,
        opacity: 0,
        scale: 0.75,
        rotateX: 30
      }, 7.1)

      // 🛸 1. Cyber UFO Swoops in from upper left directly over Station 1 (Card 0)
      .fromTo('#projects-ufo-beamer', 
        { y: -160, opacity: 0, scale: 0.5, x: () => getCabinetCenter(0) - 80 },
        { y: 0, opacity: 1, scale: 1.0, x: () => getCabinetCenter(0), duration: 0.55, ease: 'power2.out' },
        7.5
      )

      // Station 1: Tractor Beam fires -> Cabinet 1 drops from sky
      .call(() => sounds.playUfoBeam(), [], 8.1)
      .fromTo('#ufo-tractor-beam',
        { opacity: 0, scaleY: 0 },
        { opacity: 1, scaleY: 1, duration: 0.25, ease: 'power2.out' },
        8.1
      )
      .to('#arcade-row .arcade-cabinet:nth-child(1)', { 
        y: 0, 
        opacity: 1, 
        scale: 1.0, 
        rotateX: 0, 
        duration: 0.5, 
        ease: 'back.out(1.8)',
        onStart: () => sounds.playCabinetLand()
      }, 8.15)
      .to('#ufo-tractor-beam', { opacity: 0, duration: 0.2 }, 8.65)

      // 🛸 2. UFO glides directly over Station 2 (Card 1)
      .to('#projects-ufo-beamer', { x: () => getCabinetCenter(1), duration: 0.45, ease: 'power1.inOut' }, 8.8)
      .call(() => sounds.playUfoBeam(), [], 8.95)
      .to('#ufo-tractor-beam', { opacity: 1, duration: 0.2 }, 8.95)
      .to('#arcade-row .arcade-cabinet:nth-child(2)', { 
        y: 0, 
        opacity: 1, 
        scale: 1.0, 
        rotateX: 0, 
        duration: 0.5, 
        ease: 'back.out(1.8)',
        onStart: () => sounds.playCabinetLand()
      }, 9.0)
      .to('#ufo-tractor-beam', { opacity: 0, duration: 0.2 }, 9.4)

      // 🛸 3. UFO glides directly over Station 3 (Card 2)
      .to('#projects-ufo-beamer', { x: () => getCabinetCenter(2), duration: 0.45, ease: 'power1.inOut' }, 9.5)
      .call(() => sounds.playUfoBeam(), [], 9.65)
      .to('#ufo-tractor-beam', { opacity: 1, duration: 0.2 }, 9.65)
      .to('#arcade-row .arcade-cabinet:nth-child(3)', { 
        y: 0, 
        opacity: 1, 
        scale: 1.0, 
        rotateX: 0, 
        duration: 0.5, 
        ease: 'back.out(1.8)',
        onStart: () => sounds.playCabinetLand()
      }, 9.7)
      .to('#ufo-tractor-beam', { opacity: 0, duration: 0.2 }, 10.1)

      // 🛸 4. UFO glides directly over Station 4 (Card 3)
      .to('#projects-ufo-beamer', { x: () => getCabinetCenter(3), duration: 0.45, ease: 'power1.inOut' }, 10.2)
      .call(() => sounds.playUfoBeam(), [], 10.35)
      .to('#ufo-tractor-beam', { opacity: 1, duration: 0.2 }, 10.35)
      .to('#arcade-row .arcade-cabinet:nth-child(4)', { 
        y: 0, 
        opacity: 1, 
        scale: 1.0, 
        rotateX: 0, 
        duration: 0.5, 
        ease: 'back.out(1.8)',
        onStart: () => sounds.playCabinetLand()
      }, 10.4)
      .to('#ufo-tractor-beam', { opacity: 0, duration: 0.2 }, 10.8)

      // 🛸 5. All Cabinets deployed -> UFO powers up warp drive and zooms away into upper right
      .to('#projects-ufo-beamer', {
        x: () => getCabinetCenter(3) + 320,
        y: -180,
        scale: 0.2,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.in'
      }, 10.9);

    // =========================================================================
    // 📡 CHAPTER 3 -> 4: ARCADE OUT -> DEEP SPACE QUANTUM COMMS STATION (CONTACT)
    // Motion: Central quantum aperture unlock & tactical radar 360° lock
    // =========================================================================
    masterTl
      // Cabinets dissolve into upward digital particles
      .to('.arcade-cabinet', {
        yPercent: -50,
        scale: 0.85,
        opacity: 0,
        stagger: 0.03,
        filter: 'blur(8px)',
        duration: 0.7,
        ease: 'power2.in'
      }, 11.5)
      .to(actProjects, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in'
      }, 11.6)
      .set(actProjects, { pointerEvents: 'none', zIndex: 1 }, 11.7)

      // Act 4 (Direct Neural Uplink) enters with Quantum Aperture Expansion
      .set(actContact, { pointerEvents: 'auto', zIndex: 20 }, 11.7)
      .to(actContact, {
        yPercent: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power3.out'
      }, 11.7)

      // 1. Orbital Satellite Rig flies in dynamically across the screen from upper right deep space
      .fromTo('#orbital-satellite-rig', {
        x: 480,
        y: -340,
        scale: 0.15,
        rotateZ: -45,
        rotateY: 60,
        opacity: 0
      }, {
        x: 0,
        y: 0,
        scale: 1.0,
        rotateZ: 0,
        rotateY: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out'
      }, 11.75)
      .fromTo('.sat-exhaust-flame', {
        scaleY: 4.5,
        scaleX: 2.5,
        opacity: 1
      }, {
        scaleY: 1,
        scaleX: 1,
        opacity: 0.85,
        duration: 0.8,
        ease: 'power2.out'
      }, 11.75)
      .fromTo('.satellite-solar-wing', {
        scaleX: 0,
        rotateY: 90,
        opacity: 0
      }, {
        scaleX: 1,
        rotateY: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.7,
        ease: 'back.out(1.4)'
      }, 12.1)
      .fromTo('#satellite-laser-aperture', {
        scale: 0,
        opacity: 0,
        boxShadow: '0 0 0px #ffffff'
      }, {
        scale: 1,
        opacity: 1,
        boxShadow: '0 0 24px #4fe3ff, 0 0 35px #ff2e88',
        duration: 0.5,
        ease: 'elastic.out(1.2, 0.4)'
      }, 12.2)

      // 2. Station Console expands from central quantum core
      .fromTo('.comms-station-deck', {
        scale: 0.8,
        y: 40,
        opacity: 0
      }, {
        scale: 1.0,
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out'
      }, 11.8)

      // 3. Tactical Radar Scope boots with 360° spin lock
      .fromTo('.radar-scope-frame', {
        scale: 0.1,
        rotate: -360,
        opacity: 0
      }, {
        scale: 1.0,
        rotate: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'back.out(1.8)'
      }, 11.9)

      // 4. 4 Ground Receiver Conduits slide in with Matrix Stagger
      .fromTo('.comms-conduit-card', {
        x: 60,
        opacity: 0,
        scale: 0.9
      }, {
        x: 0,
        opacity: 1,
        scale: 1.0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out'
      }, 12.0)

      // Radar transmission pulses
      .set(radarWaves, { opacity: 1 }, 12.3)
      .fromTo('.radar-circle', { scale: 0.1, opacity: 1 }, { scale: 2.4, opacity: 0, stagger: 0.15, duration: 1.4, ease: 'power2.out' }, 12.3)
      .call(() => this.triggerMatrixDecryption(), [], 12.6);

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

    if (progress < 0.18) {
      sectorIdx = 0;
      envLabel = 'SECTOR: 00 // CITY_SUB';
      envClass = 'env-act-0';
      tintColor = 'rgba(79, 227, 255, 0.04)';
    } else if (progress < 0.38) {
      sectorIdx = 1;
      envLabel = 'SECTOR: 01 // ARCHIVE_VAULT';
      envClass = 'env-act-1';
      tintColor = 'rgba(57, 255, 136, 0.08)';
    } else if (progress < 0.60) {
      sectorIdx = 2;
      envLabel = 'SECTOR: 02 // DATA_CORE';
      envClass = 'env-act-2';
      tintColor = 'rgba(79, 227, 255, 0.1)';
    } else if (progress < 0.88) {
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

      this.hudRobotController?.startWalking(direction);

      if (scrollTimeout !== null) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = window.setTimeout(() => {
        this.hudRobotController?.stopWalking();
      }, 150);
    });
  }

  private triggerTypewriter() {
    const dialogueEl = document.getElementById('terminal-bio-body') || document.querySelector('.terminal-text-body') as HTMLElement;
    if (!dialogueEl || this.isTypingDialogue) return;

    this.isTypingDialogue = true;
    sounds.playCrtPower();

    const fullText = dialogueEl.getAttribute('data-full-text') || dialogueEl.textContent || '';
    if (typeof (window as any).__typeBioText === 'function') {
      (window as any).__typeBioText(fullText);
    } else {
      dialogueEl.textContent = fullText;
    }
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
