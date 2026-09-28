// Editorial poster art per question, shared by the library shelf and the
// problem pages' "Up Next" cards. (TODO: derive from storyboard poster el.)
export const posters = {
  'pq-001': { value: '≈ 0.0039', color: '#6ed9b1', eyebrow: 'Q♥ · Q♠ · K♦ · ?' },
  'pq-002': { value: '4 / 4', color: '#e7ba55', eyebrow: 'A(1,2) · B(2,3)' },
};

export function posterFor(q) {
  return posters[q.id] || { value: q.answer, color: '#6ed9b1', eyebrow: '' };
}
