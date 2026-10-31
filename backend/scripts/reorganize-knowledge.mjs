/**
 * One-shot reorganizer: flatten root dumps → loader-compatible knowledge tree.
 * Preserves original bodies; rewrites frontmatter to API schema.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  cpSync,
  readdirSync,
  statSync,
  rmSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import matter from 'gray-matter';

const ROOT = join(process.cwd(), 'knowledge');
const ARCHIVE = join(ROOT, '_archive');

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function write(path, content) {
  ensureDir(dirname(path));
  writeFileSync(path, content, 'utf8');
}

function stripFrontmatter(raw) {
  const parsed = matter(raw);
  return { data: parsed.data ?? {}, body: parsed.content.trim() };
}

function toRepoSlug(url) {
  if (!url || typeof url !== 'string') return undefined;
  const match = url.match(/github\.com\/([^/]+\/[^/#?\s]+)/i);
  return match ? match[1].replace(/\.git$/, '') : undefined;
}

function firstParagraph(body) {
  return (
    body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith('#') && !p.startsWith('---')) ?? ''
  ).slice(0, 400);
}

function yamlEscape(value) {
  if (value == null) return '';
  const s = String(value);
  if (/[:#{}[\],&*?|<>=!%@`]/.test(s) || s.includes('\n') || s.includes('"')) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

function dumpFrontmatter(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else if (value.every((v) => typeof v === 'string')) {
        lines.push(`${key}: [${value.map((v) => yamlEscape(v)).join(', ')}]`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${yamlEscape(item)}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value)) {
        if (v === undefined || v === null || v === '') continue;
        lines.push(`  ${k}: ${yamlEscape(v)}`);
      }
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${yamlEscape(value)}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

function archiveIfExists(relativePath) {
  const src = join(ROOT, relativePath);
  if (!existsSync(src)) return;
  const dest = join(ARCHIVE, relativePath);
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
}

// --- Project catalog (portfolio + Venwiz workstreams as grillable projects) ---
const PROJECTS = [
  {
    file: 'precision-backend.md',
    id: 'precision',
    title: 'PReCision — AI-powered code review',
    stack: ['TypeScript', 'NestJS', 'LangGraph', 'MongoDB Atlas Vector Search', 'Gemini', 'Docker'],
    skillIds: ['typescript', 'nestjs', 'mongodb', 'langgraph', 'rag', 'gemini'],
    evidenceIds: ['github-precision', 'demo-precision'],
  },
  {
    file: 'precision-frontend.md',
    id: 'precision-frontend',
    title: 'PReCision Frontend',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Redux Toolkit'],
    skillIds: ['react', 'typescript', 'redux'],
    evidenceIds: ['github-precision-fe', 'demo-precision'],
  },
  {
    file: 'aahaar.md',
    id: 'aahaar',
    title: 'AAHAAR — surplus-food rescue platform',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'AWS S3'],
    skillIds: ['react', 'nodejs', 'mongodb', 'aws-s3'],
    evidenceIds: ['github-aahaar', 'demo-aahaar'],
  },
  {
    file: 'stock-picker-agent.md',
    id: 'stock-picker-agent',
    title: 'Stock Picker Agent',
    stack: ['CrewAI', 'OpenAI', 'LangChain', 'SQLite'],
    skillIds: ['crewai', 'python', 'langchain'],
    evidenceIds: ['github-stock-picker'],
  },
  {
    file: 'quirkypost.md',
    id: 'quirkypost',
    title: 'QuirkyPost — MERN blogging platform',
    stack: ['React', 'MongoDB', 'JWT', 'Redux', 'Gemini'],
    skillIds: ['react', 'mongodb', 'jwt', 'redux', 'gemini'],
    evidenceIds: ['github-quirkypost', 'linkedin-quirkypost'],
  },
  {
    file: 'airline-reservation-system.md',
    id: 'airline-reservation-system',
    title: 'Airline Reservation System',
    stack: [],
    skillIds: [],
    evidenceIds: ['github-airline'],
  },
  {
    file: 'twitter-clone.md',
    id: 'twitter-clone',
    title: 'Twitter Clone',
    stack: [],
    skillIds: [],
    evidenceIds: ['github-twitter-clone'],
  },
  {
    file: 'ecommerce-platform.md',
    id: 'ecommerce-platform',
    title: 'Ecommerce Platform',
    stack: [],
    skillIds: [],
    evidenceIds: ['github-ecommerce'],
  },
  {
    file: 'offline-first-mobile.md',
    id: 'offline-first-mobile',
    title: 'MMT Offline-first mobile sync',
    stack: ['React Native', 'Expo', 'TypeScript'],
    skillIds: ['react-native', 'typescript', 'expo'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'workspace-insights-hawkai.md',
    id: 'workspace-insights-hawkai',
    title: 'Workspace Insights / HawkAI',
    stack: ['NestJS', 'MongoDB', 'AWS S3', 'Google ADK'],
    skillIds: ['nestjs', 'mongodb', 'aws-s3', 'google-adk'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'status-engine.md',
    id: 'status-engine',
    title: 'Status Intelligence Engine (statusData v2)',
    stack: ['TypeScript', 'NestJS', 'MongoDB'],
    skillIds: ['typescript', 'nestjs', 'mongodb'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'po-ingestion.md',
    id: 'po-ingestion',
    title: 'L&T Excel-to-PO ingestion',
    stack: ['TypeScript', 'NestJS', 'MongoDB'],
    skillIds: ['typescript', 'nestjs', 'mongodb'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'scheduled-pipelines.md',
    id: 'scheduled-pipelines',
    title: 'Scheduled and event-driven pipelines',
    stack: ['TypeScript', 'NestJS'],
    skillIds: ['typescript', 'nestjs', 'pipelines'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'rich-text-security.md',
    id: 'rich-text-security',
    title: 'Rich-text comments and XSS mitigation',
    stack: ['TypeScript'],
    skillIds: ['typescript', 'security'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'access-control.md',
    id: 'access-control',
    title: 'UAC / RBAC access control',
    stack: ['TypeScript', 'NestJS'],
    skillIds: ['typescript', 'nestjs', 'rbac'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'production-support.md',
    id: 'production-support',
    title: 'Production support, releases, mentoring',
    stack: ['Expo EAS'],
    skillIds: ['expo', 'mentoring'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
  {
    file: 'issue-tracking-and-activity.md',
    id: 'issue-tracking-and-activity',
    title: 'Issue tracking and activity logging',
    stack: ['TypeScript'],
    skillIds: ['typescript'],
    evidenceIds: ['experience-venwiz'],
    workstream: true,
  },
];

const EVIDENCE = [
  {
    id: 'github-precision',
    title: 'PReCision backend repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/PReCision',
    supports: 'Public repository for PReCision AI code review backend',
    projectIds: ['precision'],
    skillIds: ['nestjs', 'langgraph', 'rag'],
  },
  {
    id: 'github-precision-fe',
    title: 'PReCision frontend repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/PReCision-Fe',
    supports: 'Companion frontend for PReCision',
    projectIds: ['precision-frontend'],
    skillIds: ['react', 'typescript'],
  },
  {
    id: 'demo-precision',
    title: 'PReCision demo',
    type: 'demo',
    url: 'https://precision-fe.onrender.com',
    supports: 'Demo URL listed in supplied resumes; live status should be verified',
    projectIds: ['precision', 'precision-frontend'],
    skillIds: [],
  },
  {
    id: 'github-aahaar',
    title: 'AAHAAR repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/Aahaar',
    supports: 'Public repository for AAHAAR',
    projectIds: ['aahaar'],
    skillIds: ['react', 'nodejs'],
  },
  {
    id: 'demo-aahaar',
    title: 'AAHAAR demo',
    type: 'demo',
    url: 'https://aahaar-seven.vercel.app',
    supports: 'Demo URL listed in supplied resumes; live status should be verified',
    projectIds: ['aahaar'],
    skillIds: [],
  },
  {
    id: 'github-stock-picker',
    title: 'Stock Picker Agent repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/stock_picker_agent',
    supports: 'Public repository for Stock Picker Agent',
    projectIds: ['stock-picker-agent'],
    skillIds: ['crewai'],
  },
  {
    id: 'github-quirkypost',
    title: 'QuirkyPost repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/QuirkyPost',
    supports: 'Public repository for QuirkyPost',
    projectIds: ['quirkypost'],
    skillIds: ['react', 'mongodb'],
  },
  {
    id: 'linkedin-quirkypost',
    title: 'QuirkyPost LinkedIn post',
    type: 'linkedin-post',
    url: 'https://www.linkedin.com/posts/shivanshsri15_mernstack-quirkypost-bloggingplatform-activity-7283915866037968897-0VRd',
    supports: 'First-party feature description for QuirkyPost (not a code audit)',
    projectIds: ['quirkypost'],
    skillIds: [],
  },
  {
    id: 'github-airline',
    title: 'Airline Reservation System repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/airline-reservation-system',
    supports: 'Public repository; detailed claims pending source review',
    projectIds: ['airline-reservation-system'],
    skillIds: [],
  },
  {
    id: 'github-twitter-clone',
    title: 'Twitter Clone repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/TwitterCloneV1',
    supports: 'Public repository; detailed claims pending source review',
    projectIds: ['twitter-clone'],
    skillIds: [],
  },
  {
    id: 'github-ecommerce',
    title: 'Ecommerce Platform repository',
    type: 'github-repo',
    url: 'https://github.com/Shivanshsri15/EcommercePlatformV1',
    supports: 'Public repository; detailed claims pending source review',
    projectIds: ['ecommerce-platform'],
    skillIds: [],
  },
  {
    id: 'github-profile',
    title: 'GitHub profile',
    type: 'github-profile',
    url: 'https://github.com/Shivanshsri15',
    supports: 'Public GitHub profile for Shivansh Srivastava',
    projectIds: [],
    skillIds: [],
  },
  {
    id: 'linkedin-profile',
    title: 'LinkedIn profile',
    type: 'linkedin-profile',
    url: 'https://www.linkedin.com/in/Shivanshsri15',
    supports: 'Owner-supplied LinkedIn profile URL',
    projectIds: [],
    skillIds: [],
  },
  {
    id: 'experience-venwiz',
    title: 'Venwiz professional experience record',
    type: 'experience-record',
    supports: 'Owner-supplied resumes and mock-interview notes for Venwiz/MMT work',
    projectIds: [
      'offline-first-mobile',
      'workspace-insights-hawkai',
      'status-engine',
      'po-ingestion',
      'scheduled-pipelines',
      'rich-text-security',
      'access-control',
      'production-support',
      'issue-tracking-and-activity',
    ],
    skillIds: ['typescript', 'nestjs', 'mongodb'],
  },
  {
    id: 'evidence-policy',
    title: 'Evidence and accuracy policy',
    type: 'policy',
    supports: 'Claim boundaries, discrepancies, and uncertain-answer rules for the knowledge base',
    projectIds: [],
    skillIds: [],
  },
  {
    id: 'source-register',
    title: 'Source register and provenance',
    type: 'source-register',
    supports: 'Inventory of resumes, transcript, GitHub, and LinkedIn sources used to build this KB',
    projectIds: [],
    skillIds: [],
  },
];

const SKILLS = [
  { id: 'typescript', name: 'TypeScript / JavaScript', level: 'production', projectIds: ['precision', 'offline-first-mobile', 'status-engine', 'po-ingestion', 'scheduled-pipelines'], evidenceIds: ['experience-venwiz'] },
  { id: 'nestjs', name: 'Node.js / NestJS', level: 'production', projectIds: ['precision', 'workspace-insights-hawkai', 'status-engine', 'po-ingestion'], evidenceIds: ['experience-venwiz', 'github-precision'] },
  { id: 'mongodb', name: 'MongoDB / Mongoose', level: 'production', projectIds: ['precision', 'workspace-insights-hawkai', 'aahaar', 'quirkypost'], evidenceIds: ['experience-venwiz'] },
  { id: 'pipelines', name: 'Scheduled / event-driven pipelines', level: 'production', projectIds: ['scheduled-pipelines'], evidenceIds: ['experience-venwiz'] },
  { id: 'react-native', name: 'React Native / Expo', level: 'production', projectIds: ['offline-first-mobile'], evidenceIds: ['experience-venwiz'] },
  { id: 'expo', name: 'Expo / EAS', level: 'production', projectIds: ['offline-first-mobile', 'production-support'], evidenceIds: ['experience-venwiz'] },
  { id: 'aws-s3', name: 'AWS S3', level: 'production', projectIds: ['workspace-insights-hawkai', 'aahaar'], evidenceIds: ['experience-venwiz'] },
  { id: 'rbac', name: 'UAC / RBAC', level: 'production', projectIds: ['access-control'], evidenceIds: ['experience-venwiz'] },
  { id: 'security', name: 'Rich-text sanitization / XSS mitigation', level: 'production', projectIds: ['rich-text-security'], evidenceIds: ['experience-venwiz'] },
  { id: 'mentoring', name: 'Mentoring / code review', level: 'production', projectIds: ['production-support'], evidenceIds: ['experience-venwiz'] },
  { id: 'rag', name: 'RAG', level: 'project', projectIds: ['precision'], evidenceIds: ['github-precision'] },
  { id: 'langgraph', name: 'LangGraph', level: 'project', projectIds: ['precision'], evidenceIds: ['github-precision'] },
  { id: 'gemini', name: 'Gemini / LLM APIs', level: 'project', projectIds: ['precision', 'quirkypost'], evidenceIds: ['github-precision'] },
  { id: 'google-adk', name: 'Google ADK', level: 'project', projectIds: ['workspace-insights-hawkai'], evidenceIds: ['experience-venwiz'] },
  { id: 'crewai', name: 'CrewAI', level: 'project', projectIds: ['stock-picker-agent'], evidenceIds: ['github-stock-picker'] },
  { id: 'langchain', name: 'LangChain', level: 'project', projectIds: ['stock-picker-agent'], evidenceIds: ['github-stock-picker'] },
  { id: 'python', name: 'Python', level: 'project', projectIds: ['stock-picker-agent'], evidenceIds: ['github-stock-picker'] },
  { id: 'react', name: 'React', level: 'project', projectIds: ['precision-frontend', 'aahaar', 'quirkypost'], evidenceIds: ['github-precision-fe'] },
  { id: 'redux', name: 'Redux Toolkit', level: 'project', projectIds: ['precision-frontend', 'quirkypost'], evidenceIds: [] },
  { id: 'nodejs', name: 'Node.js / Express', level: 'project', projectIds: ['aahaar'], evidenceIds: ['github-aahaar'] },
  { id: 'jwt', name: 'JWT authentication', level: 'project', projectIds: ['aahaar', 'quirkypost'], evidenceIds: [] },
  { id: 'docker', name: 'Docker', level: 'project', projectIds: ['precision'], evidenceIds: ['github-precision'] },
  { id: 'aws', name: 'AWS (EC2, IAM, Amplify)', level: 'learning', projectIds: [], evidenceIds: [], summary: 'Listed on resumes; preparing for AWS Solutions Architect Associate — not a completed certification claim' },
  { id: 'system-design', name: 'System design', level: 'learning', projectIds: [], evidenceIds: [], summary: 'Owner-stated learning priority' },
  { id: 'dsa', name: 'DSA / coding problem solving', level: 'learning', projectIds: [], evidenceIds: [], summary: 'Owner-stated learning priority' },
];

function findSource(fileName) {
  const candidates = [
    join(ROOT, fileName),
    join(ROOT, 'projects', fileName),
    join(ROOT, 'experience', fileName),
  ];
  return candidates.find((p) => existsSync(p));
}

function buildProjectFile(spec) {
  const srcPath = findSource(spec.file);
  if (!srcPath) {
    console.warn(`Missing source for project ${spec.file}`);
    return;
  }
  const raw = read(srcPath);
  const { data, body } = stripFrontmatter(raw);
  const repo =
    toRepoSlug(data.repository) ||
    toRepoSlug(typeof data.repository === 'string' ? data.repository : undefined);
  const summary =
    firstParagraph(body) ||
    (typeof data.name === 'string' ? data.name : spec.title);

  const notes = [];
  if (spec.workstream) {
    notes.push(
      '> **Context:** Venwiz Technologies / MMT professional workstream. See `experience/venwiz.md`.',
      '',
    );
  }

  const content =
    dumpFrontmatter({
      id: spec.id,
      title: spec.title,
      summary: summary.replace(/\n/g, ' ').slice(0, 280),
      stack: spec.stack,
      repo: repo || undefined,
      defaultBranch: 'main',
      readmeSync: Boolean(repo),
      skillIds: spec.skillIds,
      evidenceIds: spec.evidenceIds,
      visibility: 'public',
    }) +
    notes.join('\n') +
    body +
    '\n';

  write(join(ROOT, 'projects', `${spec.id}.md`), content);
  console.log(`project: ${spec.id}`);
}

function buildVenwizExperience() {
  const srcPath = findSource('venwiz.md');
  if (!srcPath) throw new Error('venwiz.md missing');
  const { body } = stripFrontmatter(read(srcPath));
  const content =
    dumpFrontmatter({
      id: 'venwiz',
      company: 'Venwiz Technologies',
      role: 'Software Engineer Intern',
      dates: 'August 2025 — September 2026',
      summary:
        'Backend and product engineering on the Milestone Management Tool (MMT) for enterprise manufacturing workflows.',
      skillIds: [
        'typescript',
        'nestjs',
        'mongodb',
        'react-native',
        'pipelines',
        'rbac',
      ],
      visibility: 'public',
    }) +
    body +
    '\n';
  write(join(ROOT, 'experience', 'venwiz.md'), content);
  console.log('experience: venwiz');
}

function buildProfile() {
  const profileSrc = findSource('profile.md');
  const educationSrc = findSource('education-achievements.md');
  const careerSrc = findSource('career-context.md');
  const contactSrc = findSource('contact.md');

  const profileBody = profileSrc ? stripFrontmatter(read(profileSrc)).body : '';
  // If original was YAML-only content in frontmatter, gray-matter puts most in data and empty body.
  // Preserve the full original file in archive and embed a readable markdown summary + pointer.
  if (profileSrc) {
    archiveIfExists('profile.md');
    copyFileSync(profileSrc, join(ARCHIVE, 'profile.original.md'));
  }

  const educationBody = educationSrc
    ? stripFrontmatter(read(educationSrc)).body
    : '';
  const careerBody = careerSrc ? stripFrontmatter(read(careerSrc)).body : '';
  const contactBody = contactSrc ? stripFrontmatter(read(contactSrc)).body : '';

  // Prefer keeping original profile text if body empty: dump original raw after frontmatter
  let detailed = profileBody;
  if (!detailed && profileSrc) {
    detailed = read(profileSrc);
  }

  const content =
    dumpFrontmatter({
      name: 'Shivansh Srivastava',
      headline: 'Backend Software Engineer | Agentic AI & Full-Stack Systems',
      summary:
        'Software engineer focused on backend systems, TypeScript, Node.js/NestJS, MongoDB, and applied AI. Experience at Venwiz Technologies on enterprise SaaS workflows including data ingestion, scheduled pipelines, status consistency, access control, AI-assisted insights, and offline-first mobile sync. Independent projects include PReCision (AI code review) and AAHAAR (surplus-food rescue platform).',
      visibility: 'public',
      contactEnabled: true,
      links: {
        github: 'https://github.com/Shivanshsri15',
        linkedin: 'https://www.linkedin.com/in/Shivanshsri15',
        email: 'Srivastavashivansh295@gmail.com',
      },
    }) +
    `# Shivansh Srivastava

Software engineer focused on **backend systems**, TypeScript, Node.js/NestJS, MongoDB, and applied AI.

## Education

${educationBody || '- B.Tech CSE (Data Science), ABES Engineering College / AKTU, expected 2027.'}

## Contact

${contactBody || '- GitHub, LinkedIn, and email are listed in frontmatter. Phone is intentionally omitted from public files.'}

## Career direction

${careerBody || 'See archived career-context source for stated learning priorities (DSA, AWS SAA prep, system design, deeper backend and AI engineering).'}

## Accuracy notes

- Do not invent metrics, dates, features, or personal stories.
- Resume metrics are self-reported unless measurement methodology is documented.
- Phone number must stay out of public-facing files.
- No scheduling URL has been supplied.

## Detailed structured profile (source)

The following preserves the owner-supplied comprehensive profile draft used as the portfolio index.

${detailed}
`;

  write(join(ROOT, 'profile.md'), content);
  console.log('profile.md written');
}

function buildSkills() {
  const original = findSource('skills.md');
  if (original) {
    archiveIfExists('skills.md');
    copyFileSync(original, join(ARCHIVE, 'skills.original.md'));
  }
  const originalBody = original ? stripFrontmatter(read(original)).body : '';

  const skillsYaml = SKILLS.map((s) => {
    const lines = [
      `  - id: ${s.id}`,
      `    name: ${yamlEscape(s.name)}`,
      `    level: ${s.level}`,
    ];
    if (s.summary) lines.push(`    summary: ${yamlEscape(s.summary)}`);
    lines.push(
      `    projectIds: [${s.projectIds.join(', ')}]`,
      `    evidenceIds: [${s.evidenceIds.join(', ')}]`,
    );
    return lines.join('\n');
  }).join('\n');

  const content = `---
skills:
${skillsYaml}
---

# Skills evidence notes

These skill records power Skill Explorer. Levels:

- **production** — explicitly described in Venwiz professional work
- **project** — tied to an independent/portfolio project
- **learning** — owner-stated learning priority (not certification completion)

${originalBody}
`;
  write(join(ROOT, 'skills.md'), content);
  console.log('skills.md written');
}

function buildEvidenceFiles() {
  const policySrc = findSource('evidence-and-accuracy.md');
  const registerSrc = findSource('source-register.md');
  const historicalSrc = findSource('historical-projects.md');
  const otherReposSrc = findSource('other-repositories.md');

  for (const ev of EVIDENCE) {
    let body = `${ev.supports}\n`;
    if (ev.id === 'evidence-policy' && policySrc) {
      body = stripFrontmatter(read(policySrc)).body;
    }
    if (ev.id === 'source-register' && registerSrc) {
      body = stripFrontmatter(read(registerSrc)).body;
    }
    const content =
      dumpFrontmatter({
        id: ev.id,
        title: ev.title,
        type: ev.type,
        url: ev.url,
        supports: ev.supports,
        projectIds: ev.projectIds,
        skillIds: ev.skillIds,
        visibility: 'public',
      }) +
      body +
      '\n';
    write(join(ROOT, 'evidence', `${ev.id}.md`), content);
  }

  if (historicalSrc) {
    const { body } = stripFrontmatter(read(historicalSrc));
    write(
      join(ROOT, 'evidence', 'historical-projects.md'),
      dumpFrontmatter({
        id: 'historical-projects',
        title: 'Historical projects index',
        type: 'project-index',
        supports: 'Index of historical/portfolio projects with limited verified detail',
        projectIds: [
          'airline-reservation-system',
          'twitter-clone',
          'ecommerce-platform',
        ],
        skillIds: [],
        visibility: 'public',
      }) +
        body +
        '\n',
    );
  }

  if (otherReposSrc) {
    const { body } = stripFrontmatter(read(otherReposSrc));
    write(
      join(ROOT, 'evidence', 'other-repositories.md'),
      dumpFrontmatter({
        id: 'other-repositories',
        title: 'Other repositories index',
        type: 'project-index',
        supports: 'Additional public repositories with limited verified detail',
        projectIds: [],
        skillIds: [],
        visibility: 'public',
      }) +
        body +
        '\n',
    );
  }

  console.log('evidence files written');
}

function buildStories() {
  const src = findSource('interview-stories.md');
  if (!src) {
    console.warn('interview-stories.md missing');
    return;
  }
  archiveIfExists('interview-stories.md');
  const { body } = stripFrontmatter(read(src));

  // Keep full document as one story collection + split major STAR sections
  write(
    join(ROOT, 'stories', 'interview-narratives.md'),
    dumpFrontmatter({
      id: 'interview-narratives',
      title: 'Interview narratives and follow-up preparation',
      summary:
        'Evidence-grounded interview narratives covering Venwiz workstreams, PReCision, mentoring, and growth areas.',
      tags: ['interview', 'storytelling', 'career'],
      projectIds: [
        'offline-first-mobile',
        'status-engine',
        'workspace-insights-hawkai',
        'po-ingestion',
        'precision',
        'rich-text-security',
      ],
      skillIds: ['typescript', 'nestjs', 'rag'],
      visibility: 'public',
    }) +
      body +
      '\n',
  );

  const storySplits = [
    {
      id: 'story-offline-sync',
      title: 'Challenging problem: offline synchronization',
      tags: ['debugging', 'mobile', 'sync'],
      projectIds: ['offline-first-mobile'],
      skillIds: ['react-native', 'typescript'],
      match: /## 2\. Challenging technical problem: offline synchronization([\s\S]*?)(?=\n## 3\.|$)/,
    },
    {
      id: 'story-status-consistency',
      title: 'Data consistency: statusData v2',
      tags: ['architecture', 'consistency'],
      projectIds: ['status-engine'],
      skillIds: ['nestjs', 'mongodb'],
      match: /## 4\. Data consistency: statusData v2([\s\S]*?)(?=\n## 5\.|$)/,
    },
    {
      id: 'story-hawkai-tradeoff',
      title: 'Architectural trade-off: deterministic logic plus LLM synthesis',
      tags: ['architecture', 'ai'],
      projectIds: ['workspace-insights-hawkai'],
      skillIds: ['google-adk', 'mongodb'],
      match: /## 3\. Architectural trade-off: deterministic logic plus LLM synthesis([\s\S]*?)(?=\n## 4\.|$)/,
    },
    {
      id: 'story-precision',
      title: 'AI project: PReCision',
      tags: ['ai', 'rag', 'code-review'],
      projectIds: ['precision'],
      skillIds: ['rag', 'langgraph', 'nestjs'],
      match: /## 6\. AI project: PReCision([\s\S]*?)(?=\n## 7\.|$)/,
    },
    {
      id: 'story-rich-text-security',
      title: 'Security and cross-platform consistency',
      tags: ['security', 'xss'],
      projectIds: ['rich-text-security'],
      skillIds: ['security'],
      match: /## 7\. Security and cross-platform consistency([\s\S]*?)(?=\n## 8\.|$)/,
    },
  ];

  for (const story of storySplits) {
    const m = body.match(story.match);
    if (!m) continue;
    const section = m[0].trim();
    write(
      join(ROOT, 'stories', `${story.id}.md`),
      dumpFrontmatter({
        id: story.id,
        title: story.title,
        summary: firstParagraph(section).replace(/^#+\s*/, '').slice(0, 240),
        tags: story.tags,
        projectIds: story.projectIds,
        skillIds: story.skillIds,
        visibility: 'public',
      }) +
        section +
        '\n',
    );
  }
  console.log('stories written');
}

