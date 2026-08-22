const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.09 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const stateExample = document.querySelector('[data-state-example]');
if (stateExample) {
  const buttons = stateExample.querySelectorAll('[data-state]');
  const line = stateExample.querySelector('[data-state-line]');
  const result = stateExample.querySelector('[data-state-result]');
  const copy = stateExample.querySelector('[data-state-copy]');

  const stateData = {
    weak: {
      points: '4,54 22,43 40,60 59,36 78,48 99,39 119,55 139,45 159,61 180,35 203,43 227,29 255,36',
      result: 'Market ↑',
      copy: 'The event is compatible with a weak macro state and supports an upward response.',
      tone: 'positive'
    },
    hot: {
      points: '4,23 22,34 39,18 57,42 77,27 99,51 118,33 139,55 159,38 181,66 202,53 228,76 255,70',
      result: 'Market ↓',
      copy: 'Under an overheated state, the same event implies a different event-conditioned response.',
      tone: 'negative'
    }
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    const next = stateData[button.dataset.state];
    line.setAttribute('points', next.points);
    line.closest('svg').style.color = next.tone === 'positive' ? 'var(--blue)' : 'var(--red)';
    result.classList.remove('positive', 'negative');
    result.classList.add(next.tone);
    result.querySelector('strong').textContent = next.result;
    copy.textContent = next.copy;
  }));
}

const evidenceExample = document.querySelector('[data-evidence-example]');
if (evidenceExample) {
  const buttons = evidenceExample.querySelectorAll('[data-mode]');
  const input = evidenceExample.querySelector('[data-evidence-input]');
  const output = evidenceExample.querySelector('[data-behavior-output]');
  const outputTitle = output.querySelector('strong');
  const outputCopy = evidenceExample.querySelector('[data-behavior-copy]');
  const mark = output.querySelector('.behavior-mark');

  const evidenceData = {
    full: {
      chips: [['temporal evidence', 'series-chip'], ['textual evidence', 'event-chip']],
      tone: 'supported', mark: '✓', title: 'Original prediction',
      copy: 'Full evidence produces the reference prediction and explanation.'
    },
    retain: {
      chips: [['selected temporal evidence', 'series-chip'], ['selected textual evidence', 'event-chip']],
      tone: 'supported', mark: '≈', title: 'Prediction preserved',
      copy: 'Selected evidence is sufficient when retaining it preserves the full-input behavior.'
    },
    remove: {
      chips: [['temporal evidence removed', 'series-chip muted-chip'], ['textual evidence removed', 'event-chip muted-chip']],
      tone: 'changed', mark: '↘', title: 'Prediction support drops',
      copy: 'Important cited evidence is comprehensive when removing it produces a meaningful response.'
    },
    irrelevant: {
      chips: [['temporal evidence', 'series-chip'], ['textual evidence', 'event-chip'], ['irrelevant context', 'irrelevant-chip']],
      tone: 'invariant', mark: '≈', title: 'Prediction stays stable',
      copy: 'Selective grounding leaves the prediction invariant to non-predictive context.'
    }
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    const next = evidenceData[button.dataset.mode];
    input.innerHTML = next.chips.map(([label, classes]) => `<span class="chip ${classes}">${label}</span>`).join('');
    output.classList.remove('supported', 'changed', 'invariant');
    output.classList.add(next.tone);
    mark.textContent = next.mark;
    outputTitle.textContent = next.title;
    outputCopy.textContent = next.copy;
  }));
}
