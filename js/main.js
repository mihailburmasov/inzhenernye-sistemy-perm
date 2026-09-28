(function () {
  "use strict";

  /* ---- Бургер-меню ---- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Плавный скролл для якорей без учёта закрытого меню ---- */

  /* ---- Лайтбокс для сертификатов/писем ---- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector("figcaption");
    var closeBtn = lightbox.querySelector(".lightbox__close");
    var prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    var nextBtn = lightbox.querySelector(".lightbox__nav--next");
    var currentItems = [];
    var currentIndex = 0;

    function itemsFor(gallery) {
      var buttons = document.querySelectorAll('[data-gallery="' + gallery + '"] .doc');
      return Array.prototype.slice.call(buttons).filter(function (b) { return b.tagName === "BUTTON"; });
    }

    function show(index) {
      if (!currentItems.length) return;
      currentIndex = (index + currentItems.length) % currentItems.length;
      var btn = currentItems[currentIndex];
      var img = btn.querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      lbCaption.textContent = img.alt || "";
    }

    function open(gallery, startIndex) {
      currentItems = itemsFor(gallery);
      if (!currentItems.length) return;
      show(startIndex || 0);
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".doc").forEach(function (btn) {
      if (btn.tagName !== "BUTTON") return;
      btn.addEventListener("click", function () {
        var gallery = btn.closest("[data-gallery]").getAttribute("data-gallery");
        var index = Array.prototype.indexOf.call(itemsFor(gallery), btn);
        open(gallery, index);
      });
    });
    document.querySelectorAll("[data-open-gallery]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        open(btn.getAttribute("data-open-gallery"), 0);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(currentIndex - 1); });
    nextBtn.addEventListener("click", function () { show(currentIndex + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(currentIndex - 1);
      if (e.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  /* ---- Форма обратной связи ---- */
  var form = document.getElementById("lead-form");
  if (form) {
    var status = document.getElementById("form-status");
    var consent = form.querySelector('input[name="consent"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      ["name", "phone", "email"].forEach(function (name) {
        var field = form.querySelector('[name="' + name + '"]');
        var ok = field.value.trim() !== "" && field.checkValidity();
        field.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });

      var consentLabel = consent.closest(".consent");
      if (!consent.checked) {
        consentLabel.classList.add("is-invalid");
        valid = false;
      } else {
        consentLabel.classList.remove("is-invalid");
      }

      if (!valid) {
        status.textContent = "Проверьте, пожалуйста, заполненные поля.";
        status.className = "form__status is-err";
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      status.textContent = "Отправляем…";
      status.className = "form__status";

      fetch(form.action, { method: "POST", body: new FormData(form) })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (data) {
          if (data.ok) {
            status.textContent = data.message || "Спасибо! Мы свяжемся с вами в ближайшее время.";
            status.className = "form__status is-ok";
            form.reset();
            consent.checked = true;
          } else {
            status.textContent = data.message || "Не удалось отправить заявку. Позвоните нам по телефону.";
            status.className = "form__status is-err";
          }
        })
        .catch(function () {
          status.textContent = "Не удалось отправить заявку. Проверьте соединение или позвоните нам.";
          status.className = "form__status is-err";
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  /* ---- Cookie-баннер ---- */
  var cookieBar = document.getElementById("cookie-bar");
  if (cookieBar) {
    var KEY = "n159_cookie_ack_v1";
    var acked = false;
    try { acked = localStorage.getItem(KEY) === "1"; } catch (e) {}
    if (!acked) cookieBar.hidden = false;
    var okBtn = document.getElementById("cookie-ok");
    okBtn.addEventListener("click", function () {
      cookieBar.hidden = true;
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
    });
  }
})();
