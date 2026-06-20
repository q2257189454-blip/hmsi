const pageMeta = {
  overview: { title: "工作台总览", subtitle: "项目流转、风险与责任人一页掌握", action: "新建项目" },
  sales: { title: "销售额预估", subtitle: "多方法区间参考，支持候选区域进入下一轮研究", action: "新建预测" },
  selection: { title: "智能选址", subtitle: "商圈规划与候选 AB 点管理", action: "新建选址方案" },
  compare: { title: "点位对比", subtitle: "经营潜力与六维硬约束同步审核", action: "新建对比" },
  report: { title: "AI 报告", subtitle: "AI 归纳决策材料，结论需业务负责人审核确认", action: "生成报告" },
  promotion: { title: "地推策略", subtitle: "在资源约束下安排 Block 覆盖与执行反馈", action: "新建地推计划" }
};

const funnelRows = [
  ["候选商圈", 26, "2.1 天", 1], ["区域评估", 18, "3.4 天", 2], ["现场勘探", 12, "1.8 天", 0],
  ["待一审", 8, "2.6 天", 0], ["待二审", 5, "4.3 天", 1], ["已签约", 6, "-", 0], ["开业验证", 4, "14 天", 0]
];

const decisionRows = [
  { name: "五角场核心区", stage: "待一审", range: "12.8-15.4 万元 / 日", benefit: "家庭客群好", risk: "排烟待核", next: "补工程说明", owner: "李四" },
  { name: "徐家汇东区", stage: "待二审", range: "11.9-13.6 万元 / 日", benefit: "租售比稳定", risk: "条款待审", next: "财务复核", owner: "张三" },
  { name: "静安寺西区", stage: "现场勘探", range: "10.8-13.1 万元 / 日", benefit: "近场人流稳", risk: "卸货待核", next: "回传视频", owner: "王五" }
];

const todoRows = {
  mine: [["五角场工程补件", "上传排烟改造说明", "今天 17:00", "待处理"], ["徐家汇二审材料", "确认租售比计算口径", "明天 10:00", "待复核"], ["静安寺现场回传", "补充卸货区全景视频", "5/23", "进行中"], ["候选池复核", "确认世博滨江数据完整度", "5/24", "待处理"]],
  action: [["一审会议确认", "确认五角场会议参与人", "今天 15:00", "待处理"], ["Block 人员排班", "确认 12 人执行名单", "5/25", "待处理"], ["合规风险复核", "更新物业消防意见", "5/26", "待复核"], ["预测口径确认", "补充相似门店选择依据", "5/26", "待复核"]],
  cc: [["预测验证复盘", "查看开业后第 14 天偏差", "5/28", "已抄送"], ["候选池更新", "新增 3 个区域研究对象", "5/29", "已抄送"]]
};

const salesRows = [
  { area: "五角场核心区", rank: 1, range: "12.8-15.4", confidence: "中", completeness: "86%", stage: "区域评估", conclusion: "优先进入下一轮" },
  { area: "徐家汇东区", rank: 2, range: "11.9-13.6", confidence: "较高", completeness: "91%", stage: "待一审", conclusion: "优先进入下一轮" },
  { area: "静安寺西区", rank: 3, range: "10.8-13.1", confidence: "中", completeness: "82%", stage: "现场勘探", conclusion: "可进入下一轮" },
  { area: "世博滨江板块", rank: 4, range: "9.6-12.0", confidence: "中", completeness: "76%", stage: "区域评估", conclusion: "补充数据后评估" },
  { area: "中山公园西区", rank: 5, range: "8.2-10.7", confidence: "较低", completeness: "63%", stage: "候选商圈", conclusion: "暂缓研究" }
];

const driverRows = [
  ["居住人口", 27.8], ["家庭客群", 21.2], ["控制人口后的竞争压力", 16.6], ["距离圈层", 12.1], ["数据完整度", 11.4], ["样本外风险", 10.9]
];

