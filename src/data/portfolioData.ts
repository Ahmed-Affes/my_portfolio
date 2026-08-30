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
    headline: 'AHMED AFFES',
    subHeadline: 'Full-Stack Software Engineer & Motion Architect. Specializing in high-performance web systems, distributed APIs, and interactive digital interfaces.',
    primaryCta: 'EXPLORE PROJECTS',
    secondaryCta: 'DIRECT UPLINK'
  },
  dialogue: {
    stageTag: 'STAGE 01 — OPERATOR BIO & TELEMETRY',
    title: 'Ahmed Affes // UNIT_07 Bio',
    text: "Boot sequence verified. I am UNIT_07 — telemetry interface for Ahmed Affes. Full-stack engineer crafting high-throughput distributed systems, ultra-responsive web applications, and physics-driven interactive graphics. Everything built here is code-driven, hand-tuned, and engineered to scale under production workloads."
  },
  skills: [
    {
      id: 'js-ts',
      name: 'TypeScript /\nJavaScript',
      category: 'Frontend & Core',
      rarity: 'legendary',
      level: 'LEGENDARY',
      detail: 'Strict typing, AST transforms, modern ESNext runtimes, high-performance DOM architecture, and robust tooling pipelines.'
    },
    {
      id: 'react',
      name: 'React & Next.js',
      category: 'Frontend & UI',
      rarity: 'legendary',
      level: 'LEGENDARY',
      detail: 'Server Components, concurrent rendering, custom hooks, micro-frontends, state stores, and dynamic motion systems.'
    },
    {
      id: 'node',
      name: 'Node.js & Express',
      category: 'Backend & APIs',
      rarity: 'rare',
      level: 'RARE',
      detail: 'Event-driven architectures, REST & GraphQL APIs, streaming protocols, microservices, and high-concurrency workloads.'
    },
    {
      id: 'flutter',
      name: 'Flutter & Dart',
      category: 'Mobile & Multiplatform',
      rarity: 'rare',
      level: 'RARE',
      detail: 'Cross-platform mobile apps for iOS & Android with native platform channel integrations and sub-8ms UI rendering.'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL & SQL',
      category: 'Databases & Storage',
      rarity: 'rare',
      level: 'RARE',
      detail: 'Relational data modeling, advanced indexing, query optimization, ACID transactions, and caching layers.'
    },
    {
      id: 'electron',
      name: 'Electron & Tauri',
      category: 'Desktop Systems',
      rarity: 'common',
      level: 'COMMON',
      detail: 'Cross-platform desktop application packaging, IPC security channels, and native filesystem integrations.'
    },
    {
      id: 'docker',
      name: 'Docker & CI/CD',
      category: 'DevOps & Cloud',
      rarity: 'common',
      level: 'COMMON',
      detail: 'Containerization, reproducible multi-stage builds, orchestrated deployments, and automated testing pipelines.'
    },
    {
      id: 'figma',
      name: 'UI/UX & WebGL',
      category: 'Design & Motion',
      rarity: 'common',
      level: 'COMMON',
      detail: 'Design system token architecture, wireframes, interaction prototypes, WebGL shaders, and GSAP timeline choreography.'
    }
  ] as SkillItem[],
  projects: [
    {
      id: 'proj-1',
      cabinetNumber: '01',
      levelTitle: 'LEVEL 01 — WEB PLATFORM',
      title: 'Cinematic Motion Engine',
      tagline: 'Hardware-accelerated web platform combining zero-overhead canvas layers with GSAP scrub choreography.',
      description: 'Engineered a cinematic web platform utilizing Lenis smooth inertia scrolling, custom Web Audio synthesis, and procedural canvas rendering with zero layout thrashing.',
      metrics: '60 FPS Locked · 0ms Frame Drops · 100% Code-Driven',
      tags: ['TYPESCRIPT', 'GSAP', 'CANVAS', 'LENIS'],
      status: 'SHIPPED',
      statusColor: '#39ff88',
      accentColor: '#4fe3ff',
      demoUrl: 'https://github.com/Ahmed-Affes',
      repoUrl: 'https://github.com/Ahmed-Affes'
    },
    {
      id: 'proj-2',
      cabinetNumber: '02',
      levelTitle: 'LEVEL 02 — MOBILE APP',
      title: 'Real-Time Sync Platform',
      tagline: 'Offline-first cross-platform mobile application with sub-8ms state synchronization and cloud cache.',
      description: 'High-performance mobile application engineered for seamless real-time syncing, sub-8ms P99 interaction latency, and resilient offline-first data persistence.',
      metrics: 'Sub-8ms P99 Latency · Offline-First · Multiplatform',
      tags: ['FLUTTER', 'DART', 'FIREBASE', 'REST API'],
      status: 'SHIPPED',
      statusColor: '#39ff88',
      accentColor: '#4fe3ff',
      demoUrl: 'https://github.com/Ahmed-Affes',
      repoUrl: 'https://github.com/Ahmed-Affes'
    },
    {
      id: 'proj-3',
      cabinetNumber: '03',
      levelTitle: 'LEVEL 03 — DESKTOP SYSTEM',
      title: 'Local-First Dev Suite',
      tagline: 'Local-first desktop application with embedded storage and background worker threads for developers.',
      description: 'Cross-platform desktop application featuring embedded SQLite storage, asynchronous background worker threads, and customizable developer automation workflows.',
      metrics: '99.9% Reliability · Low Memory Footprint · Zero Cloud Dependency',
      tags: ['ELECTRON', 'TYPESCRIPT', 'SQLITE', 'NODE.JS'],
      status: 'IN DEV',
      statusColor: '#ffb238',
      accentColor: '#ffb238',
      demoUrl: 'https://github.com/Ahmed-Affes',
      repoUrl: 'https://github.com/Ahmed-Affes'
    },
    {
      id: 'proj-4',
      cabinetNumber: '04',
      levelTitle: 'LEVEL 04 — DEVELOPER TOOL',
      title: 'Interactive CLI Terminal Engine',
      tagline: 'Lightweight procedural command dispatch engine with Matrix rain simulation and hardware diagnostics.',
      description: 'In-browser interactive cyber terminal featuring command execution, history buffer navigation, autocomplete, audio synthesis, and live system diagnostics.',
      metrics: 'Zero External UI Dependencies · <12KB Gzip · 100% TypeScript',
      tags: ['TYPESCRIPT', 'WEB AUDIO', 'TERMINAL', 'ALGORITHMS'],
      status: 'SHIPPED',
      statusColor: '#39ff88',
      accentColor: '#39ff88',
      demoUrl: 'https://github.com/Ahmed-Affes',
      repoUrl: 'https://github.com/Ahmed-Affes'
    }
  ] as ProjectItem[],
  contact: {
    stageTag: 'STAGE 04 — DIRECT UPLINK',
    title: 'Connect with Ahmed Affes',
    links: [
      { cmd: '> connect --email', value: 'c0der.devl0pper@gmail.com', href: 'mailto:c0der.devl0pper@gmail.com' },
      { cmd: '> connect --github', value: 'github.com/Ahmed-Affes', href: 'https://github.com/Ahmed-Affes' },
      { cmd: '> connect --linkedin', value: 'linkedin.com/in/ahmed-affes', href: 'https://www.linkedin.com/in/ahmed-affes-a8778942a/' },
      { cmd: '> connect --resume', value: 'Ahmed_Affes_CV_2026.pdf', href: '/Ahmed_Affes_CV_2026.pdf' }
    ],
    footerPrompt: 'INITIALIZE DIRECT UPLINK // OPEN FOR HIGH-IMPACT ROLES',
    copyright: '© 2026 AHMED AFFES · built pixel by pixel, not by template'
  }
};
