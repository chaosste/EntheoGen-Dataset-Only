export interface Drug {
  id: string;
  name: string;
  class: string;
  mechanismTag: string;
  notes: string;
}

export interface InteractionMetadata {
  label: string;
  symbol: string;
  color: string;
  description: string;
  riskScale: number;
}

export interface InteractionEvidence {
  code: string;
  summary: string;
  confidence: string;
  sources: string;
  mechanism?: string;
  practicalGuidance?: string;
  timing?: string;
  evidenceGaps?: string;
  evidenceTier?: string;
  fieldNotes?: string;
}

export type RuleOrigin = 'self' | 'explicit' | 'fallback' | 'unknown';

export type MechanismCategory =
  | 'serotonergic'
  | 'maoi'
  | 'qt_prolongation'
  | 'sympathomimetic'
  | 'cns_depressant'
  | 'anticholinergic'
  | 'dopaminergic'
  | 'glutamatergic'
  | 'gabaergic'
  | 'stimulant_stack'
  | 'psychedelic_potentiation'
  | 'cardiovascular_load'
  | 'unknown';

export interface ResolvedInteraction {
  evidence: InteractionEvidence;
  origin: RuleOrigin;
  pairKey: string;
}

export function classifyMechanismCategory(
  mechanism?: string
): MechanismCategory {
  if (!mechanism) {
    return 'unknown';
  }

  const normalizedMechanism = mechanism.toLowerCase();

  if (normalizedMechanism.includes('serotonin')) {
    return 'serotonergic';
  }

  if (normalizedMechanism.includes('maoi')) {
    return 'maoi';
  }

  if (normalizedMechanism.includes('qt')) {
    return 'qt_prolongation';
  }

  if (normalizedMechanism.includes('sympathomimetic')) {
    return 'sympathomimetic';
  }

  if (normalizedMechanism.includes('cns depressant')) {
    return 'cns_depressant';
  }

  if (normalizedMechanism.includes('anticholinergic')) {
    return 'anticholinergic';
  }

  if (normalizedMechanism.includes('dopamine')) {
    return 'dopaminergic';
  }

  if (normalizedMechanism.includes('glutamate')) {
    return 'glutamatergic';
  }

  if (normalizedMechanism.includes('gaba')) {
    return 'gabaergic';
  }

  if (normalizedMechanism.includes('stimulant')) {
    return 'stimulant_stack';
  }

  if (
    normalizedMechanism.includes('potentiation') &&
    normalizedMechanism.includes('psychedelic')
  ) {
    return 'psychedelic_potentiation';
  }

  if (
    normalizedMechanism.includes('cardio') ||
    normalizedMechanism.includes('hypertension')
  ) {
    return 'cardiovascular_load';
  }

  return 'unknown';
}

