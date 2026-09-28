// Editorial poster art per question, shared by the library shelf and the
// problem pages' "Up Next" cards. (TODO: derive from storyboard poster el.)
// `tone` maps to a .pv-* class in site.css — the pages must not carry inline
// style attributes (design plan, phase 5).
export const posters = {
  'pq-001': { value: '≈ 0.0039', tone: 'green', eyebrow: 'Q♥ · Q♠ · K♦ · ?' },
  'pq-002': { value: '4 / 4', tone: 'gold', eyebrow: 'A(1,2) · B(2,3)' },
};

export function posterFor(q) {
  return posters[q.id] || { value: q.answer, tone: 'green', eyebrow: '' };
}
