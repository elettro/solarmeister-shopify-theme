(function () {
  'use strict';

  var root = document.querySelector('[data-product-finder]');
  if (!root) return;

  var STEPS = [
    { id: 'mount', type: 'cards' },
    { id: 'weight', type: 'radio' },
    { id: 'space', type: 'cards' },
    { id: 'consumption', type: 'radio' },
    { id: 'orientation', type: 'radio' },
    { id: 'rent', type: 'radio' }
  ];

  var MOUNT_TAG_MAP = {
    balkon: 'Balkon',
    flachdach: 'Flachdach',
    dach: 'Dach',
    fassade: 'Wandmontage',
    garten: 'Gartenmontage',
    ohne: 'OhneHalterung'
  };

  var ADDON_MOUNTS = ['balkon', 'flachdach', 'fassade', 'garten'];

  var catalog = [];
  var addons = [];
  try {
    var catalogEl = root.querySelector('[data-pf-catalog]');
    catalog = JSON.parse(catalogEl.textContent || '[]');
  } catch (e) {
    catalog = [];
  }
  try {
    var addonsEl = root.querySelector('[data-pf-addons]');
    addons = JSON.parse(addonsEl.textContent || '[]');
  } catch (e) {
    addons = [];
  }

  var panels = {
    intro: root.querySelector('[data-pf-panel="intro"]'),
    quiz: root.querySelector('[data-pf-panel="quiz"]'),
    loading: root.querySelector('[data-pf-panel="loading"]'),
    results: root.querySelector('[data-pf-panel="results"]')
  };

  var progressFill = root.querySelector('[data-pf-progress-fill]');
  var progressLabel = root.querySelector('[data-pf-progress-label]');
  var backButton = root.querySelector('[data-pf-back]');
  var nextButton = root.querySelector('[data-pf-next]');
  var resultCard = root.querySelector('[data-pf-result-card]');
  var addonBox = root.querySelector('[data-pf-addon]');

  var answers = {};
  var currentIndex = 0;

  function showPanel(name) {
    Object.keys(panels).forEach(function (key) {
      if (panels[key]) panels[key].hidden = key !== name;
    });
  }

  function currentStepEl() {
    return root.querySelector('[data-pf-step="' + STEPS[currentIndex].id + '"]');
  }

  function renderStep() {
    STEPS.forEach(function (step) {
      var el = root.querySelector('[data-pf-step="' + step.id + '"]');
      if (el) el.hidden = step.id !== STEPS[currentIndex].id;
    });

    var pct = Math.round(((currentIndex + 1) / STEPS.length) * 100);
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressLabel) progressLabel.textContent = pct + '%';
    if (backButton) backButton.hidden = currentIndex === 0;

    var step = STEPS[currentIndex];
    if (nextButton) {
      if (step.type === 'radio') {
        nextButton.hidden = false;
        nextButton.disabled = !answers[step.id];
      } else {
        nextButton.hidden = true;
      }
    }
  }

  function selectCard(stepId, button) {
    var grid = root.querySelector('[data-pf-options="' + stepId + '"]');
    if (grid) {
      grid.querySelectorAll('[data-pf-choice]').forEach(function (el) {
        el.classList.remove('is-selected');
      });
    }
    button.classList.add('is-selected');
  }

  function goToStep(index) {
    if (index < 0 || index >= STEPS.length) return;
    currentIndex = index;
    renderStep();
  }

  function advance() {
    if (currentIndex < STEPS.length - 1) {
      goToStep(currentIndex + 1);
    } else {
      finish();
    }
  }

  root.addEventListener('click', function (event) {
    var startBtn = event.target.closest('[data-pf-start]');
    if (startBtn) {
      showPanel('quiz');
      goToStep(0);
      return;
    }

    var restartBtn = event.target.closest('[data-pf-restart]');
    if (restartBtn) {
      answers = {};
      currentIndex = 0;
      showPanel('intro');
      return;
    }

    var backBtn = event.target.closest('[data-pf-back]');
    if (backBtn) {
      goToStep(currentIndex - 1);
      return;
    }

    var nextBtn = event.target.closest('[data-pf-next]');
    if (nextBtn && !nextBtn.disabled) {
      advance();
      return;
    }

    var card = event.target.closest('.pf__card[data-pf-choice]');
    if (card) {
      var step = card.closest('[data-pf-step]');
      var stepId = step ? step.getAttribute('data-pf-step') : null;
      if (!stepId) return;
      answers[stepId] = card.getAttribute('data-value');
      selectCard(stepId, card);
      window.setTimeout(advance, 220);
    }
  });

  root.addEventListener('change', function (event) {
    var input = event.target.closest('input[type="radio"][data-pf-choice]');
    if (!input) return;
    var step = input.closest('[data-pf-step]');
    var stepId = step ? step.getAttribute('data-pf-step') : null;
    if (!stepId) return;
    answers[stepId] = input.value;
    if (nextButton) nextButton.disabled = false;
  });

  function wattOf(product) {
    for (var i = 0; i < product.tags.length; i++) {
      var m = /^(\d+)W$/.exec(product.tags[i]);
      if (m) return parseInt(m[1], 10);
    }
    return null;
  }

  function subsetByTag(tag) {
    return catalog.filter(function (p) {
      return p.tags.indexOf(tag) !== -1;
    });
  }

  function pickProduct() {
    var spaceTargets = { '1': 450, '2': 900, '3-4': 1600, '6-8': 3150, unsicher: null };
    var consumptionTargets = { 'unter-1000': 450, '1000-2000': 900, '2000-3000': 1600, 'ueber-3000': 3150, unsicher: 900 };
    var orientationMultiplier = { sueden: 1, 'ost-west': 1.15, norden: 1.4, unsicher: 1 };

    var baseTarget = spaceTargets[answers.space];
    if (baseTarget == null) baseTarget = consumptionTargets[answers.consumption] || 900;
    var targetWatt = baseTarget * (orientationMultiplier[answers.orientation] || 1);

    var mountTag = MOUNT_TAG_MAP[answers.mount];
    var subset = [];
    var usedBatteryLine = false;
    var usedFlexLine = false;

    if (answers.weight === 'ja') {
      subset = subsetByTag('Flexibel');
      usedFlexLine = true;
    } else if (answers.consumption === '2000-3000' || answers.consumption === 'ueber-3000') {
      subset = subsetByTag('MitSpeicher');
      usedBatteryLine = true;
    } else if (mountTag) {
      subset = subsetByTag(mountTag);
    } else {
      subset = catalog.slice();
    }

    if (subset.length === 0 && (usedBatteryLine || usedFlexLine)) {
      subset = mountTag ? subsetByTag(mountTag) : catalog.slice();
      usedBatteryLine = false;
      usedFlexLine = false;
    }
    if (subset.length === 0) subset = catalog.slice();

    var withWatt = subset.filter(function (p) {
      return wattOf(p) != null;
    });
    var pool = withWatt.length ? withWatt : subset;

    pool.sort(function (a, b) {
      var da = Math.abs((wattOf(a) || targetWatt) - targetWatt);
      var db = Math.abs((wattOf(b) || targetWatt) - targetWatt);
      if (da !== db) return da - db;
      return a.price - b.price;
    });

    var product = pool[0] || catalog[0];

    return {
      product: product,
      watt: product ? wattOf(product) : null,
      hasBattery: product ? product.tags.indexOf('MitSpeicher') !== -1 : false
    };
  }

  function formatPrice(cents) {
    var value = (cents || 0) / 100;
    try {
      return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    } catch (e) {
      return value.toFixed(2) + ' €';
    }
  }

  function renderResult(result) {
    var product = result.product;
    if (!product) {
      resultCard.innerHTML = '<p>Leider konnten wir gerade kein passendes Set finden. Bitte kontaktiere uns direkt.</p>';
      addonBox.hidden = true;
      return;
    }

    var bullets = [];
    if (result.watt) bullets.push('Leistung: ' + result.watt + ' W');
    if (result.hasBattery) bullets.push('Inkl. Speicher – Solarstrom auch abends nutzbar');
    bullets.push('0% MwSt. gemäß § 12 Abs. 3 UStG');
    if (answers.rent === 'ja') bullets.push('Auch als Mieter grundsätzlich möglich');

    var imageHtml = product.image
      ? '<img src="' + product.image + '" alt="' + product.title + '" loading="lazy">'
      : '';

    resultCard.innerHTML =
      '<div class="pf__result-image">' + imageHtml + '</div>' +
      '<div class="pf__result-body">' +
      '<h3 class="pf__result-title">' + product.title + '</h3>' +
      '<p class="pf__result-price">' + formatPrice(product.price) + '</p>' +
      '<ul class="pf__result-bullets">' +
      bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') +
      '</ul>' +
      '<a class="pf__button pf__button--primary" href="' + product.url + '">Produkt ansehen</a>' +
      '</div>';

    if (ADDON_MOUNTS.indexOf(answers.mount) !== -1) {
      var addon = addons.filter(function (a) { return a.mount === answers.mount; })[0];
      if (addon) {
        var addonImg = addon.image ? '<img src="' + addon.image + '" alt="' + addon.title + '">' : '';
        addonBox.innerHTML =
          addonImg +
          '<span>Passt dazu: <a href="' + addon.url + '">' + addon.title + '</a> – ' + formatPrice(addon.price) + '</span>';
        addonBox.hidden = false;
      } else {
        addonBox.hidden = true;
      }
    } else {
      addonBox.hidden = true;
    }
  }

  function finish() {
    showPanel('loading');
    window.setTimeout(function () {
      var result = pickProduct();
      renderResult(result);
      showPanel('results');
    }, 700);
  }
})();