export const DRUGS: Drug[] = [
  {
    id: 'ayahuasca',
    name: 'Ayahuasca',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'MAOI + DMT',
    notes: 'Contains harmala alkaloids; interaction profile strongly MAOI-mediated.'
  },
  {
    id: 'psilocybin',
    name: 'Psilocybin Mushrooms',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic psychedelic',
    notes: 'Classical psychedelic; medication interactions include blunting/intensification.'
  },
  {
    id: 'nn_dmt',
    name: 'N,N-DMT',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic tryptamine',
    notes: 'Referenced as generally lower risk with ayahuasca context than 5-MeO-DMT.'
  },
  {
    id: 'five_meo_dmt',
    name: '5-MeO-DMT',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic tryptamine',
    notes: 'Specifically flagged as dangerous with MAOIs in supplied sources.'
  },
  {
    id: 'mescaline_peyote',
    name: 'Mescaline / Peyote',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Phenethylamine psychedelic',
    notes: 'Listed with spacing guidance relative to ayahuasca.'
  },
  {
    id: 'yopo',
    name: 'Yopo',
    class: 'Ceremonial Psychedelic',
    mechanismTag: '5-MeO-DMT + bufotenine containing seeds',
    notes: 'Source notes caution due active constituents.'
  },
  {
    id: 'lsd',
    name: 'LSD',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Serotonergic psychedelic',
    notes: 'Included in lower-risk ayahuasca combination examples.'
  },
  {
    id: 'salvia',
    name: 'Salvia divinorum',
    class: 'Ceremonial Psychedelic',
    mechanismTag: 'Atypical dissociative/dysphoric profile',
    notes: 'Marked distinct per request; no explicit risk ratings in provided documents.'
  },
  {
    id: 'belladonna',
    name: 'Belladonna',
    class: 'Deliriant',
    mechanismTag: 'Anticholinergic deliriant',
    notes: 'Marked distinct per request; no explicit risk ratings in provided documents.'
  },
  {
    id: 'brugmansia',
    name: 'Brugmansia',
    class: 'Deliriant',
    mechanismTag: 'Anticholinergic deliriant',
    notes: 'Marked distinct per request; no explicit risk ratings in provided documents.'
  },
  {
    id: 'kambo',
    name: 'Kambo',
    class: 'Ceremonial Adjunct',
    mechanismTag: 'Ceremonial adjunct',
    notes: 'Caution advised around co-presentation with ayahuasca.'
  },
  {
    id: 'tobacco_rape',
    name: 'Tobacco / Rapé',
    class: 'Ceremonial Adjunct',
    mechanismTag: 'Nicotinic stimulant (traditional adjunct)',
    notes: 'Generally noted as acceptable with caveats on admixtures.'
  },
  {
    id: 'cannabis',
    name: 'Cannabis',
    class: 'Ceremonial Or Recreational',
    mechanismTag: 'Cannabinoid',
    notes: 'Listed in lower-risk ayahuasca combinations.'
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    class: 'Non Ceremonial',
    mechanismTag: 'CNS depressant',
    notes: 'Explicitly advised against with ayahuasca in provided text.'
  },
  {
    id: 'ssri',
    name: 'SSRIs',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Serotonin reuptake inhibition',
    notes: 'Psilocybin chart: blunted effects; ayahuasca: serotonin syndrome risk.'
  },
  {
    id: 'snri',
    name: 'SNRIs',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Serotonin + norepinephrine reuptake inhibition',
    notes: 'Psilocybin chart: blunted effects; ayahuasca contraindication list includes SNRIs.'
  },
  {
    id: 'tricyclic_ad',
    name: 'Tricyclic Antidepressants',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Mixed monoamine reuptake effects',
    notes: 'Psilocybin chart: intensified effects; specific tricyclics listed as contraindicated with ayahuasca.'
  },
  {
    id: 'maoi_pharma',
    name: 'Pharmaceutical MAOIs',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Monoamine oxidase inhibition',
    notes: 'Major contraindication category around ayahuasca and serotonergic combinations.'
  },
  {
    id: 'atypical_ad',
    name: 'Atypical Antidepressants',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Mixed serotonergic mechanisms',
    notes: 'Buspirone, trazodone, mirtazapine in psilocybin chart mostly blunted.'
  },
  {
    id: 'ndri_bupropion',
    name: 'NDRI (Bupropion)',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Norepinephrine + dopamine reuptake inhibition',
    notes: 'Psilocybin chart flags reduced seizure threshold and individualized risk.'
  },
  {
    id: 'amphetamine_stims',
    name: 'Amphetamine Stimulants',
    class: 'Pharmaceutical Or Recreational',
    mechanismTag: 'Monoamine releasing stimulant',
    notes: 'Explicitly high risk with MAOI context; potential hypertensive crisis/serotonin toxicity.'
  },
  {
    id: 'methylphenidate',
    name: 'Methylphenidate',
    class: 'Pharmaceutical',
    mechanismTag: 'Catecholaminergic stimulant',
    notes: 'Contraindication list item with ayahuasca in source slides.'
  },
  {
    id: 'cocaine',
    name: 'Cocaine',
    class: 'Recreational Stimulant',
    mechanismTag: 'Monoamine reuptake inhibition',
    notes: 'Contraindication list item with ayahuasca in source slides.'
  },
  {
    id: 'mdma_2cx_dox_nbome',
    name: 'MDMA / 2C-x / DOx / NBOMe',
    class: 'Recreational Serotonergic',
    mechanismTag: 'Serotonergic stimulant/psychedelic cluster',
    notes: 'Contraindication cluster with ayahuasca in source slides.'
  },
  {
    id: 'serotonergic_opioids',
    name: 'Serotonergic Opioids (Tramadol/Methadone/Meperidine/Tapentadol)',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Opioid + serotonergic action',
    notes: 'Contraindication list item with ayahuasca in source slides.'
  },
  {
    id: 'antipsychotics',
    name: 'Antipsychotics',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Dopamine/serotonin modulation',
    notes: 'Mixed source signals; treat as elevated caution/high risk with ayahuasca.'
  },
  {
    id: 'antihypertensives',
    name: 'Antihypertensives',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Blood pressure modulation',
    notes: 'Mentioned as risk area and also emergency management context.'
  },
  {
    id: 'benzodiazepines',
    name: 'Benzodiazepines',
    class: 'Pharmaceutical Class',
    mechanismTag: 'GABAergic sedatives',
    notes: 'Listed as generally low-risk emergency management option in supplied slides.'
  },
  {
    id: 'lithium',
    name: 'Lithium',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Mood stabilizer / second-messenger modulation',
    notes: 'Strong seizure signal reported in observational psychedelic co-use data.'
  },
  {
    id: 'lamotrigine',
    name: 'Lamotrigine',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Anticonvulsant / sodium-channel modulation',
    notes: 'Observational data suggest lower seizure concern than lithium with classic psychedelics.'
  },
  {
    id: 'ketamine',
    name: 'Ketamine',
    class: 'Pharmaceutical Or Clinical Psychedelic',
    mechanismTag: 'NMDA-antagonist dissociative',
    notes: 'No formal ayahuasca interaction trials; concern is mainly confusion, sedation, and autonomic instability.'
  },
  {
    id: 'clonidine_guanfacine',
    name: 'Clonidine / Guanfacine',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Alpha-2 agonist sympatholytic',
    notes: 'Potential hypotension/bradycardia and timing-dependent potentiation around harmala use.'
  },
  {
    id: 'beta_blockers_ccb',
    name: 'Beta-Blockers / Rate-Controlling CCBs',
    class: 'Pharmaceutical Class',
    mechanismTag: 'Cardiovascular rate and pressure control',
    notes: 'Higher concern than general antihypertensives because compensatory heart-rate responses may be blunted.'
  },
];

