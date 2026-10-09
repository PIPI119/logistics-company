/* Northway Logistics — demo scripts. No network calls except the optional Telegram share link. */
(function () {
  var ZONES = {
    local:    { label: 'Within the city', base: 6 },
    regional: { label: 'Within the region', base: 10 },
    national: { label: 'Nationwide', base: 16 },
    intl:     { label: 'International', base: 35 }
  };
  var SERVICES = {
    economy:  { label: 'Economy (5–7 days)', mult: 0.8 },
    standard: { label: 'Standard (2–4 days)', mult: 1 },
    express:  { label: 'Express (next day)', mult: 1.7 }
  };

  function fill(select, map) {
    Object.keys(map).forEach(function (key) {
      select.add(new Option(map[key].label, key));
    });
  }

  /* Estimate: (zone base + chargeable kg × 1.2) × service multiplier.
     Chargeable weight = larger of actual weight and volumetric weight (L×W×H / 5000), minimum 1 kg. */
  function estimate(zone, service, kg, l, w, h) {
    var volumetric = (l * w * h) / 5000;
    var chargeable = Math.max(1, kg, volumetric);
    var price = (ZONES[zone].base + chargeable * 1.2) * SERVICES[service].mult;
    return { price: Math.round(price * 100) / 100, chargeable: Math.round(chargeable * 100) / 100 };
  }

  var calc = document.getElementById('calc');
  if (calc) {
    fill(calc.zone, ZONES);
    fill(calc.service, SERVICES);
    calc.service.value = 'standard';
    calc.addEventListener('submit', function (e) { e.preventDefault(); update(); });
    calc.addEventListener('input', update);
    update();
  }

  function num(v) { var n = parseFloat(v); return isFinite(n) && n > 0 ? n : 0; }

  function update() {
    if (!calc) return;
    var kg = num(calc.weight.value), l = num(calc.l.value), w = num(calc.w.value), h = num(calc.h.value);
    var out = document.getElementById('estimate');
    var note = document.getElementById('chargeable');
    if (!kg && !(l && w && h)) {
      out.textContent = '—';
      note.textContent = 'Enter the weight to see an estimate.';
      return;
    }
    var r = estimate(calc.zone.value, calc.service.value, kg, l, w, h);
    out.textContent = '$' + r.price.toFixed(2);
    note.textContent = 'Chargeable weight: ' + r.chargeable + ' kg. Estimate only — the manager confirms the final price.';
  }

  /* Request form: builds the text and opens Telegram with it prefilled. */
  var form = document.getElementById('request');
  if (form) {
    fill(form.service, SERVICES);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form;
      var text = 'Request from the Northway website\n' +
        'Name: ' + f.name.value + '\n' +
        'Company: ' + (f.company.value || '—') + '\n' +
        'Phone / email: ' + f.contact.value + '\n' +
        'Service: ' + f.service.options[f.service.selectedIndex].text + '\n' +
        'Message: ' + (f.message.value || '—');
      var url = 'https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(text);
      var status = document.getElementById('status');
      status.textContent = 'Telegram opens with your request. Press send there to deliver it.';
      window.open(url, '_blank', 'noopener');
    });
  }
})();
