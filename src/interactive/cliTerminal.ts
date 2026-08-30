import { sounds } from '../audio/soundEngine';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export class CyberCLITerminal {
  private modalEl: HTMLElement | null;
  private terminalEl: HTMLElement | null;
  private outputEl: HTMLElement | null;
  private inputEl: HTMLInputElement | null;
  private history: string[] = [];
  private historyIndex: number = -1;
  private isMatrixRunning: boolean = false;
  private matrixAnimId: number | null = null;
  private isOpen: boolean = false;

  constructor(terminalId: string = 'cli-terminal-window') {
    this.modalEl = document.getElementById('floating-cli-modal');
    this.terminalEl = document.getElementById(terminalId);
    this.outputEl = document.getElementById('cli-output-log');
    this.inputEl = document.getElementById('cli-input') as HTMLInputElement;

    this.initModalControls();
    this.initEventListeners();
    this.initQuickPills();
    this.printWelcomeMessage();
  }

  private initModalControls() {
    const launcherBtn = document.getElementById('floating-help-toggle');
    const closeBtn = document.getElementById('cli-modal-close');
    const closeDot = document.getElementById('cli-close-dot');
    const backdrop = document.getElementById('floating-cli-backdrop');

    launcherBtn?.addEventListener('click', () => {
      this.toggleModal();
    });

    closeBtn?.addEventListener('click', () => {
      this.closeModal();
    });

    closeDot?.addEventListener('click', () => {
      this.closeModal();
    });

    backdrop?.addEventListener('click', () => {
      this.closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeModal();
      } else if ((e.key === '`' || e.key === '~') && !this.isTypingInInput(e.target)) {
        e.preventDefault();
        this.toggleModal();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggleModal();
      }
    });

    // Forward wheel scrolling when over backdrop to Lenis / document so page scrolls smoothly
    this.modalEl?.addEventListener('wheel', (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#cli-output-log')) {
        const lenis = (window as any).__lenis;
        if (lenis) {
          lenis.scrollTo(lenis.scroll + e.deltaY * 0.8, { immediate: true });
        } else {
          window.scrollBy({ top: e.deltaY * 0.8 });
        }
      }
    }, { passive: true });
  }

  private isTypingInInput(target: EventTarget | null): boolean {
    if (!target) return false;
    const tag = (target as HTMLElement).tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA';
  }

  public openModal() {
    if (!this.modalEl) return;
    this.isOpen = true;
    sounds.playPanelOpen();
    this.modalEl.classList.add('open');
    this.modalEl.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      this.inputEl?.focus();
    }, 100);
  }

  public closeModal() {
    if (!this.modalEl) return;
    this.isOpen = false;
    sounds.playClose();
    this.modalEl.classList.remove('open');
    this.modalEl.setAttribute('aria-hidden', 'true');
  }

  public toggleModal() {
    if (this.isOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  private initEventListeners() {
    this.inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.inputEl?.value.trim() || '';
        this.executeCommand(cmd);
        if (this.inputEl) this.inputEl.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.handleAutocomplete();
      } else {
        sounds.playKeyType();
      }
    });

    // Clicking anywhere in the terminal focuses the input
    this.terminalEl?.addEventListener('click', () => {
      this.inputEl?.focus();
    });

    // Dynamic click on command items inside help output
    this.outputEl?.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('.cli-cmd-item, .cli-link-btn') as HTMLElement;
      if (item) {
        const cmd = item.getAttribute('data-cmd');
        if (cmd) {
          this.executeCommand(cmd);
          this.inputEl?.focus();
        }
      }
    });
  }

  private initQuickPills() {
    const pills = document.querySelectorAll('.cli-pill-btn');
    pills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmd = pill.getAttribute('data-cmd') || '';
        if (cmd) {
          sounds.playPanelOpen();
          this.executeCommand(cmd);
          this.inputEl?.focus();
        }
      });
    });
  }

  private printWelcomeMessage() {
    this.appendOutput(`
<div class="cli-card welcome-card">
  <div class="cli-card-header">
    <div class="header-left">
      <span class="cli-status-indicator"></span>
      <span class="cli-title-glow">UNIT_07 TACTICAL CLI CONSOLE v2.6.0</span>
    </div>
    <span class="cli-tag-cyan">AUTHENTICATED // 2026</span>
  </div>
  <div class="cli-card-body">
    <p class="welcome-lead">High-performance terminal dispatch for full-stack engineering, production archives & live system diagnostics.</p>
    <div class="welcome-shortcuts">
      <span class="shortcut-badge">SHORTCUT: <kbd>~</kbd> OR <kbd>Ctrl+K</kbd></span>
      <span class="shortcut-hint">Type <span class="cli-amber font-bold">help</span> or click quick pills below</span>
    </div>
  </div>
</div>
    `);
  }

  public executeCommand(rawCommand: string) {
    if (!rawCommand) {
      this.appendPromptLine('');
      return;
    }

    this.history.push(rawCommand);
    this.historyIndex = this.history.length;

    this.appendPromptLine(rawCommand);

    const parts = rawCommand.trim().split(' ');
    const cmd = parts[0].toLowerCase();

    sounds.playPanelOpen();

    switch (cmd) {
      case 'help':
      case '?':
      case 'commands':
        this.cmdHelp();
        break;
      case 'about':
      case 'bio':
      case 'whoami':
        this.cmdAbout();
        break;
      case 'skills':
      case 'stack':
      case 'tech':
        this.cmdSkills();
        break;
      case 'projects':
      case 'work':
      case 'apps':
        this.cmdProjects();
        break;
      case 'contact':
      case 'email':
      case 'links':
      case 'hire':
        this.cmdContact();
        break;
      case 'matrix':
        this.cmdMatrix();
        break;
      case 'stats':
      case 'status':
      case 'system':
        this.cmdStats();
        break;
      case 'clear':
      case 'cls':
        this.cmdClear();
        break;
      case 'sudo':
        this.appendOutput(`
<div class="cli-card error-card">
  <div class="cli-card-header"><span class="cli-tag-red">SECURITY ALERT: UNAUTHORIZED ELEVATION</span></div>
  <div class="cli-card-body">
    <p class="cli-error-text">User 'guest' is not in the sudoers file. Incident logged and dispatched to UNIT_07 Sentinel Core.</p>
  </div>
</div>`);
        break;
      case 'secret':
      case 'easteregg':
      case 'vault':
        this.cmdSecret();
        break;
      case 'game':
      case 'dice':
      case 'roll':
        this.cmdGame();
        break;
      default:
        this.appendOutput(`
<div class="cli-card error-card">
  <div class="cli-card-body">
    <span class="cli-error-text">Unknown system command: '<span class="cli-amber">${escapeHtml(cmd)}</span>'.</span>
    <span class="cli-dim">Type <span class="cli-cyan font-bold cli-link-btn" data-cmd="help">help</span> to view available system routines.</span>
  </div>
</div>`);
    }

    // Auto-scroll output to bottom
    if (this.outputEl) {
      this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
  }

  private cmdHelp() {
    this.appendOutput(`
<div class="cli-card help-card">
  <div class="cli-card-header">
    <span class="cli-tag-amber">SYSTEM DISPATCH ROUTINES</span>
    <span class="cli-meta-dim">[CLICK ANY ROUTINE TO EXECUTE]</span>
  </div>
  <div class="cli-help-grid">
    <div class="cli-cmd-item" data-cmd="about">
      <span class="cmd-pill amber">about</span>
      <span class="cmd-desc">Operator bio, engineering philosophy & experience specs</span>
    </div>
    <div class="cli-cmd-item" data-cmd="skills">
      <span class="cmd-pill cyan">skills</span>
      <span class="cmd-desc">Equipped capability matrix, tech stack & mastery bars</span>
    </div>
    <div class="cli-cmd-item" data-cmd="projects">
      <span class="cmd-pill magenta">projects</span>
      <span class="cmd-desc">Shipped production systems, arcade projects & live links</span>
    </div>
    <div class="cli-cmd-item" data-cmd="contact">
      <span class="cmd-pill green">contact</span>
      <span class="cmd-desc">Direct communication channels & encryption uplink</span>
    </div>
    <div class="cli-cmd-item" data-cmd="hire">
      <span class="cmd-pill green">hire</span>
      <span class="cmd-desc">Contract availability & recruiter transmission portal</span>
    </div>
    <div class="cli-cmd-item" data-cmd="matrix">
      <span class="cmd-pill green">matrix</span>
      <span class="cmd-desc">Toggle full-screen digital green rain simulation</span>
    </div>
    <div class="cli-cmd-item" data-cmd="stats">
      <span class="cmd-pill cyan">stats</span>
      <span class="cmd-desc">Hardware specs, FPS, WebGL engine & client telemetry</span>
    </div>
    <div class="cli-cmd-item" data-cmd="game">
      <span class="cmd-pill amber">game</span>
      <span class="cmd-desc">Roll quantum cyber dice D100 RNG mini-game</span>
    </div>
    <div class="cli-cmd-item" data-cmd="secret">
      <span class="cmd-pill magenta">secret</span>
      <span class="cmd-desc">Unlock classified easter egg memory vault</span>
    </div>
    <div class="cli-cmd-item" data-cmd="clear">
      <span class="cmd-pill dim">clear</span>
      <span class="cmd-desc">Wipe terminal output screen</span>
    </div>
  </div>
</div>
    `);
  }

  private cmdAbout() {
    this.appendOutput(`
<div class="cli-card about-card">
  <div class="cli-card-header">
    <div class="header-left">
      <span class="cli-tag-cyan">OPERATOR DOSSIER // AHMED AFFES</span>
    </div>
    <span class="cli-tag-green">CLEARANCE: LVL_04 · [AUTHENTICATED]</span>
  </div>
  <div class="cli-dossier-layout">
    <div class="cli-dossier-icon">
      <div class="dossier-hex-avatar">🤖</div>
      <div class="dossier-status-pill">ONLINE</div>
    </div>
    <div class="cli-dossier-body">
      <h4 class="cli-dossier-headline">Principal Motion & Full-Stack Architect</h4>
      <p class="cli-dossier-desc">${PORTFOLIO_DATA.dialogue.text}</p>
      <div class="cli-dossier-stats-row">
        <div class="dossier-stat-box">
          <span class="stat-num">6+</span>
          <span class="stat-lbl">YRS EXPERIENCE</span>
        </div>
        <div class="dossier-stat-box">
          <span class="stat-num">0ms</span>
          <span class="stat-lbl">INPUT LATENCY</span>
        </div>
        <div class="dossier-stat-box">
          <span class="stat-num">60</span>
          <span class="stat-lbl">LOCKED FPS</span>
        </div>
        <div class="dossier-stat-box">
          <span class="stat-num">100%</span>
          <span class="stat-lbl">PROD RESILIENCE</span>
        </div>
      </div>
      <div class="cli-tag-strip">
        <span class="cli-chip">TYPESCRIPT</span>
        <span class="cli-chip">REACT / NEXT.JS</span>
        <span class="cli-chip">NODE.JS / APIS</span>
        <span class="cli-chip">WEBGL / GSAP</span>
        <span class="cli-chip">FLUTTER</span>
        <span class="cli-chip">POSTGRESQL</span>
      </div>
    </div>
  </div>
</div>
    `);
  }

  private cmdSkills() {
    const powerMap: Record<string, { pct: string; blocks: string }> = {
      'js-ts': { pct: '98%', blocks: '██████████' },
      'react': { pct: '95%', blocks: '█████████░' },
      'node': { pct: '90%', blocks: '█████████░' },
      'flutter': { pct: '88%', blocks: '████████░░' },
      'postgres': { pct: '86%', blocks: '████████░░' },
      'electron': { pct: '82%', blocks: '████████░░' },
      'docker': { pct: '80%', blocks: '████████░░' },
      'figma': { pct: '85%', blocks: '████████░░' },
    };

    let itemsHtml = '';
    PORTFOLIO_DATA.skills.forEach((skill) => {
      const power = powerMap[skill.id] || { pct: '85%', blocks: '████████░░' };
      const rarityColor = skill.rarity === 'legendary' ? 'amber' : skill.rarity === 'rare' ? 'cyan' : 'green';
      itemsHtml += `
<div class="cli-skill-entry">
  <div class="skill-meta-left">
    <span class="skill-name font-bold ${rarityColor}">${skill.name}</span>
    <span class="skill-detail-text">${skill.detail}</span>
  </div>
  <div class="skill-gauge-right">
    <span class="skill-blocks ${rarityColor}">${power.blocks}</span>
    <span class="skill-pct font-bold ${rarityColor}">${power.pct}</span>
  </div>
</div>`;
    });

    this.appendOutput(`
<div class="cli-card skills-card">
  <div class="cli-card-header">
    <span class="cli-tag-cyan">EQUIPPED CAPABILITY MATRIX</span>
    <span class="cli-meta-dim">8 Core Modules · Max Power</span>
  </div>
  <div class="cli-skills-container">
    ${itemsHtml}
  </div>
</div>
    `);
  }

  private cmdProjects() {
    let projsHtml = '';
    PORTFOLIO_DATA.projects.forEach((proj, idx) => {
      const statusClass = proj.status === 'SHIPPED' ? 'badge-green' : 'badge-amber';
      projsHtml += `
<div class="cli-project-card">
  <div class="proj-header-row">
    <div class="proj-title-group">
      <span class="proj-num cli-magenta font-bold">[0${idx + 1}]</span>
      <span class="proj-title cli-amber font-bold">${proj.title}</span>
    </div>
    <span class="proj-status-badge ${statusClass}">${proj.status}</span>
  </div>
  <p class="proj-tagline">${proj.tagline}</p>
  <div class="proj-tags-row">
    ${proj.tags.map((t) => `<span class="proj-tag-chip">${t}</span>`).join('')}
  </div>
  <div class="proj-actions-row">
    <a href="${proj.demoUrl}" target="_blank" class="cli-action-btn primary">⚡ LAUNCH DEMO ↗</a>
    <a href="${proj.repoUrl}" target="_blank" class="cli-action-btn secondary">⌥ SOURCE CODE ↗</a>
  </div>
</div>`;
    });

    this.appendOutput(`
<div class="cli-card projects-card">
  <div class="cli-card-header">
    <span class="cli-tag-magenta">SHIPPED PRODUCTION ARSENAL</span>
    <span class="cli-meta-dim">Deployed Applications & Repositories</span>
  </div>
  <div class="cli-projects-grid">
    ${projsHtml}
  </div>
</div>
    `);
  }

  private cmdContact() {
    const contactLinks = [
      { label: 'DIRECT EMAIL', value: 'ahmed.affes.dev@gmail.com', href: 'mailto:ahmed.affes.dev@gmail.com', icon: '✉️' },
      { label: 'GITHUB VAULT', value: 'github.com/Ahmed-Affes', href: 'https://github.com/Ahmed-Affes', icon: '🐙' },
      { label: 'LINKEDIN UPLINK', value: 'linkedin.com/in/ahmed-affes', href: 'https://linkedin.com', icon: '⚡' },
      { label: 'CURRICULUM VITAE', value: 'Ahmed_Affes_CV_2026.pdf', href: '/Ahmed_Affes_CV_2026.pdf', icon: '📄' }
    ];

    let commsHtml = '';
    contactLinks.forEach((c) => {
      commsHtml += `
<a href="${c.href}" target="_blank" class="cli-comm-channel">
  <span class="comm-icon">${c.icon}</span>
  <div class="comm-info">
    <span class="comm-label">${c.label}</span>
    <span class="comm-val">${c.value}</span>
  </div>
  <span class="comm-arrow">↗</span>
</a>`;
    });

    this.appendOutput(`
<div class="cli-card contact-card">
  <div class="cli-card-header">
    <span class="cli-tag-green">DIRECT TRANSMISSION PORTAL</span>
    <span class="cli-tag-green">STATUS: AVAILABLE</span>
  </div>
  <div class="cli-card-body">
    <p class="contact-lead">Ready for high-impact full-stack architecture, web motion engineering, and high-performance product teams.</p>
    <div class="cli-comms-grid">
      ${commsHtml}
    </div>
  </div>
</div>
    `);
  }

  private cmdStats() {
    const dpr = window.devicePixelRatio || 1;
    const cores = navigator.hardwareConcurrency || 8;
    const memory = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'HIGH (64-bit)';

    this.appendOutput(`
<div class="cli-card stats-card">
  <div class="cli-card-header">
    <span class="cli-tag-cyan">CLIENT RUNTIME HARDWARE TELEMETRY</span>
    <span class="cli-tag-green">60 FPS LOCKED</span>
  </div>
  <div class="cli-stats-grid">
    <div class="cli-stat-item"><span class="stat-k">VIEWPORT:</span> <span class="stat-v">${window.innerWidth} × ${window.innerHeight} (${dpr}x DPR)</span></div>
    <div class="cli-stat-item"><span class="stat-k">CPU CORES:</span> <span class="stat-v">${cores} Logical Cores</span></div>
    <div class="cli-stat-item"><span class="stat-k">SYSTEM MEMORY:</span> <span class="stat-v">${memory}</span></div>
    <div class="cli-stat-item"><span class="stat-k">ANIMATION ENGINE:</span> <span class="stat-v">GSAP 3.12 + ScrollTrigger Scrub</span></div>
    <div class="cli-stat-item"><span class="stat-k">INPUT LATENCY:</span> <span class="stat-v cli-green">0.0ms (Hardware Accelerated)</span></div>
    <div class="cli-stat-item"><span class="stat-k">AUDIO SYNTH:</span> <span class="stat-v">Web Audio API Procedural Synth</span></div>
  </div>
</div>
    `);
  }

  private cmdMatrix() {
    if (this.isMatrixRunning) {
      this.stopMatrixRain();
      this.appendOutput(`
<div class="cli-card matrix-card">
  <div class="cli-card-body">
    <span class="cli-dim">Digital Matrix simulation halted. Normal viewport restored.</span>
  </div>
</div>`);
    } else {
      this.startMatrixRain();
      this.appendOutput(`
<div class="cli-card matrix-card">
  <div class="cli-card-header"><span class="cli-tag-green">MATRIX RAIN ENGAGED</span></div>
  <div class="cli-card-body">
    <span class="cli-green">Digital rain simulation active across all display buffers. Type <span class="cli-amber font-bold">matrix</span> again to halt.</span>
  </div>
</div>`);
    }
  }

  private startMatrixRain() {
    let canvas = document.getElementById('matrix-rain-canvas') as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'matrix-rain-canvas';
      canvas.className = 'matrix-rain-canvas';
      document.body.appendChild(canvas);
    }

    canvas.style.display = 'block';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.isMatrixRunning = true;
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const render = () => {
      ctx.fillStyle = 'rgba(5, 7, 15, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#39ff88';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (this.isMatrixRunning) {
        this.matrixAnimId = requestAnimationFrame(render);
      }
    };

    render();
  }

  private stopMatrixRain() {
    this.isMatrixRunning = false;
    if (this.matrixAnimId) {
      cancelAnimationFrame(this.matrixAnimId);
    }
    const canvas = document.getElementById('matrix-rain-canvas');
    if (canvas) canvas.style.display = 'none';
  }

  private cmdGame() {
    const roll = Math.floor(Math.random() * 100) + 1;
    let tier = 'STANDARD ROLL';
    let tierColor = 'cli-dim';
    let xp = 50;

    if (roll === 100) {
      tier = 'CRITICAL OVERCLOCK! (LEGENDARY)';
      tierColor = 'cli-amber';
      xp = 1000;
      sounds.playCoreDetonation();
    } else if (roll > 80) {
      tier = 'PLASMA SURGE (RARE)';
      tierColor = 'cli-cyan';
      xp = 350;
      sounds.playQuantumSurge();
    } else if (roll > 50) {
      tier = 'HIGH EFFICIENCY (COMMON)';
      tierColor = 'cli-green';
      xp = 150;
    }

    this.appendOutput(`
<div class="cli-card game-card">
  <div class="cli-card-header">
    <span class="cli-tag-amber">QUANTUM CYBER DICE [D100]</span>
    <span class="cli-tag-${tierColor.replace('cli-', '')}">${tier}</span>
  </div>
  <div class="cli-game-layout">
    <div class="game-dice-box">
      <span class="dice-val">${roll}</span>
      <span class="dice-max">/ 100</span>
    </div>
    <div class="game-dice-info">
      <div class="game-outcome font-bold ${tierColor}">RESULT: ${tier}</div>
      <div class="game-reward">Gained <span class="cli-cyan font-bold">+${xp} XP</span> · Neural synchronization increased.</div>
    </div>
  </div>
</div>
    `);
  }

  private cmdSecret() {
    this.appendOutput(`
<div class="cli-card secret-card">
  <div class="cli-card-header">
    <span class="cli-tag-magenta">CLASSIFIED MEMORY DUMP [DECRYPTED]</span>
    <span class="cli-tag-magenta">TOP SECRET</span>
  </div>
  <div class="cli-secret-body">
    <pre class="ascii-art cli-magenta">
   __  ___   __________  ____
  / / / / | / /  _/_  __/ __ \\
 / / / /  |/ // /  / / / / / /
/ /_/ / /|  // /  / / / /_/ / 
\\____/_/ |_/___/ /_/  \\____/  
    </pre>
    <p class="secret-quote">"Built with code-driven SVG sprites, canvas render loops, zero bulky frameworks, and pure passion for high-performance interactive craft. Welcome to the machine."</p>
  </div>
</div>
    `);
  }

  private cmdClear() {
    if (this.outputEl) this.outputEl.innerHTML = '';
  }

  private handleAutocomplete() {
    const current = this.inputEl?.value.trim() || '';
    const commands = ['help', 'about', 'skills', 'projects', 'contact', 'hire', 'matrix', 'stats', 'game', 'secret', 'clear'];
    const match = commands.find((c) => c.startsWith(current));
    if (match && this.inputEl) {
      this.inputEl.value = match;
    }
  }

  private navigateHistory(direction: number) {
    if (this.history.length === 0) return;
    this.historyIndex += direction;
    if (this.historyIndex < 0) this.historyIndex = 0;
    if (this.historyIndex >= this.history.length) {
      this.historyIndex = this.history.length;
      if (this.inputEl) this.inputEl.value = '';
      return;
    }
    if (this.inputEl) this.inputEl.value = this.history[this.historyIndex];
  }

  private appendPromptLine(cmd: string) {
    const line = document.createElement('div');
    line.className = 'cli-command-echo';
    line.innerHTML = `<span class="cli-green font-bold">visitor@unit07:~$</span> <span class="cli-user-cmd">${escapeHtml(cmd)}</span>`;
    this.outputEl?.appendChild(line);
  }

  private appendOutput(html: string) {
    const block = document.createElement('div');
    block.className = 'cli-output-entry';
    block.innerHTML = html;
    this.outputEl?.appendChild(block);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
