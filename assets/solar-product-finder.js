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

  var LANG_STORAGE_KEY = 'pf-lang';

  var I18N = {
    de: {
      'intro.eyebrow': 'Kostenloser Konfigurator',
      'intro.title': 'Finde dein passendes Balkonkraftwerk',
      'intro.lead': 'Beantworte ein paar kurze Fragen zu deinem Standort und Bedarf – wir empfehlen dir das passende SolarMeister-Set aus unserem Sortiment.',
      'intro.start': 'Jetzt starten',
      'nav.back': '← Zurück',
      'nav.next': 'Weiter',
      'mount.question': 'Wo möchtest du dein Balkonkraftwerk montieren?',
      'mount.balkon': 'Balkon',
      'mount.flachdach': 'Flachdach oder Terrasse',
      'mount.dach': 'Dach',
      'mount.fassade': 'Hauswand oder Fassade',
      'mount.garten': 'Garten',
      'mount.ohne': 'Ohne Halterung',
      'mount.unsicher': 'Noch unsicher oder mehr als ein Ort',
      'weight.question': 'Ist deine Montagefläche gewichtssensibel, gebogen oder gewölbt?',
      'weight.hint': 'Zum Beispiel aufgrund einer gerundeten Balkonbrüstung.',
      'common.yes': 'Ja',
      'common.no': 'Nein',
      'common.dontknow': 'Ich weiß es nicht',
      'space.question': 'Wie viel Platz steht dir für die Solarmodule zur Verfügung?',
      'space.hint': 'Richtwert je nach Montageart und Modulgröße.',
      'space.opt1': 'ca. 1,2 × 2 m<br><small>Platz für 1 Solarmodul</small>',
      'space.opt2': 'ca. 2,4 × 2 m<br><small>Platz für 2 Solarmodule</small>',
      'space.opt3': 'ca. 4,8 × 2 m<br><small>Platz für 3–4 Solarmodule</small>',
      'space.opt4': 'Mehr als 4,8 × 2 m<br><small>Platz für 6–8 Solarmodule</small>',
      'consumption.question': 'Wie hoch ist dein jährlicher Stromverbrauch?',
      'consumption.hint': 'Eine ungefähre Einschätzung genügt.',
      'consumption.opt1': 'Unter 1.000 kWh',
      'consumption.opt2': '1.000 – 2.000 kWh',
      'consumption.opt3': '2.000 – 3.000 kWh',
      'consumption.opt4': 'Über 3.000 kWh',
      'orientation.question': 'Wie ist die Ausrichtung des Standorts?',
      'orientation.south': 'Süden',
      'orientation.eastwest': 'Osten oder Westen',
      'orientation.north': 'Norden',
      'rent.question': 'Wohnst du zur Miete?',
      'rent.hint': 'Auch als Mieter ist ein Balkonkraftwerk grundsätzlich möglich.',
      'loading.title': 'Wir stellen dein Ergebnis zusammen …',
      'results.eyebrow': '0% MwSt. auf Photovoltaik gem. § 12 Abs. 3 UStG',
      'results.title': 'Unsere Empfehlung für dich',
      'results.lead': 'Dieses Set passt am besten zu deinem Standort, deiner Ausrichtung und deinem Platzangebot.',
      'results.restart': '↻ Von vorne beginnen',
      'result.watt': 'Leistung: {watt} W',
      'result.battery': 'Inkl. Speicher – Solarstrom auch abends nutzbar',
      'result.vat': '0% MwSt. gemäß § 12 Abs. 3 UStG',
      'result.renter': 'Auch als Mieter grundsätzlich möglich',
      'result.cta': 'Produkt ansehen',
      'result.addonLabel': 'Passt dazu:',
      'result.empty': 'Leider konnten wir gerade kein passendes Set finden. Bitte kontaktiere uns direkt.'
    },
    en: {
      'intro.eyebrow': 'Free configurator',
      'intro.title': 'Find your perfect balcony power station',
      'intro.lead': 'Answer a few short questions about your location and needs – we’ll recommend the right SolarMeister set from our range.',
      'intro.start': 'Start now',
      'nav.back': '← Back',
      'nav.next': 'Next',
      'mount.question': 'Where would you like to mount your balcony power station?',
      'mount.balkon': 'Balcony',
      'mount.flachdach': 'Flat roof or terrace',
      'mount.dach': 'Roof',
      'mount.fassade': 'House wall or facade',
      'mount.garten': 'Garden',
      'mount.ohne': 'Without a bracket',
      'mount.unsicher': 'Still unsure or more than one location',
      'weight.question': 'Is your mounting surface weight-sensitive, curved, or arched?',
      'weight.hint': 'For example, due to a rounded balcony railing.',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.dontknow': 'I don’t know',
      'space.question': 'How much space do you have available for the solar panels?',
      'space.hint': 'Guideline value depending on mounting type and panel size.',
      'space.opt1': 'approx. 1.2 × 2 m<br><small>Space for 1 solar panel</small>',
      'space.opt2': 'approx. 2.4 × 2 m<br><small>Space for 2 solar panels</small>',
      'space.opt3': 'approx. 4.8 × 2 m<br><small>Space for 3–4 solar panels</small>',
      'space.opt4': 'More than 4.8 × 2 m<br><small>Space for 6–8 solar panels</small>',
      'consumption.question': 'What is your annual electricity consumption?',
      'consumption.hint': 'A rough estimate is enough.',
      'consumption.opt1': 'Under 1,000 kWh',
      'consumption.opt2': '1,000 – 2,000 kWh',
      'consumption.opt3': '2,000 – 3,000 kWh',
      'consumption.opt4': 'Over 3,000 kWh',
      'orientation.question': 'What is the orientation of the location?',
      'orientation.south': 'South',
      'orientation.eastwest': 'East or West',
      'orientation.north': 'North',
      'rent.question': 'Do you rent your home?',
      'rent.hint': 'A balcony power station is generally possible for tenants too.',
      'loading.title': 'Putting together your result …',
      'results.eyebrow': '0% VAT on photovoltaics acc. to § 12 para. 3 UStG',
      'results.title': 'Our recommendation for you',
      'results.lead': 'This set best matches your location, orientation, and available space.',
      'results.restart': '↻ Start over',
      'result.watt': 'Output: {watt} W',
      'result.battery': 'Includes battery – use solar power in the evening too',
      'result.vat': '0% VAT according to § 12 para. 3 UStG',
      'result.renter': 'Generally possible for tenants too',
      'result.cta': 'View product',
      'result.addonLabel': 'Goes well with:',
      'result.empty': 'Unfortunately we couldn’t find a matching set right now. Please contact us directly.'
    }
  };

  var currentLang = 'de';
  try {
    var stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'de') currentLang = stored;
  } catch (e) {}

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.de[key] || key);
  }

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
  var lastResult = null;

  function applyLang() {
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = I18N[currentLang][key];
      if (val != null) el.innerHTML = val;
    });
    root.querySelectorAll('[data-pf-lang]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-pf-lang') === currentLang);
    });
    root.setAttribute('lang', currentLang);

    if (panels.results && !panels.results.hidden && lastResult) {
      renderResult(lastResult);
    }
  }

  function showPanel(name) {
    Object.keys(panels).forEach(function (key) {
      if (panels[key]) panels[key].hidden = key !== name;
    });
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
    var langBtn = event.target.closest('[data-pf-lang]');
    if (langBtn) {
      currentLang = langBtn.getAttribute('data-pf-lang');
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, currentLang);
      } catch (e) {}
      applyLang();
      return;
    }

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
      lastResult = null;
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
      hasBattery: product ? product.tags.indexOf('MitSpeicher') !== -1 : false,
      isRenter: answers.rent === 'ja'
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
    lastResult = result;
    var product = result.product;
    if (!product) {
      resultCard.innerHTML = '<p>' + t('result.empty') + '</p>';
      addonBox.hidden = true;
      return;
    }

    var bullets = [];
    if (result.watt) bullets.push(t('result.watt').replace('{watt}', result.watt));
    if (result.hasBattery) bullets.push(t('result.battery'));
    bullets.push(t('result.vat'));
    if (result.isRenter) bullets.push(t('result.renter'));

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
      '<a class="pf__button pf__button--primary" href="' + product.url + '">' + t('result.cta') + '</a>' +
      '</div>';

    if (ADDON_MOUNTS.indexOf(answers.mount) !== -1) {
      var addon = addons.filter(function (a) { return a.mount === answers.mount; })[0];
      if (addon) {
        var addonImg = addon.image ? '<img src="' + addon.image + '" alt="' + addon.title + '">' : '';
        addonBox.innerHTML =
          addonImg +
          '<span>' + t('result.addonLabel') + ' <a href="' + addon.url + '">' + addon.title + '</a> – ' + formatPrice(addon.price) + '</span>';
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

  applyLang();
})();
