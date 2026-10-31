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
