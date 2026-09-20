(function () {
  "use strict";

  var STORAGE_KEY = "we_teacher_access_v1";
  var ACCESS_HASH = "ca62b39458b186e86a9e0a10f75fa980a0c6225f7add8ac083a3a24d13dfe850";
  var root = document.documentElement;

  if (localStorage.getItem(STORAGE_KEY) === "ok") return;

  root.classList.add("we-locked");

  var style = document.createElement("style");
  style.id = "weTeacherGateStyles";
  style.textContent = [
    "html.we-locked body > *:not(#weTeacherGate){visibility:hidden!important}",
    "#weTeacherGate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:#f4f6f9;font-family:-apple-system,'PingFang SC','Hiragino Sans GB',sans-serif;color:#1f2430}",
    "#weTeacherGate .wg-card{width:100%;max-width:390px;background:#fff;border-radius:16px;padding:22px;box-shadow:0 10px 35px rgba(28,45,75,.12)}",
    "#weTeacherGate h2{font-size:20px;color:#2456a6;margin:0 0 8px}",
    "#weTeacherGate p{font-size:14px;line-height:1.65;color:#7b8494;margin:0 0 16px}",
    "#weTeacherGate input{width:100%;border:1px solid #d8dde6;border-radius:11px;padding:13px 14px;font-size:16px;outline:0;box-sizing:border-box}",
    "#weTeacherGate input:focus{border-color:#2456a6}",
    "#weTeacherGate button{width:100%;border:0;border-radius:11px;padding:13px 14px;margin-top:11px;background:#2456a6;color:#fff;font-size:16px;font-weight:700;cursor:pointer}",
    "#weTeacherGate .wg-error{min-height:22px;margin-top:9px;color:#c74747;font-size:13px}",
    "#weTeacherGate .wg-note{margin-top:14px;font-size:12px;color:#a1a8b4;text-align:center}"
  ].join("");
  document.head.appendChild(style);

  function hex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  async function unlock(input, error) {
    var code = (input.value || "").trim();
    if (!code) {
      error.textContent = "请输入教师访问码。";
      return;
    }
    if (!window.crypto || !window.crypto.subtle) {
      error.textContent = "当前浏览器不支持安全校验，请换用最新版 Chrome 或 Safari。";
      return;
    }
    var digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
    if (hex(digest) !== ACCESS_HASH) {
      error.textContent = "访问码不正确。";
      input.select();
      return;
    }
    localStorage.setItem(STORAGE_KEY, "ok");
    root.classList.remove("we-locked");
    var gate = document.getElementById("weTeacherGate");
    if (gate) gate.remove();
  }

  function mountGate() {
    if (localStorage.getItem(STORAGE_KEY) === "ok" || document.getElementById("weTeacherGate")) return;
    var gate = document.createElement("div");
    gate.id = "weTeacherGate";
    gate.innerHTML = '<div class="wg-card"><h2>教师访问</h2><p>这个页面暂时只用于教师备课，请输入访问码。</p><input id="weTeacherCode" type="password" autocomplete="current-password" placeholder="教师访问码"><button id="weTeacherEnter" type="button">进入</button><div class="wg-error" id="weTeacherError"></div><div class="wg-note">仅保存在当前浏览器</div></div>';
    document.body.appendChild(gate);
    var input = document.getElementById("weTeacherCode");
    var button = document.getElementById("weTeacherEnter");
    var error = document.getElementById("weTeacherError");
    button.addEventListener("click", function () { unlock(input, error); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") unlock(input, error);
    });
    setTimeout(function () { input.focus(); }, 50);
  }

  window.WETeacherGate = {
    lock: function () {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountGate);
  } else {
    mountGate();
  }
})();
