import { RobotSpriteController } from './sprites/robotSprite';
import { sounds } from './audio/soundEngine';
import { PORTFOLIO_DATA } from './data/portfolioData';
import { InteractionSystem } from './motion/interactionSystem';
import { ScrollChoreography } from './motion/scrollChoreography';
import { gsap, EASE_UI } from './motion/customEases';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Render Skills Cards (Data Core) FIRST
  const skillsGrid = document.getElementById('skills-grid');
  if (skillsGrid) {
    skillsGrid.innerHTML = PORTFOLIO_DATA.skills
      .map(
        (skill) => `
        <article class="skill-card ${skill.rarity}" data-skill-id="${skill.id}" tabindex="0" role="button" aria-label="${skill.name}">
          <div class="skill-card-tier">${skill.level}</div>
          <div class="skill-card-name">${skill.name}</div>
          <div style="font-size: 17px; color: var(--muted); line-height: 1.35;">${skill.detail}</div>
        </article>
      `
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
          <div class="walk-up-indicator">WALK UP ▲ [CLICK]</div>
          <div>
            <div class="cabinet-level-tag">${proj.levelTitle}</div>
            <div style="margin-bottom: 8px;">
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

  // 4. Initialize Robot Sprite Controllers
  const hudAvatarEl = document.getElementById('hud-robot-avatar');
  const sceneAvatarEl = document.getElementById('scene-robot');

  if (!hudAvatarEl || !sceneAvatarEl) {
    console.error('Robot avatar containers not found');
    return;
  }

  const hudRobotController = new RobotSpriteController(hudAvatarEl, 1.25);
  const sceneRobotController = new RobotSpriteController(sceneAvatarEl, 3.5);

  // 5. Initialize Interaction System (§5)
  const interactionSystem = new InteractionSystem(
    '.scene-camera',
    '#interaction-backdrop',
    '#interaction-drawer',
    '#scene-robot-container',
    sceneRobotController
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
    cabinet.addEventListener('click', () => {
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
      primaryBtn: { text: 'SEND EMAIL ↗', href: 'mailto:alex.developer@example.com' },
      secondaryBtn: { text: 'GITHUB PROFILE ↗', href: 'https://github.com' }
    });
  });

  // 7. Initialize Scroll Choreography AFTER DOM is fully rendered
  const scrollChoreography = new ScrollChoreography(
    hudRobotController,
    sceneRobotController
  );

  // 8. Run Preloader Boot Sequence (Screenshots 1 & 2)
  const preloaderEl = document.getElementById('preloader-screen');
  const preloaderStatusEl = document.getElementById('preloader-status-text');
  const preloaderBarFill = document.getElementById('preloader-bar-fill');

  const bootMessages = [
    { threshold: 0, text: 'CALIBRATING NEON...' },
    { threshold: 25, text: 'INITIALIZING SPRITE ENGINE...' },
    { threshold: 55, text: 'SYNCHRONIZING GSAP TIMELINES...' },
    { threshold: 85, text: 'ENGAGING CINEMATIC STAGE...' },
    { threshold: 100, text: 'SYSTEM READY' }
  ];

  let loadProgress = 0;
  const progressInterval = window.setInterval(() => {
    loadProgress += Math.floor(Math.random() * 8) + 4;
    if (loadProgress > 100) loadProgress = 100;

    if (preloaderBarFill) {
      preloaderBarFill.style.width = `${loadProgress}%`;
    }

    const currentMsg = [...bootMessages].reverse().find((m) => loadProgress >= m.threshold);
    if (currentMsg && preloaderStatusEl) {
      preloaderStatusEl.textContent = currentMsg.text;
    }

    if (loadProgress >= 100) {
      clearInterval(progressInterval);
      window.setTimeout(() => {
        sounds.playCrtPower();
        if (preloaderEl) {
          preloaderEl.classList.add('hidden');
        }

        // Hero Intro Animation
        gsap.fromTo(
          '#act-boot .hero-grid-layout',
          { opacity: 0, scale: 0.94, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: EASE_UI }
        );
      }, 400);
    }
  }, 45);

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

  // 10. Setup Hero CTAs smooth scrolling to target progress
  const heroViewProjectsBtn = document.getElementById('hero-view-projects-btn');
  const heroOpenChannelBtn = document.getElementById('hero-open-channel-btn');

  heroViewProjectsBtn?.addEventListener('click', () => {
    sounds.playHoverBlip();
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      scrollChoreography.lenis.scrollTo(0.75 * maxScroll, { duration: 1.5 });
    }
  });

  heroOpenChannelBtn?.addEventListener('click', () => {
    sounds.playHoverBlip();
    const scrollTrack = document.getElementById('scroll-track');
    if (scrollTrack) {
      const maxScroll = scrollTrack.offsetHeight - window.innerHeight;
      scrollChoreography.lenis.scrollTo(1.00 * maxScroll, { duration: 1.8 });
    }
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
});
