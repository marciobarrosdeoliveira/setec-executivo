/* Apresentação executiva do Portfólio de Tecnologia SETEC — gerada a partir de window.DADOS. */
(function () {
  'use strict';
  const D = window.DADOS;
  const U = D.meta.unidades;
  const AB = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const MX = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const hoje = new Date();
  const MES_ATUAL = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mi = (ym) => +ym.slice(5, 7) - 1;
  const mc = (ym) => AB[mi(ym)] + '/' + ym.slice(2, 4);
  const ml = (ym) => MX[mi(ym)] + '/' + ym.slice(0, 4);
  const addMes = (ym, n) => {
    const d = new Date(+ym.slice(0, 4), mi(ym) + n, 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const lista = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' e ' + xs[xs.length - 1]);
  const hexA = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;
  const semestre = (ym) => `${mi(ym) < 6 ? 1 : 2}º sem/${ym.slice(0, 4)}`;

  const COR = { COINF: '#2563EB', CODES: '#0D9488', COIND: '#7C3AED', DISIN: '#EA580C', COGES: '#65A30D', CGTEC: '#94A3B8', '—': '#CBD5E1' };
  const SIT = { 'Bloqueado': '#E5484D', 'Em atenção': '#F5A623', 'Em andamento': '#2563EB', 'Planejado': '#93C5FD', 'Concluído': '#16A34A', 'A validar': '#CBD5E1', '': '#F1F5F9' };
  const sitRot = (s) => s || 'Não informada';
  const sitCor = (s) => SIT[s] || '#F1F5F9';

  // ---------- Dados derivados ----------
  const ini = {};
  D.iniciativas.forEach((i) => { ini[i.id] = i; });
  const respDe = (p, i) => {
    const r = U.filter((u) => p[u] === 'R');
    if (r.length) return r;
    return /CGTEC/i.test(i ? [i.analise, i.origem].join(' ') : '') ? ['CGTEC'] : [];
  };
  const C = D.compromissos;
  C.forEach((c) => {
    c.i = ini[c.iniciativa];
    c.frente = c.i ? c.i.frente : '';
    c.resp = respDe(c.papeis, c.i);
    c.u1 = c.resp[0] || '—';
    c.vencido = !!c.data && c.data < MES_ATUAL && c.situacao !== 'Concluído';
    c.bloq = c.situacao === 'Bloqueado';
    c.verm = c.saude === 'Vermelho';
    c.critico = c.bloq || c.verm || c.vencido;
    c.registrado = !!c.situacao && c.situacao !== 'A validar';
  });
  const UNI = U.concat(C.some((c) => c.resp.includes('CGTEC')) ? ['CGTEC'] : []);
  const datas = C.map((c) => c.data).filter(Boolean).sort();
  const M0 = datas[0];
  const M1 = datas[datas.length - 1];
  const MESES = [];
  for (let m = M0; m <= M1; m = addMes(m, 1)) MESES.push(m);
  const semData = C.filter((c) => !c.data);
  const doMes = (m) => C.filter((c) => c.data === m);
  const carga = (u, m) => C.filter((c) => c.resp.includes(u) && (m === undefined || c.data === m)).length;
  const frentes = [...new Set(D.iniciativas.map((i) => i.frente))];

  const nC = C.length;
  const nIni = D.iniciativas.length;
  const porU = UNI.map((u) => [u, carga(u)]).sort((a, b) => b[1] - a[1]);
  const top3U = porU.slice(0, 3);
  const pTop3U = pct(top3U.reduce((s, x) => s + x[1], 0), nC);
  const picos = MESES.map((m) => [m, doMes(m).length]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const picosCrono = picos.map((p) => p[0]).sort();
  const pPicos = pct(picos.reduce((s, x) => s + x[1], 0), nC);
  const nContr = C.filter((c) => c.contratacao).length;
  const nCapac = C.filter((c) => c.capacitacao).length;
  const nCrit = C.filter((c) => c.critico).length;
  const nBloq = C.filter((c) => c.bloq).length;
  const nVerm = C.filter((c) => c.verm).length;
  const nVenc = C.filter((c) => c.vencido).length;
  const nReg = C.filter((c) => c.registrado).length;

  const versao = (String(D.meta.fonte).match(/v\d+(\.\d+)?/i) || [''])[0];
  const atualizada = D.meta.fonteAtualizadaEm ? new Date(D.meta.fonteAtualizadaEm).toLocaleDateString('pt-BR') : '';
  const FONTE = `Fonte Operacional ${versao}${atualizada ? ' · atualizada em ' + atualizada : ''}`;

  // Primeiros meses do horizonte (set e out/2026)
  const PM = MESES.slice(0, 2);
  const PMC = C.filter((c) => PM.includes(c.data));
  const rotPM = PM[0].slice(0, 4) === PM[1].slice(0, 4) ? `${MX[mi(PM[0])]} e ${MX[mi(PM[1])]}/${PM[0].slice(0, 4)}` : `${ml(PM[0])} e ${ml(PM[1])}`;

  const SEC = [
    { rot: 'Panorama do portfólio', desc: 'Resumo por datas e áreas — última revisão macro de quantidade e datas (viabilidade)' },
    { rot: 'Primeiras entregas', desc: `Compromissos previstos para ${rotPM}` },
    { rot: 'Rodadas de acompanhamento', desc: 'Metodologia quinzenal, por exceção, para compromissos e entregas' },
    { rot: 'Monitoramento dinâmico', desc: 'Da planilha a um acompanhamento contínuo — e encaminhamentos' },
  ];
  const sobre = (s, extra) => `<div class="sobre"><span class="n">${s + 1}</span>${esc(SEC[s].rot)}${extra ? ' · ' + extra : ''}</div>`;
  const cab = (s, titulo, sub, extra) => sobre(s, extra) + `<h1>${titulo}</h1>` + (sub ? `<p class="sub">${sub}</p>` : '');

  const slides = [];
  const add = (sec, html, classe) => slides.push({ sec, html, classe: classe || '' });

  // ---------- Capa ----------
  add(-1, `<div class="capa-grade">
    <div>
      <div class="marca">SETEC · SOF — Governança de Tecnologia</div>
      <h1>Portfólio de Tecnologia</h1>
      <p class="sub">Panorama, viabilidade e acompanhamento dos compromissos</p>
      <div class="data">Reunião de <b>${esc(hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }))}</b></div>
      <div class="numeros">
        <div><b>${nIni}</b>iniciativas estruturantes</div>
        <div><b>${nC}</b>compromissos</div>
        <div><b>${D.entregas.length}</b>entregas ao negócio</div>
        <div><b>${UNI.filter((u) => u !== 'CGTEC').length}</b>unidades</div>
      </div>
    </div>
    <nav class="roteiro" aria-label="Roteiro"><h2>Roteiro</h2>
      ${SEC.map((s, i) => `<button data-sec="${i}"><span class="n">${i + 1}</span><span><b>${esc(s.rot)}</b><span>${esc(s.desc)}</span></span></button>`).join('')}
    </nav>
  </div>`, 'escuro capa');

  // ---------- 1. Panorama em números ----------
  {
    const maxU = porU[0][1];
    const barrasU = porU.map(([u, n]) => `<div class="hb"><span class="hb-rot"><i style="background:${COR[u]}"></i>${u}</span>
      <span class="hb-trilha"><span style="width:${(n / maxU) * 100}%;background:${COR[u]}"></span></span><b>${n}</b><small>${pct(n, nC)}%</small></div>`).join('');
    const fr = frentes.map((f) => [f, D.iniciativas.filter((i) => i.frente === f).length, C.filter((c) => c.frente === f).length]).sort((a, b) => b[2] - a[2]);
    const maxF = fr[0][2];
    const listaF = fr.map(([f, ni, n]) => `<div class="fr"><span class="fr-nome" title="${esc(f)}">${esc(f)}<small>${ni} inic.</small></span>
      <span class="fr-trilha"><span style="width:${(n / maxF) * 100}%"></span></span><b>${n}</b></div>`).join('');
    add(0, cab(0, `<em>${nIni}</em> iniciativas estruturantes se desdobram em <em>${nC}</em> compromissos até ${ml(M1)}`,
      `${frentes.length} frentes temáticas, ${UNI.filter((u) => u !== 'CGTEC').length} unidades responsáveis e um horizonte de ${MESES.length} meses (${mc(M0)} a ${mc(M1)}).`) +
      `<div class="corpo">
        <div class="kpis">
          <div class="kpi"><b>${nIni}</b><span>Iniciativas estruturantes</span><small>em ${frentes.length} frentes</small></div>
          <div class="kpi destaque"><b>${nC}</b><span>Compromissos</span><small>unidade do acompanhamento</small></div>
          <div class="kpi"><b>${D.entregas.length}</b><span>Entregas ao negócio</span><small>pactuadas com as áreas</small></div>
          <div class="kpi"><b>${D.acoes.length}</b><span>Ações relevantes</span><small>não rotineiras</small></div>
          <div class="kpi"><b>${nContr}</b><span>Dependem de contratação</span><small>compromissos</small></div>
        </div>
        <div class="duas">
          <div class="bloco"><h3>Por área <small>compromissos como responsável</small></h3>${barrasU}
            <p class="nota-bloco"><b>${lista(top3U.map((x) => x[0]))}</b> concentram <b>${pTop3U}%</b> dos compromissos.</p></div>
          <div class="bloco"><h3>Por frente <small>compromissos · iniciativas</small></h3><div class="frentes">${listaF}</div></div>
        </div>
      </div>`);
  }

  // ---------- 2. Quando ----------
  {
    const cols = MESES.map((m) => ({ k: m, rot: mc(m), cs: doMes(m) }));
    if (semData.length) cols.push({ k: 'sd', rot: 'sem data', cs: semData });
    const max = Math.max(...cols.map((c) => c.cs.length));
    const tpl = `grid-template-columns:repeat(${cols.length},1fr)`;
    const picoSet = new Set(picos.map((p) => p[0]));
    const ordem = UNI.concat(['—']);
    const colunas = cols.map((c, i) => {
      const n = c.cs.length;
      const seg = ordem.map((u) => [u, c.cs.filter((x) => x.u1 === u).length]).filter((x) => x[1])
        .map(([u, q]) => `<span style="flex:${q};background:${COR[u]}" title="${u}: ${q}"></span>`).join('');
      const cls = ['col', picoSet.has(c.k) ? 'pico' : '', n ? '' : 'vazia', c.k === 'sd' ? 'sd' : ''].join(' ');
      return `<div class="${cls}"><b class="col-n">${n || ''}</b><div class="col-barra" style="height:${n ? (n / max) * 100 : 0}%;animation-delay:${i * 30}ms">${seg}</div></div>`;
    }).join('');
    const eixo = cols.map((c) => `<span class="${c.k === MES_ATUAL ? 'atual' : ''}">${c.rot}</span>`).join('');
    const sems = [];
    cols.forEach((c) => {
      const k = c.k === 'sd' ? 'Sem data' : semestre(c.k);
      const ult = sems[sems.length - 1];
      if (ult && ult.k === k) { ult.span++; ult.n += c.cs.length; } else sems.push({ k, span: 1, n: c.cs.length });
    });
    const semAtual = semestre(MES_ATUAL);
    const faixa = sems.map((s) => `<div class="${s.k === semAtual ? 'corrente' : ''}" style="grid-column:span ${s.span}">${s.span > 1 ? s.k : s.k === 'Sem data' ? '' : s.k.replace(' sem/', 'º/').replace('ºº', 'º')}<b>${s.n}</b></div>`).join('');
    const sA = sems.find((s) => s.k === semAtual);
    const mesesCiclo = MESES.filter((m) => semestre(m) === semAtual).map((m) => [m, doMes(m).length]).sort((a, b) => b[1] - a[1]);
    const legenda = ordem.filter((u) => C.some((c) => c.u1 === u)).map((u) => `<span><i class="ponto" style="background:${COR[u]}"></i>${u === '—' ? 'Sem responsável' : u}</span>`).join('');
    add(0, cab(0, `<em>${pPicos}%</em> dos compromissos vencem em apenas três meses: ${lista(picosCrono.map(mc))}`,
      'Distribuição mensal das datas previstas, empilhada por unidade responsável.', 'quando') +
      `<div class="corpo"><div class="linha-tempo">
        <div class="colunas-wrap">
          <div class="colunas" style="${tpl}">${colunas}</div>
          <div class="eixo" style="${tpl}">${eixo}</div>
          <div class="semestres" style="${tpl}">${faixa}</div>
          <div class="legenda">${legenda}</div>
        </div>
        <div class="chamadas">
          ${sA ? `<div class="chamada"><b>${sA.n}</b><span>no ciclo atual (${semAtual}), sendo <b>${mesesCiclo[0][1]}</b> só em ${ml(mesesCiclo[0][0])}</span></div>` : ''}
          <div class="chamada"><b>${doMes(MES_ATUAL).length}</b><span>previstos para o mês atual (${ml(MES_ATUAL)})</span></div>
          ${nVenc ? `<div class="chamada alerta"><b>${nVenc}</b><span>com prazo já vencido sem conclusão registrada</span></div>` : ''}
          ${semData.length ? `<div class="chamada alerta"><b>${semData.length}</b><span>sem data definida</span></div>` : ''}
        </div>
      </div></div>`);
  }

  // ---------- 3. Área × mês ----------
  {
    const cols = MESES.concat(semData.length ? ['sd'] : []);
    const cel = (u, m) => (m === 'sd' ? semData.filter((c) => c.resp.includes(u)).length : carga(u, m));
    let maxCel = 1;
    const linhasU = UNI.filter((u) => carga(u));
    linhasU.forEach((u) => cols.forEach((m) => { maxCel = Math.max(maxCel, cel(u, m)); }));
    const celulas = [];
    linhasU.forEach((u) => cols.forEach((m) => { const n = cel(u, m); if (n) celulas.push([u, m, n]); }));
    const topo = celulas.filter((x) => x[1] !== 'sd').sort((a, b) => b[2] - a[2]).slice(0, 3);
    const grupos = [];
    topo.forEach(([u, m, n]) => {
      let g = grupos.find((x) => x.u === u);
      if (!g) grupos.push((g = { u, itens: [] }));
      g.itens.push(`${mc(m)} (${n})`);
    });
    const titulo = 'Onde a carga aperta: ' + grupos.map((g) => `<em>${g.u}</em> em ${lista(g.itens)}`).join('; ');
    const tpl = `grid-template-columns:130px repeat(${cols.length},1fr) 70px`;
    let html = `<div class="cab"></div>` + cols.map((m) => `<div class="cab ${m === MES_ATUAL ? 'atual' : ''}">${m === 'sd' ? 's/ data' : mc(m)}</div>`).join('') + `<div class="cab tot">Total</div>`;
    let k = 0;
    linhasU.forEach((u) => {
      html += `<div class="uni"><i class="ponto" style="background:${COR[u]}"></i>${u}</div>`;
      cols.forEach((m) => {
        const n = cel(u, m);
        const d = n ? Math.round(18 + 38 * Math.sqrt(n / maxCel)) : 0;
        const peq = d < 30;
        html += `<div class="cel ${m === MES_ATUAL ? 'atual' : ''}">${n ? `<span class="bolha ${peq ? 'peq' : ''}" title="${u} · ${m === 'sd' ? 'sem data' : mc(m)}: ${n}" style="width:${d}px;height:${d}px;background:${peq ? hexA(COR[u], 0.28) : COR[u]};animation-delay:${(k++ % 40) * 12}ms">${n}</span>` : ''}</div>`;
      });
      html += `<div class="tot-l">${carga(u)}</div>`;
    });
    const totCols = cols.map((m) => (m === 'sd' ? semData.length : doMes(m).length));
    const maxTot = Math.max(...totCols);
    html += `<div class="rot-tot">Total</div>` + totCols.map((n) => `<div class="tot-c ${n === maxTot ? 'pico' : ''}">${n || '–'}</div>`).join('') + `<div class="tot-c pico">${nC}</div>`;
    const fimCiclo = MESES.filter((m) => semestre(m) === semestre(MES_ATUAL)).pop() || MES_ATUAL;
    const insights = U.filter((u) => carga(u)).map((u) => {
      const tot = carga(u);
      const pico = MESES.map((m) => [m, carga(u, m)]).sort((a, b) => b[1] - a[1])[0];
      const ateCiclo = C.filter((c) => c.resp.includes(u) && c.data && c.data <= fimCiclo).length;
      return `<div class="insight" style="--cor:${COR[u]}"><b>${u}</b><p>Pico em <strong>${mc(pico[0])} (${pico[1]})</strong> — ${pct(pico[1], tot)}% da carga da unidade. <strong>${ateCiclo}</strong> até ${mc(fimCiclo)}.</p></div>`;
    }).join('');
    add(0, cab(0, titulo, 'Compromissos por unidade responsável e mês previsto. O tamanho do círculo é proporcional à quantidade.', 'áreas × datas') +
      `<div class="corpo"><div class="matriz" style="${tpl}">${html}</div>
        <div class="insights" style="grid-template-columns:repeat(${U.filter((u) => carga(u)).length},1fr)">${insights}</div></div>`);
  }

  // ---------- 4. Viabilidade ----------
  {
    const topU = porU[0];
    add(0, cab(0, 'Última revisão macro de <em>quantidade e datas</em>',
      'Depois desta reunião o quadro vira baseline: mudanças de data ou de escopo passam a ser registradas como mudança de previsão nas rodadas quinzenais.', 'viabilidade') +
      `<div class="corpo"><div class="viab">
        <div>
          <div class="checks">
            <div class="check"><div class="rot">Quantidade</div><b>${nC}</b><p>compromissos em ${nIni} iniciativas; ${lista(top3U.map((x) => x[0]))} concentram ${pTop3U}%.</p></div>
            <div class="check"><div class="rot">Datas</div><b>${pPicos}%</b><p>em ${lista(picosCrono.map(mc))}${semData.length ? `; ${semData.length} sem data definida` : ''}.</p></div>
            <div class="check"><div class="rot">Dependências</div><b>${nContr}</b><p>compromissos dependem de contratação; ${nCapac} de capacitação.</p></div>
            <div class="check"><div class="rot">Sinais de risco</div><b>${nCrit}</b><p>requerem decisão: ${nBloq} bloqueados, ${nVerm} com saúde vermelha, ${nVenc} com prazo vencido.</p></div>
          </div>
          <div class="fluxo">
            <div class="hoje"><b>Hoje</b>Revisão macro</div>
            <div><b>Baseline</b>Quadro pactuado</div>
            <div><b>Rodadas</b>Mudanças por exceção</div>
            <div><b>Fechamento</b>${ml(MESES.filter((m) => semestre(m) === semestre(MES_ATUAL)).pop() || MES_ATUAL)}</div>
          </div>
        </div>
        <div class="perguntas"><h3>Para validar hoje</h3><ol>
          <li>A quantidade é exequível para cada unidade — em especial ${topU[0]}, com ${topU[1]} compromissos?</li>
          <li>Os picos de ${lista(picosCrono.map(mc))} são realistas ou devem ser redistribuídos?</li>
          <li>As datas que dependem de contratação são compatíveis com o calendário de compras?</li>
          <li>Como tratar ${semData.length ? `os ${semData.length} compromissos sem data e ` : ''}os ${nVenc} já vencidos?</li>
          <li>Podemos instituir o baseline com este quadro?</li>
        </ol></div>
      </div></div>`, 'escuro');
  }

  // ---------- 5. Primeiras entregas ----------
  {
    const card = (c) => `<div class="cc" style="--cor:${COR[c.u1]}" title="${esc(c.iniciativa + ' — ' + (c.i ? c.i.nome : ''))}">
      <div class="cc-top"><span class="cc-id">${esc(c.id)}</span><span class="u-tag">${c.u1 === '—' ? 's/ resp.' : c.u1}</span><span class="sit" style="--s:${sitCor(c.situacao)}">${esc(sitRot(c.situacao))}</span></div>
      <div class="cc-nome">${esc(c.nome)}</div></div>`;
    const tag = (m) => (m < MES_ATUAL ? '<span class="tag">prazo vencido</span>' : m === MES_ATUAL ? '<span class="tag agora">vence este mês</span>' : '<span class="tag futuro">a vencer</span>');
    const coluna = (m, g3) => {
      const cs = doMes(m);
      return `<div><div class="mes-cab"><b>${MX[mi(m)].replace(/^./, (x) => x.toUpperCase())}/${m.slice(2, 4)}</b><span class="qt">${cs.length}</span>${tag(m)}</div>
        <div class="cards ${g3 ? 'g3' : ''}">${cs.map(card).join('')}</div></div>`;
    };
    const sits = Object.keys(SIT).map((s) => [s, PMC.filter((c) => (c.situacao || '') === s).length]).filter((x) => x[1]);
    const resumo = sits.map(([s, n]) => `<span><i class="ponto" style="background:${sitCor(s)};border-radius:50%"></i>${esc(sitRot(s))} <b>${n}</b></span>`).join('');
    const rotPrazo = PM.map((m) => `${AB[mi(m)]}/${m.slice(0, 4)}`);
    const ents = D.entregas.filter((e) => rotPrazo.includes(String(e.prazo).trim().toLowerCase()));
    const nVencPM = PMC.filter((c) => c.vencido).length;
    const nAtualPM = PMC.filter((c) => c.data === MES_ATUAL).length;
    const sub = [nVencPM ? `${nVencPM} já passaram do prazo sem conclusão registrada` : '', nAtualPM ? `${nAtualPM} vencem neste mês` : ''].filter(Boolean).join(' e ');
    add(1, cab(1, `<em>${PMC.length}</em> compromissos estavam previstos para ${rotPM}`, (sub ? sub[0].toUpperCase() + sub.slice(1) + '. ' : '') + 'Confirmar conclusão, repactuar a data ou registrar bloqueio.') +
      `<div class="resumo-sit">${resumo}</div>
      <div class="corpo" style="margin-top:20px">
        <div class="meses-2" style="grid-template-columns:400px 1fr">${coluna(PM[0], false)}${coluna(PM[1], true)}</div>
        ${ents.length ? `<div class="entregas-neg"><h4>Entregas ao negócio no período</h4>${ents.map((e) => `<div class="en"><b>${esc(e.id)}</b><span>${esc(e.nome)}</span><small>${esc(e.executor)} · ${esc(e.estagio)} · ${esc(e.prazo)}</small></div>`).join('')}</div>` : ''}
      </div>`);
  }

  // ---------- 6. Pontos a validar ----------
  {
    const grupos = [];
    PMC.forEach((c) => {
      let g = grupos.find((x) => x.ini === c.iniciativa);
      if (!g) grupos.push((g = { ini: c.iniciativa, nome: c.i ? c.i.nome : '', u: c.u1, ids: [], pontos: [] }));
      g.ids.push(c.id);
      if (c.pontoValidar && !g.pontos.includes(c.pontoValidar)) g.pontos.push(c.pontoValidar);
    });
    const itens = grupos.filter((g) => g.pontos.length).map((g) => `<div class="pv" style="--cor:${COR[g.u]}"><div>
      <div class="pv-cab"><b>${esc(g.ini)}</b><span title="${esc(g.nome)}">${esc(g.nome)}</span><em>${esc(g.ids.join(', '))} · ${g.u}</em></div>
      <p>${esc(g.pontos.join(' '))}</p></div></div>`).join('');
    add(1, cab(1, 'O que precisamos ouvir das áreas responsáveis',
      `Pontos a validar registrados na análise dos compromissos de ${rotPM}, agrupados por iniciativa.`, 'pontos a validar') +
      `<div class="corpo"><div class="pontos">${itens}</div></div>`);
  }

  // ---------- 7. Rodada quinzenal ----------
  {
    const fimCiclo = MESES.filter((m) => semestre(m) === semestre(MES_ATUAL)).pop() || MES_ATUAL;
    add(2, cab(2, 'Rodada quinzenal: <em>atualizar só o que mudou</em>, discutir só o que exige decisão',
      'Compromissos são a unidade principal do acompanhamento; entregas ao negócio e ações relevantes sobem por exceção. A reunião não é rodada de status por unidade.') +
      `<div class="corpo">
        <div class="semana">
          <div class="dia"><div class="quando">Segunda e terça</div><div class="quem">Unidades</div><p>Atualizam somente os compromissos com fato novo e sinalizam “Área propõe discutir”.</p></div>
          <div class="dia"><div class="quando">Terça e quarta</div><div class="quem">Subsecretário</div><p>Lê a Fonte Operacional, marca “Interesse SETEC” e identifica decisões, bloqueios e interfaces.</p></div>
          <div class="dia"><div class="quando">Quarta</div><div class="quem">Responsáveis</div><p>Preparam-se para os itens selecionados; aprofundamento técnico fica fora do fórum.</p></div>
          <div class="dia reuniao"><div class="quando">Quinta</div><div class="quem">Reunião de governança</div><p>Discussão por exceção, interface e decisão — sem reapresentar o que já está escrito.</p></div>
          <div class="dia"><div class="quando">Pós-reunião</div><div class="quem">Secretaria técnica</div><p>Registra decisões e ajustes objetivos, sem ata narrativa extensa.</p></div>
        </div>
        <div class="ciclo">
          <div><b>Início do ciclo</b>Compromissos pactuados com data em mês/ano</div>
          <div class="foco"><b>A cada 15 dias</b>Rodada por exceção</div>
          <div><b>Mudanças</b>Nova previsão registrada, com histórico</div>
          <div><b>Fim do ciclo · ${mc(fimCiclo)}</b>Fechamento e repactuação semestral</div>
        </div>
        <div class="principio"><span class="aspas">“</span><p>Atualizar somente quando houver fato novo e discutir por exceção, interface e decisão.</p></div>
      </div>`);
  }

  // ---------- 8. O que sobe para a reunião ----------
  add(2, cab(2, 'O que sobe para a reunião — <em>e o que não sobe</em>',
    'A governança concentra atenção onde há exceção, mudança, bloqueio, decisão ou conflito.', 'regra de pauta') +
    `<div class="corpo"><div class="tres">
      <div class="coluna"><h3>A unidade registra</h3><p class="dica">somente quando há fato novo</p><ul>
        <li><span><b>Fato novo</b> relevante, em relato objetivo</span></li>
        <li><span><b>Bloqueio</b> e o que é preciso para destravar</span></li>
        <li><span><b>Necessidade de decisão</b></span></li>
        <li><span><b>Mudança de previsão</b> — nova data e motivo</span></li>
        <li><span><b>Saúde</b>: verde, amarelo ou vermelho</span></li>
        <li><span><b>“Área propõe discutir”</b></span></li>
      </ul></div>
      <div class="coluna sim"><h3>Entra em pauta</h3><p class="dica">prioridade da reunião</p><ul>
        <li><span>Bloqueios e decisões pendentes</span></li>
        <li><span>Interfaces e conflitos entre unidades</span></li>
        <li><span>Itens marcados pela área ou como <b>Interesse SETEC</b></span></li>
        <li><span>Mudanças materiais de resultado, prazo ou custo</span></li>
        <li><span>Conflitos de capacidade e mudanças de risco</span></li>
      </ul></div>
      <div class="coluna nao"><h3>Não entra</h3><p class="dica">como regra</p><ul>
        <li><span>Revisão oral de todos os compromissos</span></li>
        <li><span>Rodada de status por unidade</span></li>
        <li><span>Itens estáveis — sem registro, a estabilidade é presumida</span></li>
        <li><span>Aprofundamento técnico sem decisão gerencial</span></li>
      </ul></div>
    </div>
    <p class="nota-escala"><b>Incidente grave não espera a rodada:</b> é escalonado imediatamente, com registro rastreável.</p></div>`);

  // ---------- 9. Monitoramento dinâmico ----------
  {
    const ate = addMes(MES_ATUAL, 2);
    const nProx = C.filter((c) => c.data && c.data >= MES_ATUAL && c.data <= ate).length;
    const pReg = pct(nReg, nC);
    add(3, cab(3, 'Da planilha a um <em>monitoramento contínuo</em>',
      'A mesma Fonte Operacional passa a alimentar painéis atualizados automaticamente — a pauta nasce dos sinais, não de relatos.') +
      `<div class="corpo">
        <div class="estagios">
          <div class="estagio"><div class="quando">Até aqui</div><b>Planilha e apresentações</b><p>Fonte Operacional consolidada manualmente; cada reunião exige montar material novo.</p></div>
          <div class="estagio agora"><div class="quando">Agora</div><b>Painel gerado da Fonte</b><p>Esta apresentação e a visão detalhada são geradas direto da planilha: atualizou, publicou.</p></div>
          <div class="estagio prox"><div class="quando">Próximo passo</div><b>Acompanhamento contínuo</b><p>Rodadas registradas pelas unidades, histórico de mudanças, alertas e pauta por exceção.</p></div>
        </div>
        <div class="sinais-cab"><h3>Sinais acompanhados a cada rodada — valores de hoje</h3><a href="../" target="_blank" rel="noopener">Abrir visão detalhada ↗</a></div>
        <div class="sinais">
          <div class="sinal"><b>${pReg}%<small>${nReg}/${nC}</small></b><span>Situação registrada</span><div class="medidor"><i style="width:${pReg}%"></i></div><p>meta: 100% na primeira rodada após o baseline</p></div>
          <div class="sinal alerta"><b>${nCrit}</b><span>Requerem decisão</span><p>bloqueio, saúde vermelha ou prazo vencido</p></div>
          <div class="sinal alerta"><b>${nVenc}</b><span>Prazo vencido</span><p>previstos até ${mc(addMes(MES_ATUAL, -1))} sem conclusão</p></div>
          <div class="sinal"><b>${nProx}</b><span>Vencem nos próximos 3 meses</span><p>${mc(MES_ATUAL)} a ${mc(ate)}</p></div>
          <div class="sinal"><b>${nContr}</b><span>Dependem de contratação</span><p>acompanhar junto ao calendário de compras</p></div>
          <div class="sinal"><b>—</b><span>Mudanças de previsão</span><p>contadas a partir do baseline</p></div>
        </div>
        <div class="sinais-cab"><h3>Situação registrada por unidade — retrato de hoje</h3></div>
        <div class="sit-unis">${situacaoUnidades()}</div>
        <div class="legenda">${Object.keys(SIT).filter((s) => C.some((c) => (c.situacao || '') === s)).map((s) => `<span><i class="ponto" style="background:${sitCor(s)}"></i>${esc(sitRot(s))}</span>`).join('')}</div>
      </div>`);
  }
  function situacaoUnidades() {
    return porU.map(([u, tot]) => {
      const cs = C.filter((c) => c.resp.includes(u));
      const seg = Object.keys(SIT).map((s) => [s, cs.filter((c) => (c.situacao || '') === s).length]).filter((x) => x[1])
        .map(([s, n]) => `<span style="flex:${n};background:${sitCor(s)}" title="${esc(sitRot(s))}: ${n}">${n >= 2 ? n : ''}</span>`).join('');
      const reg = cs.filter((c) => c.registrado).length;
      return `<div class="su"><b><i class="ponto" style="background:${COR[u]}"></i>${u}</b><div class="su-barra">${seg}</div><small>${pct(reg, tot)}% registrada</small></div>`;
    }).join('');
  }

  // ---------- 10. Encaminhamentos ----------
  add(3, cab(3, 'Encaminhamentos propostos', '', 'próximos passos') +
    `<div class="corpo"><div class="passos">
      <div class="passo hoje"><div class="n">1</div><div class="quando">Hoje</div><b>Validar quantidade e datas</b><p>Última revisão macro: confirmar a viabilidade, redistribuir picos e tratar itens sem data ou vencidos.</p></div>
      <div class="passo"><div class="n">2</div><div class="quando">Após a reunião</div><b>Instituir o baseline</b><p>Congelar o quadro pactuado; a partir daí, mudanças viram registros de nova previsão.</p></div>
      <div class="passo"><div class="n">3</div><div class="quando">Próxima quinzena</div><b>Primeira rodada por exceção</b><p>Registrar situação e saúde dos ${nC - nReg} compromissos ainda sem registro, além dos fatos novos.</p></div>
      <div class="passo"><div class="n">4</div><div class="quando">Contínuo</div><b>Monitoramento dinâmico</b><p>Painel atualizado a partir da Fonte Operacional como base da pauta quinzenal.</p></div>
    </div>
    <p class="fecho"><b>O Portfólio define o que a SETEC decidiu perseguir; os Compromissos traduzem isso em entregas concretas</b> — com responsáveis, prazos e condições para realização.</p></div>`, 'escuro');

  // ---------- Montagem ----------
  const deck = document.getElementById('deck');
  const total = slides.length;
  const primeiroDaSecao = SEC.map((_, s) => slides.findIndex((x) => x.sec === s));
  deck.innerHTML = slides.map((s, i) => {
    const trilha = SEC.map((x, k) => `<button data-sec="${k}" class="${k === s.sec ? 'atual' : k < s.sec ? 'feita' : ''}"><i></i>${k + 1}. ${esc(x.rot)}</button>`).join('');
    return `<section class="slide ${s.classe}" aria-label="Slide ${i + 1} de ${total}">${s.html}
      <footer class="rodape"><span>${esc(FONTE)}</span><nav class="trilha-secoes">${trilha}</nav><span class="pag">${i + 1} / ${total}</span></footer></section>`;
  }).join('');

  const els = [...deck.querySelectorAll('.slide')];
  const btnAnt = document.getElementById('ant');
  const btnProx = document.getElementById('prox');
  let atual = -1;
  function ir(i) {
    i = Math.max(0, Math.min(total - 1, i | 0));
    if (i === atual) return;
    if (atual >= 0) els[atual].classList.remove('ativo');
    atual = i;
    els[i].classList.add('ativo');
    btnAnt.disabled = i === 0;
    btnProx.disabled = i === total - 1;
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
  }
  const doHash = () => ir((parseInt(location.hash.slice(1), 10) || 1) - 1);

  function escala() {
    const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    deck.style.transform = `translate(-50%, -50%) scale(${s})`;
  }

  deck.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sec]');
    if (b) ir(primeiroDaSecao[+b.dataset.sec]);
  });
  btnAnt.addEventListener('click', () => ir(atual - 1));
  btnProx.addEventListener('click', () => ir(atual + 1));
  const telaCheia = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen());
  document.getElementById('btn-tela').addEventListener('click', telaCheia);
  document.getElementById('btn-pdf').addEventListener('click', () => window.print());
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'Enter', 'ArrowDown'].includes(k)) { e.preventDefault(); ir(atual + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace', 'ArrowUp'].includes(k)) { e.preventDefault(); ir(atual - 1); }
    else if (k === 'Home') ir(0);
    else if (k === 'End') ir(total - 1);
    else if (k === 'f' || k === 'F') telaCheia();
  });
  let x0 = null;
  document.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  const ctl = document.getElementById('controles');
  let tmr;
  const mostrar = () => { ctl.classList.remove('oculto'); clearTimeout(tmr); tmr = setTimeout(() => ctl.classList.add('oculto'), 2500); };
  document.addEventListener('mousemove', mostrar);
  window.addEventListener('resize', escala);
  window.addEventListener('hashchange', doHash);
  escala();
  doHash();
  mostrar();
})();
