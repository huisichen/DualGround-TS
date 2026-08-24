const revealItems = document.querySelectorAll('.reveal');
const objectiveDemos = Array.from(document.querySelectorAll('.training-objectives > .inline-demo'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const objectiveAnimations = new WeakMap();

const setObjectiveDemo = (demo, shouldOpen, animate = true) => {
  const button = demo.querySelector(':scope > .demo-toggle');
  const content = demo.querySelector(':scope > .inline-demo-body');
  if (!button || !content) return;

  const currentAnimation = objectiveAnimations.get(demo);
  if (currentAnimation) currentAnimation.cancel();

  demo.classList.toggle('is-open', shouldOpen);
  button.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  if (shouldOpen) content.hidden = false;

  if (!animate || reduceMotion) {
    content.hidden = !shouldOpen;
    return;
  }

  const animation = content.animate(shouldOpen ? [
    { opacity: 0, transform: 'translateY(-8px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ] : [
    { opacity: 1, transform: 'translateY(0)' },
    { opacity: 0, transform: 'translateY(-6px)' }
  ], {
    duration: shouldOpen ? 220 : 160,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    fill: 'both'
  });

  objectiveAnimations.set(demo, animation);
  animation.addEventListener('finish', () => {
    animation.cancel();
    objectiveAnimations.delete(demo);
    if (!shouldOpen) content.hidden = true;
  }, { once: true });
};

objectiveDemos.forEach((demo) => {
  const button = demo.querySelector(':scope > .demo-toggle');
  if (!button) return;
  button.addEventListener('click', () => {
    const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
    if (shouldOpen) {
      objectiveDemos.forEach((other) => {
        if (other !== demo) setObjectiveDemo(other, false, false);
      });
    }
    setObjectiveDemo(demo, shouldOpen);
  });
});

if (window.matchMedia('(max-width: 680px)').matches) {
  document.querySelectorAll('[data-collapse-mobile]').forEach((details) => details.removeAttribute('open'));
}

if (!reduceMotion) {
  document.querySelectorAll('details.inline-demo').forEach((details) => {
    const summary = details.querySelector(':scope > summary');
    const content = details.querySelector(':scope > .inline-demo-body');
    if (!summary || !content) return;

    let animation = null;
    let targetOpen = details.open;

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      targetOpen = !targetOpen;

      if (animation) {
        animation.reverse();
        return;
      }

      if (targetOpen) details.open = true;
      animation = content.animate([
        { opacity: 0, transform: 'translateY(-8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 220,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fill: 'both'
      });

      if (!targetOpen) {
        animation.currentTime = 220;
        animation.reverse();
      }

      animation.addEventListener('finish', () => {
        const shouldStayOpen = targetOpen;
        animation.cancel();
        animation = null;
        details.open = shouldStayOpen;
      }, { once: true });
    });
  });
}

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
  const area = stateExample.querySelector('[data-state-area]');
  const forecast = stateExample.querySelector('[data-state-forecast]');
  const forecastArea = stateExample.querySelector('[data-state-forecast-area]');
  const nowDot = stateExample.querySelector('[data-state-dot]');
  const endDot = stateExample.querySelector('[data-state-end-dot]');
  const chart = stateExample.querySelector('[data-state-chart]');
  const spark = stateExample.querySelector('.market-spark');
  const outcome = stateExample.querySelector('[data-state-outcome]');

  const stateData = {
    weak: {
      points: '36,120 54,113 72,116 90,105 108,98 126,103 144,91 162,82 180,87 198,70 216,75 240,46',
      area: '36,120 54,113 72,116 90,105 108,98 126,103 144,91 162,82 180,87 198,70 216,75 240,46 240,152 36,152',
      forecast: '240,46 270,41 300,32 334,24', forecastArea: '240,46 270,41 300,32 334,24 334,152 240,152', dotY: '46', endY: '24', outcomeY: '17%', change: '+2.4%',
      result: '↑',
      aria: 'Weak macro market history followed by a 2.4 percent upward forecast after the event.',
      tone: 'positive'
    },
    hot: {
      points: '36,46 54,52 72,48 90,60 108,72 126,66 144,82 162,91 180,85 198,104 216,99 240,122',
      area: '36,46 54,52 72,48 90,60 108,72 126,66 144,82 162,91 180,85 198,104 216,99 240,122 240,152 36,152',
      forecast: '240,122 270,128 300,139 334,150', forecastArea: '240,122 270,128 300,139 334,150 334,152 240,152', dotY: '122', endY: '150', outcomeY: '72%', change: '−2.1%',
      result: '↓',
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
    area.setAttribute('points', next.area);
    forecast.setAttribute('points', next.forecast);
    forecastArea.setAttribute('points', next.forecastArea);
    nowDot.setAttribute('cy', next.dotY);
    endDot.setAttribute('cy', next.endY);
    chart.classList.toggle('negative-history', next.tone === 'negative');
    chart.classList.toggle('forecast-negative', next.tone === 'negative');
    chart.classList.toggle('forecast-up', next.tone === 'positive');
    chart.classList.toggle('forecast-down', next.tone === 'negative');
    chart.style.setProperty('--outcome-y', next.outcomeY);
    spark.setAttribute('aria-label', next.aria);
    forecast.classList.toggle('positive-line', next.tone === 'positive');
    forecast.classList.toggle('negative-line', next.tone === 'negative');
    outcome.classList.remove('positive', 'negative');
    outcome.classList.add(next.tone);
    outcome.querySelector('strong').textContent = next.change;
    outcome.querySelector('span').textContent = next.result;
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
    ['Price Breakout', 'series-chip important-chip'],
    ['Volume Surge', 'series-chip important-chip'],
    ['Low Volatility', 'irrelevant-chip context-chip']
  ];
  const baseTextual = [
    ['Earnings Beat', 'event-chip important-chip'],
    ['Guidance Raised', 'event-chip important-chip'],
    ['Dividend Held', 'irrelevant-chip context-chip']
  ];

  const evidenceData = {
    full: {
      temporal: baseTemporal,
      textual: baseTextual,
      tone: 'supported', mark: '↑', prediction: 'Rise', confidence: '78%', status: 'Original'
    },
    retain: {
      temporal: [['Price Breakout', 'series-chip important-chip'], ['Volume Surge', 'series-chip important-chip'], ['Low Volatility', 'irrelevant-chip context-chip muted-chip']],
      textual: [['Earnings Beat', 'event-chip important-chip'], ['Guidance Raised', 'event-chip important-chip'], ['Dividend Held', 'irrelevant-chip context-chip muted-chip']],
      tone: 'supported', mark: '↑', prediction: 'Rise', confidence: '75%', status: 'Preserved'
    },
    remove: {
      temporal: [['Price Breakout', 'series-chip important-chip muted-chip'], ['Volume Surge', 'series-chip important-chip muted-chip'], ['Low Volatility', 'irrelevant-chip context-chip']],
      textual: [['Earnings Beat', 'event-chip important-chip muted-chip'], ['Guidance Raised', 'event-chip important-chip muted-chip'], ['Dividend Held', 'irrelevant-chip context-chip']],
      tone: 'changed', mark: '→', prediction: 'Flat', confidence: '61%', status: 'Changed'
    },
    irrelevant: {
      temporal: [...baseTemporal, ['Web Traffic ↑', 'irrelevant-chip context-chip']],
      textual: [...baseTextual, ['Logo Change', 'irrelevant-chip context-chip']],
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
  const forecastArea = eventExample.querySelector('[data-event-forecast-area]');
  const endDot = eventExample.querySelector('[data-event-end-dot]');
  const chart = eventExample.querySelector('[data-event-chart]');
  const spark = eventExample.querySelector('.market-spark');
  const outcome = eventExample.querySelector('[data-event-outcome]');

  const eventData = {
    cut: {
      event: 'Rate cut', result: '↑', tone: 'positive', change: '+2.4%', endY: '24', outcomeY: '17%',
      forecast: '240,46 270,41 300,32 334,24', forecastArea: '240,46 270,41 300,32 334,24 334,152 240,152',
      aria: 'Fixed market history followed by a 2.4 percent upward forecast after a rate cut.'
    },
    hike: {
      event: 'Rate hike', result: '↓', tone: 'negative', change: '−2.0%', endY: '96', outcomeY: '47%',
      forecast: '240,46 270,58 300,76 334,96', forecastArea: '240,46 270,58 300,76 334,96 334,152 240,152',
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
    forecastArea.setAttribute('points', next.forecastArea);
    endDot.setAttribute('cy', next.endY);
    forecast.classList.toggle('positive-line', next.tone === 'positive');
    forecast.classList.toggle('negative-line', next.tone === 'negative');
    chart.classList.toggle('forecast-negative', next.tone === 'negative');
    chart.classList.toggle('forecast-up', next.tone === 'positive');
    chart.classList.toggle('forecast-down', next.tone === 'negative');
    chart.style.setProperty('--outcome-y', next.outcomeY);
    spark.setAttribute('aria-label', next.aria);
    outcome.classList.remove('positive', 'negative');
    outcome.classList.add(next.tone);
    outcome.querySelector('strong').textContent = next.change;
    outcome.querySelector('span').textContent = next.result;
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
