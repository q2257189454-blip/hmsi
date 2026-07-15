const MODEL_VERSION = "stroke-rehab-2026.1";
const DATA_VERSION = "experience-data-2026Q2";

const BANDS = ["30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79"];

const ORIGINAL_COSTS = {
  M: {
    "30-34": [10.1, 3.8, 13.8, 27.7], "35-39": [18.8, 9.0, 37.6, 65.4],
    "40-44": [33.8, 14.8, 50.3, 98.8], "45-49": [61.6, 21.4, 91.9, 174.9],
    "50-54": [102.0, 34.7, 152.2, 289.0], "55-59": [153.3, 52.9, 232.4, 438.6],
    "60-64": [217.8, 80.4, 294.7, 593.0], "65-69": [257.6, 120.4, 294.6, 672.6],
    "70-74": [375.1, 197.2, 192.3, 764.6], "75-79": [585.6, 330.5, 183.0, 1099.1]
  },
  F: {
    "30-34": [4.8, 1.2, 1.1, 7.1], "35-39": [9.2, 2.5, 7.2, 18.9],
    "40-44": [20.5, 4.2, 11.3, 36.0], "45-49": [42.0, 6.8, 29.2, 78.0],
    "50-54": [81.7, 13.0, 63.1, 157.8], "55-59": [116.1, 21.3, 104.7, 242.1],
    "60-64": [147.2, 37.2, 161.0, 345.5], "65-69": [195.5, 62.9, 183.3, 441.7],
    "70-74": [351.9, 114.6, 154.0, 620.4], "75-79": [604.7, 213.2, 154.1, 972.0]
  }
};

const NEW_REHAB_COSTS = {
  M: {
    "30-34": {0:32,3:21,5:17,8:14}, "35-39": {0:82,3:56,5:46,8:36},
    "40-44": {0:108,3:74,5:61,8:48}, "45-49": {0:187,3:131,5:109,8:87},
    "50-54": {0:277,3:204,5:173,8:141}, "55-59": {0:385,3:294,5:254,8:211},
    "60-64": {0:446,3:353,5:310,8:262}, "65-69": {0:385,3:322,5:291,8:253},
    "70-74": {0:217,3:192,5:177,8:159}, "75-79": {0:230,3:196,5:178,8:157}
  },
  F: {
    "30-34": {0:3,3:2,5:1,8:1}, "35-39": {0:16,3:11,5:9,8:7},
    "40-44": {0:24,3:16,5:14,8:11}, "45-49": {0:64,3:44,5:36,8:28},
    "50-54": {0:124,3:88,5:74,8:60}, "55-59": {0:188,3:139,5:118,8:97},
    "60-64": {0:264,3:202,5:175,8:146}, "65-69": {0:252,3:207,5:184,8:158},
    "70-74": {0:208,3:172,5:154,8:133}, "75-79": {0:199,3:168,5:152,8:133}
  }
};

const CASES = [
  {id:"C2505001245", band:"40-49", state:"中度功能障碍 · Barthel 55", review:"2026-08-05", service:"平衡训练包（12周）", flag:"材料记录冲突", level:"attention"},
  {id:"C2505001251", band:"50-59", state:"轻度功能障碍 · Barthel 80", review:"2026-07-18", service:"上肢精细训练（8周）", flag:"随访逾期3天", level:"attention"},
  {id:"C2505001266", band:"60-69", state:"重度功能障碍 · Barthel 35", review:"2026-08-12", service:"综合强化包（24周）", flag:"高风险失访", level:"danger"},
  {id:"C2505001278", band:"70-79", state:"中度功能障碍 · Barthel 60", review:"2026-08-20", service:"步态与平衡（12周）", flag:"按计划执行", level:"success"}
];

const state = {
  page: "overview",
  rule: "new",
  sex: "M",
  band: "55-59",
  recovery: 5,
  annualReview: true,
  stopOnRecovery: true,
  riskGenerated: false,
  selectedCase: null,
  reviewTaskCreated: false,
  reportGenerated: true,
  schemeValidated: false,
  savedScenarios: [],
  audit: [
    {label:"输入方案", value:"脑中风康复险 V2.0"},
    {label:"模型计算", value:MODEL_VERSION},
    {label:"结果校验", value:"基准用例通过"},
    {label:"人工确认", value:"等待产品评审"}
  ]
};

const main = document.getElementById("mainContent");
const navItems = Array.from(document.querySelectorAll(".nav-item"));

function icon(name, cls) {
  return '<svg class="' + (cls || "icon") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
}

function money(value) {
  return Number(value).toFixed(1) + " 元";
}

function interpolate(points, x) {
  const keys = Object.keys(points).map(Number).sort(function(a,b){ return a-b; });
  if (x <= keys[0]) return points[keys[0]];
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (x <= keys[i + 1]) {
      const ratio = (x - keys[i]) / (keys[i + 1] - keys[i]);
      return points[keys[i]] + (points[keys[i + 1]] - points[keys[i]]) * ratio;
    }
  }
  const last = keys[keys.length - 1];
  const prev = keys[keys.length - 2];
  const slope = (points[last] - points[prev]) / (last - prev);
  return Math.max(0, points[last] + slope * (x - last));
}

function currentCosts() {
  const base = ORIGINAL_COSTS[state.sex][state.band];
  const rehab = state.rule === "original" ? base[2] : interpolate(NEW_REHAB_COSTS[state.sex][state.band], state.recovery);
  return {treatment:base[0], death:base[1], rehab:rehab, total:base[0] + base[1] + rehab, original:base[3]};
}

function costState(rate) {
  if (rate < 5) return {label:"成本承压", tone:"danger", note:"恢复停赔不足以抵消长尾给付"};
  if (rate < 6.5) return {label:"高度敏感", tone:"attention", note:"接近模型成本平衡点"};
  if (rate <= 8) return {label:"接近平衡", tone:"balanced", note:"位于跨年龄组平衡区间"};
  return {label:"相对稳健", tone:"success", note:"恢复停赔效应更加明显"};
}

function pageHeader(title, actions) {
  return [
    '<header class="page-header">',
      '<div class="page-title"><h1>' + title + '</h1></div>',
      '<div class="page-actions">' + (actions || "") + '</div>',
    '</header>'
  ].join("");
}

function actionButton(label, action, kind, iconName) {
  return '<button class="button ' + (kind || "secondary") + '" data-action="' + action + '">' + (iconName ? icon(iconName) : "") + '<span>' + label + '</span></button>';
}

