/*
  <free-shipping-progress>
  ---------------------------------------------------------------------------
  Keeps the PDP free-shipping progress block up to date.

  data-basis="product" (default) measures the SELECTED VARIANT's price against
  the threshold, so the copy reads "This product is X away from" /
  "This product qualifies for" and never claims the reward is already unlocked
  before anything is in the cart. It follows PUB_SUB_EVENTS.variantChange.

  data-basis="cart" measures the REAL cart total instead.

  It does not own any cart state: it listens to the theme's existing cart
  mechanisms only —
    • PUB_SUB_EVENTS.cartUpdate  (published by product-form.js on add-to-cart
      and by cart.js on quantity change / line removal)
    • the 'cart:updated' DOM event (also dispatched by cart.js)

  /cart/change.js returns the whole cart, so those payloads carry
  `total_price` and are used directly. /cart/add.js returns the added line
  item, so when no total is present we fall back to one debounced /cart.js
  read. Rendered markup comes from Liquid, so the block is already correct on
  first paint and this script only handles subsequent updates.
*/
if (!customElements.get('free-shipping-progress')) {
  customElements.define(
    'free-shipping-progress',
    class FreeShippingProgress extends HTMLElement {
      constructor() {
        super();
        this.pending = false;
        this.timer = null;
        this.onDomCartUpdate = this.onDomCartUpdate.bind(this);
        this.onCartUpdate = this.onCartUpdate.bind(this);
        this.onVariantChange = this.onVariantChange.bind(this);
      }

      connectedCallback() {
        this.threshold = parseInt(this.dataset.threshold, 10);
        // No threshold configured -> Liquid renders nothing, nothing to wire up.
        if (!this.threshold || this.threshold <= 0) return;

        this.fill = this.querySelector('[data-kfsp-fill]');
        this.mwrap = this.querySelector('[data-kfsp-mwrap]');
        this.marker = this.querySelector('[data-kfsp-marker]');
        this.track = this.querySelector('[data-kfsp-track]');
        this.label = this.querySelector('[data-kfsp-label]');
        this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';
        this.textAway = this.dataset.textAway || '';
        this.textComplete = this.dataset.textComplete || '';

        this.basis = this.dataset.basis === 'cart' ? 'cart' : 'product';
        this.sectionId = this.dataset.sectionId || '';

        const hasPubSub = typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined';

        if (this.basis === 'cart') {
          if (hasPubSub) this.unsubscribe = subscribe(PUB_SUB_EVENTS.cartUpdate, this.onCartUpdate);
          document.addEventListener('cart:updated', this.onDomCartUpdate);
        } else if (hasPubSub) {
          // Product basis: the cart is irrelevant, but the price changes with the
          // selected variant — so follow the theme's existing variant event.
          this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, this.onVariantChange);
        }
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
        document.removeEventListener('cart:updated', this.onDomCartUpdate);
        if (this.timer) clearTimeout(this.timer);
      }

      onDomCartUpdate(event) {
        this.onCartUpdate((event && event.detail) || {});
      }

      onVariantChange(event) {
        const data = event && event.data;
        if (!data || (this.sectionId && data.sectionId && data.sectionId !== this.sectionId)) return;
        // variant is null when the selected combination is unavailable — keep the last state.
        if (data.variant && typeof data.variant.price === 'number') this.render(data.variant.price);
      }

      onCartUpdate(payload) {
        const data = payload && (payload.cartData || payload.cart);
        const total = data && typeof data.total_price === 'number' ? data.total_price : null;
        if (total !== null) {
          this.render(total);
          return;
        }
        // add-to-cart responses have no cart total — read it once, debounced.
        this.fetchTotal();
      }

      fetchTotal() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (this.pending) return;
          this.pending = true;
          const root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
          fetch(`${root}cart.js`, { headers: { Accept: 'application/json' } })
            .then((response) => (response.ok ? response.json() : Promise.reject(response)))
            .then((cart) => {
              if (cart && typeof cart.total_price === 'number') this.render(cart.total_price);
            })
            .catch(() => {
              /* Cart read failed — keep the last known state rather than showing a broken bar. */
            })
            .finally(() => {
              this.pending = false;
            });
        }, 150);
      }

      render(totalCents) {
        const threshold = this.threshold;
        const total = Math.max(Number(totalCents) || 0, 0);
        const percent = Math.min((total / threshold) * 100, 100);
        const remaining = Math.max(threshold - total, 0);
        const complete = remaining === 0;

        if (this.fill) this.fill.style.width = `${percent}%`;
        // The marker rides the fill boundary. Its spacer gets the same width as
        // the fill and the CSS min-width: max-content does the clamping, so no
        // element measuring is needed here.
        if (this.mwrap) this.mwrap.style.width = `${percent}%`;
        if (this.marker) this.marker.textContent = this.formatMoney(remaining);
        if (this.track) this.track.setAttribute('aria-valuenow', String(Math.round(percent)));
        this.classList.toggle('kfsp--complete', complete);

        if (this.label) {
          this.label.textContent = complete
            ? this.textComplete
            : this.textAway.replace('${addMoreForFreeShip}', this.formatMoney(remaining));
        }
      }

      // Mirrors Shopify's money_format placeholders so non-USD stores format correctly.
      formatMoney(cents) {
        const value = (Number(cents) || 0) / 100;
        const build = (decimals, thousands, decimalSep) => {
          const fixed = value.toFixed(decimals);
          const parts = fixed.split('.');
          const whole = parts[0].replace(/(\d)(?=(\d{3})+$)/g, `$1${thousands}`);
          return decimals && parts[1] ? whole + decimalSep + parts[1] : whole;
        };
        return this.moneyFormat.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => {
          switch (name) {
            case 'amount':
              return build(2, ',', '.');
            case 'amount_no_decimals':
              return build(0, ',', '.');
            case 'amount_with_comma_separator':
              return build(2, '.', ',');
            case 'amount_no_decimals_with_comma_separator':
              return build(0, '.', ',');
            case 'amount_with_apostrophe_separator':
              return build(2, "'", '.');
            case 'amount_no_decimals_with_space_separator':
              return build(0, ' ', ',');
            case 'amount_with_space_separator':
              return build(2, ' ', ',');
            default:
              return match;
          }
        });
      }
    }
  );
}