export const LEGEND: Record<string, InteractionMetadata> = {
  LOW: {
    label: 'Low Risk',
    symbol: 'CIRCLE',
    color: '#1C8AD1',
    description: 'Generally low physiologic interaction risk in source context.',
    riskScale: 1
  },
  LOW_MOD: {
    label: 'Low Risk, Effect Modulation',
    symbol: 'DOWN',
    color: '#3EA5E6',
    description: 'Low acute risk, but may blunt/decrease/increase subjective effects.',
    riskScale: 2
  },
  CAU: {
    label: 'Caution / Moderate Risk',
    symbol: 'WARN',
    color: '#D7CA25',
    description: 'Meaningful interaction risk; monitor and/or avoid unless supervised.',
    riskScale: 3
  },
  UNS: {
    label: 'Unsafe / High Risk',
    symbol: 'HEART',
    color: '#DD8B28',
    description: 'High adverse-event risk; generally avoid.',
    riskScale: 4
  },
  DAN: {
    label: 'Dangerous / Contraindicated',
    symbol: 'X',
    color: '#E21B2B',
    description: 'Potentially severe or life-threatening interaction risk; avoid.',
    riskScale: 5
  },
  UNK: {
    label: 'Unknown/Insufficient Data',
    symbol: 'INFO',
    color: '#6C757D',
    description: 'No explicit classification in the current curated interaction dataset.',
    riskScale: 0
  },
  SELF: {
    label: 'Same Entity / N-A',
    symbol: 'SELF',
    color: '#274F13',
    description: 'Diagonal/self pairing; not an interaction pair.',
    riskScale: -1
  },
};

