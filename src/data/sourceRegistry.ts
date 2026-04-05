import { createHash } from 'node:crypto';

export interface SourceReference {
  id: string;
  canonicalLabel: string;
  apaCitation: string | null;
  url: string | null;
  kind: 'publication' | 'internal';
  aliases: string[];
}

export interface SourceResolution {
  sourceIds: string[] | null;
  sourceFingerprint: string | null;
  unresolvedLabels: string[];
}

export const SOURCE_REGISTRY: SourceReference[] = [
  {
    id: 'alma_ayahuasca_medication_interactions_2025',
    canonicalLabel: 'Alma Healing Center-Ayahuasca and medication interactions.pdf',
    apaCitation:
      'Alma Healing Center. (2025). Ayahuasca and medication interactions. Alma Healing Center.',
    url: 'https://almahealingcenter.com',
    kind: 'publication',
    aliases: [
      'ayahuasca-interactions.pdf',
      'ayahuasca-interactions.pdf (p1 text)',
      'Alma Healing Center-Ayahuasca and medication interactions.pdf',
      'Ayahuasca and medication interactions',
    ],
  },
  {
    id: 'malcolm_ayahuasca_drug_interaction_2022',
    canonicalLabel: 'Ayahuasca and Drug Interaction.pdf',
    apaCitation:
      'Malcolm, B. (2022). Ayahuasca and Drug Interaction: The Good, the Bad, and the Soul. University of Connecticut.',
    url: 'https://share.google/go3FfRMyYvxSJr99v',
    kind: 'publication',
    aliases: [
      'Ayahuasca and Drug Interaction.pdf',
      'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)',
      'Ayahuasca and Drug Interaction.pdf (Good combinations caveat)',
      'Ayahuasca and Drug Interaction.pdf (The Good slide)',
      'Ayahuasca and Drug Interaction.pdf (The Good + Contraindications slides)',
      'Ayahuasca and Drug Interaction.pdf (pharmahuasca section)',
      'Ayahuasca and Drug Interaction.pdf (summary slide text)',
      'Ayahuasca and Drug Interaction',
    ],
  },
  {
    id: 'ruffell_compounds_ayahuasca_corrigendum_2020',
    canonicalLabel: 'ruffell-2020-pharmacological-interaction-compounds-ayahuasca.pdf',
    apaCitation:
      'Ruffell, S., Netzband, N., Bird, C., Young, A. H., & Juruena, M. F. (2020). The pharmacological interaction of compounds in ayahuasca: A systematic review (Corrigendum).',
    url: null,
    kind: 'publication',
    aliases: [
      'ruffell-2020-pharmacological-interaction-compounds-ayahuasca.pdf',
      'Ruffell et al. 2020',
    ],
  },
  {
    id: 'halman_classic_psychedelics_ddi_2024',
    canonicalLabel:
      'halman-et-al-2023-drug-drug-interactions-involving-classic-psychedelics-a-systematic-review.pdf',
    apaCitation:
      'Halman, A., Kong, G., Sarris, J., & Perkins, D. (2024). Drug-drug interactions involving classic psychedelics: A systematic review. Journal of Psychopharmacology, 38(1), 3-18. https://doi.org/10.1177/02698811231211219',
    url: 'https://doi.org/10.1177/02698811231211219',
    kind: 'publication',
    aliases: [
      'halman-et-al-2023-drug-drug-interactions-involving-classic-psychedelics-a-systematic-review.pdf',
      'Halman et al. 2024',
    ],
  },
  {
    id: 'psilocybin_ssri_interaction_chart',
    canonicalLabel: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf',
    apaCitation: null,
    url: null,
    kind: 'internal',
    aliases: ['Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'],
  },
  {
    id: 'entheogen_interactions_research_update',
    canonicalLabel: 'entheogen-interactions-research-update',
    apaCitation: null,
    url: null,
    kind: 'internal',
    aliases: ['entheogen-interactions-research-update'],
  },
  {
    id: 'source_gap',
    canonicalLabel: 'source-gap',
    apaCitation: null,
    url: null,
    kind: 'internal',
    aliases: ['source-gap'],
  },
  {
    id: 'not_available',
    canonicalLabel: 'n/a',
    apaCitation: null,
    url: null,
    kind: 'internal',
    aliases: ['n/a'],
  },
];

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

