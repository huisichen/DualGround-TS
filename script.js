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
  const forecast = stateExample.querySelector('[data-state-forecast]');
  const nowDot = stateExample.querySelector('[data-state-dot]');
  const chart = stateExample.querySelector('.market-spark');
  const price = stateExample.querySelector('[data-state-price]');
  const change = stateExample.querySelector('[data-state-change]');
  const result = stateExample.querySelector('[data-state-result]');
  const resultChange = stateExample.querySelector('[data-state-result-change]');
  const copy = stateExample.querySelector('[data-state-copy]');

  const stateData = {
    weak: {
      points: '28,85 44,79 60,82 76,72 92,66 108,70 124,60 140,52 156,56 172,43 188,47 204,30',
      forecast: '204,30 226,27 248,20 274,13', dotY: '30', price: '104.2', change: '+2.4%',
      result: 'Market ↑',
      copy: 'Rate cut after weak state.',
      aria: 'Weak macro market history followed by a 2.4 percent upward forecast after the event.',
      tone: 'positive'
    },
    hot: {
      points: '28,30 44,35 60,32 76,42 92,51 108,47 124,59 140,66 156,61 172,76 188,73 204,88',
      forecast: '204,88 226,92 248,100 274,108', dotY: '88', price: '98.6', change: '−2.1%',
      result: 'Market ↓',
      copy: 'Same cut, opposite response.',
      aria: 'Overheated market history followed by a 2.1 percent downward forecast after the event.',
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
    forecast.setAttribute('points', next.forecast);
    nowDot.setAttribute('cy', next.dotY);
    chart.classList.toggle('negative-history', next.tone === 'negative');
    chart.classList.toggle('forecast-negative', next.tone === 'negative');
    chart.setAttribute('aria-label', next.aria);
    forecast.classList.toggle('positive-line', next.tone === 'positive');
    forecast.classList.toggle('negative-line', next.tone === 'negative');
    price.textContent = next.price;
    change.textContent = next.change;
    result.classList.remove('positive', 'negative');
    result.classList.add(next.tone);
    result.querySelector('strong').textContent = next.result;
    resultChange.textContent = next.change;
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
    ['Price Breakout', 'series-chip'],
    ['Volume Surge', 'series-chip'],
    ['Low Volatility', 'series-chip']
  ];
  const baseTextual = [
    ['Earnings Beat', 'event-chip'],
    ['Guidance Raised', 'event-chip'],
    ['Dividend Held', 'event-chip']
  ];

  const evidenceData = {
    full: {
      temporal: baseTemporal,
      textual: baseTextual,
      tone: 'supported', mark: '↑', prediction: 'Rise', confidence: '78%', status: 'Original'
    },
    retain: {
      temporal: [['Price Breakout', 'series-chip'], ['Volume Surge', 'series-chip'], ['Low Volatility', 'series-chip muted-chip']],
      textual: [['Earnings Beat', 'event-chip'], ['Guidance Raised', 'event-chip'], ['Dividend Held', 'event-chip muted-chip']],
      tone: 'supported', mark: '↑', prediction: 'Rise', confidence: '75%', status: 'Preserved'
    },
    remove: {
      temporal: [['Price Breakout', 'series-chip muted-chip'], ['Volume Surge', 'series-chip muted-chip'], ['Low Volatility', 'series-chip']],
      textual: [['Earnings Beat', 'event-chip muted-chip'], ['Guidance Raised', 'event-chip muted-chip'], ['Dividend Held', 'event-chip']],
      tone: 'changed', mark: '→', prediction: 'Flat', confidence: '61%', status: 'Changed'
    },
    irrelevant: {
      temporal: [...baseTemporal, ['Web Traffic ↑', 'irrelevant-chip']],
      textual: [...baseTextual, ['Logo Change', 'irrelevant-chip']],
      tone: 'invariant', mark: '↑', prediction: 'Rise', confidence: '77%', status: 'Unaffected'
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
  const forecast = eventExample.querySelector('[data-event-forecast]');
  const chart = eventExample.querySelector('.market-spark');
  const change = eventExample.querySelector('[data-event-change]');
  const result = eventExample.querySelector('[data-event-result]');
  const resultLabel = result.querySelector('strong');
  const resultChange = eventExample.querySelector('[data-event-result-change]');
  const copy = eventExample.querySelector('[data-event-copy]');

  const eventData = {
    cut: {
      event: 'Rate cut', result: 'Market ↑', tone: 'positive', change: '+2.4%',
      forecast: '204,30 226,27 248,20 274,13',
      copy: 'Rate cut after the fixed history.',
      aria: 'Fixed market history followed by a 2.4 percent upward forecast after a rate cut.'
    },
    hike: {
      event: 'Rate hike', result: 'Market ↓', tone: 'negative', change: '−2.0%',
      forecast: '204,30 226,38 248,49 274,60',
      copy: 'Rate hike after the fixed history.',
      aria: 'Fixed market history followed by a 2 percent downward forecast after a rate hike.'
    }
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    const next = eventData[button.dataset.event];
    eventLabel.textContent = next.event;
    forecast.setAttribute('points', next.forecast);
    forecast.classList.toggle('positive-line', next.tone === 'positive');
    forecast.classList.toggle('negative-line', next.tone === 'negative');
    chart.classList.toggle('forecast-negative', next.tone === 'negative');
    chart.setAttribute('aria-label', next.aria);
    change.textContent = next.change;
    result.classList.remove('positive', 'negative');
    result.classList.add(next.tone);
    resultLabel.textContent = next.result;
    resultChange.textContent = next.change;
    copy.textContent = next.copy;
  }));
}

const futureCard = document.querySelector('.future-card');
if (futureCard) {
  const eventButtons = futureCard.querySelectorAll('[data-future-choice]');
  const stage = futureCard.querySelector('.future-stage');
  const switcher = futureCard.querySelector('.future-switcher');
  const path = futureCard.querySelector('[data-future-path]');
  const mark = futureCard.querySelector('[data-future-mark]');
  const relation = futureCard.querySelector('[data-future-relation]');

  const futureData = {
    warning: {
      mode: 'matched', mark: '✓', relation: 'Closer',
      aria: 'The profit warning event-history state is closer to the realized company stock price drop.'
    },
    buyback: {
      mode: 'mismatched', mark: '×', relation: 'Farther',
      aria: 'The swapped buyback-plan event-history state is farther from the realized company stock price drop.'
    }
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
    stage.setAttribute('aria-label', next.aria);
    mark.textContent = next.mark;
    relation.textContent = next.relation;
  }));
}
