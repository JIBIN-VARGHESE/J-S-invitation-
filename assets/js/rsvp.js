/* =============================================================================
   RSVP — form validation + pluggable delivery
   -----------------------------------------------------------------------------
   Everything about WHERE responses go lives in this file. Choose a provider in
   config.js → rsvp.provider. Each provider is a small function below that
   receives a plain object:

       { name, guests, attending: "yes" | "no", message, submittedAt }

   and returns a Promise that resolves on success / rejects on failure.

   Free options, from simplest:
   • formsubmit  – emails each reply to the address in endpoint (no sign-up).
                   The FIRST reply sends an "Activate form" email to that
                   address; click it once, then every reply arrives by email.
   • formspree   – create a form at formspree.io, paste its URL into endpoint.
   • appsScript  – Google Sheet → Extensions → Apps Script, deploy a web app
                   with a doPost(e) that appends a row (see README). Paste the
                   web-app URL into endpoint.
   • googleForm  – make a Google Form with 4 short-answer questions, use the
                   form's ".../formResponse" URL as endpoint and map the
                   entry.XXXX ids in rsvp.googleFormFields.
   • supabase    – table "rsvps" with columns matching the object above;
                   endpoint ".../rest/v1/rsvps", key = anon public key.
   • firebase    – Realtime Database URL ending in "/rsvps.json".
   • demo        – no network; stores the reply in this browser only.
   ========================================================================== */
(function () {
  "use strict";

  var providers = {
    demo: function (data) {
      return new Promise(function (resolve) {
        try {
          var all = JSON.parse(localStorage.getItem("rsvp-demo") || "[]");
          all.push(data);
          localStorage.setItem("rsvp-demo", JSON.stringify(all));
        } catch (e) { /* storage unavailable — still show success in demo mode */ }
        setTimeout(resolve, 700);
      });
    },

    formsubmit: function (data, cfg) {
      var yes = data.attending === "yes";
      return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(cfg.endpoint), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "Wedding RSVP: " + data.name + (yes ? " is coming (" + data.guests + ")" : " can't come"),
          _template: "table",
          _captcha: "false",
          Name: data.name,
          Attending: yes ? "Yes" : "No",
          Guests: yes ? data.guests : 0,
          Message: data.message || "-",
          Sent: data.submittedAt,
        }),
      }).then(ok).then(function (r) { return r.json(); }).then(function (j) {
        if (String(j.success) !== "true") throw new Error(j.message || "FormSubmit refused the reply");
      });
    },

    formspree: function (data, cfg) {
      return fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      }).then(ok);
    },

    appsScript: function (data, cfg) {
      // text/plain avoids a CORS preflight, which Apps Script cannot answer.
      return fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      }).then(ok);
    },

    googleForm: function (data, cfg) {
      var f = cfg.googleFormFields || {};
      var body = new URLSearchParams();
      Object.keys(f).forEach(function (k) { body.append(f[k], data[k]); });
      // Google Forms does not send CORS headers; "no-cors" posts the response
      // but the result cannot be read, so success is assumed.
      return fetch(cfg.endpoint, { method: "POST", mode: "no-cors", body: body });
    },

    supabase: function (data, cfg) {
      return fetch(cfg.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: cfg.key,
          Authorization: "Bearer " + cfg.key,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(data),
      }).then(ok);
    },

    firebase: function (data, cfg) {
      return fetch(cfg.endpoint, { method: "POST", body: JSON.stringify(data) }).then(ok);
    },
  };

  function ok(res) {
    if (!res.ok) throw new Error("RSVP request failed: " + res.status);
    return res;
  }

  /* ----------------------------------------------------------- the form */
  function init(form, cfg) {
    if (!form) return;
    var max = Math.max(1, Number(cfg.maxGuests) || 6);
    var guests = form.elements.guests;
    var guestField = form.querySelector(".field--guests");
    var status = form.querySelector(".rsvp__status");
    var submit = form.querySelector('[type="submit"]');
    guests.max = max;

    function clampGuests(v) { return Math.min(max, Math.max(1, Math.round(Number(v) || 1))); }

    form.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        guests.value = clampGuests(Number(guests.value) + Number(b.getAttribute("data-step")));
        clearError("guests");
      });
    });

    // Guests are irrelevant when declining
    form.querySelectorAll('[name="attending"]').forEach(function (r) {
      r.addEventListener("change", function () {
        guestField.classList.toggle("is-disabled", form.elements.attending.value === "no");
        clearError("attending");
      });
    });
    form.elements.name.addEventListener("input", function () { clearError("name"); });

    function setError(field, msg) {
      var p = form.querySelector("#err-" + field);
      if (p) p.textContent = msg;
      var wrap = p && p.closest(".field");
      if (wrap) wrap.classList.add("has-error");
    }
    function clearError(field) {
      var p = form.querySelector("#err-" + field);
      if (p) { p.textContent = ""; p.closest(".field").classList.remove("has-error"); }
    }

    function validate() {
      var valid = true, first = null;
      var name = form.elements.name.value.trim();
      var attending = form.elements.attending.value;
      if (name.length < 2) { setError("name", "Please tell us your name."); valid = false; first = first || form.elements.name; }
      if (!attending) { setError("attending", "Please let us know if you can come."); valid = false; first = first || form.querySelector("#att-yes"); }
      if (attending === "yes") {
        var g = Number(guests.value);
        if (!g || g < 1 || g > max || g !== Math.round(g)) {
          setError("guests", "Please choose between 1 and " + max + " guests."); valid = false; first = first || guests;
        }
      }
      if (first) first.focus();
      return valid;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements._gotcha.value) return;        // bot
      if (!validate()) return;

      var attending = form.elements.attending.value;
      var data = {
        name: form.elements.name.value.trim(),
        guests: attending === "yes" ? clampGuests(guests.value) : 0,
        attending: attending,
        message: form.elements.message.value.trim(),
        submittedAt: new Date().toISOString(),
      };

      var send = providers[cfg.provider] || providers.demo;
      if (cfg.provider !== "demo" && !cfg.endpoint) send = providers.demo;

      submit.disabled = true;
      status.classList.remove("is-error");
      status.textContent = "Sending…";

      send(data, cfg).then(function () {
        document.dispatchEvent(new CustomEvent("rsvp:sent", { detail: data }));
        form.classList.add("is-sent");
        status.textContent = attending === "yes"
          ? "Thank you, " + data.name.split(" ")[0] + ". We can't wait to celebrate with you."
          : "Thank you, " + data.name.split(" ")[0] + ". We will miss you, and we are grateful for your prayers.";
      }).catch(function () {
        status.classList.add("is-error");
        status.textContent = "Something went wrong. Please try again in a moment.";
      }).then(function () { submit.disabled = false; });
    });
  }

  window.RSVP = { init: init, providers: providers };
})();
