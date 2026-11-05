// 下一节课高亮：根据当前日期计算下一个周四晚上的课，并高亮对应周次卡片。
(function () {
  "use strict";

  // 每周实验简称（与 index.html 顺序一致），用于生成预告文案
  var WEEK_EXPS = {
    "2026-09-10": ["绪论"],
    "2026-09-17": ["电学基础", "伏安特性A"],
    "2026-09-24": ["测量薄透镜焦距", "显微镜"],
    "2026-10-01": [],
    "2026-10-08": ["测定冰的熔化热", "模拟示波器"],
    "2026-10-15": ["测量误差和数据处理"],
    "2026-10-22": ["虚拟仪器应用"],
    "2026-10-29": ["观察光的偏振现象"],
    "2026-11-05": ["测定介质中的声速"],
    "2026-11-12": ["直流电桥·非平衡电桥"],
    "2026-11-19": ["迈克耳孙干涉仪"],
    "2026-11-26": ["真空镀膜"],
    "2026-12-03": ["RLC电路谐振现象"],
    "2026-12-10": ["分光计·掠入法测折射率"],
    "2026-12-17": ["测定金属杨氏模量"],
    "2026-12-24": []
  };

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  // 返回从今天起（含今天）最近的周四日期对象
  function nextThursday(from) {
    var d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    var day = d.getDay(); // 0=日, 4=四
    var add = (4 - day + 7) % 7;
    d.setDate(d.getDate() + add);
    return d;
  }

  function findCard() {
    var cards = document.querySelectorAll(".week-card[data-date]");
    var today = new Date();
    var target = nextThursday(today);
    var tIso = iso(target);
    // 学期结束后（超过最后一周）不再高亮
    var last = "2026-12-24";
    if (tIso > last) return null;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute("data-date") === tIso) return cards[i];
    }
    return null;
  }

  function render() {
    var card = findCard();
    var box = document.getElementById("nextBox");
    var text = document.getElementById("nextText");
    if (!card || !text) return;
    card.classList.add("is-next");
    var wk = card.getAttribute("data-week");
    var dt = card.getAttribute("data-date").slice(5).replace("-", "/");
    var exps = WEEK_EXPS[card.getAttribute("data-date")] || [];
    var label = exps.length ? exps.join(" · ") : "停课 / 机动";
    text.innerHTML = "第 " + wk + " 周（" + dt + "）— " + label;
  }

  // 导航栏滚动时加阴影（轻量增强，失败不影响主功能）
  try {
    var nav = document.getElementById("nav");
    if (nav) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 8) nav.style.boxShadow = "0 4px 14px rgba(16,24,40,.08)";
        else nav.style.boxShadow = "none";
      }, { passive: true });
    }
  } catch (e) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