function buildResumesAndSources() {
  ensureDir(join(ROOT, 'resume'));
  ensureDir(join(ROOT, 'sources'));

  const resumeMap = [
    ['resume-backend.txt', 'backend.md'],
    ['resume-ai.txt', 'ai.md'],
    ['resume-fullstack.txt', 'generic.md'],
  ];
  for (const [srcName, destName] of resumeMap) {
    const src = join(ROOT, srcName);
    if (!existsSync(src)) continue;
    const text = read(src);
    write(
      join(ROOT, 'resume', destName),
      dumpFrontmatter({
        variant: destName.replace(/\.md$/, ''),
        title: `Resume extract (${destName.replace(/\.md$/, '')})`,
        visibility: 'public',
        note: 'Text extract from owner-supplied PDF; phone redacted. Original PDFs remain the canonical resume artifacts for Phase 4 PDF pipeline.',
      }) +
        text +
        '\n',
    );
    copyFileSync(src, join(ROOT, 'sources', srcName));
  }

  for (const name of [
    'mock-interview-transcript.txt',
    'linkedin-quirkypost-post.txt',
    'github-stock-picker-readme.txt',
  ]) {
    const src = join(ROOT, name);
    if (existsSync(src)) copyFileSync(src, join(ROOT, 'sources', name));
  }

  console.log('resume + sources prepared');
}

