import { sounds } from '../audio/soundEngine';
import { PORTFOLIO_DATA } from '../data/portfolioData';

export class CyberCLITerminal {
  private terminalEl: HTMLElement | null;
  private outputEl: HTMLElement | null;
  private inputEl: HTMLInputElement | null;
  private history: string[] = [];
  private historyIndex: number = -1;
  private isMatrixRunning: boolean = false;
  private matrixAnimId: number | null = null;

  constructor(terminalId: string = 'cli-terminal-window') {
    this.terminalEl = document.getElementById(terminalId);
    this.outputEl = document.getElementById('cli-output-log');
    this.inputEl = document.getElementById('cli-input') as HTMLInputElement;

    if (!this.terminalEl || !this.outputEl || !this.inputEl) return;

    this.initEventListeners();
    this.initQuickPills();
    this.printWelcomeMessage();
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
<div class="cli-system-msg">
  <span class="cli-cyan">UNIT_07 SECURE TERMINAL v2.6.0</span> [AUTHENTICATED]<br>
  Type <span class="cli-amber">help</span> to view available system routines, or click the quick pills below.
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
        this.cmdHelp();
        break;
      case 'about':
      case 'bio':
      case 'whoami':
        this.cmdAbout();
        break;
      case 'skills':
      case 'stack':
        this.cmdSkills();
        break;
      case 'projects':
      case 'work':
        this.cmdProjects();
        break;
      case 'contact':
      case 'email':
      case 'hire':
        this.cmdContact();
        break;
      case 'matrix':
        this.cmdMatrix();
        break;
      case 'clear':
      case 'cls':
        this.cmdClear();
        break;
      case 'sudo':
        this.appendOutput(`<div class="cli-error">ERROR: Unauthorized elevation. User 'guest' is not in the sudoers file. Incident reported to UNIT_07 Core.</div>`);
        break;
      case 'secret':
      case 'easteregg':
        this.cmdSecret();
        break;
      case 'game':
        this.cmdGame();
        break;
      default:
        this.appendOutput(`<div class="cli-error">Command not found: '${escapeHtml(cmd)}'. Type <span class="cli-amber">help</span> for valid commands.</div>`);
    }

    // Auto-scroll output to bottom
    if (this.outputEl) {
      this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
  }

  private cmdHelp() {
    this.appendOutput(`
<div class="cli-table">
  <div class="cli-row"><span class="cli-amber">about</span>     <span class="cli-dim">—</span> Display operator biography, focus & uptime</div>
  <div class="cli-row"><span class="cli-amber">skills</span>    <span class="cli-dim">—</span> Output equipped technology stack & mastery bars</div>
  <div class="cli-row"><span class="cli-amber">projects</span>  <span class="cli-dim">—</span> List shipped production systems & repository links</div>
  <div class="cli-row"><span class="cli-amber">contact</span>   <span class="cli-dim">—</span> Display communication channels & mail launcher</div>
  <div class="cli-row"><span class="cli-amber">hire</span>      <span class="cli-dim">—</span> Review contract availability & direct transmission</div>
  <div class="cli-row"><span class="cli-amber">matrix</span>    <span class="cli-dim">—</span> Toggle full-screen digital rain simulation</div>
  <div class="cli-row"><span class="cli-amber">game</span>      <span class="cli-dim">—</span> Roll quantum cyber dice mini-game</div>
  <div class="cli-row"><span class="cli-amber">secret</span>    <span class="cli-dim">—</span> Reveal decrypted classified telemetry</div>
  <div class="cli-row"><span class="cli-amber">clear</span>     <span class="cli-dim">—</span> Wipe terminal log buffer</div>
</div>
    `);
  }

  private cmdAbout() {
    this.appendOutput(`
<div class="cli-block">
  <div class="cli-cyan font-bold">${PORTFOLIO_DATA.dialogue.title}</div>
  <div class="cli-text">${PORTFOLIO_DATA.dialogue.text}</div>
  <div class="cli-meta mt-1">
    <span class="cli-magenta">CLASS:</span> FULL-STACK ENGINEER · <span class="cli-cyan">EXP:</span> 6+ YRS PROD · <span class="cli-green">STATUS:</span> ONLINE
  </div>
</div>
    `);
  }

