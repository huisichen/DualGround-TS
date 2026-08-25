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

const defaultObjectiveDemo = objectiveDemos.find((demo) => demo.hasAttribute('data-default-open'));
objectiveDemos.forEach((demo) => setObjectiveDemo(demo, demo === defaultObjectiveDemo, false));

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
  const input = evidenceExample.querySelector('[data-evidence-input]');
  const workbench = evidenceExample.querySelector('.evidence-workbench');
  const resetButton = evidenceExample.querySelector('[data-evidence-reset]');
  const chart = evidenceExample.querySelector('[data-behavior-chart]');
  const spark = evidenceExample.querySelector('[data-behavior-spark]');
  const forecast = evidenceExample.querySelector('[data-behavior-forecast]');
  const forecastArea = evidenceExample.querySelector('[data-behavior-forecast-area]');
  const endDot = evidenceExample.querySelector('[data-behavior-end-dot]');
  const outcome = evidenceExample.querySelector('[data-behavior-outcome]');
  const count = evidenceExample.querySelector('[data-evidence-count]');
  const live = evidenceExample.querySelector('[data-evidence-live]');

  const evidenceItems = [
    { id: 'price-breakout', label: 'Price Breakout', group: 'temporal', classes: 'series-chip important-chip', important: true, initial: true },
    { id: 'volume-surge', label: 'Volume Surge', group: 'temporal', classes: 'series-chip important-chip', important: true, initial: true },
    { id: 'low-volatility', label: 'Low Volatility', group: 'temporal', classes: 'irrelevant-chip context-chip', important: false, initial: true },
    { id: 'web-traffic', label: 'Web Traffic ↑', group: 'temporal', classes: 'irrelevant-chip context-chip', important: false, initial: false, optional: true },
    { id: 'earnings-beat', label: 'Earnings Beat', group: 'textual', classes: 'event-chip important-chip', important: true, initial: true },
    { id: 'guidance-raised', label: 'Guidance Raised', group: 'textual', classes: 'event-chip important-chip', important: true, initial: true },
    { id: 'dividend-held', label: 'Dividend Held', group: 'textual', classes: 'irrelevant-chip context-chip', important: false, initial: true },
    { id: 'logo-change', label: 'Logo Change', group: 'textual', classes: 'irrelevant-chip context-chip', important: false, initial: false, optional: true }
  ].map((item) => ({ ...item, active: item.initial }));

  const renderEvidenceGroup = (label, group, items) => `
    <div class="evidence-group" role="group" aria-label="${label}">
      <span class="evidence-group-label">${label}</span>
      <div class="evidence-chips">${items.filter((item) => item.group === group).map((item) => `
        <button class="chip evidence-chip ${item.classes}" type="button" data-evidence-id="${item.id}" aria-pressed="${item.active}">
          <span>${item.label}</span><i class="evidence-chip-state" aria-hidden="true"></i>
          ${item.id === 'price-breakout' ? '<i class="evidence-tap-cue" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 3.5 19 14l-6.2 1.4 3.2 5.1-3.1 1.9-3.1-5.2L5 21Z"/><path class="tap-rays" d="M3.5 0.8v2.4M0.8 3.5h2.4M1.5 1.5l1.7 1.7"/></svg></i>' : ''}
        </button>`).join('')}
      </div>
    </div>`;

  input.innerHTML = renderEvidenceGroup('Temporal Evidence', 'temporal', evidenceItems) + renderEvidenceGroup('Textual Evidence', 'textual', evidenceItems);

  const syncEvidenceButton = (item) => {
    const button = input.querySelector(`[data-evidence-id="${item.id}"]`);
    const state = button.querySelector('.evidence-chip-state');
    button.classList.toggle('is-unselected', !item.active);
    button.classList.toggle('is-added', item.active && item.optional);
    button.setAttribute('aria-pressed', item.active ? 'true' : 'false');
    button.setAttribute('aria-label', `${item.active ? 'Remove' : item.optional ? 'Add' : 'Restore'} ${item.label} ${item.active ? 'from' : 'to'} the input`);
    state.textContent = item.active ? '✓' : '+';
  };

  const updateEvidenceForecast = (announcement = '') => {
    const retainedImportant = evidenceItems.filter((item) => item.important && item.active).length;
    const activeCount = evidenceItems.filter((item) => item.active).length;
    const strength = retainedImportant / 4;
    const full = [64, 54, 40, 28];
    const flat = [64, 66, 64, 67];
    const ys = full.map((value, index) => Math.round((flat[index] + (value - flat[index]) * strength) * 10) / 10);
    const points = `240,${ys[0]} 270,${ys[1]} 300,${ys[2]} 334,${ys[3]}`;
    const percent = 2.4 * strength;
    const isFlat = retainedImportant === 0;

    forecast.setAttribute('points', points);
    forecastArea.setAttribute('points', `${points} 334,152 240,152`);
    endDot.setAttribute('cy', ys[3]);
    chart.classList.toggle('forecast-up', !isFlat);
    chart.classList.toggle('forecast-flat', isFlat);
    forecast.classList.toggle('positive-line', !isFlat);
    forecast.classList.toggle('neutral-line', isFlat);
    outcome.classList.toggle('positive', !isFlat);
    outcome.classList.toggle('neutral', isFlat);
    outcome.querySelector('strong').textContent = `${isFlat ? '' : '+'}${percent.toFixed(1)}%`;
    outcome.querySelector('span').textContent = isFlat ? '→' : '↑';
    chart.style.setProperty('--outcome-y', `${14 + (ys[3] - 28) * .6}%`);
    count.textContent = `${activeCount} / 8`;
    spark.setAttribute('aria-label', `Company stock history followed by a ${percent.toFixed(1)} percent ${isFlat ? 'flat' : 'upward'} forecast using ${activeCount} of 8 evidence items. The full-input reference forecast is 2.4 percent upward.`);
    if (announcement) live.textContent = `${announcement} Forecast is now ${isFlat ? 'flat at' : 'up'} ${percent.toFixed(1)} percent.`;
  };

  evidenceItems.forEach((item) => {
    syncEvidenceButton(item);
    input.querySelector(`[data-evidence-id="${item.id}"]`).addEventListener('click', () => {
      workbench.classList.add('has-interacted');
      item.active = !item.active;
      syncEvidenceButton(item);
      updateEvidenceForecast(`${item.label} ${item.active ? item.optional ? 'added' : 'restored' : 'removed'}.`);
    });
  });

  resetButton.addEventListener('click', () => {
    workbench.classList.add('has-interacted');
    evidenceItems.forEach((item) => {
      item.active = item.initial;
      syncEvidenceButton(item);
    });
    updateEvidenceForecast('Evidence reset.');
  });

  workbench.addEventListener('focusin', () => workbench.classList.add('has-interacted'), { once: true });

  updateEvidenceForecast();
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
  const market = futureCard.querySelector('[data-future-market]');
  const spark = futureCard.querySelector('[data-future-chart]');
  const live = futureCard.querySelector('[data-future-live]');
  const counterfactualLine = futureCard.querySelector('[data-future-counterfactual-line]');
  const counterfactualDot = futureCard.querySelector('[data-future-counterfactual-dot]');
  const distanceLine = futureCard.querySelector('[data-future-distance-line]');
  const distanceCapStart = futureCard.querySelector('[data-future-distance-cap-start]');

  const futureData = {
    warning: {
      counterfactual: false,
      aria: 'Profit Warning selected. The fixed realized company stock price drops 2.6 percent.'
    },
    guidance: {
      counterfactual: true,
      points: '430,90 470,93 510,88 550,94 600,91',
      endY: 91,
      distanceY: 94,
      aria: 'Stable Guidance selected. A gray counterfactual forecast stays nearly flat while the fixed realized company stock price drops, showing a moderate distance between them.'
    },
    buyback: {
      counterfactual: true,
      points: '430,90 470,83 510,70 550,57 600,49',
      endY: 49,
      distanceY: 57,
      aria: 'Buyback Plan selected. A gray counterfactual forecast rises while the fixed realized company stock price drops, showing a large distance between them.'
    }
  };

  eventButtons.forEach((button) => button.addEventListener('click', () => {
    eventButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    const next = futureData[button.dataset.futureChoice];
    if (next.counterfactual) {
      counterfactualLine.setAttribute('points', next.points);
      counterfactualDot.setAttribute('cy', next.endY);
      distanceLine.setAttribute('y1', next.distanceY);
      distanceCapStart.setAttribute('y1', next.distanceY);
      distanceCapStart.setAttribute('y2', next.distanceY);
    }
    market.classList.toggle('show-counterfactual', next.counterfactual);
    stage.setAttribute('aria-label', next.aria);
    spark.setAttribute('aria-label', next.aria);
    live.textContent = next.aria;
  }));
}
