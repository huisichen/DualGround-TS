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
      points: '4,76 27,71 50,74 73,65 96,58 119,62 142,52 165,44 188,47 211,35 234,39 257,21',
      result: 'Market ↑',
      copy: 'The event is compatible with a weak macro state and supports an upward response.',
      tone: 'positive'
    },
    hot: {
      points: '4,20 27,25 50,22 73,32 96,41 119,37 142,49 165,56 188,51 211,66 234,63 257,79',
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
  const prediction = output.querySelector('[data-behavior-prediction]');
  const confidence = output.querySelector('[data-behavior-confidence]');
  const outputCopy = evidenceExample.querySelector('[data-behavior-copy]');
  const mark = output.querySelector('.behavior-mark');

  const baseTemporal = [
    ['Rising Peaks', 'series-chip'],
    ['Stable Overnight', 'series-chip'],
    ['Heat Response', 'series-chip']
  ];
  const baseTextual = [
    ['Heat Alert', 'event-chip'],
    ['Full Production', 'event-chip'],
    ['App Update', 'event-chip']
  ];

  const evidenceData = {
    full: {
      temporal: baseTemporal,
      textual: baseTextual,
      tone: 'supported', mark: '✓', prediction: 'Increase', confidence: '78%', status: 'Original'
    },
    retain: {
      temporal: [['Rising Peaks', 'series-chip'], ['Stable Overnight', 'series-chip muted-chip'], ['Heat Response', 'series-chip']],
      textual: [['Heat Alert', 'event-chip'], ['Full Production', 'event-chip'], ['App Update', 'event-chip muted-chip']],
      tone: 'supported', mark: '≈', prediction: 'Increase', confidence: '75%', status: 'Preserved'
    },
    remove: {
      temporal: [['Rising Peaks', 'series-chip muted-chip'], ['Stable Overnight', 'series-chip'], ['Heat Response', 'series-chip muted-chip']],
      textual: [['Heat Alert', 'event-chip muted-chip'], ['Full Production', 'event-chip muted-chip'], ['App Update', 'event-chip']],
      tone: 'changed', mark: '↘', prediction: 'Stable', confidence: '61%', status: 'Changed'
    },
    irrelevant: {
      temporal: [...baseTemporal, ['App Use ↑', 'irrelevant-chip']],
      textual: [...baseTextual, ['UI Update', 'irrelevant-chip']],
      tone: 'invariant', mark: '≈', prediction: 'Increase', confidence: '77%', status: 'Unaffected'
    }
  };

  const renderEvidenceGroup = (label, chips) => `
    <div class="evidence-group">
      <span class="evidence-group-label">${label}</span>
      <div class="evidence-chips">${chips.map(([chipLabel, classes]) => `<span class="chip ${classes}">${chipLabel}</span>`).join('')}</div>
    </div>`;

  const renderEvidence = (next) => {
    input.innerHTML = renderEvidenceGroup('Temporal Evidence', next.temporal) + renderEvidenceGroup('Textual Evidence', next.textual);
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    const next = evidenceData[button.dataset.mode];
    renderEvidence(next);
    output.classList.remove('supported', 'changed', 'invariant');
    output.classList.add(next.tone);
    mark.textContent = next.mark;
    prediction.textContent = next.prediction;
    confidence.textContent = next.confidence;
    outputCopy.textContent = next.status;
  }));

  renderEvidence(evidenceData.full);
}

const eventExample = document.querySelector('[data-event-example]');
if (eventExample) {
  const buttons = eventExample.querySelectorAll('[data-event]');
  const eventLabel = eventExample.querySelector('[data-event-label]');
  const result = eventExample.querySelector('[data-event-result]');
  const resultLabel = result.querySelector('strong');
  const copy = eventExample.querySelector('[data-event-copy]');

  const eventData = {
    cut: {
      event: 'Rate cut', result: 'Market ↑', tone: 'positive',
      copy: 'The same history leads upward when paired with a rate cut.'
    },
    hike: {
      event: 'Rate hike', result: 'Market ↓', tone: 'negative',
      copy: 'The same history leads downward when paired with a rate hike.'
    }
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    const next = eventData[button.dataset.event];
    eventLabel.textContent = next.event;
    result.classList.remove('positive', 'negative');
    result.classList.add(next.tone);
    resultLabel.textContent = next.result;
    copy.textContent = next.copy;
  }));
}

const futureCard = document.querySelector('.future-card');
if (futureCard) {
  const eventButtons = futureCard.querySelectorAll('[data-future-choice]');
  const switcher = futureCard.querySelector('.future-switcher');
  const path = futureCard.querySelector('[data-future-path]');
  const pathLabel = futureCard.querySelector('[data-future-path-label]');
  const mark = futureCard.querySelector('[data-future-mark]');
  const relation = futureCard.querySelector('[data-future-relation]');

  const futureData = {
    rain: { mode: 'matched', label: 'Matched Event', mark: '✓', relation: 'Closer' },
    holiday: { mode: 'mismatched', label: 'Mismatched Event', mark: '×', relation: 'Farther' }
  };

  eventButtons.forEach((button) => button.addEventListener('click', () => {
    eventButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    const next = futureData[button.dataset.futureChoice];
    switcher.classList.toggle('matched-mode', next.mode === 'matched');
    switcher.classList.toggle('mismatched-mode', next.mode === 'mismatched');
    path.classList.toggle('matched-path', next.mode === 'matched');
    path.classList.toggle('mismatched-path', next.mode === 'mismatched');
    pathLabel.textContent = next.label;
    mark.textContent = next.mark;
    relation.textContent = next.relation;
  }));
}
