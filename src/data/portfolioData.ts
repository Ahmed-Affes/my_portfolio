export type RarityTier = 'legendary' | 'rare' | 'common';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  rarity: RarityTier;
  level: string;
  detail: string;
}

export interface ProjectItem {
  id: string;
  cabinetNumber: string;
  levelTitle: string;
  title: string;
  tagline: string;
  description: string;
  metrics: string;
  tags: string[];
  status: 'SHIPPED' | 'IN DEV';
  statusColor: string;
  accentColor: string;
  demoUrl?: string;
  repoUrl?: string;
}

export const PORTFOLIO_DATA = {
  hero: {
    unit: 'UNIT_07',
    level: 'LVL 04',
    status: 'ONLINE',
    tag: 'BOOT // PORTFOLIO.EXE',
    headline: 'YOUR NAME\nHERE',
    subHeadline: 'Full-stack builder. I ship web, mobile & desktop apps — then talk about it in first person through a robot, apparently.',
    primaryCta: 'VIEW PROJECTS',
    secondaryCta: 'OPEN CHANNEL'
  },
  dialogue: {
    stageTag: 'STAGE 01 — SYSTEM LOG',
    title: 'UNIT_07 Operator Log',
    text: "Boot sequence initiated. I am UNIT_07 — the personal avatar and telemetry core for Alex. For 6+ years, we have engineered responsive distributed systems, crisp interactive web experiences, and microsecond-latency client tools. Everything here is code-driven, hand-tuned, and built to survive production loads. Step into the Data Core or approach an Arcade Cabinet to inspect live archives."
  },
  skills: [
    {
      id: 'js-ts',
      name: 'JavaScript /\nTypeScript',
      category: 'Frontend & Core',
      rarity: 'legendary',
      level: 'LEGENDARY',
      detail: 'Strict typing, AST transforms, modern ESNext runtimes, high-performance DOM architecture and tooling.'
    },
    {
      id: 'react',
      name: 'React',
      category: 'Frontend & UI',
      rarity: 'legendary',
      level: 'LEGENDARY',
      detail: 'Server Components, concurrent rendering, custom hooks, micro-frontends and state management.'
    },
    {
      id: 'node',
      name: 'Node.js',
      category: 'Backend & APIs',
      rarity: 'rare',
      level: 'RARE',
      detail: 'Asynchronous event loops, REST & GraphQL APIs, streaming protocols, microservices.'
    },
    {
      id: 'flutter',
      name: 'Flutter',
      category: 'Mobile & Multiplatform',
      rarity: 'rare',
      level: 'RARE',
      detail: 'Cross-platform mobile applications for iOS & Android with native platform channel integrations.'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      category: 'Databases & Storage',
      rarity: 'rare',
      level: 'RARE',
      detail: 'Relational data modeling, indexing, query optimization, ACID compliance.'
    },
    {
      id: 'electron',
      name: 'Electron',
      category: 'Desktop Systems',
      rarity: 'common',
      level: 'COMMON',
      detail: 'Cross-platform desktop application packaging, IPC security channels, native filesystem access.'
    },
    {
      id: 'docker',
      name: 'Docker',
      category: 'DevOps & Infra',
      rarity: 'common',
      level: 'COMMON',
      detail: 'Containerization, reproducible multi-stage builds, orchestrated deployments.'
    },
    {
      id: 'figma',
      name: 'Figma',
      category: 'Design & UX',
      rarity: 'common',
      level: 'COMMON',
      detail: 'Design system token architecture, wireframes, interaction prototypes and asset pipelines.'
    }
  ] as SkillItem[],
  projects: [
    {
      id: 'proj-1',
      cabinetNumber: '01',
      levelTitle: 'LEVEL 01 — WEB',
      title: 'Project Name One',
      tagline: 'One or two lines on what it does and the problem it solves for the user.',
      description: 'A bespoke web platform combining zero-overhead canvas layers with GSAP timelines and Lenis smooth scrolling. Built to eliminate layout recalculations and deliver 60fps motion.',
      metrics: '60 FPS Locked · 11.2 KB Gzip · 0 Dependencies',
      tags: ['REACT', 'NODE', 'POSTGRES'],
      status: 'SHIPPED',
      statusColor: '#39ff88',
      accentColor: '#4fe3ff',
      demoUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'proj-2',
      cabinetNumber: '02',
      levelTitle: 'LEVEL 02 — MOBILE',
      title: 'Project Name Two',
      tagline: "What it does, who it's for, and one number that proves it worked (users, speed, scale).",
      description: 'High-performance mobile application engineered for seamless real-time syncing, sub-8ms P99 interaction latency, and clean offline-first resilience.',
      metrics: '45,000+ Active Users · <8ms P99 Latency',
      tags: ['FLUTTER', 'FIREBASE'],
      status: 'SHIPPED',
      statusColor: '#39ff88',
      accentColor: '#4fe3ff',
      demoUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'proj-3',
      cabinetNumber: '03',
      levelTitle: 'LEVEL 03 — DESKTOP',
      title: 'Project Name Three',
      tagline: "Currently building — a short line on the goal and what stage it's at.",
      description: 'Local-first desktop application with SQLite embedded storage, background worker threads, and customizable developer workflows.',
      metrics: 'Alpha Stage · 99.99% Reliability Target',
      tags: ['ELECTRON', 'SQLITE'],
      status: 'IN DEV',
      statusColor: '#ff2e88',
      accentColor: '#ff2e88',
      demoUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    {
      id: 'proj-4',
      cabinetNumber: '04',
      levelTitle: 'LEVEL 04 — TOOL',
      title: 'Project Name Four',
      tagline: 'A smaller tool or script with focused utility for everyday automation.',
      description: 'Lightweight developer utility that accelerates continuous integration pipelines and automates asset compression.',
      metrics: 'Real-time CLI · 100% Code Coverage',
      tags: ['TYPESCRIPT', 'CLI'],
      status: 'SHIPPED',
      statusColor: '#39ff88',
      accentColor: '#39ff88',
      demoUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    }
  ] as ProjectItem[],
  contact: {
    stageTag: 'STAGE 04 — SAVE POINT',
    title: 'Continue the session',
    links: [
      { cmd: '> connect --email', value: 'you@example.com', href: 'mailto:you@example.com' },
      { cmd: '> connect --github', value: 'github.com/yourname', href: 'https://github.com' },
      { cmd: '> connect --linkedin', value: 'linkedin.com/in/yourname', href: 'https://linkedin.com' },
      { cmd: '> connect --resume', value: 'download_cv.pdf', href: '#' }
    ],
    footerPrompt: 'GAME OVER — INSERT COIN TO CONTINUE',
    copyright: '© 2026 YOUR NAME · built pixel by pixel, not by template'
  }
};