function cleanupRootClutter() {
  const keepRoot = new Set([
    'profile.md',
    'skills.md',
    'AUTHORING.md',
    'README.md',
    'experience',
    'projects',
    'evidence',
    'stories',
    'resume',
    'sources',
    '_archive',
  ]);

  for (const entry of readdirSync(ROOT)) {
    if (keepRoot.has(entry)) continue;
    const full = join(ROOT, entry);
    const dest = join(ARCHIVE, 'root-dump', entry);
    ensureDir(dirname(dest));
    cpSync(full, dest, { recursive: true });
    rmSync(full, { recursive: true, force: true });
    console.log(`archived+removed root: ${entry}`);
  }
}

function writeKnowledgeReadme() {
  write(
    join(ROOT, 'README.md'),
    `# Knowledge base (loader-compatible)

Owner: **Shivansh Srivastava**  
Organized for the Why Not Grill Me? NestJS knowledge loader.

## Layout

\`\`\`
knowledge/
  profile.md
  skills.md
  experience/          # employer roles (Venwiz)
  projects/            # portfolio projects + Venwiz workstreams
  evidence/            # receipts, repos, demos, policy
  stories/             # interview narratives
  resume/              # text extracts (generic/backend/ai) until PDF pipeline
  sources/             # original extracts (transcript, LinkedIn, READMEs)
  _archive/            # originals preserved before reorganization
  AUTHORING.md
\`\`\`

## Rules preserved from source package

- Do not invent facts, metrics, dates, or features.
- Separate production work, projects, and learning.
- Keep phone number out of public-facing files.
- Resume metrics are self-reported unless methodology is documented.
- Synced GitHub READMEs (Phase 4) must not overwrite curated project Markdown.

See \`evidence/evidence-policy.md\` and \`evidence/source-register.md\` for provenance.
`,
  );
}

// --- run ---
ensureDir(ARCHIVE);
ensureDir(join(ROOT, 'projects'));
ensureDir(join(ROOT, 'experience'));
ensureDir(join(ROOT, 'evidence'));
ensureDir(join(ROOT, 'stories'));
ensureDir(join(ROOT, 'resume'));
ensureDir(join(ROOT, 'sources'));

for (const p of PROJECTS) buildProjectFile(p);
buildVenwizExperience();
buildProfile();
buildSkills();
buildEvidenceFiles();
buildStories();
buildResumesAndSources();
cleanupRootClutter();
writeKnowledgeReadme();

console.log('\\nDone. Run knowledge loader / tests to validate.');