// ---------------------------------------------------------------- 预习 & 报告要求
(function () {
  "use strict";

  // 第三组每周课表 → 对应预习条目 [显示名, 目标锚点]
  var WEEK_PREP = {
    2:  [["电学基础", "exp-2"], ["伏安特性", "exp-3"]],
    3:  [["薄透镜焦距", "exp-5"], ["显微镜", "exp-6"]],
    5:  [["冰的熔化热", "exp-1"], ["模拟示波器", "exp-4"]],
    6:  [["预习问题", "exp-7"], ["作业题目", "note-error-hw"]],
    7:  [["虚拟仪器", "exp-29"]],
    8:  [["光的偏振", "exp-21"]],
    9:  [["介质中的声速", "exp-12"]],
    10: [["直流电桥", "exp-14"], ["非平衡电桥", "exp-15"]],
    11: [["迈克耳孙干涉仪", "exp-22"]],
    12: [["真空镀膜", "exp-26"]],
    13: [["RLC 谐振", "exp-17"]],
    14: [["分光计", "exp-19"]],
    15: [["杨氏模量", "exp-8"]]
  };

  function init() {
    // 1) 每张周卡底部注入「预习问题 →」直达链接
    var weekCards = document.querySelectorAll(".week-card[data-week]");
    for (var i = 0; i < weekCards.length; i++) {
      var card = weekCards[i];
      var wk = parseInt(card.getAttribute("data-week"), 10);
      var list = WEEK_PREP[wk];
      if (!list) continue;
      var box = document.createElement("div");
      box.className = "prep-links";
      var links = "预习问题：";
      for (var j = 0; j < list.length; j++) {
        links += '<a href="#' + list[j][1] + '">' + list[j][0] + " →</a>";
      }
      box.innerHTML = links;
      card.appendChild(box);
    }

    var input = document.getElementById("prepSearch");
    var count = document.getElementById("prepCount");
    var toggle = document.getElementById("prepToggle");
    var listWrap = document.getElementById("prepList");
    var cards = [].slice.call(document.querySelectorAll(".prep-card"));
    var buttons = [].slice.call(document.querySelectorAll(".pf-btn[data-filter]"));
    if (!cards.length) return;

    var empty = document.createElement("div");
    empty.className = "prep-empty";
    empty.textContent = "没有匹配的实验，试试别的关键词或切换筛选条件。";
    if (listWrap && listWrap.parentNode) {
      listWrap.parentNode.insertBefore(empty, listWrap.nextSibling);
    }

    var mode = "all";
    var allOpen = false;

    function syncGroups() {
      var groups = [].slice.call(document.querySelectorAll(".prep-list"));
      groups.forEach(function (ul) {
        var any = [].slice.call(ul.querySelectorAll(".prep-card"))
          .some(function (c) { return c.style.display !== "none"; });
        ul.style.display = any ? "" : "none";
        var gl = ul.previousElementSibling;
        while (gl && !gl.classList.contains("prep-group-label")) {
          gl = gl.previousElementSibling;
        }
        if (gl && gl.classList.contains("prep-group-label")) {
          gl.style.display = any ? "" : "none";
        }
      });
    }

    function apply() {
      var q = ((input && input.value) || "").trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (c) {
        var hay = (c.getAttribute("data-search") || "").toLowerCase();
        var ok = !q || hay.indexOf(q) > -1;
        if (mode === "mine") ok = ok && c.getAttribute("data-mine") === "1";
        if (mode === "pre") ok = ok && c.getAttribute("data-pre") === "1";
        c.style.display = ok ? "" : "none";
        if (ok) visible++;
        if (q && ok) c.open = true;   // 搜索命中自动展开，直接看到内容
      });
      if (count) count.textContent = visible + " / " + cards.length + " 项";
      empty.classList.toggle("is-on", visible === 0);
      syncGroups();
    }

    function openHash() {
      var id = "";
      try { id = decodeURIComponent((location.hash || "").slice(1)); } catch (e) { return; }
      if (!id) return;
      var el = document.getElementById(id);
      if (!el || el.tagName !== "DETAILS") return;   // #prep 等 section 锚点交给浏览器
      // 目标若被筛选隐藏，先重置筛选
      if (el.style.display === "none") {
        mode = "all";
        if (input) input.value = "";
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b.getAttribute("data-filter") === "all");
        });
        apply();
      }
      el.open = true;
      setTimeout(function () {
        try { el.scrollIntoView({ behavior: "smooth", block: "start" }); }
        catch (e) { el.scrollIntoView(); }
      }, 80);
    }

    if (input) input.addEventListener("input", apply);
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.getAttribute("data-filter");
        buttons.forEach(function (x) { x.classList.toggle("is-active", x === b); });
        apply();
      });
    });
    if (toggle) {
      toggle.addEventListener("click", function () {
        allOpen = !allOpen;
        cards.forEach(function (c) { c.open = allOpen; });
        toggle.textContent = allOpen ? "收起全部" : "展开全部";
      });
    }
    window.addEventListener("hashchange", openHash);

    apply();
    if (location.hash) setTimeout(openHash, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
