// ==UserScript==
// @name         Job Autofill (profile-driven)
// @namespace    lachlanspangler
// @version      1.0
// @description  Fill Greenhouse/Ashby/Lever/Workday application forms from a stored profile. You review every field and click submit yourself — this never submits, never touches CAPTCHAs, never uploads your resume.
// @match        https://boards.greenhouse.io/*
// @match        https://job-boards.greenhouse.io/*
// @match        https://*.greenhouse.io/*
// @match        https://jobs.ashbyhq.com/*
// @match        https://jobs.lever.co/*
// @match        https://*.myworkdayjobs.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // 1. YOUR PROFILE — edit these values once (they stay local in your browser's
  //    userscript; nothing is uploaded anywhere). Leave a field "" to skip it.
  // ---------------------------------------------------------------------------
  const PROFILE = {
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",                 // e.g. "New York, NY"
    linkedin: "",             // full URL
    github: "",               // full URL
    website: "",              // portfolio / personal site URL
    school: "",
    degree: "",               // e.g. "B.S."
    major: "",
    gradYear: "",             // e.g. "2025"
    salaryExpectation: "",    // e.g. "Open / market"
    howHeard: "",             // e.g. "Company website"
    // Yes/No questions -> true = Yes, false = No, null = leave blank
    workAuthorized: null,     // authorized to work in the country?
    requiresSponsorship: null,// require visa sponsorship now or in future?
    // Optional EEO fields — filled only if you set them.
    gender: "",
    race: "",
    veteranStatus: "",
    disabilityStatus: "",
  };

  // ---------------------------------------------------------------------------
  // 2. Field matchers: profile key -> regexes tested against each field's label.
  //    Order matters (specific before generic).
  // ---------------------------------------------------------------------------
  const TEXT_FIELDS = [
    ["email", [/e-?mail/]],
    ["phone", [/phone|mobile|\btel\b/]],
    ["firstName", [/first\s*name|given\s*name|^first$/]],
    ["lastName", [/last\s*name|family\s*name|surname|^last$/]],
    ["fullName", [/full\s*name|your\s*name|^name$|legal\s*name/]],
    ["linkedin", [/linkedin/]],
    ["github", [/github/]],
    ["website", [/website|portfolio|personal\s*site|url/]],
    ["city", [/city|current\s*location|^location$|where.*located/]],
    ["school", [/school|university|college|institution|education/]],
    ["degree", [/degree/]],
    ["major", [/major|discipline|field\s*of\s*study|concentration/]],
    ["gradYear", [/grad(uation)?\s*(year|date)|expected\s*grad|year\s*of\s*grad/]],
    ["salaryExpectation", [/salary|compensation\s*expectation|desired\s*(pay|comp)/]],
    ["howHeard", [/how\s*did\s*you\s*hear|referr(al|ed)|^source$/]],
    ["gender", [/gender/]],
    ["race", [/race|ethnicity/]],
    ["veteranStatus", [/veteran/]],
    ["disabilityStatus", [/disab(led|ility)/]],
  ];
  const YESNO_FIELDS = [
    ["workAuthorized", [/authoriz(e|ed|ation)\s*to\s*work|legally\s*authorized|work\s*authorization/]],
    ["requiresSponsorship", [/sponsor|visa\s*sponsorship|require.*sponsor/]],
  ];

  // ---------------------------------------------------------------------------
  // 3. Helpers.
  // ---------------------------------------------------------------------------
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

  // Best-effort human label for an input.
  function labelText(el) {
    const bits = [];
    if (el.id) {
      const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (l) bits.push(l.innerText);
    }
    const wrapLabel = el.closest("label");
    if (wrapLabel) bits.push(wrapLabel.innerText);
    // walk up a few ancestors for a nearby label/legend/question text
    let p = el.parentElement, hops = 0;
    while (p && hops < 4) {
      const lbl = p.querySelector("label, legend");
      if (lbl && !bits.includes(lbl.innerText)) bits.push(lbl.innerText);
      hops++;
      p = p.parentElement;
    }
    bits.push(el.getAttribute("aria-label") || "");
    bits.push(el.getAttribute("placeholder") || "");
    bits.push(el.getAttribute("name") || "");
    return norm(bits.join(" | "));
  }

  // Set value in a way React (Ashby/Workday) also registers.
  function setNativeValue(el, value) {
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function markFilled(el) {
    el.style.outline = "2px solid #43e08a";
    el.style.outlineOffset = "1px";
  }

  let filled = 0;
  const report = [];

  function fillTextLike() {
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input:not([type]), textarea'
    );
    inputs.forEach((el) => {
      if (el.value) return; // don't clobber anything already entered
      const label = labelText(el);
      for (const [key, regexes] of TEXT_FIELDS) {
        const v = PROFILE[key];
        if (!v) continue;
        if (regexes.some((r) => r.test(label))) {
          setNativeValue(el, v);
          markFilled(el);
          filled++;
          report.push(`✓ ${key} → "${v.slice(0, 40)}"`);
          break;
        }
      }
    });
  }

  function fillSelects() {
    document.querySelectorAll("select").forEach((sel) => {
      if (sel.value && sel.value !== "" && sel.selectedIndex > 0) return;
      const label = labelText(sel);
      const spec = TEXT_FIELDS.find(([k, rs]) => PROFILE[k] && rs.some((r) => r.test(label)));
      if (!spec) return;
      const want = norm(PROFILE[spec[0]]);
      const opt = [...sel.options].find((o) => norm(o.text).includes(want) || norm(o.value).includes(want));
      if (opt) {
        setNativeValue(sel, opt.value);
        markFilled(sel);
        filled++;
        report.push(`✓ ${spec[0]} → "${opt.text}"`);
      }
    });
  }

  // Yes/No questions rendered as radios or selects.
  function fillYesNo() {
    for (const [key, regexes] of YESNO_FIELDS) {
      const want = PROFILE[key];
      if (want === null || want === undefined) continue;
      const answer = want ? "yes" : "no";

      // Radios: group by name, match the option whose label says yes/no.
      const radios = [...document.querySelectorAll('input[type="radio"]')];
      const groups = {};
      radios.forEach((r) => (groups[r.name] = groups[r.name] || []).push(r));
      for (const name in groups) {
        const groupLabel = labelText(groups[name][0]);
        if (!regexes.some((r) => r.test(groupLabel))) continue;
        const pick = groups[name].find((r) => {
          const t = norm((document.querySelector(`label[for="${CSS.escape(r.id)}"]`) || {}).innerText || r.value);
          return t.startsWith(answer);
        });
        if (pick && !pick.checked) {
          pick.click();
          markFilled(pick);
          filled++;
          report.push(`✓ ${key} → ${answer}`);
        }
      }

      // Selects with Yes/No options.
      document.querySelectorAll("select").forEach((sel) => {
        if (!regexes.some((r) => r.test(labelText(sel)))) return;
        const opt = [...sel.options].find((o) => norm(o.text).startsWith(answer));
        if (opt && norm(sel.options[sel.selectedIndex]?.text) !== answer) {
          setNativeValue(sel, opt.value);
          markFilled(sel);
          filled++;
          report.push(`✓ ${key} → ${answer}`);
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Floating control panel.
  // ---------------------------------------------------------------------------
  function panel() {
    const box = document.createElement("div");
    box.style.cssText =
      "position:fixed;bottom:18px;right:18px;z-index:999999;font:13px -apple-system,sans-serif;" +
      "background:#141a29;color:#eef1f8;border:1px solid #2a3346;border-radius:12px;" +
      "padding:12px 14px;box-shadow:0 12px 40px rgba(0,0,0,.5);max-width:280px";
    const missing = Object.entries(PROFILE).filter(([, v]) => v === "" || v === null).length;
    box.innerHTML =
      '<div style="font-weight:700;margin-bottom:6px">⚡ Job Autofill</div>' +
      '<button id="jaf-fill" style="width:100%;padding:8px;border:0;border-radius:8px;cursor:pointer;' +
      'background:linear-gradient(135deg,#7c8cff,#b06bff);color:#fff;font-weight:700">Fill this form</button>' +
      '<div id="jaf-out" style="margin-top:8px;color:#9aa4bd;max-height:180px;overflow:auto"></div>' +
      '<div style="margin-top:8px;color:#6b7690;font-size:11px">Review every field, attach your resume, and submit yourself. ' +
      (missing ? missing + " profile field(s) still blank." : "") +
      "</div>";
    document.body.appendChild(box);
    box.querySelector("#jaf-fill").onclick = () => {
      filled = 0;
      report.length = 0;
      fillTextLike();
      fillSelects();
      fillYesNo();
      box.querySelector("#jaf-out").innerHTML =
        `<b>${filled} field(s) filled.</b><br>` +
        (report.length ? report.join("<br>") : "Nothing matched — fill manually.") +
        "<br><span style='color:#fbbf3d'>Check everything before submitting.</span>";
    };
  }

  panel();
})();
