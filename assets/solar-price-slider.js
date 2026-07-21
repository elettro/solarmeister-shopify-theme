class PriceRangeSlider extends HTMLElement {
  connectedCallback() {
    this.max = Number(this.dataset.max || 0);
    this.fromInput = document.getElementById(this.dataset.fromId);
    this.toInput = document.getElementById(this.dataset.toId);
    this.rangeMin = this.querySelector('[data-range-min]');
    this.rangeMax = this.querySelector('[data-range-max]');
    this.trackRange = this.querySelector('[data-track-range]');
    this.valueMin = this.querySelector('[data-value-min]');
    this.valueMax = this.querySelector('[data-value-max]');

    if (!this.fromInput || !this.toInput || !this.max || !this.rangeMin || !this.rangeMax) return;

    this.rangeMin.max = this.max;
    this.rangeMax.max = this.max;

    this.syncFromFields();

    this.rangeMin.addEventListener('input', () => this.onRangeInput('min'));
    this.rangeMax.addEventListener('input', () => this.onRangeInput('max'));
    this.fromInput.addEventListener('change', () => this.syncFromFields());
    this.toInput.addEventListener('change', () => this.syncFromFields());
  }

  parseValue(value) {
    if (value === '' || value === null || typeof value === 'undefined') return null;
    const parsed = parseFloat(String(value).replace(',', '.'));
    return Number.isNaN(parsed) ? null : Math.round(parsed);
  }

  onRangeInput(which) {
    let minVal = Number(this.rangeMin.value);
    let maxVal = Number(this.rangeMax.value);

    if (minVal > maxVal) {
      if (which === 'min') {
        minVal = maxVal;
        this.rangeMin.value = minVal;
      } else {
        maxVal = minVal;
        this.rangeMax.value = maxVal;
      }
    }

    this.updateTrack(minVal, maxVal);
    this.updateLabels(minVal, maxVal);

    this.fromInput.value = minVal > 0 ? minVal : '';
    this.toInput.value = maxVal < this.max ? maxVal : '';
    this.fromInput.dispatchEvent(new Event('input', { bubbles: true }));
    this.toInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  syncFromFields() {
    const minVal = this.parseValue(this.fromInput.value) ?? 0;
    const maxVal = this.parseValue(this.toInput.value) ?? this.max;
    this.rangeMin.value = minVal;
    this.rangeMax.value = maxVal;
    this.updateTrack(minVal, maxVal);
    this.updateLabels(minVal, maxVal);
  }

  updateTrack(minVal, maxVal) {
    const minPct = this.max ? (minVal / this.max) * 100 : 0;
    const maxPct = this.max ? (maxVal / this.max) * 100 : 100;
    this.trackRange.style.left = `${minPct}%`;
    this.trackRange.style.right = `${100 - maxPct}%`;
  }

  updateLabels(minVal, maxVal) {
    if (this.valueMin) this.valueMin.textContent = this.formatMoney(minVal);
    if (this.valueMax) this.valueMax.textContent = this.formatMoney(maxVal);
  }

  formatMoney(value) {
    try {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: this.dataset.currency || 'EUR' }).format(
        value
      );
    } catch (error) {
      return value;
    }
  }
}

if (!customElements.get('price-range-slider')) {
  customElements.define('price-range-slider', PriceRangeSlider);
}