const INTERACTION_RULES: Record<string, InteractionEvidence> = {
  'alcohol|ayahuasca': {
    code: 'DAN',
    summary: 'Advised against; MAOI context and stated potential for dangerous outcomes.',
    confidence: 'high',
    sources: 'ayahuasca-interactions.pdf (p1 text)'
  },
  'amphetamine_stims|ayahuasca': {
    code: 'DAN',
    summary: 'Explicitly contraindicated; risk includes hypertensive crisis/serotonin toxicity.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'antihypertensives|ayahuasca': {
    code: 'CAU',
    summary: 'Class-dependent cardiovascular caution; stable ACEi/ARB therapy is often less concerning than beta-blockers, clonidine, or rate-controlling calcium-channel blockers.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update; ayahuasca-interactions.pdf; Ayahuasca and Drug Interaction.pdf',
    mechanism: `Ayahuasca commonly raises heart rate and blood pressure while also causing vomiting, diarrhea, and fluid shifts. Background antihypertensive therapy can make those hemodynamic swings less predictable, especially if compensatory tachycardia is blunted or the participant becomes volume depleted.`,
    practicalGuidance: `- Stable ACE inhibitor or ARB treatment is usually a caution problem rather than an automatic stop.\n- Beta-blockers, rate-controlling calcium-channel blockers, and alpha-2 agonists deserve a separate review rather than being lumped into one bucket.\n- Do not advise people to abruptly stop blood-pressure medication just to attend ceremony; the unmanaged baseline disease may be riskier than the interaction itself.`,
    timing: `If recent vomiting, diarrhea, fasting, heat exposure, or repeated cups are involved, the interaction risk rises because volume depletion makes antihypertensives harder to titrate safely.`,
    evidenceGaps: `There are still no direct trials of standardized ayahuasca in participants maintained on specific antihypertensive classes.`,
    evidenceTier: 'mechanistic inference + retreat guidance + limited human ayahuasca hemodynamic data'
  },
  'antipsychotics|ayahuasca': {
    code: 'UNS',
    summary: 'Usually a psychiatric contraindication rather than a classic serotonergic-toxicity problem; many antipsychotics will also strongly suppress DMT effects.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (The Good + Contraindications slides)',
    mechanism: `Many antipsychotics are potent 5-HT2A antagonists, so they can flatten DMT effects while adding their own burdens such as orthostasis, QT issues, sedation, or metabolic strain. The larger concern is that the person is often being treated for psychosis-spectrum illness, bipolar instability, or severe agitation.`,
    practicalGuidance: `- Treat antipsychotic use for schizophrenia, psychosis, or unstable bipolar illness as a practical contraindication to ayahuasca.\n- Low-dose quetiapine or similar drugs used only for sleep/anxiety may be physiologically lower-risk, but they still tend to blunt the medicine and invite dose-chasing.\n- Do not recommend stopping antipsychotics without psychiatric supervision.`,
    evidenceGaps: `Direct ayahuasca-in-antipsychotic-maintained cohorts are missing; most evidence is extrapolated from classic psychedelic receptor-blockade studies.`,
    evidenceTier: 'mechanistic inference + clinical exclusion practice + retreat guidance'
  },
  'atypical_ad|psilocybin': {
    code: 'LOW_MOD',
    summary: 'Usually lower acute toxicity than MAOI or SNRI combinations, but trazodone, mirtazapine, and buspirone commonly blunt or reshape psilocybin effects.',
    confidence: 'high',
    sources: 'entheogen-interactions-research-update; Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf',
    mechanism: `Trazodone and mirtazapine antagonize 5-HT2A signaling, while buspirone changes serotonergic tone through 5-HT1A partial agonism. That generally lowers subjective intensity more than it raises toxicity.`,
    practicalGuidance: `- Expect dulled or altered macrodose effects rather than a clean contraindication.\n- Polypharmacy matters: the risk picture changes if SSRIs, SNRIs, MAOIs, or several serotonergic agents are also present.\n- Microdosing is not automatically exempt; a published serotonin-toxicity case involved a heavier serotonergic stack plus trazodone.`,
    timing: `Where fuller psychedelic intensity is the goal, clinics often use a rough 1-2 week taper/hold heuristic for trazodone or mirtazapine. That timing is pragmatic rather than strongly evidenced.`,
    evidenceGaps: `Controlled data are emerging for trazodone plus psilocybin, but comparable formal work for mirtazapine and buspirone is still thin.`,
    evidenceTier: 'systematic interaction review + trial rationale + case report + clinical heuristics'
  },
  'ayahuasca|benzodiazepines': {
    code: 'LOW_MOD',
    summary: 'Emergency benzodiazepine use is generally low-risk and clinically preferred for severe agitation; planned co-use more often blunts effects and complicates screening than it causes direct toxicity.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (The Good slide)',
    mechanism: `Benzodiazepines are GABAergic rather than serotonergic, which is why toxicology guidance favors them for agitation, muscle rigidity, and serotonin-toxicity management. The main tradeoffs are sedation, falls, aspiration during heavy purge, and a flatter psychedelic process.`,
    practicalGuidance: `- Distinguish rescue use from routine co-use.\n- Rescue dosing for severe panic, agitation, or suspected serotonin toxicity is a safer option than antipsychotic-heavy chemical restraint in most settings.\n- Do not push abrupt benzodiazepine discontinuation before ceremony; withdrawal and rebound anxiety can be more dangerous than stable low-dose maintenance.`,
    timing: `Stable low-dose maintenance mainly predicts effect blunting. Escalating doses, erratic use, or recent withdrawal raise the risk profile much more than the pharmacology of the pair itself.`,
    fieldNotes: `Field consensus is often stricter than toxicology literature: many retreats discourage baseline benzo use but still keep benzodiazepines available as emergency rescue medication.`,
    evidenceGaps: `Ayahuasca-specific observational data on maintained benzodiazepine users remain sparse.`,
    evidenceTier: 'toxicology guidelines + retreat protocols + field consensus'
  },
  'ayahuasca|cannabis': {
    code: 'CAU',
    summary: 'Main concern is psychiatric and cardiovascular destabilization rather than classic MAOI toxicity; cannabis often makes ayahuasca less predictable, not safer.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (The Good slide)',
    mechanism: `THC can raise heart rate, intensify anxiety, and lower the threshold for derealization or psychotic-like reactions. Ayahuasca already increases autonomic load and psychological lability, so the combination can become panic-prone even when neither agent is medically toxic on its own.`,
    practicalGuidance: `- Avoid high-THC cannabis during the peak of ayahuasca.\n- If used at all in experienced people, lower-THC or balanced THC:CBD cannabis late in the tail is a safer pattern than early peak stacking.\n- Screen out active psychosis and strong family history of psychotic illness.`,
    fieldNotes: `Many facilitators report cannabis as a more common destabilizer than tobacco on ceremony days, especially with concentrates or strong edibles.`,
    evidenceGaps: `Prospective data on cannabis preloading, concentrates, and redosing during ceremony are still missing.`,
    evidenceTier: 'ethnopharmacology review + pilot endocannabinoid work + facilitator consensus'
  },
  'ayahuasca|cocaine': {
    code: 'DAN',
    summary: 'Listed as contraindicated with ayahuasca.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|five_meo_dmt': {
    code: 'DAN',
    summary: 'Source explicitly states 5-MeO-DMT may be dangerous with MAOIs.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (summary slide text)'
  },
  'ayahuasca|kambo': {
    code: 'CAU',
    summary: 'Multi-medicine retreat sequencing is common, but same-day kambo plus ayahuasca can push dehydration, electrolyte disturbance, and hemodynamic instability into unsafe territory.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; ayahuasca-interactions.pdf (p1 text)',
    mechanism: `Kambo produces short, intense autonomic stress with vomiting, hypotension, tachycardia, and fluid/electrolyte loss. Ayahuasca adds further blood-pressure shifts, purging, and cardiovascular activation, so the main risk is somatic rather than serotonergic.`,
    practicalGuidance: `- Safer sequencing is kambo first, then overnight recovery with explicit rehydration and a health check before ayahuasca.\n- Avoid same-half-day protocols, repeated kambo sessions immediately before aya, and anyone with kidney disease, cardiovascular disease, or heavy diuretic use.`,
    timing: `Overnight spacing with recovery is a minimum field standard. Same-day stacking should be treated as materially riskier.`,
    evidenceGaps: `There are no formal kambo plus ayahuasca interaction studies; a retreat safety registry would be more realistic than a trial.`,
    evidenceTier: 'case reports + ethnographic / retreat sequencing practice'
  },
  'ayahuasca|lsd': {
    code: 'LOW_MOD',
    summary: 'Listed in lower-risk ceremonial/recreational combinations.',
    confidence: 'medium',
    sources: 'Ayahuasca and Drug Interaction.pdf (The Good slide)'
  },
  'ayahuasca|maoi_pharma': {
    code: 'DAN',
    summary: 'Other MAOIs explicitly called out as interaction risks.',
    confidence: 'high',
    sources: 'ayahuasca-interactions.pdf (p1 text)'
  },
  'ayahuasca|mdma_2cx_dox_nbome': {
    code: 'DAN',
    summary: 'Ceremonial/recreational serotonergic phenethylamines listed as contraindicated.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|mescaline_peyote': {
    code: 'CAU',
    summary: 'Phenethylamine-style cardiovascular load makes full same-session combinations unsafe in practice; if sequenced, 24 hours looks like a bare minimum rather than a comfortable margin.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (The Good slide)',
    mechanism: `Mescaline is more sympathomimetic than psilocybin or DMT. Harmala-mediated MAO inhibition may slow mescaline clearance and prolong stimulation, making blood-pressure and rhythm stress the dominant concern.`,
    practicalGuidance: `- Treat full-dose same-night ayahuasca plus mescaline/peyote as unsafe for ceremonial settings.\n- If ayahuasca came first, waiting 48-72 hours before a substantial mescaline dose is a more conservative field rule than 24 hours.\n- If mescaline came first, full recovery, sleep, and hydration matter before any next-day ayahuasca.`,
    timing: `A 24-hour gap is only a minimal pharmacology-based estimate. The research update strongly favors 48-72 hours after ayahuasca before significant mescaline work.`,
    evidenceGaps: `Direct human mescaline-under-harmala data are essentially absent; current guidance is mostly mechanistic plus field conservatism.`,
    evidenceTier: 'mechanistic inference + MAOI pharmacology + field guidance'
  },
  'ayahuasca|beta_blockers_ccb': {
    code: 'UNS',
    summary: 'Rate-controlling beta-blockers and certain calcium-channel blockers are higher-concern than generic blood-pressure medication because ayahuasca can create pressure swings while these drugs limit compensatory responses.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update',
    mechanism: `Beta-blockers and rate-controlling calcium-channel blockers can worsen bradycardia or hypotension during stress states. Ayahuasca adds variable sympathetic activation, vasodilation, vomiting, and dehydration, so the combined hemodynamic picture can become unstable.`,
    practicalGuidance: `- Do not assume these medications behave like ACE inhibitors or ARBs.\n- Combined beta-blocker plus calcium-channel blocker therapy deserves especially strong caution.\n- If ayahuasca is still being considered, cardiology input and active monitoring are more appropriate than self-experimentation.`,
    evidenceGaps: `The concern is strong mechanistically but still lacks ayahuasca-specific prospective studies.`,
    evidenceTier: 'cardiovascular pharmacology + retreat guidance + mechanistic inference'
  },
  'ayahuasca|clonidine_guanfacine': {
    code: 'CAU',
    summary: 'Alpha-2 agonists may be potentiated around harmala use and can tilt an ayahuasca session toward hypotension, bradycardia, or over-sedation.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update',
    mechanism: `Clonidine and guanfacine reduce sympathetic outflow. The research update notes field concern that harmala-related CYP inhibition may raise exposure for some related agents, making blood-pressure drops and sedation harder to predict.`,
    practicalGuidance: `- Treat clonidine/guanfacine as a timing-sensitive caution rather than a universal stop.\n- Monitor for dizziness, bradycardia, and rebound blood-pressure problems if doses are skipped.\n- Avoid improvising withdrawal just to make room for ceremony.`,
    timing: `Prefer taking alpha-2 agonists well outside the strongest harmala window; the research update used a rough 10-hour separation rule as a practical field heuristic.`,
    evidenceGaps: `Evidence is mostly mechanistic plus field experience; formal aya-specific PK work is missing.`,
    evidenceTier: 'field guidance + mechanistic inference'
  },
  'ayahuasca|ketamine': {
    code: 'UNS',
    summary: 'Same-session ayahuasca plus ketamine is a poor fit: dissociation, sedation, impaired mobility, and purge-related aspiration/fall risk outweigh any novelty value.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update',
    mechanism: `Ketamine adds dissociation and motor impairment rather than a clean serotonergic synergy. Ayahuasca adds vomiting, autonomic swings, and intense perceptual disruption, so the combination is operationally unsafe even without a known receptor-level crisis mechanism.`,
    practicalGuidance: `- Avoid same-session co-use.\n- In multi-day programs, treat 24 hours as a minimum spacing buffer and prefer clinical staffing if either medicine is being used for mental-health treatment rather than informal experimentation.`,
    evidenceGaps: `No formal ketamine-ayahuasca interaction studies were identified; current guidance is mostly based on operational risk and scattered reports.`,
    evidenceTier: 'mechanistic inference + scattered field reports'
  },
  'ayahuasca|methylphenidate': {
    code: 'DAN',
    summary: 'Listed in contraindicated stimulant class with ayahuasca.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|nn_dmt': {
    code: 'CAU',
    summary: 'This is the basic ayahuasca/pharmahuasca interaction at oral doses, but layering extra smoked or vaped DMT on top of ayahuasca meaningfully raises intensity and can become unsafe at high combined loads.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (summary slide text)',
    mechanism: `Ayahuasca's harmala alkaloids reversibly inhibit MAO-A and prolong DMT exposure. The main issue is not a mysterious new toxic syndrome but sharply increased total psychedelic load, longer duration, and bigger cardiovascular and behavioral swings when extra DMT is added during peak ayahuasca.`,
    practicalGuidance: `- Treat smoked or vaped DMT on top of active ayahuasca as an advanced intensification protocol, not a casual booster.\n- If someone insists, conservative DMT dosing and single rather than repeated redosing are much safer than chasing peak intensity.\n- Avoid entirely in seizure history, uncontrolled hypertension, or unstable cardiovascular disease.`,
    timing: `Ayahuasca should still be treated as conferring meaningful MAO-A inhibition for about 24 hours, with a more conservative 24-48 hour washout after heavy or repeated dosing.`,
    evidenceGaps: `Formal data exist for oral DMT plus harmalas, but not for stacked smoked/vaped DMT during an ayahuasca session.`,
    evidenceTier: 'formal ayahuasca pharmacology + PK data + field extrapolation'
  },
  'ayahuasca|psilocybin': {
    code: 'CAU',
    summary: 'Not clearly toxic in the way ayahuasca plus SSRIs or MDMA can be, but same-session overlap is a strong intensifier and can become operationally unsafe.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (pharmahuasca section)',
    mechanism: `Harmala-mediated MAO-A inhibition may prolong psilocin exposure while both medicines strongly activate 5-HT2A-mediated psychedelic effects. The main risk is stacked intensity, blood-pressure load, vomiting, panic, and behavioral disorganization rather than a well-documented serotonergic crisis.`,
    practicalGuidance: `- Avoid same-night full doses.\n- If sequencing in a retreat arc, ayahuasca one evening and psilocybin 24-48 hours later is substantially safer than deliberate overlap.\n- If overlap is still being considered, reduce both doses heavily and make the setting medically and physically contained.`,
    timing: `A 24-hour gap is a bare minimum after ayahuasca. The research update leans toward 36-48 hours as a more conservative margin when harmala exposure was strong or repeated.`,
    evidenceGaps: `There is still no direct psilocin-under-harmala PK dataset, so much of the spacing guidance remains mechanistic.`,
    evidenceTier: 'MAOI pharmacology + secondary review + field guidance'
  },
  'ayahuasca|serotonergic_opioids': {
    code: 'DAN',
    summary: 'Methadone/tramadol/meperidine/tapentadol listed as contraindicated.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|snri': {
    code: 'DAN',
    summary: 'SNRIs included in contraindicated antidepressant list.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|ssri': {
    code: 'DAN',
    summary: 'Serotonin syndrome risk explicitly discussed in MAOI context.',
    confidence: 'high',
    sources: 'ayahuasca-interactions.pdf + Ayahuasca and Drug Interaction.pdf'
  },
  'ayahuasca|tobacco_rape': {
    code: 'LOW_MOD',
    summary: 'Traditional low-frequency use appears broadly compatible in healthy people, but repeated or heavy tobacco/rapé use can add meaningful blood-pressure and anxiety load.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (The Good slide)',
    mechanism: `Nicotine raises heart rate and blood pressure through catecholamine release. Ayahuasca can do the same, so the combination is usually tolerated in healthy participants but can become a problem with cardiovascular disease, naïve users, or repeated strong applications.`,
    practicalGuidance: `- Distinguish traditional intermittent use from compulsive repeated dosing.\n- Ask whether the rapé contains other plant admixtures before assuming the interaction is just nicotine.\n- Use more caution in hypertension, arrhythmia, panic-prone states, or older participants.`,
    fieldNotes: `Traditional Amazonian practice is one reason this pair should not be overclassified, but facilitator experience still supports caution around repeated dosing and admixtures.`,
    evidenceGaps: `Almost no formal hemodynamic monitoring exists for ayahuasca plus ritual tobacco patterns.`,
    evidenceTier: 'traditional-use precedent + mechanistic inference + limited hemodynamic data'
  },
  'ayahuasca|tricyclic_ad': {
    code: 'DAN',
    summary: 'Specific tricyclics listed as contraindicated with MAOI context.',
    confidence: 'high',
    sources: 'Ayahuasca and Drug Interaction.pdf (Drug Contraindications slide)'
  },
  'ayahuasca|yopo': {
    code: 'DAN',
    summary: 'Concurrent ayahuasca plus yopo should be treated as contraindicated because bufotenine/5-substituted tryptamine exposure under MAO inhibition is poorly studied and plausibly high-risk.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update; Ayahuasca and Drug Interaction.pdf (Good combinations caveat)',
    mechanism: `Yopo preparations are often bufotenine-dominant and may contain small amounts of DMT or 5-MeO-DMT depending on material and preparation. Ayahuasca's MAO-A inhibition can increase exposure to 5-substituted tryptamines, which is exactly the class that underground and ethnographic guidance treats most cautiously.`,
    practicalGuidance: `- Flag same-session ayahuasca plus yopo as contraindicated.\n- If both medicines are used in a longer retreat container, avoid same-day use and build in at least 48 hours, hydration review, and cardiovascular screening.\n- The lack of clear traditional precedent for oral ayahuasca plus yopo layering is itself useful safety information.`,
    evidenceGaps: `Human data are almost entirely absent. Current guidance is built from pharmacology, ethnographic negative precedent, and field caution rather than trials.`,
    evidenceTier: 'mechanistic inference + ethnographic precedent + underground harm-reduction consensus'
  },
  'antipsychotics|psilocybin': {
    code: 'LOW_MOD',
    summary: 'Many antipsychotics will blunt psilocybin more than they increase direct toxicity, but the underlying psychiatric indication may still make psychedelic use a poor fit.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update',
    mechanism: `5-HT2A antagonism reliably suppresses classic psychedelic effects. The principal concern is less serotonin toxicity than medication discontinuation, psychosis risk, and dose-chasing against receptor blockade.`,
    practicalGuidance: `- Expect a flatter or partially blocked psychedelic response.\n- Treat psychosis-spectrum illness and unstable bipolar illness as more important red flags than the pharmacology of the pair itself.\n- Avoid unsupervised antipsychotic tapering just to regain psychedelic intensity.`,
    evidenceTier: 'systematic interaction review + clinical exclusion practice'
  },
  'benzodiazepines|psilocybin': {
    code: 'LOW_MOD',
    summary: 'Usually a blunting or rescue-medication issue rather than a toxicological one.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update',
    mechanism: `Benzodiazepines reduce arousal and can dampen the behavioral and emotional intensity of psilocybin without adding serotonergic load.`,
    practicalGuidance: `- Stable low-dose use usually means reduced subjective intensity.\n- Rescue use for overwhelming panic is more defensible than preemptive repeated co-dosing.\n- Abrupt discontinuation before a session can be riskier than continuing a stable prescription.`,
    evidenceTier: 'toxicology practice + field consensus'
  },
  'lithium|psilocybin': {
    code: 'DAN',
    summary: 'Lithium has the clearest published seizure signal of the missing medication classes and should be treated as contraindicated with classic psychedelics.',
    confidence: 'medium',
    sources: 'entheogen-interactions-research-update',
    mechanism: `The exact mechanism is unresolved, but observational report analysis found a striking seizure rate when lithium was combined with classic psychedelics. Because psilocybin already changes cortical excitability and lithium alters second-messenger systems, the pairing is treated conservatively.`,
    practicalGuidance: `- Do not frame this as merely an effect-blunting interaction.\n- If lithium is present, the safer recommendation is to avoid psilocybin entirely unless the medication plan is being changed under medical supervision for broader clinical reasons.`,
    evidenceGaps: `The signal is observational rather than trial-based, but it is strong enough to justify a hard warning.`,
    evidenceTier: 'observational report analysis + harm-reduction consensus'
  },
  'lamotrigine|psilocybin': {
    code: 'LOW_MOD',
    summary: 'Current observational evidence suggests lower interaction concern than lithium, with many reports describing little change in intensity and no seizure signal.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update',
    mechanism: `Lamotrigine is anticonvulsant rather than serotonergic, so the main expectation is possible mild effect modulation rather than a toxic synergy.`,
    practicalGuidance: `- This is not a free pass, especially when lamotrigine is part of a bipolar treatment plan.\n- Relative to lithium, though, current evidence points toward lower seizure concern and less dramatic interaction.`,
    evidenceGaps: `Evidence remains observational and much thinner than for standard antidepressant categories.`,
    evidenceTier: 'observational report analysis'
  },
  'methylphenidate|psilocybin': {
    code: 'CAU',
    summary: 'Outside the ayahuasca/MAOI context this is not the same level of crisis risk, but additive heart-rate, blood-pressure, and anxiety load still warrant caution.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update',
    mechanism: `Methylphenidate raises catecholaminergic tone while psilocybin can also elevate heart rate and intensify stimulation, especially in anxious or sleep-deprived users.`,
    practicalGuidance: `- Avoid high stimulant doses, dehydration, and uncontrolled hypertension.\n- If someone is prescribed methylphenidate, a stable therapeutic regimen is still meaningfully different from binge or recreational redosing.`,
    evidenceTier: 'mechanistic inference + field guidance'
  },
  'amphetamine_stims|psilocybin': {
    code: 'CAU',
    summary: 'Prescription or recreational amphetamine stimulants add cardiovascular and anxiety load to psilocybin even without MAOI potentiation.',
    confidence: 'low',
    sources: 'entheogen-interactions-research-update',
    mechanism: `This is an additive arousal problem rather than the hypertensive-crisis pattern seen with ayahuasca plus stimulants. Heart rate, blood pressure, panic, insomnia, and overheating become more likely as dose rises.`,
    practicalGuidance: `- Lower stimulant exposure and good hydration matter.\n- Avoid in uncontrolled hypertension, structural heart disease, or when the stimulant use itself is erratic or escalating.`,
    evidenceTier: 'mechanistic inference + field guidance'
  },
  'maoi_pharma|psilocybin': {
    code: 'DAN',
    summary: 'Serotonin syndrome or hypertension category in source chart.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'ndri_bupropion|psilocybin': {
    code: 'CAU',
    summary: 'Reduced seizure-threshold caution; individualized risk assessment advised.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'psilocybin|snri': {
    code: 'LOW_MOD',
    summary: 'Blunted effects with typical 2-week washout guidance.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'psilocybin|ssri': {
    code: 'LOW_MOD',
    summary: 'Blunted effects; washout mostly 2 weeks (fluoxetine 6 weeks).',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
  'psilocybin|tricyclic_ad': {
    code: 'CAU',
    summary: 'Intensified effects; chart indicates caution with 2-week washout guidance.',
    confidence: 'high',
    sources: 'Psilocybin-Mushrooms-SSRIs-Antidepressant-Interaction-Chart.pdf'
  },
};

const CLASSIC_PSYCHEDELIC_IDS = new Set([
  'ayahuasca',
  'psilocybin',
  'nn_dmt',
  'five_meo_dmt',
  'mescaline_peyote',
  'yopo',
  'lsd',
]);

const DELIRIANT_IDS = new Set(['belladonna', 'brugmansia']);

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

const getFallbackInteractionEvidence = (drug1: string, drug2: string): InteractionEvidence | null => {
  const ids = [drug1, drug2];
  const otherClassic = ids.find((id) => CLASSIC_PSYCHEDELIC_IDS.has(id));

  if (ids.includes('lithium') && otherClassic) {
    return {
      code: 'DAN',
      summary: 'Lithium should be treated as contraindicated with classic psychedelics because published observational data show a disproportionate seizure signal.',
      confidence: 'medium',
      sources: 'entheogen-interactions-research-update',
      mechanism: `The exact mechanism is unresolved, but lithium appears to interact with classic psychedelic states in a way that meaningfully raises seizure and severe adverse-reaction concern.`,
      practicalGuidance: `- Treat lithium plus ayahuasca, psilocybin, LSD, mescaline, DMT, or 5-MeO-DMT as a hard stop in this dataset.\n- Do not advise unsupervised lithium discontinuation merely to make psychedelic use possible.`,
      evidenceGaps: `The evidence base is observational rather than controlled, but the signal is strong enough to warrant a contraindication.`,
      evidenceTier: 'observational report analysis + harm-reduction consensus'
    };
  }

  if (ids.includes('lamotrigine') && otherClassic) {
    return {
      code: 'LOW_MOD',
      summary: 'Lamotrigine currently looks substantially lower-risk than lithium with classic psychedelics, with mostly observational evidence of minimal effect modulation.',
      confidence: 'low',
      sources: 'entheogen-interactions-research-update',
      mechanism: `Lamotrigine is anticonvulsant and not strongly serotonergic, so expectations center on mild effect modulation rather than toxic synergy.`,
      practicalGuidance: `- Relative to lithium, this is a much softer warning.\n- Still take extra care when lamotrigine is part of a bipolar treatment plan or is being changed recently.`,
      evidenceTier: 'observational report analysis'
    };
  }

  if (ids.some((id) => DELIRIANT_IDS.has(id)) && otherClassic) {
    return {
      code: 'DAN',
      summary: 'Tropane-rich deliriants such as belladonna and Brugmansia should be treated as contraindicated with psychedelics because anticholinergic toxidrome and psychedelic disorganization are a dangerous mix.',
      confidence: 'medium',
      sources: 'entheogen-interactions-research-update',
      mechanism: `Belladonna and Brugmansia contain atropine-, scopolamine-, and hyoscyamine-like alkaloids that can produce tachycardia, hyperthermia, delirium, urinary retention, arrhythmia, and profound confusion. Combining that with serotonergic psychedelic effects is a worst-case operational scenario.`,
      practicalGuidance: `- Treat any belladonna/Brugmansia pairing with ayahuasca, psilocybin, LSD, mescaline, DMT, or yopo as an absolute contraindication.\n- Specialist ethnographic use does not generalize to modern harm-reduction settings.`,
      evidenceGaps: `Controlled co-use studies are effectively impossible, so toxicology cases and ethnographic caution will remain the evidence base.`,
      evidenceTier: 'toxicology case literature + ethnographic caution'
    };
  }

  if (ids.includes('salvia') && otherClassic) {
    return {
      code: 'CAU',
      summary: 'Salvia is non-serotonergic, but same-session use with classic psychedelics can become unsafe because disorientation, dysphoria, and accident risk stack badly.',
      confidence: 'low',
      sources: 'entheogen-interactions-research-update',
      mechanism: `Salvinorin A is a kappa-opioid agonist rather than a classic serotonergic psychedelic. The overlap is at autonomic activation and severe state disruption, not receptor-level serotonin toxicity.`,
      practicalGuidance: `- Prefer separate-day use rather than co-use.\n- In group settings, same-session salvia plus ayahuasca or psilocybin should be treated as high-disorientation and high-accident risk.`,
      evidenceGaps: `Formal combination studies are absent, so this remains a precautionary field rule.`,
      evidenceTier: 'mechanistic inference + salvia risk literature'
    };
  }

  return null;
};

export const resolveInteraction = (drug1: string, drug2: string): ResolvedInteraction => {
  const canonicalPairKey = pairKey(drug1, drug2);

  if (drug1 === drug2) {
    return {
      pairKey: canonicalPairKey,
      origin: 'self',
      evidence: {
        code: 'SELF',
        summary: 'Same entity selected; this is not an interaction pair.',
        confidence: 'n/a',
        sources: 'n/a'
      }
    };
  }

  const explicitEvidence = INTERACTION_RULES[pairKey(drug1, drug2)];
  if (explicitEvidence) {
    return {
      pairKey: canonicalPairKey,
      origin: 'explicit',
      evidence: explicitEvidence
    };
  }

  const fallbackEvidence = getFallbackInteractionEvidence(drug1, drug2);
  if (fallbackEvidence) {
    return {
      pairKey: canonicalPairKey,
      origin: 'fallback',
      evidence: fallbackEvidence
    };
  }

  return {
    pairKey: canonicalPairKey,
    origin: 'unknown',
    evidence: {
      code: 'UNK',
      summary: 'No explicit interaction classification is loaded for this pair in the current curated dataset.',
      confidence: 'low',
      sources: 'source-gap'
    }
  };
};

export const getInteractionEvidence = (drug1: string, drug2: string): InteractionEvidence => {
  return resolveInteraction(drug1, drug2).evidence;
};