function metric(label, value, note, tone, iconName) {
  return [
    '<article class="metric ' + (tone || "") + '">',
      '<span class="metric-icon">' + icon(iconName || "overview") + '</span>',
      '<div><span class="metric-label">' + label + '</span><strong>' + value + '</strong><small>' + note + '</small></div>',
    '</article>'
  ].join("");
}

function agentRail(title, conclusion, bullets, actions, tone) {
  return [
    '<aside class="agent-rail ' + (tone || "") + '">',
      '<div class="agent-title"><span class="agent-avatar">' + icon("spark") + '</span><div><small>Agent 经营建议</small><h2>' + title + '</h2></div></div>',
      '<div class="agent-conclusion">' + conclusion + '</div>',
      '<div class="agent-evidence"><span>判断依据</span><ul>' + bullets.map(function(item){return '<li>' + item + '</li>';}).join("") + '</ul></div>',
      '<div class="agent-actions">' + (actions || "") + '</div>',
      '<p class="agent-boundary">模型负责算数，Agent负责编排，专业人员最终确认。</p>',
    '</aside>'
  ].join("");
}

function statusTag(text, tone) {
  return '<span class="status-tag ' + (tone || "") + '">' + text + '</span>';
}

function linePath(values, width, height, maxValue, pad) {
  const p = pad || {left:48,right:18,top:18,bottom:34};
  return values.map(function(value, index){
    const x = p.left + index * ((width - p.left - p.right) / (values.length - 1));
    const y = height - p.bottom - (value / maxValue) * (height - p.top - p.bottom);
    return (index === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
  }).join(" ");
}

function ageCostChart() {
  const width = 700, height = 260, max = 1200, pad = {left:48,right:18,top:18,bottom:36};
  const male = BANDS.map(function(b){ return ORIGINAL_COSTS.M[b][3]; });
  const female = BANDS.map(function(b){ return ORIGINAL_COSTS.F[b][3]; });
  const grid = [0,300,600,900,1200].map(function(v){
    const y = height - pad.bottom - (v / max) * (height - pad.top - pad.bottom);
    return '<line x1="' + pad.left + '" y1="' + y + '" x2="' + (width-pad.right) + '" y2="' + y + '"/><text x="4" y="' + (y+4) + '">' + v.toLocaleString() + '</text>';
  }).join("");
  const labels = BANDS.map(function(b,i){
    const x = pad.left + i * ((width-pad.left-pad.right)/(BANDS.length-1));
    return '<text x="' + x + '" y="' + (height-10) + '" text-anchor="middle">' + b.replace("-","–") + '</text>';
  }).join("");
  const points = function(values, cls){
    return values.map(function(v,i){
      const x = pad.left + i * ((width-pad.left-pad.right)/(values.length-1));
      const y = height-pad.bottom-(v/max)*(height-pad.top-pad.bottom);
      const active = BANDS[i] === state.band ? " active" : "";
      return '<circle class="' + cls + active + '" cx="' + x + '" cy="' + y + '" r="' + (active ? 6 : 3.5) + '" data-band="' + BANDS[i] + '"/>';
    }).join("");
  };
  return [
    '<svg class="data-chart" viewBox="0 0 700 260" role="img" aria-label="男性和女性分年龄组纯风险净成本曲线">',
      '<g class="chart-grid">' + grid + labels + '</g>',
      '<path class="line male" d="' + linePath(male,width,height,max,pad) + '"/><path class="line female" d="' + linePath(female,width,height,max,pad) + '"/>',
      points(male,"male-point"), points(female,"female-point"),
    '</svg>'
  ].join("");
}

function recoveryChart() {
  const width=760, height=300, pad={left:52,right:20,top:22,bottom:42};
  const rates=[0,1,2,3,4,5,6,7,8,9,10];
  const values=rates.map(function(r){return interpolate(NEW_REHAB_COSTS[state.sex][state.band],r);});
  const original=ORIGINAL_COSTS[state.sex][state.band][2];
  const max=Math.max.apply(null, values.concat([original]))*1.08;
  const min=Math.max(0,Math.min.apply(null,values.concat([original]))*.78);
  const x=function(v){return pad.left+(v/10)*(width-pad.left-pad.right);};
  const y=function(v){return height-pad.bottom-((v-min)/(max-min))*(height-pad.top-pad.bottom);};
  const path=values.map(function(v,i){return (i===0?"M":"L")+x(rates[i]).toFixed(1)+" "+y(v).toFixed(1);}).join(" ");
  const current=interpolate(NEW_REHAB_COSTS[state.sex][state.band],state.recovery);
  const grid=[0,1,2,3,4].map(function(i){
    const yy=pad.top+i*((height-pad.top-pad.bottom)/4);
    const val=max-i*((max-min)/4);
    return '<line x1="'+pad.left+'" y1="'+yy+'" x2="'+(width-pad.right)+'" y2="'+yy+'"/><text x="4" y="'+(yy+4)+'">'+Math.round(val)+'</text>';
  }).join("");
  const labels=rates.filter(function(r){return r%2===0;}).map(function(r){return '<text x="'+x(r)+'" y="'+(height-12)+'" text-anchor="middle">'+r+'%</text>';}).join("");
  return [
    '<svg class="data-chart recovery-chart" viewBox="0 0 760 300" role="img" aria-label="恢复率与康复责任纯风险净成本曲线">',
      '<g class="chart-grid">'+grid+labels+'</g>',
      '<rect class="balance-zone" x="'+x(5)+'" y="'+pad.top+'" width="'+(x(8)-x(5))+'" height="'+(height-pad.top-pad.bottom)+'" rx="6"/>',
      '<text class="balance-label" x="'+((x(5)+x(8))/2)+'" y="'+(pad.top+18)+'" text-anchor="middle">跨年龄组成本平衡区间 5%–8%</text>',
      '<line class="original-line" x1="'+pad.left+'" y1="'+y(original)+'" x2="'+(width-pad.right)+'" y2="'+y(original)+'"/>',
      '<text class="original-label" x="'+(width-214)+'" y="'+(y(original)-8)+'">原规则 '+money(original)+'</text>',
      '<path class="line rehab-line" d="'+path+'"/>',
      '<line class="marker-guide" x1="'+x(state.recovery)+'" y1="'+pad.top+'" x2="'+x(state.recovery)+'" y2="'+(height-pad.bottom)+'"/>',
      '<circle class="marker" cx="'+x(state.recovery)+'" cy="'+y(current)+'" r="8"/>',
      '<g class="chart-callout" transform="translate('+(Math.min(width-170,x(state.recovery)+12))+','+(Math.max(48,y(current)-42))+')"><rect width="148" height="36" rx="8"/><text x="12" y="23">r='+state.recovery.toFixed(1)+'% · '+money(current)+'</text></g>',
    '</svg>'
  ].join("");
}

function renderOverview() {
  const agentActions = actionButton("对比恢复率情景","go-simulate","secondary","simulate") + actionButton("生成优化方案","generate-report","soft","report");
  const process = [
    ["design","方案设计","责任定义与假设"],
    ["simulate","成本仿真","精算模型测算"],
    ["risk","风险诊断","识别关键风险"],
    ["rehab","运营策略","制定复评任务"],
    ["report","经营报告","输出评审结论"]
  ].map(function(item,i){
    return '<button data-action="navigate" data-page="'+item[0]+'"><span>'+(i+1)+'</span><div><strong>'+item[1]+'</strong><small>'+item[2]+'</small></div>'+icon("arrow")+'</button>';
  }).join("");
  main.innerHTML = [
    '<section class="page overview-page">',
      pageHeader("经营总览",""),
      '<section class="hero-band spotlight-target">',
        '<div class="hero-copy"><span class="hero-tag">经营测算方案 · 脱敏样例数据</span><h2>从风险量化到产品经营的<br>一体化决策平台</h2><p>当前方案的主要不确定性不在10万元医疗责任上限，而在低恢复率情景下的长期康复给付。</p>'+actionButton("进入方案评估","go-design","primary","arrow")+'</div>',
        '<div class="hero-visual" aria-hidden="true"><div class="brain-core">脑</div><i></i><i></i><i></i><div class="hero-bars"><b></b><b></b><b></b><b></b></div></div>',
      '</section>',
      '<div class="metric-strip">',
        metric("180天封顶后平均治疗费用","6,204 元","经验均值，不是总净成本","blue","overview"),
        metric("超过10万元医疗事件","0.33%","封顶主要约束极端尾部","violet","risk"),
        metric("模型成本平衡区间","约 5%–8%","核心年龄段约7%","teal","rehab"),
        metric("当前主要成本风险","长期失能与生存","康复责任需重点仿真","amber","info"),
      '</div>',
      '<div class="overview-grid">',
        '<section class="panel chart-panel wide"><div class="panel-head"><div><span>人群风险</span><h2>年龄 × 性别净成本</h2></div><div class="legend"><span class="male-key">男性</span><span class="female-key">女性</span><small>元/人年</small></div></div>'+ageCostChart()+'<p class="chart-summary">年龄越高，合计净成本越高；35–69岁以康复责任为核心，70岁后治疗与身故占比上升。</p></section>',
        '<section class="panel responsibility-panel"><div class="panel-head"><div><span>责任结构</span><h2>55–59岁男性</h2></div><small>原规则基准</small></div><div class="donut" style="--a:35%;--b:47%"><div><strong>438.6</strong><small>元/人年</small></div></div><dl><div><dt class="treatment-dot">治疗责任</dt><dd>153.3元</dd></div><div><dt class="death-dot">身故责任</dt><dd>52.9元</dd></div><div><dt class="rehab-dot">康复责任</dt><dd>232.4元</dd></div></dl></section>',
        '<section class="panel risk-list"><div class="panel-head"><div><span>风险情景</span><h2>方案热区</h2></div><small>模型判断</small></div><div class="risk-row danger"><span>长尾给付风险</span><strong>高</strong><small>长期康复给付持续性</small></div><div class="risk-row attention"><span>逆向选择风险</span><strong>中</strong><small>高风险客群更了解自身状况</small></div><div class="risk-row success"><span>医疗费用极端风险</span><strong>低</strong><small>10万元封顶覆盖绝大多数事件</small></div></section>',
        agentRail("先看长期责任","建议进入定价仿真，对比5%、8%和10%恢复率情景，再决定年度鉴定与康复运营配置。",["6,204元是封顶后治疗经验均值","康复责任成本取决于后遗症、生存与恢复","7%左右是模型成本平衡阈值，不是临床目标"],agentActions,"spotlight-target"),
      '</div>',
      '<nav class="process-rail" aria-label="产品经营流程">'+process+'</nav>',
    '</section>'
  ].join("");
}

function renderDesign() {
  const isNew = state.rule === "new";
  const actions = actionButton("方案校验","validate-scheme","secondary","check") + actionButton("保存草稿","save-draft","secondary") + actionButton("运行仿真","run-simulation","primary","arrow");
  main.innerHTML = [
    '<section class="page design-page">',
      pageHeader("方案设计",actions),
      '<div class="wizard"><span class="active"><b>1</b>基本信息</span><i></i><span class="active"><b>2</b>保障责任</span><i></i><span class="'+(isNew?"active":"")+'"><b>3</b>经营规则</span><i></i><span class="'+(state.schemeValidated?"active":"")+'"><b>4</b>方案确认</span></div>',
      state.schemeValidated?'<div class="validation-banner">'+icon("check")+'<strong>方案校验通过</strong><span>责任边界、给付规则、测算参数与人工节点均已完整配置</span>'+statusTag("可进入仿真","success")+'</div>':'',
      '<div class="design-layout">',
        '<div class="design-main">',
          '<section class="panel info-panel"><div class="panel-head"><div><span>基本信息</span><h2>研究基准方案</h2></div>'+statusTag(state.schemeValidated?"已校验":"设计中",state.schemeValidated?"success":"info")+'</div><div class="definition-grid"><div><span>产品名称</span><strong>脑中风康复险 V2.0</strong></div><div><span>产品期限</span><strong>1年期</strong></div><div><span>首次投保年龄</span><strong>30–60岁</strong></div><div><span>最高续保年龄</span><strong>80岁</strong></div><div><span>目标客群</span><strong>城镇基本医保参保人</strong></div><div class="rule-switch"><span>方案版本</span><div role="group" aria-label="方案版本"><button class="'+(!isNew?"active":"")+'" data-action="set-rule" data-rule="original">原规则</button><button class="'+(isNew?"active":"")+'" data-action="set-rule" data-rule="new">动态管理规则</button></div></div></div></section>',
          '<section class="responsibility-matrix spotlight-target"><div class="matrix-head"><div><span>责任配置</span><h2>治疗、身故、康复三项责任</h2></div><small>研究结论与产品规则一一对应</small></div>',
            '<article class="responsibility treatment"><div class="responsibility-title"><span>'+icon("overview")+'</span><h3>治疗责任</h3>'+statusTag("已启用","success")+'</div><div class="responsibility-kpi"><strong>100%</strong><span>医疗费用报销</span><small>最高 10 万元</small></div><dl><div><dt>保障期间</dt><dd>发病后180天内</dd></div><div><dt>费用口径</dt><dd>同次事件合并</dd></div><div><dt>免赔设置</dt><dd>0元</dd></div><div><dt>责任上限</dt><dd>100,000元</dd></div></dl><p>封顶后平均治疗费用约6,204元，超10万元事件约0.33%。</p></article>',
            '<article class="responsibility death"><div class="responsibility-title"><span>'+icon("human")+'</span><h3>身故责任</h3>'+statusTag("已启用","success")+'</div><div class="responsibility-kpi violet"><strong>10万元</strong><span>急性身故定额给付</span><small>发病后180天内</small></div><dl><div><dt>给付方式</dt><dd>一次性给付</dd></div><div><dt>责任触发</dt><dd>急性期身故</dd></div><div><dt>材料核验</dt><dd>死亡及诊疗记录</dd></div><div><dt>决策节点</dt><dd>理赔人员确认</dd></div></dl><p>急性死亡率随年龄上升，高龄责任结构向身故与治疗切换。</p></article>',
            '<article class="responsibility rehab '+(isNew?"selected":"")+'"><div class="responsibility-title"><span>'+icon("rehab")+'</span><h3>康复责任</h3>'+statusTag(isNew?"重点关注":"原规则",isNew?"attention":"info")+'</div><div class="responsibility-kpi teal"><strong>5万元/年</strong><span>严重后遗症年度给付</span><small>第180天后进入</small></div><dl><div><dt>触发条件</dt><dd>仍有严重后遗症</dd></div><div><dt>给付期限</dt><dd class="rule-changing">'+(isNew?"持续至恢复或死亡":"最长10年")+'</dd></div><div><dt>年度鉴定</dt><dd>'+toggleControl("annual-review",state.annualReview && isNew,isNew)+'</dd></div><div><dt>恢复后停赔</dt><dd>'+toggleControl("stop-recovery",state.stopOnRecovery && isNew,isNew)+'</dd></div></dl><p>'+(isNew?"取消固定上限，长期成本由死亡、恢复与复评质量共同决定。":"原规则最多给付10年，身故停止。")+'</p></article>',
          '</section>',
          '<section class="panel timeline-panel"><div class="panel-head"><div><span>保障路径</span><h2>医保与临床路径衔接</h2></div><small>责任边界示意</small></div><div class="care-timeline">'+["急性治疗|0–180天","功能鉴定|第180天","后遗症确认|责任触发","年度给付|每年5万元","功能复评|每年一次",isNew?"恢复复核|停赔或继续":"给付终止|最长10年"].map(function(item,i){const parts=item.split("|");return '<div><span>'+(i+1)+'</span><strong>'+parts[0]+'</strong><small>'+parts[1]+'</small></div>';}).join("")+'</div></section>',
        '</div>',
        '<aside class="design-side">',
          '<section class="panel summary-panel"><div class="panel-head"><div><span>方案预览</span><h2>脑中风康复险 V2.0</h2></div>'+statusTag("可测算","success")+'</div><dl><div><dt>产品期限</dt><dd>1年期</dd></div><div><dt>保障责任</dt><dd>三项责任</dd></div><div><dt>当前规则</dt><dd>'+(isNew?"年度鉴定、恢复停赔":"最长10年、身故停赔")+'</dd></div><div><dt>首次投保</dt><dd>30–60岁</dd></div></dl></section>',
          '<section class="panel diagnosis-panel"><div class="panel-head"><div><span>风险诊断</span><h2>方案不确定性</h2></div><small>基于当前规则</small></div><div class="risk-row '+(isNew?"danger":"attention")+'"><span>长尾给付风险</span><strong>'+(isNew?"高":"中")+'</strong></div><div class="risk-row attention"><span>逆向选择风险</span><strong>中</strong></div><div class="risk-row success"><span>医疗费用极端风险</span><strong>低</strong></div></section>',
          agentRail("重点测算康复责任",isNew?"新规则取消固定给付期限，长期成本取决于死亡、恢复与年度复评质量。":"原规则成本边界明确，但无法根据功能恢复动态停止给付。",["医疗上限能够覆盖绝大多数样本事件","年度恢复率必须作为情景参数","危险因素只触发核保提示，不直接改价"],actionButton("运行定价仿真","run-simulation","primary","arrow"),"compact"),
        '</aside>',
      '</div>',
    '</section>'
  ].join("");
}

function toggleControl(action, checked, enabled) {
  return '<button class="switch '+(checked?"on":"")+'" data-action="'+action+'" aria-pressed="'+checked+'" '+(enabled?"":"disabled")+'><span></span><em>'+(checked?"开启":"关闭")+'</em></button>';
}

function renderSimulate() {
  const costs=currentCosts();
  const status=costState(state.recovery);
  const rehabShare=costs.rehab/costs.total*100;
  const delta=costs.total-costs.original;
  const agentActions=actionButton("对比8%恢复率","compare-eight","secondary","simulate")+actionButton("生成风控策略","go-risk","soft","risk");
  main.innerHTML=[
    '<section class="page simulate-page">',
      pageHeader("定价仿真",actionButton("保存情景","save-scenario","secondary","check")+actionButton("重置参数","reset-simulation","secondary")+actionButton("查看风控","go-risk","primary","arrow")),
      '<div class="metric-strip result-strip">',
        metric("合计纯风险净成本",money(costs.total),(delta>=0?"+":"")+money(delta)+" 较原规则",delta>0?"amber":"blue","overview"),
        metric("康复责任成本",money(costs.rehab),rehabShare.toFixed(1)+"% 的合计成本","teal","rehab"),
        metric("恢复率判断","r = "+state.recovery.toFixed(1)+"%",status.label+" · "+status.note,status.tone,"simulate"),
        metric("当前人群",(state.sex==="M"?"男性 ":"女性 ")+state.band+"岁","3%贴现率 · "+(state.rule==="new"?"动态管理规则":"原规则"),"violet","human"),
      '</div>',
      '<div class="simulation-layout">',
        '<aside class="panel control-rail"><div class="panel-head"><div><span>模拟条件</span><h2>人群与假设</h2></div><button class="text-button" data-action="reset-simulation">重置</button></div>',
          '<fieldset><legend>性别</legend><div class="segmented"><button data-action="set-sex" data-sex="M" class="'+(state.sex==="M"?"active":"")+'">男性</button><button data-action="set-sex" data-sex="F" class="'+(state.sex==="F"?"active":"")+'">女性</button></div></fieldset>',
          '<label>年龄组<select data-input="band">'+BANDS.map(function(b){return '<option value="'+b+'" '+(b===state.band?"selected":"")+'>'+b.replace("-","–")+'岁</option>';}).join("")+'</select></label>',
          '<label class="range-field"><span>年度恢复率 <strong>'+state.recovery.toFixed(1)+'%</strong></span><input data-input="recovery" type="range" min="0" max="10" step="0.5" value="'+state.recovery+'" style="--range:'+state.recovery*10+'%"><div><small>0%</small><small>5%</small><small>8%</small><small>10%</small></div></label>',
          '<fieldset><legend>产品规则</legend><div class="segmented vertical"><button data-action="set-rule" data-rule="original" class="'+(state.rule==="original"?"active":"")+'">原规则</button><button data-action="set-rule" data-rule="new" class="'+(state.rule==="new"?"active":"")+'">动态管理规则</button></div></fieldset>',
          '<div class="toggle-list"><div><span>年度功能鉴定</span>'+toggleControl("annual-review",state.annualReview,true)+'</div><div><span>恢复后停赔</span>'+toggleControl("stop-recovery",state.stopOnRecovery,true)+'</div></div>',
          '<p class="control-note">'+icon("info")+' 恢复率是经营情景参数，不是临床预测或康复目标。</p>',
        '</aside>',
        '<div class="simulation-main">',
          '<section class="panel chart-panel spotlight-target"><div class="panel-head"><div><span>核心情景</span><h2>恢复率—康复责任成本曲线</h2></div><div class="legend"><span class="original-key">原规则</span><span class="rehab-key">新规则</span></div></div>'+recoveryChart()+'<p class="chart-summary">当前55–59岁男性模型平衡点约6.5%；不同年龄性别组的平衡区间约为5%–8%。</p></section>',
          '<div class="simulation-subgrid">',
            '<section class="panel composition"><div class="panel-head"><div><span>责任拆解</span><h2>三项责任成本</h2></div><strong>'+money(costs.total)+'</strong></div>'+costBar("治疗责任",costs.treatment,costs.total,"treatment")+costBar("身故责任",costs.death,costs.total,"death")+costBar("康复责任",costs.rehab,costs.total,"rehab")+'</section>',
            '<section class="panel scenario-compare"><div class="panel-head"><div><span>方案对比</span><h2>原规则 vs 动态管理</h2></div><small>'+(state.savedScenarios.length?"已保存 "+state.savedScenarios.length+" 个情景":"元/人年")+'</small></div><div><span>原规则基准<strong>'+money(costs.original)+'</strong></span><i></i><span>当前新规则<strong>'+money(costs.total)+'</strong></span></div><p>'+ (delta>0?"当前假设下新规则成本增加 "+money(delta)+"，需要强化年度复评和康复管理。":"恢复停赔效应已抵消尾部增支，当前情景接近或低于原规则成本。") +'</p></section>',
          '</div>',
        '</div>',
        agentRail(status.label,status.note+"。建议结合年度复评与康复服务验证实际恢复经验。",["取消10年上限带来尾部增支","恢复停赔降低持续给付","康复责任占比为"+rehabShare.toFixed(1)+"%","所有金额为纯风险净成本"],agentActions,"simulate-agent"),
      '</div>',
    '</section>'
  ].join("");
}

function costBar(label,value,total,cls) {
  return '<div class="cost-bar"><div><span>'+label+'</span><strong>'+money(value)+' · '+(value/total*100).toFixed(1)+'%</strong></div><span><i class="'+cls+'" style="width:'+(value/total*100)+'%"></i></span></div>';
}

function renderRisk() {
  const generated=state.riskGenerated;
  const stages=[
    {name:"投保前",sub:"控制逆向选择",tone:"blue",items:["年龄性别分层费率","标准化健康告知","既往脑血管疾病核验","高风险客群人工核保","等待期与责任边界"]},
    {name:"出险后",sub:"控制理赔风险",tone:"teal",items:["180天事件观察","医疗材料核验","严重后遗症标准鉴定","第三方机构复核","异常案件人工审核"]},
    {name:"长期给付",sub:"控制道德风险",tone:"violet",items:["年度功能复评","康复进度随访","恢复停赔人工复核","康复机构数据回传","异动案件持续追踪"]}
  ];
  const stageHtml=stages.map(function(s,index){
    return '<section class="risk-stage '+s.tone+' '+(generated?"generated":"")+'"><header><span>'+(index+1)+'</span><div><h2>'+s.name+'</h2><p>'+s.sub+'</p></div></header><ol>'+s.items.map(function(item,i){return '<li style="--i:'+i+'">'+icon(generated?"check":"clock")+'<span>'+item+'</span><small>'+(generated?"已配置":"待生成")+'</small></li>';}).join("")+'</ol></section>';
  }).join("");
  const rows=[
    ["CLM202605200001","投保前·人工核保","逆向选择风险","补充近期体检报告","待审核"],
    ["CLM202605200002","出险后·材料核验","理赔风险","补充头部MRI检查","待补材料"],
    ["CLM202605200003","出险后·第三方复核","长期给付风险","进入第三方复核","复核中"],
    ["CLM202605200004","长期给付·年度复评","长尾给付风险","安排线下评估","待年度复评"]
  ].map(function(r){return '<tr><td data-label="案件编号">'+r[0]+'</td><td data-label="当前阶段">'+r[1]+'</td><td data-label="风险标签">'+statusTag(r[2],r[2].indexOf("长尾")>=0?"danger":"attention")+'</td><td data-label="处理建议">'+r[3]+'</td><td data-label="状态">'+statusTag(r[4],"info")+'</td><td data-label="操作"><button class="text-button" data-action="open-risk-case">查看</button></td></tr>';}).join("");
  const agentActions=actionButton(generated?"策略已生成":"生成风控策略",generated?"noop":"generate-risk",generated?"success":"primary",generated?"check":"spark")+actionButton("进入康复运营","go-rehab","secondary","arrow");
  main.innerHTML=[
    '<section class="page risk-page">',
      pageHeader("风险控制",actionButton("生成风控策略","generate-risk","primary","spark")),
      '<div class="metric-strip">'+metric("待年度复评","12 件","较上周减少2件","blue","design")+metric("待补充材料","5 件","均已生成材料清单","teal","report")+metric("第三方复核","3 件","全部需人工确认","violet","human")+metric("停赔复核完成","8 件","均经理赔人员确认","amber","check")+'</div>',
      '<div class="risk-layout">',
        '<div class="risk-main">',
          '<div class="risk-stage-flow spotlight-target">'+stageHtml+'</div>',
          '<section class="panel case-table"><div class="panel-head"><div><span>脱敏样例</span><h2>案件审核队列</h2></div><div class="table-filters">'+statusTag(generated?"策略已匹配":"等待策略","info")+'<button class="text-button" data-action="generate-risk">'+(generated?"重新生成":"生成策略")+'</button></div></div><div class="table-wrap"><table><thead><tr><th>案件编号</th><th>当前阶段</th><th>风险标签</th><th>处理建议</th><th>状态</th><th>操作</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>',
          '<section class="panel risk-monitor"><div class="panel-head"><div><span>执行监测</span><h2>风控任务质量</h2></div><small>近7日</small></div><div class="risk-monitor-grid"><div><span>规则覆盖</span><strong>96%</strong><small>28/29条已配置</small></div><div><span>24小时处理率</span><strong>87%</strong><small>较上周提升5.4pp</small></div><div><span>人工复核留痕</span><strong>100%</strong><small>高影响动作全量记录</small></div></div></section>',
        '</div>',
        agentRail(generated?"风控策略已进入任务流":"先生成三阶段策略",generated?"已根据当前产品规则生成核保、材料核验、第三方复核和年度复评任务草稿。":"当前方案主要风险为长尾给付与逆向选择，建议按三个经营阶段生成对应控制动作。",["危险因素仅触发核保提示，不直接改价","任何停赔建议必须进入人工复核","模型输出、任务草稿与人工结论分开记录"],agentActions,"risk-agent"),
      '</div>',
    '</section>'
  ].join("");
}

function renderRehab() {
  const rows=CASES.map(function(c){
    return '<tr class="'+(state.selectedCase===c.id?"selected":"")+'"><td data-label="个案ID"><strong>'+c.id+'</strong></td><td data-label="年龄组">'+c.band+'岁</td><td data-label="功能状态">'+c.state+'</td><td data-label="复评日期">'+c.review+'</td><td data-label="康复服务">'+c.service+'</td><td data-label="风险提示">'+statusTag(c.flag,c.level)+'</td><td data-label="操作"><button class="text-button" data-action="open-case" data-case="'+c.id+'">查看</button></td></tr>';
  }).join("");
  const drawer=state.selectedCase?renderCaseDrawer(CASES.find(function(c){return c.id===state.selectedCase;})):"";
  main.innerHTML=[
    '<section class="page rehab-page">',
      pageHeader("康复运营",actionButton("查看经营报告","go-report","primary","arrow")),
      '<div class="metric-strip">'+metric("年度复评完成率","86%","较上月提升6.2个百分点","blue","check")+metric("本月在管康复","128 件","全部为脱敏样例数据","teal","rehab")+metric("观察恢复率","5.8%","经验监测值，不自动改模","violet","overview")+metric("高风险失访","9 件","需要人工跟进","amber","info")+'</div>',
      '<section class="operation-flow spotlight-target">'+["个案筛选|基于风险与治疗","年度鉴定|标准化量表","康复计划|匹配服务包","服务执行|机构协同记录","恢复追踪|定期随访评估","给付复核|人工确认结果"].map(function(item,i){const p=item.split("|");return '<div class="'+(i<3?"done":i===3?"active":"")+'"><span>'+icon(i<3?"check":"clock")+'</span><strong>'+p[0]+'</strong><small>'+p[1]+'</small></div>';}).join("")+'</section>',
      '<div class="rehab-layout">',
        '<div class="rehab-main"><section class="panel case-table"><div class="panel-head"><div><span>模拟个案</span><h2>在管康复个案</h2></div><div class="table-filters">'+statusTag("128件","info")+'<button class="text-button" data-action="open-case" data-case="C2505001245">打开冲突案例</button></div></div><div class="table-wrap"><table><thead><tr><th>个案ID</th><th>年龄组</th><th>功能状态</th><th>复评日期</th><th>康复服务</th><th>风险提示</th><th>操作</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>',
          '<div class="rehab-charts"><section class="panel mini-chart"><div class="panel-head"><div><span>经验监测</span><h2>恢复率追踪</h2></div><small>近12个月</small></div>'+sparkChart([4.1,4.3,4.6,4.8,4.9,5.1,5.4,5.2,5.3,5.6,5.2,5.8])+'</section><section class="panel service-bars"><div class="panel-head"><div><span>任务执行</span><h2>康复服务完成率</h2></div><small>本月</small></div>'+simpleBars([["复评完成",86,"blue"],["康复训练",78,"teal"],["随访回访",72,"violet"],["给付复核",61,"amber"]])+'</section><section class="panel cohort-panel"><div class="panel-head"><div><span>人群分层</span><h2>功能等级恢复率</h2></div><small>近12月</small></div><div class="cohort-list"><div><span>轻度功能障碍</span><b>48件</b><strong>11.2%</strong></div><div><span>中度功能障碍</span><b>52件</b><strong>5.1%</strong></div><div><span>重度功能障碍</span><b>28件</b><strong>2.3%</strong></div></div></section></div>',
        '</div>',
        '<aside class="rehab-side"><section class="panel task-list"><div class="panel-head"><div><span>当前队列</span><h2>康复任务</h2></div><small>脱敏样例</small></div><dl><div><dt>待复评</dt><dd>42件</dd></div><div><dt>待随访</dt><dd>18件</dd></div><div><dt>待人工确认</dt><dd>12件</dd></div><div><dt>待机构回传</dt><dd>9件</dd></div></dl></section>'+agentRail("经验数据需要回流","观察恢复率为5.8%，建议重点处理材料冲突与失访个案；经验值只能在精算人员审核并发布新版本后进入模型。",["按年龄、性别和功能等级统计经验","样本不足时不输出稳定结论","康复服务与年度复评必须留下审计轨迹"],actionButton("打开冲突案例","open-case","primary","arrow").replace('data-action="open-case"','data-action="open-case" data-case="C2505001245"'),"compact")+'</aside>',
      '</div>',
      drawer,
    '</section>'
  ].join("");
}

function sparkChart(values) {
  const width=520,height=150,max=7,pad={left:26,right:16,top:14,bottom:28};
  const path=linePath(values,width,height,max,pad);
  const labels=values.map(function(v,i){const x=pad.left+i*((width-pad.left-pad.right)/(values.length-1));const y=height-pad.bottom-(v/max)*(height-pad.top-pad.bottom);return '<circle cx="'+x+'" cy="'+y+'" r="3"/><text x="'+x+'" y="'+(y-8)+'" text-anchor="middle">'+v.toFixed(1)+'</text>';}).join("");
  return '<svg class="spark-data" viewBox="0 0 520 150" role="img" aria-label="近12个月观察恢复率从4.1%变化至5.8%"><path d="'+path+'"/>'+labels+'<line x1="'+pad.left+'" y1="'+(height-pad.bottom)+'" x2="'+(width-pad.right)+'" y2="'+(height-pad.bottom)+'"/></svg>';
}

function simpleBars(items) {
  return '<div class="simple-bars">'+items.map(function(i){return '<div><span>'+i[0]+'</span><i><b class="'+i[2]+'" style="width:'+i[1]+'%"></b></i><strong>'+i[1]+'%</strong></div>';}).join("")+'</div>';
}

function renderCaseDrawer(c) {
  return [
    '<aside class="case-drawer" aria-label="年度功能复评详情">',
      '<button class="drawer-close" data-action="close-case" aria-label="关闭案例详情">'+icon("close")+'</button>',
      '<span class="drawer-eyebrow">年度功能复评 · '+c.id+'</span><h2>材料记录冲突，转人工复核</h2><p>机构记录与康复随访记录存在差异，Agent不生成停赔结论，仅创建第三方复核任务草稿。</p>',
      '<div class="assessment-grid"><div><span>mRS评估</span><strong>机构记录 2</strong><small>随访记录 3</small></div><div><span>Barthel指数</span><strong>机构记录 70</strong><small>随访记录 55</small></div></div>',
      '<div class="drawer-steps"><span class="done">'+icon("check")+'材料收集</span><span class="active">'+icon("clock")+'第三方复核</span><span>'+icon("human")+'人工确认</span><span>'+icon("database")+'经验回流</span></div>',
      '<div class="drawer-note">'+icon("info")+' 最终继续给付或停赔必须由理赔人员结合条款、材料与复评记录确认。</div>',
      '<div class="drawer-actions">'+actionButton(state.reviewTaskCreated?"任务已创建":"创建复核任务",state.reviewTaskCreated?"noop":"create-review",state.reviewTaskCreated?"success":"primary",state.reviewTaskCreated?"check":"human")+actionButton("查看经营报告","go-report","secondary","arrow")+'</div>',
    '</aside><button class="drawer-scrim" data-action="close-case" aria-label="关闭案例详情"></button>'
  ].join("");
}

function renderReport() {
  if (!state.reportGenerated) {
    main.innerHTML='<section class="page report-page">'+pageHeader("经营报告","")+'<div class="report-loading"><span class="analysis-loader">'+icon("spark")+'</span><h2>正在生成经营方案</h2><p>校验模型结果、人工边界与审计轨迹。</p><div><i></i><i></i><i></i><i></i></div></div></section>';
    return;
  }
  const costs=currentCosts();
  const status=costState(state.recovery);
  const sections=[
    ["1","产品责任建议","治疗、身故与康复三项责任完整覆盖风险链；动态管理规则保留年度鉴定与恢复停赔。","blue","design",["明确发病后180天治疗责任边界","康复责任按年度功能状态动态管理","继续给付与停赔均保留人工确认节点"],[["责任完整度","3/3"],["规则校验","通过"]]],
    ["2","分层定价策略","按性别与5岁年龄组测算纯风险净成本；费用率、利润率与再保安排另行审批。","teal","simulate",["当前情景纯风险净成本为"+money(costs.total),"模型恢复率情景为"+state.recovery.toFixed(1)+"%","保存情景后可进行版本间对比"],[["当前净成本",money(costs.total)],["恢复率情景",state.recovery.toFixed(1)+"%"]]],
    ["3","风险控制策略","投保前控制逆向选择，出险后核验材料，长期给付阶段实施第三方年度复评。","violet","risk",["危险因素仅触发核保提示","异常材料进入第三方复核","所有高影响建议进入人工任务流"],[["经营阶段","3个"],["人工留痕","100%"]]],
    ["4","康复运营方案","按功能状态匹配康复服务，持续监测恢复经验，经精算审核后发布新模型版本。","amber","rehab",["按功能状态配置差异化服务包","失访与材料冲突优先生成跟进任务","经验数据经审核后进入版本化回流"],[["在管康复","128件"],["观察恢复率","5.8%"]]]
  ].map(function(s){return '<article class="report-section '+s[3]+'"><span>'+s[0]+'</span><div>'+icon(s[4])+'<h2>'+s[1]+'</h2><p>'+s[2]+'</p><dl class="report-facts">'+s[6].map(function(f){return '<div><dt>'+f[0]+'</dt><dd>'+f[1]+'</dd></div>';}).join("")+'</dl><ul>'+s[5].map(function(item){return '<li>'+item+'</li>';}).join("")+'</ul></div></article>';}).join("");
  const audit=state.audit.map(function(a,i){return '<div class="'+(i<3?"done":"pending")+'"><span>'+icon(i<3?"check":"human")+'</span><strong>'+a.label+'</strong><small>'+a.value+'</small></div>';}).join("");
  main.innerHTML=[
    '<section class="page report-page">',
      pageHeader("经营报告",actionButton("导出报告","export-report","secondary","report")+actionButton("重新生成","generate-report","secondary")+actionButton("提交评审","submit-review","primary","arrow")),
      '<div class="report-meta"><span>方案名称 <strong>脑中风康复险 V2.0</strong></span><span>报告版本 <strong>V1.0</strong></span><span>模型版本 <strong>'+MODEL_VERSION+'</strong></span>'+statusTag("已完成","success")+'</div>',
      '<div class="report-layout">',
        '<div class="report-main"><section class="report-sections spotlight-target">'+sections+'</section><section class="audit-trail"><div class="panel-head"><div><span>审计追踪</span><h2>从模型输入到专业人员确认</h2></div><small>'+DATA_VERSION+'</small></div><div>'+audit+'</div></section></div>',
        '<aside class="report-side">',
          '<section class="executive-summary"><span class="agent-avatar">'+icon("spark")+'</span><small>Agent 总结</small><h2>主要不确定性仍在低恢复率情景下的长期康复给付</h2><p>当前方案具备进入产品评审的基础，但需以年度复评、第三方核验和康复数据回流控制长期不确定性。</p></section>',
          '<section class="key-results"><div><span>当前纯风险净成本</span><strong>'+money(costs.total)+'</strong><small>'+(state.sex==="M"?"男性":"女性")+' '+state.band+'岁</small></div><div><span>康复责任占比</span><strong>'+(costs.rehab/costs.total*100).toFixed(1)+'%</strong><small>'+money(costs.rehab)+'</small></div><div><span>模型恢复率情景</span><strong>'+state.recovery.toFixed(1)+'%</strong><small>'+status.label+'</small></div></section>',
          '<section class="report-boundary"><h3>'+icon("human")+' 人机协作边界</h3><dl><div><dt>Agent负责</dt><dd>模型调用、结果解释、策略编排、报告草稿</dd></div><div><dt>专业人员负责</dt><dd>产品责任、定价水平、核保理赔和最终评审</dd></div></dl></section>',
          '<section class="review-checklist"><div class="panel-head"><div><span>评审检查</span><h2>提交前完整性</h2></div>'+statusTag("3/4完成","attention")+'</div><ul><li>'+icon("check")+'模型与数据版本已锁定</li><li>'+icon("check")+'风险建议已保留人工边界</li><li>'+icon("check")+'审计轨迹已写入报告</li><li class="pending">'+icon("human")+'定价水平等待产品评审</li></ul></section>',
          actionButton("提交产品评审","submit-review","primary full","arrow"),
        '</aside>',
      '</div>',
    '</section>'
  ].join("");
}

function render() {
  if (state.page === "overview") renderOverview();
  if (state.page === "design") renderDesign();
  if (state.page === "simulate") renderSimulate();
  if (state.page === "risk") renderRisk();
  if (state.page === "rehab") renderRehab();
  if (state.page === "report") renderReport();
  navItems.forEach(function(item){
    const active=item.dataset.page===state.page;
    item.classList.toggle("active",active);
    item.setAttribute("aria-current",active?"page":"false");
  });
  document.body.classList.remove("nav-open");
  closeTaskCenter();
}

function navigate(page, focus) {
  state.page=page;
  render();
  window.scrollTo({top:0,behavior:"smooth"});
  if (focus) main.focus({preventScroll:true});
}

function toast(message, tone) {
  const region=document.getElementById("toastRegion");
  const node=document.createElement("div");
  node.className="toast "+(tone||"");
  node.innerHTML=icon(tone==="success"?"check":"info")+'<span>'+message+'</span>';
  region.appendChild(node);
  setTimeout(function(){node.classList.add("leaving");setTimeout(function(){node.remove();},220);},2600);
}

function setRule(rule) {
  state.rule=rule;
  if (rule==="new") {state.annualReview=true;state.stopOnRecovery=true;toast("已切换动态管理规则：年度鉴定和恢复停赔已开启","success");}
  render();
}

function closeTaskCenter() {
  const panel=document.getElementById("taskCenter");
  const button=document.querySelector('[data-action="toggle-tasks"]');
  if (panel) panel.hidden=true;
  if (button) button.setAttribute("aria-expanded","false");
}

function toggleTaskCenter() {
  const panel=document.getElementById("taskCenter");
  const button=document.querySelector('[data-action="toggle-tasks"]');
  const opening=panel.hidden;
  panel.hidden=!opening;
  button.setAttribute("aria-expanded",String(opening));
}

function saveScenario() {
  const scenario={sex:state.sex,band:state.band,recovery:state.recovery,rule:state.rule,total:currentCosts().total};
  const key=[scenario.sex,scenario.band,scenario.recovery,scenario.rule].join("-");
  if (!state.savedScenarios.some(function(item){return item.key===key;})) state.savedScenarios.push(Object.assign({key:key},scenario));
  render();
  toast("当前定价情景已保存，可继续调整参数进行对比","success");
}

function exportReport() {
  const costs=currentCosts();
  const payload={
    product:"脑中风康复险 V2.0",
    generatedAt:new Date().toISOString(),
    model:MODEL_VERSION,
    data:DATA_VERSION,
    scenario:{sex:state.sex,ageBand:state.band,recoveryRate:state.recovery,rule:state.rule},
    costs:costs,
    audit:state.audit,
    boundary:"模型负责测算，Agent负责编排，专业人员最终确认"
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download="智康保-经营报告-V1.0.json";
  link.click();
  URL.revokeObjectURL(url);
  toast("经营报告已导出，包含模型版本与审计轨迹","success");
}

function createReviewTask() {
  state.reviewTaskCreated=true;
  state.audit[3]={label:"人工确认",value:"复核任务已创建，等待理赔人员"};
  render();
  toast("第三方复核任务草稿已创建，需理赔人员确认","success");
}

function generateReport() {
  state.reportGenerated=false;
  state.page="report";
  render();
  setTimeout(function(){state.reportGenerated=true;render();toast("经营报告已完成并写入审计轨迹","success");},900);
}

document.addEventListener("click",function(event){
  const nav=event.target.closest(".nav-item");
  if (nav) {navigate(nav.dataset.page,true);return;}
  const target=event.target.closest("[data-action]");
  if (!target) return;
  const action=target.dataset.action;
  if (action==="navigate") navigate(target.dataset.page,true);
  if (action==="menu") document.body.classList.toggle("nav-open");
  if (action==="toggle-tasks") toggleTaskCenter();
  if (action==="close-tasks") closeTaskCenter();
  if (action==="go-design") navigate("design",true);
  if (action==="go-simulate"||action==="run-simulation") {state.rule="new";navigate("simulate",true);}
  if (action==="go-risk") navigate("risk",true);
  if (action==="go-rehab") navigate("rehab",true);
  if (action==="go-report") navigate("report",true);
  if (action==="set-rule") setRule(target.dataset.rule);
  if (action==="set-sex") {state.sex=target.dataset.sex;render();}
  if (action==="annual-review") {state.annualReview=!state.annualReview;render();}
  if (action==="stop-recovery") {state.stopOnRecovery=!state.stopOnRecovery;render();}
  if (action==="reset-simulation") {state.sex="M";state.band="55-59";state.recovery=5;state.rule="new";render();toast("已恢复57岁男性基准测算案例");}
  if (action==="compare-eight") {state.recovery=8;render();toast("恢复率已调整为8%，进入跨年龄组成本平衡区间","success");}
  if (action==="save-scenario") saveScenario();
  if (action==="validate-scheme") {state.schemeValidated=true;render();toast("方案校验通过，可进入定价仿真","success");}
  if (action==="generate-risk") {state.riskGenerated=true;render();toast("三阶段风控策略与任务草稿已生成","success");}
  if (action==="open-risk-case") toast("案件详情已定位，处理建议仍需人工确认");
  if (action==="open-case") {state.selectedCase=target.dataset.case||"C2505001245";render();}
  if (action==="close-case") {state.selectedCase=null;render();}
  if (action==="create-review") createReviewTask();
  if (action==="generate-report") generateReport();
  if (action==="export-report") exportReport();
  if (action==="submit-review") {state.audit[3]={label:"人工确认",value:"已提交产品评审"};render();toast("方案已提交产品评审，等待专业人员确认","success");}
  if (action==="save-draft") toast("方案草稿已保存","success");
});

document.addEventListener("input",function(event){
  if (event.target.dataset.input==="recovery") {state.recovery=Number(event.target.value);render();}
  if (event.target.dataset.input==="band") {state.band=event.target.value;render();}
});

render();