const methodRanges = [
  ["AIC 精简 OLS", 12.5, 14.2, 15.7, "中"], ["历史相似门店对标", 12.8, 14.0, 15.2, "较高"], ["人工预估", 12.2, 13.8, 15.0, "待审核"], ["保守情景", 11.9, 12.8, 13.4, "参考"], ["基准情景", 12.8, 14.1, 15.4, "参考"], ["乐观情景", 14.2, 15.1, 16.0, "参考"], ["综合参考区间", 12.8, 14.1, 15.4, "中" ]
];

const selectionRows = [
  ["A 类", "五角场核心区", "区域评估", "12.8-15.4"], ["A 类", "徐家汇东区", "待一审", "11.9-13.6"], ["待勘探", "静安寺西区", "现场勘探", "10.8-13.1"], ["B 类", "世博滨江板块", "候选商圈", "9.6-12.0"]
];

const priorityRows = [
  ["A", "五角场核心区", "工程补齐后入一审"], ["B", "徐家汇东区", "财务复核后入二审"], ["C", "静安寺西区", "回传后入对比"], ["D", "世博滨江", "补样本后研究"]
];

const comparePoints = [
  { id: "A", title: "点位 A", area: "五角场核心区", range: "12.8-15.4", confidence: "中", customer: "居住 32.6 万 / 家庭占比 47%", competition: "500m 内 8 家", analogue: "相似门店 6 家", rent: "月租 31.2 万，5 年，递增待审", rate: "租售比待复核", cooperation: "房东已初谈", turnover: "排烟待确认", color: "#df0b12" },
  { id: "B", title: "点位 B", area: "徐家汇东区", range: "11.9-13.6", confidence: "较高", customer: "居住 28.1 万 / 家庭占比 42%", competition: "500m 内 6 家", analogue: "相似门店 8 家", rent: "月租 28.7 万，5 年，条款齐", rate: "租售比较稳", cooperation: "房东配合", turnover: "工程可交付", color: "#ff8a00" },
  { id: "C", title: "点位 C", area: "静安寺西区", range: "10.8-13.1", confidence: "中", customer: "居住 25.4 万 / 家庭占比 38%", competition: "500m 内 11 家", analogue: "相似门店 4 家", rent: "月租 26.4 万，3 年，待谈", rate: "费率可接受", cooperation: "需复谈", turnover: "平面图待补", color: "#ffc33d" }
];

const constraints = [
  ["物业", "已通过", "已通过", "待核验"], ["工程", "待核验", "已通过", "待核验"], ["物流", "待核验", "已通过", "有条件通过"], ["竞争", "有条件通过", "已通过", "有条件通过"], ["合规", "待核验", "已通过", "待核验"], ["现场", "待核验", "已通过", "待核验"]
];

const promotionRows = [
  ["B01", "五角场花园", "420m", "3,280", "1 / 2", "社区定点", "已排期"], ["B02", "创智汇社区", "650m", "2,860", "2 / 1", "午晚高峰", "进行中"], ["B03", "复旦家属区", "780m", "2,140", "3 / 4", "社群触达", "待确认"], ["B04", "江湾里", "920m", "1,760", "4 / 3", "物料投放", "待排期"]
];

const taskRows = [
  ["李四", "6/11", "B01-B02", "360 份", "照片+定位", "已排期"], ["王五", "6/12", "B03", "240 份", "扫码明细", "进行中"], ["赵六", "6/13", "B04", "180 份", "异常记录", "待确认"]
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { todoFilter: "mine", salesFilter: "all", activePoint: "A" };

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[char]);
}

