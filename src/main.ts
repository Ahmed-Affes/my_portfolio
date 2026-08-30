import { RobotSpriteController } from './sprites/robotSprite';
import { sounds } from './audio/soundEngine';
import { PORTFOLIO_DATA } from './data/portfolioData';
import { InteractionSystem } from './motion/interactionSystem';
import { ScrollChoreography } from './motion/scrollChoreography';
import { gsap, EASE_UI } from './motion/customEases';

import { WarStarMeteorEngine } from './canvas/meteorEngine';
import { RobotFaceController } from './interactive/robotFace';
import { CyberCLITerminal } from './interactive/cliTerminal';
import { HeroQuantumReactor } from './interactive/heroReactor';
import { RadarTransmitterEngine } from './interactive/radarTransmitter';
import { HeroSubtitleMorpher } from './interactive/heroSubtitleMorpher';
import { CustomCursorController } from './interactive/cursor';
import { SatelliteUplinkController } from './interactive/satelliteUplink';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  // 0. Initialize War Star Shooting Meteor Engine, Hero Quantum Reactor, Robot Face, Radar, Subtitle Morpher, Satellite Relay & CLI Help Center
  const meteorEngine = new WarStarMeteorEngine();
  new HeroQuantumReactor('hero-reactor-canvas');
  new RadarTransmitterEngine('radar-canvas');
  new SatelliteUplinkController();
  const robotFace = new RobotFaceController('about-robot-face');
  const cliTerminal = new CyberCLITerminal('cli-terminal-window');
  const heroSubtitleMorpher = new HeroSubtitleMorpher('hero-typewriter-text');
  heroSubtitleMorpher.start();
  (window as any).__robotFace = robotFace;
  (window as any).__cliTerminal = cliTerminal;
  // 1. Render Skills Cards (Data Core) FIRST
  const skillPowerMap: Record<string, string> = {
    'js-ts': '██████████ 98%',
    'react': '█████████░ 95%',
    'node': '█████████░ 90%',
    'flutter': '████████░░ 88%',
    'postgres': '████████░░ 86%',
    'electron': '████████░░ 82%',
    'docker': '████████░░ 80%',
    'figma': '████████░░ 85%',
  };

  const skillsGrid = document.getElementById('skills-grid');
  if (skillsGrid) {
    const jumpingRobotHtml = `
      <div class="skills-jumping-robot" id="skills-jumping-robot" aria-hidden="true">
        <div class="hopper-pixel-body">
          <div class="hopper-antenna"><span class="antenna-bulb"></span></div>
          <div class="hopper-head"><div class="hopper-visor-glow"></div></div>
          <div class="hopper-torso"><div class="hopper-core"></div></div>
          <div class="hopper-thruster">
            <span class="thruster-spark left"></span>
            <span class="thruster-spark right"></span>
          </div>
        </div>
        <div class="hopper-shadow"></div>
      </div>
    `;

    skillsGrid.innerHTML = jumpingRobotHtml + PORTFOLIO_DATA.skills
      .map(
        (skill) => {
          const powerEntry = skillPowerMap[skill.id] || '████████░░ 85%';
          const barPart = powerEntry.replace(/\s*\d+%$/, '');
          const pctPart = powerEntry.match(/(\d+%)$/)?.[1] || '85%';
          const tierColor = skill.rarity === 'legendary' ? '#ffb238' : skill.rarity === 'rare' ? 'var(--cyan)' : 'var(--green)';
          return `
        <article class="skill-card ${skill.rarity}" data-skill-id="${skill.id}" tabindex="0" role="button" aria-label="${skill.name}">
          <div class="skill-card-tier">${skill.level}</div>
          <div class="skill-card-name">${skill.name}</div>
          <div class="skill-power-bar" style="color: ${tierColor};">
            <span class="power-bar-blocks">${barPart}</span>
            <span class="power-bar-pct">${pctPart}</span>
          </div>
          <div class="skill-card-detail">${skill.detail}</div>
          <div class="skill-expand-hint-badge shine-badge">[CLICK TO EXPAND] ↗</div>
        </article>
      `;
        }
      )
      .join('');
  }

  // 2. Render Arcade Row Projects (Cabinets)
  const arcadeRow = document.getElementById('arcade-row');
  if (arcadeRow) {
    arcadeRow.innerHTML = PORTFOLIO_DATA.projects
      .map(
        (proj) => `
        <article class="arcade-cabinet" id="cabinet-${proj.id}" data-project-id="${proj.id}" tabindex="0" role="button" aria-label="${proj.title}">
          <div class="cabinet-top-section">
            <div class="walk-up-indicator shine-badge">INSPECT SPECS ▲ [CLICK]</div>
            <div class="cabinet-level-tag">${proj.levelTitle}</div>
            <div class="cabinet-badge-row">
              <span class="pixel-badge ${proj.status === 'SHIPPED' ? 'badge-shipped' : 'badge-in-dev'}">${proj.status}</span>
            </div>
            <h3 class="cabinet-title">${proj.title}</h3>
          </div>

          <div class="cabinet-screen">
            <div class="screen-mask"></div>
            <canvas class="cabinet-pixel-canvas" width="240" height="140" data-accent="${proj.accentColor}"></canvas>
          </div>

          <div>
            <p class="cabinet-desc">${proj.tagline}</p>
            <div class="cabinet-tags">
              ${proj.tags.map((t) => `<span class="tag-chip">${t}</span>`).join('')}
            </div>

            <!-- Direct 1-Click Action Buttons for Fast Scan / Recruiters -->
            <div class="cabinet-direct-actions">
              <a href="${proj.demoUrl || 'https://github.com/Ahmed-Affes'}" target="_blank" rel="noopener noreferrer" class="cabinet-action-btn" title="Launch Live Demo or Deployment">
                <span>⚡ LIVE DEMO ↗</span>
              </a>
              <a href="${proj.repoUrl || 'https://github.com/Ahmed-Affes'}" target="_blank" rel="noopener noreferrer" class="cabinet-action-btn secondary" title="Inspect Source Code on GitHub">
                <span>⌥ GITHUB ↗</span>
              </a>
            </div>
          </div>

          <div class="cabinet-landing-dock" aria-hidden="true">
            <span class="dock-light left"></span>
            <span class="dock-beam-pad"></span>
            <span class="dock-light right"></span>
          </div>
        </article>
      `
      )
      .join('');

    // Setup animated arcade screens
    const cabinetCanvases = arcadeRow.querySelectorAll<HTMLCanvasElement>('.cabinet-pixel-canvas');
    cabinetCanvases.forEach((canvas, idx) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const accent = canvas.getAttribute('data-accent') || '#4fe3ff';

      let frame = 0;
      const renderCabinetVisual = () => {
        frame++;
        ctx.fillStyle = '#0a0f1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(79, 227, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let y = 0; y < canvas.height; y += 8) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.save();
        ctx.translate(cx, cy);

        if (idx === 0) {
          ctx.rotate((frame * 0.02) % (Math.PI * 2));
          ctx.strokeStyle = accent;
          ctx.lineWidth = 2;
          ctx.strokeRect(-24, -24, 48, 48);
          ctx.fillStyle = 'rgba(79, 227, 255, 0.2)';
          ctx.fillRect(-12, -12, 24, 24);
        } else if (idx === 1) {
          ctx.fillStyle = accent;
          for (let b = -4; b <= 4; b++) {
            const barHeight = 15 + Math.sin(frame * 0.08 + b) * 20;
            ctx.fillRect(b * 12 - 4, -barHeight / 2, 8, barHeight);
          }
        } else if (idx === 2) {
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1.5;
          const radius = (frame * 0.4) % 40;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, (radius + 20) % 40, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeStyle = accent;
          ctx.lineWidth = 2;
          ctx.strokeRect(-18, -18, 36, 36);
          ctx.fillStyle = '#ff2e88';
          ctx.fillRect(-3, -3, 6, 6);
        }

        ctx.restore();
        requestAnimationFrame(renderCabinetVisual);
      };
      renderCabinetVisual();
    });
  }

  // 3. Render Beacon Commands
  const beaconCommandsEl = document.getElementById('beacon-commands');
  const beaconKioskEl = document.getElementById('beacon-kiosk');
  if (beaconCommandsEl) {
    beaconCommandsEl.innerHTML = PORTFOLIO_DATA.contact.links
      .map(
        (link) => `
        <div class="beacon-command-row">
          <span class="cmd-prefix">&gt;</span>
          <span style="color: var(--ink);">${link.cmd.replace('> ', '')}</span>
          <a href="${link.href}" class="cmd-link" target="_blank" rel="noopener noreferrer">${link.value}</a>
        </div>
      `
      )
      .join('');
  }

  // 4. Initialize HUD Drone Robot Sprite Controller
  const hudAvatarEl = document.getElementById('hud-robot-avatar');
  const hudRobotController = hudAvatarEl ? new RobotSpriteController(hudAvatarEl, 1.25) : (null as any);

  // 5. Initialize Interaction System (§5)
  const interactionSystem = new InteractionSystem(
    '.scene-camera',
    '#interaction-backdrop',
    '#interaction-drawer'
  );

  // 6. Bind Interactivity to Rendered Elements
  skillsGrid?.querySelectorAll('.skill-card').forEach((card) => {
    card.addEventListener('mouseenter', () => sounds.playHoverBlip());
    card.addEventListener('click', () => {
      const skillId = card.getAttribute('data-skill-id');
      const skill = PORTFOLIO_DATA.skills.find((s) => s.id === skillId);
      if (skill) {
        interactionSystem.open(card as HTMLElement, {
          statusBadge: { text: skill.level, type: skill.rarity },
          title: skill.name,
          tagline: `CATEGORY: ${skill.category.toUpperCase()}`,
          metrics: `STACK MASTERY // TIER: ${skill.rarity.toUpperCase()}`,
          description: skill.detail,
          tags: [skill.category, skill.level, 'PRODUCTION-READY']
        });
      }
    });
  });

  arcadeRow?.querySelectorAll('.arcade-cabinet').forEach((cabinet) => {
    cabinet.addEventListener('mouseenter', () => sounds.playHoverBlip());
    cabinet.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.cabinet-direct-actions') || target.tagName === 'A') {
        // Direct link clicked, do not trigger modal drawer
        return;
      }
      e.preventDefault();
      const projId = cabinet.getAttribute('data-project-id');
      const proj = PORTFOLIO_DATA.projects.find((p) => p.id === projId);
      if (proj) {
        interactionSystem.open(cabinet as HTMLElement, {
          statusBadge: {
            text: proj.status,
            type: proj.status === 'SHIPPED' ? 'shipped' : 'in-dev'
          },
          title: proj.title,
          tagline: proj.tagline,
          metrics: proj.metrics,
          description: proj.description,
          tags: proj.tags,
          primaryBtn: { text: 'VISIT PROJECT ↗', href: proj.demoUrl },
          secondaryBtn: { text: 'SOURCE CODE ↗', href: proj.repoUrl }
        });
      }
    });
  });

  // Global fallback delegation for 100% click reliability
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cabinet-direct-actions') || target.tagName === 'A') {
      return;
    }
    const cabinet = target.closest('.arcade-cabinet') as HTMLElement;
    if (cabinet && !interactionSystem.isOpenState()) {
      const projId = cabinet.getAttribute('data-project-id');
      const proj = PORTFOLIO_DATA.projects.find((p) => p.id === projId);
      if (proj) {
        interactionSystem.open(cabinet, {
          statusBadge: {
            text: proj.status,
            type: proj.status === 'SHIPPED' ? 'shipped' : 'in-dev'
          },
          title: proj.title,
          tagline: proj.tagline,
          metrics: proj.metrics,
          description: proj.description,
          tags: proj.tags,
          primaryBtn: { text: 'VISIT PROJECT ↗', href: proj.demoUrl },
          secondaryBtn: { text: 'SOURCE CODE ↗', href: proj.repoUrl }
        });
      }
    }
  });

  const terminalKiosk = document.getElementById('terminal-kiosk');
  terminalKiosk?.addEventListener('click', () => {
    sounds.playHoverBlip();
    interactionSystem.open(terminalKiosk, {
      statusBadge: { text: 'LOG // DECRYPTED', type: 'shipped' },
      title: PORTFOLIO_DATA.dialogue.title,
      tagline: 'OPERATOR SYSTEM TELEMETRY & BIO ARCHIVE',
      metrics: 'UPTIME: 6+ YEARS · 100% HAND-TUNED · ZERO RUNTIME ERRORS',
      description: PORTFOLIO_DATA.dialogue.text,
      tags: ['FULL-STACK', 'MOTION DESIGN', 'DISTRIBUTED SYSTEMS', 'CREATIVE TECH'],
      primaryBtn: {
        text: 'EXPLORE PROJECTS',
        onClick: () => {
          interactionSystem.close();
          const scrollTrack = document.getElementById('scroll-track');
          if (scrollTrack) {
            const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
            scrollChoreography.lenis.scrollTo(0.75 * maxScroll, { duration: 1.4 });
          }
        }
      },
      secondaryBtn: {
        text: 'TRANSMIT MESSAGE',
        onClick: () => {
          interactionSystem.close();
          const scrollTrack = document.getElementById('scroll-track');
          if (scrollTrack) {
            const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
            scrollChoreography.lenis.scrollTo(1.00 * maxScroll, { duration: 1.6 });
          }
        }
      }
    });
  });

  beaconKioskEl?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).tagName === 'A') return;
    sounds.playHoverBlip();
    interactionSystem.open(beaconKioskEl, {
      statusBadge: { text: 'UPLINK ONLINE', type: 'legendary' },
      title: 'Direct Uplink Terminal',
      tagline: 'SECURE BEACON PORT // 2026',
      metrics: 'CHANNEL: OPEN · ENCRYPTION: 256-BIT · PING: <12ms',
      description: 'Send a direct transmission for full-stack engineering contracts, creative motion development, or technical collaboration.',
      tags: ['AVAILABLE FOR WORK', 'REMOTE / HYBRID', 'CONTRACT / FULL-TIME'],
      primaryBtn: { text: 'SEND EMAIL ↗', href: 'mailto:c0der.devl0pper@gmail.com' },
      secondaryBtn: { text: 'GITHUB PROFILE ↗', href: 'https://github.com/Ahmed-Affes' }
    });
  });

  // Dossier Quick Action Triggers
  const dossierResumeBtn = document.getElementById('dossier-resume-btn');
  dossierResumeBtn?.addEventListener('click', () => {
    sounds.playPanelOpen();
    interactionSystem.open(dossierResumeBtn, {
      statusBadge: { text: 'DECRYPTED SPEC', type: 'legendary' },
      title: 'Ahmed Affes — Dossier & CV',
      tagline: 'CREATIVE FULL-STACK & MOTION ENGINEER // 2026',
      metrics: 'EXP: 6+ YEARS · CLEARANCE: LEVEL 04 · STATUS: AVAILABLE',
      description: 'Specializing in high-performance frontend architecture, custom canvas engines, GSAP kinetic web motion, distributed APIs, and production microservices.',
      tags: ['TYPESCRIPT', 'REACT', 'NODE.JS', 'GSAP', 'CANVAS', 'FLUTTER', 'POSTGRESQL'],
      primaryBtn: { text: 'DOWNLOAD PDF ⬇', href: '/Ahmed_Affes_CV_2026.pdf' },
      secondaryBtn: { text: 'CONTACT DIRECT ↗', href: 'mailto:c0der.devl0pper@gmail.com' }
    });
  });

  document.getElementById('dossier-contact-btn')?.addEventListener('click', () => {
    sounds.playHoverBlip();
    const contactSec = document.getElementById('act-contact');
    contactSec?.scrollIntoView({ behavior: 'smooth' });
  });

  const conduitResumeBtn = document.getElementById('conduit-resume-btn');
  conduitResumeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    sounds.playPanelOpen();
    interactionSystem.open(conduitResumeBtn, {
      statusBadge: { text: 'DECRYPTED SPEC', type: 'legendary' },
      title: 'Ahmed Affes — Dossier & CV',
      tagline: 'CREATIVE FULL-STACK & MOTION ENGINEER // 2026',
      metrics: 'EXP: 6+ YEARS · CLEARANCE: LEVEL 04 · STATUS: AVAILABLE',
      description: 'Specializing in high-performance frontend architecture, custom canvas engines, GSAP kinetic web motion, distributed APIs, and production microservices.',
      tags: ['TYPESCRIPT', 'REACT', 'NODE.JS', 'GSAP', 'CANVAS', 'FLUTTER', 'POSTGRESQL'],
      primaryBtn: { text: 'DOWNLOAD PDF ⬇', href: '/Ahmed_Affes_CV_2026.pdf' },
      secondaryBtn: { text: 'SEND EMAIL ↗', href: 'mailto:c0der.devl0pper@gmail.com' }
    });
  });

  // 7. Initialize Scroll Choreography AFTER DOM is fully rendered
  const scrollChoreography = new ScrollChoreography(
    hudRobotController,
    meteorEngine
  );

  // 8. Frictionless Preloader Boot Sequence with Fast Skip & Session Memory
  const preloaderEl = document.getElementById('preloader-screen');
  const preloaderStatusEl = document.getElementById('preloader-status-text');
  const preloaderBarFill = document.getElementById('preloader-bar-fill');
  const preloaderSkipBtn = document.getElementById('preloader-skip-btn');

  const hasBootedBefore = sessionStorage.getItem('unit07_booted') === 'true';

  const finishBoot = () => {
    sessionStorage.setItem('unit07_booted', 'true');
    sounds.playCrtPower();
    if (preloaderEl) {
      preloaderEl.classList.add('hidden');
    }

    // Hero Intro Animation
    if (!prefersReducedMotion && !document.body.classList.contains('calm-motion-active')) {
      gsap.fromTo(
        '#act-boot .hero-modern-stage',
        { opacity: 0, scale: 0.96, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: EASE_UI }
      );
    }
  };

  if (hasBootedBefore) {
    // Instant bypass on repeat visits / reloads
    if (preloaderEl) preloaderEl.classList.add('hidden');
  } else {
    const bootMessages = [
      { threshold: 0, text: 'CALIBRATING CORE...' },
      { threshold: 30, text: 'LOADING TECH STACK...' },
      { threshold: 65, text: 'PREPARING TELEMETRY...' },
      { threshold: 100, text: 'SYSTEM READY' }
    ];

    let loadProgress = 0;
    const progressInterval = window.setInterval(() => {
      loadProgress += Math.floor(Math.random() * 16) + 12; // Fast sub-700ms boot
      if (loadProgress > 100) loadProgress = 100;

      if (preloaderBarFill) {
        preloaderBarFill.style.width = `${loadProgress}%`;
      }

      const currentMsg = [...bootMessages].reverse().find((m) => loadProgress >= m.threshold);
      if (currentMsg && preloaderStatusEl) {
        preloaderStatusEl.textContent = `[${String(loadProgress).padStart(3, ' ')}%] ${currentMsg.text}`;
      }

      if (loadProgress >= 100) {
        clearInterval(progressInterval);
        window.setTimeout(() => {
          finishBoot();
        }, 150);
      }
    }, 25);

    // 1-Click Skip / Keyboard Skip
    const triggerSkip = () => {
      clearInterval(progressInterval);
      finishBoot();
    };

    preloaderSkipBtn?.addEventListener('click', triggerSkip);
    window.addEventListener('keydown', (e) => {
      if (preloaderEl && !preloaderEl.classList.contains('hidden')) {
        if (e.code === 'Space' || e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          triggerSkip();
        }
      }
    });
  }

  // 9. Setup Audio Button in HUD
  const audioToggleBtn = document.getElementById('audio-toggle');
  const audioIconEl = document.getElementById('audio-icon');
  const audioLabelEl = document.getElementById('audio-label');

  sounds.subscribe((isMuted) => {
    if (audioToggleBtn) {
      if (isMuted) {
        audioToggleBtn.classList.add('muted');
        if (audioIconEl) audioIconEl.textContent = '🔇';
        if (audioLabelEl) audioLabelEl.textContent = 'AUDIO: OFF';
      } else {
        audioToggleBtn.classList.remove('muted');
        if (audioIconEl) audioIconEl.textContent = '🔊';
        if (audioLabelEl) audioLabelEl.textContent = 'AUDIO: ON';
      }
    }
  });

  audioToggleBtn?.addEventListener('click', () => {
    sounds.toggleMute();
  });

  // 10. Setup Hero CTAs smooth scrolling & CLI modal trigger
  const heroViewProjectsBtn = document.getElementById('hero-view-projects-btn');
  const heroCliTriggerBtn = document.getElementById('hero-cli-trigger-btn');

  heroViewProjectsBtn?.addEventListener('click', () => {
    sounds.playHoverBlip();
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      scrollChoreography.lenis.scrollTo(0.25 * maxScroll, { duration: 1.5 });
    }
  });

  heroCliTriggerBtn?.addEventListener('click', () => {
    sounds.playHoverBlip();
    cliTerminal.openModal();
  });

  // 11. Ambient Canvas Particle Simulator
  const particleCanvas = document.getElementById('particles-canvas') as HTMLCanvasElement;
  if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    if (ctx) {
      const resizeCanvas = () => {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      interface Particle {
        x: number;
        y: number;
        size: number;
        speedY: number;
        speedX: number;
        color: string;
        alpha: number;
      }

      const colors = ['#4fe3ff', '#ff2e88', '#ffb238', '#cdeaff'];
      const particles: Particle[] = Array.from({ length: 45 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speedY: -Math.random() * 0.4 - 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2
      }));

      const animateParticles = () => {
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < 0) {
            p.y = particleCanvas.height;
            p.x = Math.random() * particleCanvas.width;
          }
          if (p.x < 0) p.x = particleCanvas.width;
          if (p.x > particleCanvas.width) p.x = 0;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        });
        ctx.globalAlpha = 1.0;
        requestAnimationFrame(animateParticles);
      };
      animateParticles();
    }
  }

  // 12. Live UTC Cyber Clock
  const clockEl = document.getElementById('hero-live-clock');
  if (clockEl) {
    const updateClock = () => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      clockEl.textContent = `SYS_TIME: ${year}.${month}.${day} // ${hrs}:${mins}:${secs} UTC`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 13. Custom Cursor (B3)
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    new CustomCursorController('custom-cursor');
  }

  // 14. Smooth Jitter-Free 3D Card Hover & Focus (B3)
  const addTiltEffect = (selector: string) => {
    document.querySelectorAll(selector).forEach((card) => {
      const el = card as HTMLElement;
      let bounds: DOMRect | null = null;
      let isHovered = false;

      el.addEventListener('mouseenter', () => {
        isHovered = true;
        bounds = el.getBoundingClientRect();
        gsap.to(el, {
          scale: 1.025,
          boxShadow: '0 12px 36px rgba(79, 227, 255, 0.4)',
          borderColor: '#4fe3ff',
          zIndex: 30,
          duration: 0.25,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mousemove', (e: Event) => {
        if (!isHovered) return;
        if (!bounds) bounds = el.getBoundingClientRect();
        const me = e as MouseEvent;
        const x = (me.clientX - bounds.left) / bounds.width - 0.5;
        const y = (me.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(el, {
          rotateY: x * 6,
          rotateX: -y * 4,
          duration: 0.25,
          ease: 'power2.out',
          transformPerspective: 800
        });
      });

      el.addEventListener('mouseleave', () => {
        isHovered = false;
        bounds = null;
        gsap.to(el, {
          scale: 1.0,
          rotateY: 0,
          rotateX: 0,
          boxShadow: '0 0 0px rgba(79, 227, 255, 0)',
          borderColor: '',
          zIndex: 1,
          duration: 0.35,
          ease: 'power2.out'
        });
      });
    });
  };

  if (!prefersReducedMotion) {
    addTiltEffect('.skill-card');
    addTiltEffect('.arcade-cabinet');
  }
});
