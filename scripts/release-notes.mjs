import { readFileSync, writeFileSync } from 'node:fs';

const [, , tag, output] = process.argv;
if (!tag || !output) {
  throw new Error('Usage: node scripts/release-notes.mjs <tag> <output>');
}

const version = tag.replace(/^v/, '');
if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Invalid release tag: ${tag}`);
}

const changelog = readFileSync(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
const sections = [...changelog.matchAll(/^##\s+(.+?)\s*$\r?\n([\s\S]*?)(?=^##\s+|(?![\s\S]))/gm)];
const versionSection = sections.find((match) => match[1].split(/\s+-\s+/)[0] === version);
let notes = versionSection?.[2].trim();

if (!notes) {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  if (pkg.version !== version) {
    throw new Error(`CHANGELOG.md has no ${version} section and package version is ${pkg.version}`);
  }
  notes = sections.find((match) => /^(Unreleased|未发布)$/.test(match[1]))?.[2].trim();
}

if (!notes) throw new Error(`No release notes found for ${tag}`);
writeFileSync(output, `${notes}\n`, 'utf8');