function tagClass(status) {
  if (status.includes("不通过") || status.includes("暂缓") || status.includes("超期")) return "danger";
  if (status.includes("待") || status.includes("有条件") || status.includes("中") || status.includes("确认") || status.includes("进行中")) return "warn";
  if (status.includes("通过") || status.includes("较高") || status.includes("已排")) return "positive";
  return "neutral";
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function enterApp() {
  $("#loginScreen").classList.add("is-hidden");
  $("#appScreen").classList.remove("is-hidden");
}

function switchPage(page) {
  const meta = pageMeta[page];
  if (!meta) return;
  $("#pageTitle").textContent = meta.title;
  $("#pageSubtitle").textContent = meta.subtitle;
  $("#topActionBtn").textContent = meta.action;
  $$(".nav-item").forEach((button) => {
    const isActive = button.dataset.page === page;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  $$(".page").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.pagePanel === page));
}

function renderOverview() {
  $("#overviewFunnel").innerHTML = funnelRows.map(([name, count, duration, late], index) => `
    <article class="funnel-step"><span>${index + 1}</span><b>${name}</b><strong>${count}</strong><small>停留 ${duration}</small><em>${late ? `超期 ${late}` : "正常"}</em></article>`).join("");
  $("#decisionPoints").innerHTML = decisionRows.map((row) => `
    <article class="decision-row"><header><b>${row.name}</b><span class="tag ${tagClass(row.stage)}">${row.stage}</span></header><strong>${row.range}</strong><p><span>优势：${row.benefit}</span><span>风险：${row.risk}</span></p><footer><span>下一步：${row.next}</span><b>${row.owner}</b></footer></article>`).join("");
  renderTodo();
  const risks = [["五角场核心区", "排烟条件未核验", "李四", "今天"], ["徐家汇东区", "租赁递增条款待审", "张三", "5/24"], ["静安寺西区", "卸货动线资料缺失", "王五", "5/23"], ["世博滨江板块", "样本外风险待说明", "陈晨", "5/25"]];
  $("#riskTable").innerHTML = risks.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td><span class="tag warn">${row[3]}</span></td></tr>`).join("");
  const validations = [["松江大学城店", "8.6-10.2", "9.1", "+2.4%"], ["金桥社区店", "7.3-8.8", "7.9", "-1.1%"], ["虹桥枢纽店", "10.8-12.5", "11.7", "+0.9%"], ["浦东花木店", "9.2-11.0", "10.1", "+3.7%"]];
  $("#validationTable").innerHTML = validations.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join("");
  const owners = [["张三", "在办 6", "2 项待处理"], ["李四", "在办 5", "1 项超期"], ["王五", "在办 4", "现场回传中"], ["陈晨", "在办 3", "待补样本说明"]];
  $("#ownerBoard").innerHTML = owners.map((row, index) => `<article><span>${row[0].slice(0, 1)}</span><div><b>${row[0]}</b><small>${row[1]} · ${row[2]}</small></div><button data-action="查看 ${row[0]} 的项目" type="button">查看</button></article>`).join("");
}

function renderTodo() {
  const rows = todoRows[state.todoFilter];
  $("#todoList").innerHTML = rows.map((row) => `<article><div><b>${row[0]}</b><span>${row[1]}</span></div><small>${row[2]}</small><em class="tag ${tagClass(row[3])}">${row[3]}</em></article>`).join("");
}

function renderSales() {
  $("#methodRanges").innerHTML = methodRanges.map(([name, low, mid, high, confidence]) => {
    const left = ((low - 10) / 7) * 100;
    const width = ((high - low) / 7) * 100;
    const dot = ((mid - 10) / 7) * 100;
    return `<article class="method-row"><div><b>${name}</b><small>${confidence}置信</small></div><span class="range-scale"><i style="left:${left}%;width:${width}%"></i><em style="left:${dot}%"></em></span><p><b>${low.toFixed(1)}</b><span>${mid.toFixed(1)}</span><b>${high.toFixed(1)}</b></p></article>`;
  }).join("");
  $("#driverBars").innerHTML = driverRows.map(([name, value]) => `<div class="factor-row"><header><span>${name}</span><strong>${value}%</strong></header><div class="progress"><i style="width:${value * 2.65}%"></i></div></div>`).join("");
  renderSalesTable();
}

function renderSalesTable() {
  const visible = salesRows.filter((row) => {
    if (state.salesFilter === "next") return row.conclusion.includes("进入下一轮");
    if (state.salesFilter === "review") return row.conclusion.includes("补充");
    return true;
  });
  $("#salesTable").innerHTML = visible.map((row) => `<tr><td><strong>${row.area}</strong></td><td>${row.rank}</td><td class="score-red">${row.range} 万元 / 日</td><td><span class="tag ${tagClass(row.confidence)}">${row.confidence}</span></td><td>${row.completeness}</td><td>${row.stage}</td><td><span class="tag ${tagClass(row.conclusion)}">${row.conclusion}</span></td><td><button class="table-action" data-action="查看 ${row.area} 的预测依据" type="button">查看依据</button></td></tr>`).join("");
}

function renderSelection() {
  $("#selectionRank").innerHTML = selectionRows.map((row) => `<tr><td><span class="tag ${tagClass(row[0])}">${row[0]}</span></td><td><strong>${row[1]}</strong></td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join("");
  const facts = [["覆盖人口", "32.6 万"], ["家庭客群", "47%"], ["主要竞对", "8 家 / 500m"], ["物流可达性", "可达"], ["店型适配度", "较高"], ["数据完整度", "86%"]];
  $("#candidateFacts").innerHTML = facts.map(([name, value]) => `<div><span>${name}</span><b>${value}</b></div>`).join("");
  $("#openPlan").innerHTML = priorityRows.map((row, index) => `<li><span class="rank-num">${index + 1}</span><b>${row[1]}</b><span>${row[2]}</span></li>`).join("");
}

function renderCompare() {
  $("#compareCards").innerHTML = comparePoints.map((point) => `<article class="point-card ${point.id === state.activePoint ? "is-focus" : ""}"><header><div class="point-photo"></div><div><h3><span style="color:${point.color}">●</span> ${point.title}</h3><p>${point.area}</p></div><span class="score-line">${point.confidence}置信</span></header><ul><li><span>日均商品销售额区间</span><strong style="color:${point.color}">${point.range} 万元</strong></li><li><span>人口 / 家庭客群</span><strong>${point.customer}</strong></li><li><span>竞对情况</span><strong>${point.competition}</strong></li><li><span>历史相似门店</span><strong>${point.analogue}</strong></li><li><span>费率与租赁</span><strong>${point.rent}</strong></li><li><span>租售比 / 房东</span><strong>${point.rate} · ${point.cooperation}</strong></li><li><span>装修与交付</span><strong>${point.turnover}</strong></li></ul></article>`).join("");
  const metrics = [["需求与家庭客群", [90, 84, 73]], ["销售额区间中位值", [89, 82, 75]], ["控制人口后竞争", [72, 88, 65]], ["租售比与交付", [64, 90, 58]]];
  $("#compareBars").innerHTML = metrics.map(([name, vals]) => `<div class="metric-row"><header><span>${name}</span><strong>${vals.join(" / ")}</strong></header><div class="progress"><i style="width:${vals[0]}%"></i></div></div>`).join("");
  $("#constraintMatrix").innerHTML = `<div class="constraint-head"><span>维度</span><span>A</span><span>B</span><span>C</span></div>${constraints.map((row) => `<div><b>${row[0]}</b>${row.slice(1).map((value) => `<span class="constraint-state ${tagClass(value)}">${value}</span>`).join("")}</div>`).join("")}`;
  const evidence = [["门头", "已回传"], ["内部空间", "已回传"], ["道路动线", "待补"], ["卸货区域", "待补"], ["平面图", "已回传"], ["勘探记录", "GPS 齐全"]];
  $("#evidenceGallery").innerHTML = evidence.map(([name, status], index) => `<button class="evidence-thumb tone-${index % 3}" data-action="查看 ${name} 现场证据" type="button"><b>${name}</b><span>${status}</span></button>`).join("");
}

function renderPromotion() {
  $("#promoTable").innerHTML = promotionRows.map((row) => `<article><div><b>${row[0]} · ${row[1]}</b><span>距店 ${row[2]} · 居住 ${row[3]} 人 · 购买 / 渗透 ${row[4]}</span></div><div><em>${row[5]}</em><span class="tag ${tagClass(row[6])}">${row[6]}</span></div></article>`).join("");
  const purchase = [["B01", "五角场花园", "92", "首周定点"], ["B02", "创智汇社区", "89", "午晚高峰"], ["B03", "复旦家属区", "86", "社群触达"]];
  const penetration = [["B02", "创智汇社区", "90", "会员拉新"], ["B04", "江湾里", "86", "复购唤醒"], ["B03", "复旦家属区", "82", "社群裂变"]];
  $("#purchaseTable").innerHTML = purchase.map((row, index) => `<tr><td class="score-red">${index + 1}</td><td><strong>${row[1]}</strong></td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join("");
  $("#penetrationTable").innerHTML = penetration.map((row, index) => `<tr><td class="score-red">${index + 1}</td><td><strong>${row[1]}</strong></td><td>${row[2]}</td><td>${row[3]}</td></tr>`).join("");
  $("#taskTable").innerHTML = taskRows.map((row) => `<tr>${row.map((cell, index) => `<td>${index === 5 ? `<span class="tag ${tagClass(cell)}">${cell}</span>` : cell}</td>`).join("")}</tr>`).join("");
}

function renderReport() {
  const sections = [
    ["项目背景", "上海北区 Q3 拓店计划，聚焦候选商圈研究、AB 点管理与一审材料准备。", "来自人工评审"],
    ["候选点阶段性结论", "五角场核心区可有条件进入一审，尚未形成签约建议。", "AI 归纳，待人工确认"],
    ["多方法预测结果", "综合参考日均商品销售额区间为 12.8-15.4 万元，方法间存在可解释分歧。", "来自模型预测"],
    ["核心驱动因素", "居住人口、家庭客群、控制人口后的竞争压力和距离圈层共同影响研究结论。", "来自历史门店对标"],
    ["硬约束审核", "排烟、卸货动线、租赁递增条款和部分合规资料仍待人工核验。", "待人工核验"],
    ["现场勘探证据", "已回传门头、内部空间和平面图，卸货区域视频与动线照片需要补充。", "来自现场勘探"],
    ["风险与下一步", "完成工程与租赁复核后，再携带对比材料进入一审会议讨论。", "AI 归纳" ]
  ];
  $("#reportSections").innerHTML = sections.map(([title, copy, source]) => `<section><h3>${title}<span class="source-tag ${tagClass(source)}">${source}</span></h3><p>${copy}</p></section>`).join("");
  const recent = [["区域潜力分析", "05/20"], ["候选点对比", "05/19"], ["开业后复盘", "05/18"]];
  $("#recentReportsMini").innerHTML = recent.map((row) => `<button data-action="查看${row[0]}报告" type="button"><span>${row[0]}</span><b>${row[1]}</b></button>`).join("");
}

function answerQuestion(question) {
  const answers = {
    "为什么 A 点预测高于 B 点？": "A 点的居住人口和家庭客群基础更强，因此区间上沿更高。但 A 点的排烟与卸货条件仍未审核完成，当前不能直接进入签约建议。",
    "不同预测方法的分歧来自哪里？": "OLS 对可量化人口和竞争变量更敏感，历史对标包含相似门店的经营经验，人工预估则补充尚未结构化的商场、物业信息。差异会进入人工复核，不会被 AI 自动抹平。",
    "当前还有哪些条件未通过？": "五角场 A 点缺少排烟改造说明、卸货区域视频和租赁递增条款原件。静安寺 C 点还需补门头可视范围与平面图。",
    "一审最需要讨论哪些问题？": "重点讨论租售比、工程交付周期、物流可达性与合规红线。销售潜力只能决定研究优先级，不能替代硬约束审核。",
    "哪些材料仍需补充？": "需要补充门头可视范围图、租赁递增条款原件、卸货区域现场视频，并核对排烟、消防及政策风险。"
  };
  const content = answers[question] || `针对“${escapeHtml(question)}”，当前可先核对预测区间、硬约束状态和现场证据是否齐全。需要我将它整理成待办任务，也可以在报告中继续展开。`;
  $("#assistantAnswer").innerHTML = `<p>${content}</p>`;
}

function bindEvents() {
  $("#loginBtn").addEventListener("click", enterApp);
  $("#demoLoginBtn").addEventListener("click", enterApp);
  $$(".nav-item").forEach((button) => button.addEventListener("click", () => switchPage(button.dataset.page)));
  $$("[data-page-link]").forEach((button) => button.addEventListener("click", () => switchPage(button.dataset.pageLink)));
  $$(".todo-tabs button").forEach((button) => button.addEventListener("click", () => {
    state.todoFilter = button.dataset.todoFilter;
    $$(".todo-tabs button").forEach((item) => item.classList.toggle("is-active", item === button));
    renderTodo();
  }));
  $$(".tabs [data-sales-filter]").forEach((button) => button.addEventListener("click", () => {
    state.salesFilter = button.dataset.salesFilter;
    $$(".tabs [data-sales-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
    renderSalesTable();
  }));
  $$(".map-toolbar button").forEach((button) => button.addEventListener("click", () => {
    $$(".map-toolbar button").forEach((item) => item.classList.toggle("is-active", item === button));
    $("#mapStateChip").textContent = button.dataset.layer;
    showToast(`已切换至${button.dataset.layer}图层`);
  }));
  $$(".promotion-layers button").forEach((button) => button.addEventListener("click", () => {
    $$(".promotion-layers button").forEach((item) => item.classList.toggle("is-active", item === button));
    $("#promotionStateChip").textContent = button.dataset.promoLayer;
    showToast(`已切换至${button.dataset.promoLayer}图层`);
  }));
  $$(".compare-tabs [data-point]").forEach((button) => button.addEventListener("click", () => {
    state.activePoint = button.dataset.point;
    $$(".compare-tabs [data-point]").forEach((item) => item.classList.toggle("is-active", item === button));
    renderCompare();
  }));
  $$(".template-list button").forEach((button) => button.addEventListener("click", () => {
    $$(".template-list button").forEach((item) => item.classList.toggle("is-active", item === button));
    $("#reportDocumentTitle").textContent = button.dataset.template;
    showToast(`已选择${button.dataset.template}`);
  }));
  $$(".quick-question").forEach((button) => button.addEventListener("click", () => answerQuestion(button.dataset.question)));
  $("#generateReport").addEventListener("click", () => {
    $("#reportDocumentTitle").textContent = "区域潜力分析报告（AI 初稿）";
    answerQuestion("一审最需要讨论哪些问题？");
    showToast("AI 初稿已生成，等待业务负责人审核");
  });
  $("#assistantForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#assistantQuestionInput");
    if (!input.value.trim()) return showToast("请输入需要追问的内容");
    answerQuestion(input.value.trim());
    input.value = "";
  });
  $("#globalSearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") showToast(`已定位与“${event.currentTarget.value || "输入内容"}”相关的项目`);
  });
  $("#topActionBtn").addEventListener("click", () => showToast(`已打开${$("#topActionBtn").textContent}操作`));
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (target) showToast(target.dataset.action);
  });
}

function init() {
  renderOverview();
  renderSales();
  renderSelection();
  renderCompare();
  renderPromotion();
  renderReport();
  bindEvents();
  const page = new URLSearchParams(window.location.search).get("page");
  if (page && pageMeta[page]) {
    enterApp();
    switchPage(page);
  }
}

init();