  private cmdSkills() {
    let html = `<div class="cli-block"><div class="cli-cyan font-bold mb-1">EQUIPPED CAPABILITY MATRIX:</div>`;
    PORTFOLIO_DATA.skills.forEach((skill) => {
      const barFill = '█'.repeat(8) + '░'.repeat(2);
      const colorClass = skill.rarity === 'legendary' ? 'cli-amber' : skill.rarity === 'rare' ? 'cli-cyan' : 'cli-dim';
      html += `<div class="cli-row"><span class="${colorClass}">${skill.name.padEnd(20)}</span> <span class="cli-green">[${barFill}]</span> <span class="cli-dim">${skill.level}</span></div>`;
    });
    html += `</div>`;
    this.appendOutput(html);
  }

  private cmdProjects() {
    let html = `<div class="cli-block"><div class="cli-cyan font-bold mb-1">SHIPPED ARSENAL & PROJECTS:</div>`;
    PORTFOLIO_DATA.projects.forEach((proj, idx) => {
      html += `
<div class="cli-project-row">
  <span class="cli-magenta">[0${idx + 1}]</span> <span class="cli-amber font-bold">${proj.title}</span> <span class="cli-dim">(${proj.status})</span><br>
  <span class="cli-text">${proj.tagline}</span><br>
  <span class="cli-dim">STACK:</span> <span class="cli-cyan">${proj.tags.join(', ')}</span><br>
  <a href="${proj.demoUrl}" target="_blank" class="cli-link">↗ LIVE DEMO</a>  <a href="${proj.repoUrl}" target="_blank" class="cli-link">↗ SOURCE REPO</a>
</div>`;
    });
    html += `</div>`;
    this.appendOutput(html);
  }

  private cmdContact() {
    let linksHtml = '';
    PORTFOLIO_DATA.contact.links.forEach((l) => {
      linksHtml += `<div class="cli-row"><span class="cli-amber">${l.cmd}:</span> <a href="${l.href}" target="_blank" class="cli-link">${l.value}</a></div>`;
    });

    this.appendOutput(`
<div class="cli-block">
  <div class="cli-green font-bold mb-1">DIRECT TRANSMISSION UPLINK:</div>
  ${linksHtml}
  <div class="cli-meta mt-1"><span class="cli-cyan">AVAILABILITY:</span> Available for high-impact contracts & senior engineering positions.</div>
</div>
    `);
  }

  private cmdMatrix() {
    if (this.isMatrixRunning) {
      this.stopMatrixRain();
      this.appendOutput(`<div class="cli-text">Matrix simulation halted.</div>`);
    } else {
      this.startMatrixRain();
      this.appendOutput(`<div class="cli-green">Neural Matrix Rain engaged. Type <span class="cli-amber">matrix</span> again to disengage.</div>`);
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
    let result = '';
    if (roll === 100) result = 'CRITICAL OVERCLOCK! (LEGENDARY)';
    else if (roll > 75) result = 'HIGH EFFICIENCY SURGE (RARE)';
    else result = 'STANDARD COMBUSTION';

    this.appendOutput(`
<div class="cli-block">
  <span class="cli-amber">QUANTUM DICE:</span> Rolled <span class="cli-cyan font-bold">${roll}/100</span> — <span class="cli-green">${result}</span>
</div>
    `);
  }

  private cmdSecret() {
    this.appendOutput(`
<div class="cli-block cli-secret-box">
  <div class="cli-magenta font-bold">CLASSIFIED MEMORY DUMP [DECRYPTED]:</div>
  <div class="cli-text">"Built pixel by pixel with custom GSAP timelines, Lenis inertia, and zero cookie-cutter templates. Welcome to the machine."</div>
</div>
    `);
  }

  private cmdClear() {
    if (this.outputEl) this.outputEl.innerHTML = '';
  }

  private handleAutocomplete() {
    const current = this.inputEl?.value.trim() || '';
    const commands = ['help', 'about', 'skills', 'projects', 'contact', 'hire', 'matrix', 'clear', 'game', 'secret'];
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
    line.innerHTML = `<span class="cli-green">visitor@unit07:~$</span> <span class="cli-ink">${escapeHtml(cmd)}</span>`;
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
