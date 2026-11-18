/* SwiftShift Movers - site behaviour.
   Quote form maths, price tables, accordion, mobile nav, demo forms.
   All prices come from window.SS_DATA (js/data.js). */
(function () {
  "use strict";
  var D = window.SS_DATA;
  if (!D) return;

  function rs(n) { return "Rs " + Number(n).toLocaleString("en-US"); }
  function el(id) { return document.getElementById(id); }

  /* ---------- fill simple price spans: [data-ss-price="deposit"] etc. */
  document.querySelectorAll("[data-ss-price]").forEach(function (s) {
    var key = s.getAttribute("data-ss-price");
    if (key === "deposit") s.textContent = rs(D.deposit);
    if (key === "storage") s.textContent = rs(D.storagePerWeek);
    if (key === "perWorkstation") s.textContent = rs(D.perWorkstation);
    if (key === "homeFrom") s.textContent = rs(D.homeTiers[0].price);
    if (key === "officeFrom") s.textContent = rs(D.officeTiers[0].price);
    if (key === "packingSmall") s.textContent = rs(D.addons[0].prices.small);
    if (key === "packingLarge") s.textContent = rs(D.addons[0].prices.large);
  });

  /* ---------- price tables, rendered from the same data as the form */
  function buildTable(cols, rows) {
    var t = document.createElement("table");
    t.className = "price-table";
    var thead = document.createElement("thead");
    var trh = document.createElement("tr");
    cols.forEach(function (c) {
      var th = document.createElement("th");
      th.textContent = c;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    t.appendChild(thead);
    var tbody = document.createElement("tbody");
    rows.forEach(function (r) {
      var tr = document.createElement("tr");
      r.forEach(function (cell, i) {
        var td = document.createElement("td");
        td.setAttribute("data-label", cols[i]);
        if (i === r.length - 1) td.className = "price-cell";
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    return t;
  }

  document.querySelectorAll("[data-price-table]").forEach(function (host) {
    var kind = host.getAttribute("data-price-table");
    var table = null;
    if (kind === "home-tiers") {
      table = buildTable(["Home size", "Crew", "Truck loads", "From price"],
        D.homeTiers.map(function (t) { return [t.label, t.crew, t.loads, rs(t.price)]; }));
    } else if (kind === "office-tiers") {
      table = buildTable(["Office size", "Detail", "From price"],
        D.officeTiers.map(function (t) { return [t.label, t.detail, rs(t.price)]; }));
    } else if (kind === "bands") {
      table = buildTable(["Distance", "Added to base price", "Note"],
        D.bands.map(function (b) { return [b.label, b.price === 0 ? rs(0) + " (included)" : "+ " + rs(b.price), b.note]; }));
    } else if (kind === "addons") {
      var rows = [
        ["Full packing service, small home (studio to 2 bed)", rs(D.addons[0].prices.small)],
        ["Full packing service, large home (3 bed and up)", rs(D.addons[0].prices.large)],
        ["Full packing service, office move", rs(D.addons[0].prices.office)]
      ];
      D.addons.slice(1).forEach(function (a) { rows.push([a.label + " (" + a.note.toLowerCase() + ")", rs(a.price)]); });
      rows.push(["Storage, one standard room of goods, per week (booked separately)", rs(D.storagePerWeek)]);
      table = buildTable(["Add on", "Price"], rows);
    }
    if (table) host.appendChild(table);
  });

  /* ---------- mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = el("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- FAQ accordion (smooth for every visitor) */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- validation helpers */
  function validName(v) { return v.trim().length >= 3; }
  function validPhone(v) {
    var digits = v.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 13;
  }
  function setError(input, msgEl, bad) {
    input.classList.toggle("invalid", bad);
    if (msgEl) msgEl.style.display = bad ? "block" : "none";
    return !bad;
  }
  function demoRef(prefix) {
    return prefix + "-" + Math.floor(100000 + Math.random() * 900000);
  }

  /* ---------- instant quote form */
  var form = el("quote-form");
  if (form) {
    var typeSel = el("q-type");
    var sizeSel = el("q-size");
    var bandSel = el("q-band");
    var estimateEl = el("q-estimate");
    var packingBox = el("q-addon-packing");
    var packingPriceEl = el("q-packing-price");
    var nameInput = el("q-name");
    var phoneInput = el("q-phone");
    var nameErr = el("q-name-error");
    var phoneErr = el("q-phone-error");
    var success = el("q-success");

    function tiersFor(type) { return type === "office" ? D.officeTiers : D.homeTiers; }
    function currentTier() {
      var list = tiersFor(typeSel.value);
      for (var i = 0; i < list.length; i++) if (list[i].id === sizeSel.value) return list[i];
      return list[0];
    }
    function packingPrice() {
      if (typeSel.value === "office") return D.addons[0].prices.office;
      return D.addons[0].prices[currentTier().group];
    }
    function fillSizes(keepId) {
      var list = tiersFor(typeSel.value);
      sizeSel.innerHTML = "";
      list.forEach(function (t) {
        var o = document.createElement("option");
        o.value = t.id;
        o.textContent = t.label + " - from " + rs(t.price);
        sizeSel.appendChild(o);
      });
      if (keepId && list.some(function (t) { return t.id === keepId; })) sizeSel.value = keepId;
    }
    function addonPrice(id) {
      if (id === "packing") return packingPrice();
      for (var i = 0; i < D.addons.length; i++) if (D.addons[i].id === id) return D.addons[i].price;
      return 0;
    }
    function calc() {
      var total = currentTier().price;
      var band = D.bands.filter(function (b) { return b.id === bandSel.value; })[0];
      total += band ? band.price : 0;
      form.querySelectorAll(".q-addon").forEach(function (box) {
        if (box.checked) total += addonPrice(box.value);
      });
      estimateEl.textContent = "Estimated from " + rs(total);
      packingPriceEl.textContent = "+ " + rs(packingPrice());
      return total;
    }
    fillSizes("bed2");
    if (typeSel.value === "home") sizeSel.value = "bed2";
    typeSel.addEventListener("change", function () { fillSizes(); calc(); });
    sizeSel.addEventListener("change", calc);
    bandSel.addEventListener("change", calc);
    form.querySelectorAll(".q-addon").forEach(function (box) {
      box.addEventListener("change", calc);
    });
    nameInput.addEventListener("input", function () { setError(nameInput, nameErr, false); });
    phoneInput.addEventListener("input", function () { setError(phoneInput, phoneErr, false); });
    calc();

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var okName = setError(nameInput, nameErr, !validName(nameInput.value));
      var okPhone = setError(phoneInput, phoneErr, !validPhone(phoneInput.value));
      if (!okName || !okPhone) {
        (okName ? phoneInput : nameInput).focus();
        return;
      }
      var total = calc();
      el("q-success-text").textContent =
        "Thank you, " + nameInput.value.trim() + ". Your estimate is " + "Estimated from " + rs(total) +
        ". Your demo booking reference is " + demoRef("SS") +
        ". The final price is confirmed after a free survey or a short call, and never goes up on moving day unless you add work.";
      form.classList.add("sent");
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- generic demo forms (contact, survey) */
  document.querySelectorAll("form[data-demo-form]").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var ok = true;
      var firstBad = null;
      f.querySelectorAll("[required]").forEach(function (input) {
        var bad = !input.value.trim();
        if (!bad && input.getAttribute("data-validate") === "phone") bad = !validPhone(input.value);
        if (!bad && input.getAttribute("data-validate") === "name") bad = !validName(input.value);
        input.classList.toggle("invalid", bad);
        var err = f.querySelector("[data-error-for='" + input.id + "']");
        if (err) err.style.display = bad ? "block" : "none";
        if (bad) { ok = false; firstBad = firstBad || input; }
      });
      if (!ok) { firstBad.focus(); return; }
      var success = f.parentElement.querySelector(".form-success");
      f.classList.add("sent");
      if (success) {
        var refEl = success.querySelector("[data-ref]");
        if (refEl) refEl.textContent = demoRef(f.getAttribute("data-ref-prefix") || "SS");
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    f.querySelectorAll("[required]").forEach(function (input) {
      input.addEventListener("input", function () {
        input.classList.remove("invalid");
        var err = f.querySelector("[data-error-for='" + input.id + "']");
        if (err) err.style.display = "none";
      });
    });
  });
})();
