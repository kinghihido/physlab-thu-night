// 下一节课高亮：根据当前日期计算下一个周四晚上的课，并高亮对应周次卡片。
(function () {
  "use strict";

  // 每周实验简称（与 index.html 顺序一致），用于生成预告文案
  var WEEK_EXPS = {
    "2026-09-10": ["绪论"],
    "2026-09-17": ["冰熔化热", "示波器", "电基伏安A", "电基伏安B", "焦距", "显微镜"],
    "2026-09-24": ["电基伏安A", "电基伏安B", "焦距", "显微镜", "冰熔化热", "示波器"],
    "2026-10-01": [],
    "2026-10-08": ["焦距", "显微镜", "冰熔化热", "示波器", "电基伏安A", "电基伏安B"],
    "2026-10-15": ["测量误差和数据处理"],
    "2026-10-22": ["声速", "真空镀膜", "虚拟仪器", "直/非平衡电桥", "偏振", "迈克耳孙"],
    "2026-10-29": ["虚拟仪器", "直/非平衡电桥", "偏振", "迈克耳孙", "声速", "真空镀膜"],
    "2026-11-05": ["偏振", "迈克耳孙", "声速", "真空镀膜", "虚拟仪器", "直/非平衡电桥"],
    "2026-11-12": ["真空镀膜", "杨氏模量", "直/非平衡电桥", "谐振", "迈克耳孙", "分光计"],
    "2026-11-19": ["直/非平衡电桥", "谐振", "迈克耳孙", "分光计", "真空镀膜", "杨氏模量"],
    "2026-11-26": ["迈克耳孙", "分光计", "真空镀膜", "杨氏模量", "直/非平衡电桥", "谐振"],
    "2026-12-03": ["杨氏模量", "声速", "谐振", "虚拟仪器", "分光计", "偏振"],
    "2026-12-10": ["谐振", "虚拟仪器", "分光计", "偏振", "杨氏模量", "声速"],
    "2026-12-17": ["分光计", "偏振", "杨氏模量", "声速", "谐振", "虚拟仪器"],
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