const stripTrailingParenthetical = (value: string): string =>
  normalizeWhitespace(value.replace(/\s*\([^)]*\)\s*$/u, ''));

const normalizeLabel = (value: string): string => normalizeWhitespace(value).toLowerCase();

const sourceAliasMap = new Map<string, string>();

const registerAlias = (label: string, sourceId: string): void => {
  const normalizedAlias = normalizeLabel(label);
  const existing = sourceAliasMap.get(normalizedAlias);
  if (existing && existing !== sourceId) {
    throw new Error(`Source alias collision for "${label}": ${existing} vs ${sourceId}`);
  }
  sourceAliasMap.set(normalizedAlias, sourceId);
};

for (const source of SOURCE_REGISTRY) {
  registerAlias(source.canonicalLabel, source.id);
  registerAlias(stripTrailingParenthetical(source.canonicalLabel), source.id);

  for (const alias of source.aliases) {
    registerAlias(alias, source.id);
    registerAlias(stripTrailingParenthetical(alias), source.id);
  }
}

export const splitSources = (rawSources: string): string[] => {
  const values: string[] = [];
  let buffer = '';
  let parenthesesDepth = 0;

  for (let index = 0; index < rawSources.length; index += 1) {
    const character = rawSources[index];

    if (character === '(') {
      parenthesesDepth += 1;
    }

    if (character === ')' && parenthesesDepth > 0) {
      parenthesesDepth -= 1;
    }

    const isTopLevelDelimiter =
      parenthesesDepth === 0 &&
      (character === ';' || (character === '+' && rawSources[index - 1] === ' ' && rawSources[index + 1] === ' '));

    if (isTopLevelDelimiter) {
      const normalized = normalizeWhitespace(buffer);
      if (normalized.length > 0) {
        values.push(normalized);
      }
      buffer = '';
      continue;
    }

    buffer += character;
  }

  const normalized = normalizeWhitespace(buffer);
  if (normalized.length > 0) {
    values.push(normalized);
  }

  return values;
};

const sourceIdForLabel = (label: string): string | null => {
  const normalized = normalizeLabel(label);
  const directMatch = sourceAliasMap.get(normalized);
  if (directMatch) {
    return directMatch;
  }

  const stripped = normalizeLabel(stripTrailingParenthetical(label));
  return sourceAliasMap.get(stripped) ?? null;
};

const buildSourceFingerprint = (sourceIds: string[]): string =>
  createHash('sha256').update(sourceIds.join('|'), 'utf8').digest('hex');

export const resolveSources = (rawSources: string | null | undefined): SourceResolution => {
  if (!rawSources || normalizeWhitespace(rawSources).length === 0) {
    return {
      sourceIds: null,
      sourceFingerprint: null,
      unresolvedLabels: [],
    };
  }

  const labels = splitSources(rawSources);
  const unresolved = new Set<string>();
  const sourceIds = new Set<string>();

  for (const label of labels) {
    const sourceId = sourceIdForLabel(label);
    if (!sourceId) {
      unresolved.add(label);
      continue;
    }
    sourceIds.add(sourceId);
  }

  const sortedSourceIds = [...sourceIds].sort((left, right) => left.localeCompare(right));
  if (sortedSourceIds.length === 0) {
    return {
      sourceIds: null,
      sourceFingerprint: null,
      unresolvedLabels: [...unresolved].sort((left, right) => left.localeCompare(right)),
    };
  }

  return {
    sourceIds: sortedSourceIds,
    sourceFingerprint: buildSourceFingerprint(sortedSourceIds),
    unresolvedLabels: [...unresolved].sort((left, right) => left.localeCompare(right)),
  };
};