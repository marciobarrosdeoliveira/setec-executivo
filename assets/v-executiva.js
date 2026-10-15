/* Visão Executiva e Pauta de deliberação. */
(function (S) {
  'use strict';
  const { D, U, MES_ATUAL, MESES, esc, mesRot, mesCurto, addMes, pct, contar, tagSit, tagSaude, papeisHtml, respHtml, flags, frenteHtml, painel, cabPagina, barraSeg, legenda, partesSit, partesSau, SIT, tagAnalise } = S;

  const agrupar = (lista) => {
    const g = new Map();
    lista.forEach((c) => { if (!g.has(c.iniciativa)) g.set(c.iniciativa, []); g.get(c.iniciativa).push(c); });
    return [...g.entries()].map(([id, cs]) => ({ ini: S.iniPorId[id], comps: cs }));
  };

  const agItem = (g, opts = {}) => {
    const motivos = [...new Set(g.comps.flatMap((c) => c.motivos))];
    const tags = opts.motivos !== false ? `<div class="ag-motivos">${motivos.map((m) => `<span class="tag alerta">${esc(m)}</span>`).join('')}</div>` : '';
    return `<div class="ag-item" data-item="${esc(g.ini.id)}">
      <div class="ag-topo"><span class="ag-titulo">${esc(g.ini.id)} · ${esc(g.ini.nome)}</span><span class="tag">${g.comps.length} comp.</span></div>
      <div class="ag-meta"><span>${frenteHtml(g.ini.frente)}</span><span>Resp.: ${respHtml(g.ini.resp)}</span></div>
      ${tags}
      <ul class="ag-comps">${g.comps.map((c) => `<li data-item="${esc(c.id)}"><span class="cod">${esc(c.curto)}</span><span>${esc(c.nome)} <span class="muda">· ${esc(mesRot(c.data))}</span></span></li>`).join('')}</ul>
    </div>`;
  };

  function cadencia(lista) {
    const porMes = {};
    lista.forEach((c) => { if (c.data) (porMes[c.data] = porMes[c.data] || []).push(c); });
    const max = Math.max(1, ...MESES.map((m) => (porMes[m] || []).length));
    const barras = MESES.map((m) => {
      const cs = porMes[m] || [];
      const k = contar(cs, (c) => c.situacao);
      const segs = SIT.filter((s) => k[s.v]).map((s) => `<span style="height:${(k[s.v] / max) * 110}px;background:${s.cor}" title="${esc(s.rot || s.v)}: ${k[s.v]}"></span>`).join('');
      const cls = m === MES_ATUAL ? 'atual' : m < MES_ATUAL ? 'passado' : '';
      return `<div class="mes ${cls}" data-href="#/compromissos?mes=${m}" title="${mesRot(m)}: ${cs.length} compromisso(s)">
        <div class="mes-valor">${cs.length || ''}</div><div class="mes-barra">${segs}</div><div class="mes-rotulo">${mesCurto(m)}</div></div>`;
    }).join('');
    const top = MESES.map((m) => [m, (porMes[m] || []).length]).sort((a, b) => b[1] - a[1]).slice(0, 3).filter((x) => x[1]);
    const somaTop = top.reduce((a, x) => a + x[1], 0);
    const semData = lista.filter((c) => !c.data).length;
    const nota = top.length ? `<p class="nota"><b>${pct(somaTop, lista.length)}%</b> dos compromissos concentram-se em ${top.map((x) => `${mesRot(x[0])} (${x[1]})`).join(', ')} — picos que pedem acompanhamento antecipado.${semData ? ` ${semData} sem data definida.` : ''} Clique em um mês para ver os compromissos.</p>` : '';
    return `<div class="meses">${barras}</div>${legenda(partesSit(lista.filter((c) => c.data)), lista.length)}${nota}`;
  }

  function proximos(lista) {
    const cols = [0, 1, 2].map((n) => addMes(MES_ATUAL, n));
    return '<div class="prox">' + cols.map((m, i) => {
      const cs = lista.filter((c) => c.data === m);
      const itens = cs.length ? cs.map((c) => `<div class="prox-item" data-item="${esc(c.id)}">
        <div class="prox-linha"><span class="cod mono">${esc(c.id)}</span>${tagSaude(c.saude)}</div>
        <div class="prox-nome">${esc(c.nome)}</div>
        <div class="muda" style="font-size:12px">Resp.: ${respHtml(c.resp)} · ${esc(c.situacao || 'Situação não informada')}</div></div>`).join('') : '<div class="vazio-msg">Nenhum compromisso no mês.</div>';
      return `<div class="prox-col ${i === 0 ? 'atual' : ''}"><h3><span>${mesRot(m)}${i === 0 ? ' · mês corrente' : ''}</span><span class="n">${cs.length}</span></h3>${itens}</div>`;
    }).join('') + '</div>';
  }

  function cargaUnidades(lista) {
    const PAP = ['R', 'CR', 'P', 'C', 'I'];
    const linhas = U.map((u) => {
      const k = contar(lista.filter((c) => c.papeis[u]), (c) => c.papeis[u]);
      const tot = PAP.reduce((a, p) => a + (k[p] || 0), 0);
      const crit = lista.filter((c) => c.papeis[u] === 'R' && c.critico).length;
      return `<tr class="clicavel" data-href="#/unidades?u=${u}"><td><b>${u}</b></td>${PAP.map((p) => `<td class="num ${k[p] ? '' : 'zero'}">${k[p] || '–'}</td>`).join('')}<td class="num"><b>${tot}</b></td><td class="num ${crit ? '' : 'zero'}">${crit ? `<span class="tag alerta">${crit}</span>` : '–'}</td></tr>`;
    }).join('');
    return `<div class="tabela-wrap"><table class="t"><thead><tr><th>Unidade</th>${PAP.map((p) => `<th class="num" title="${S.PAPEL_NOME[p]}">${S.papel(p)}</th>`).join('')}<th class="num">Total</th><th class="num">Críticos (R)</th></tr></thead><tbody>${linhas}</tbody></table></div>`;
  }

  function porFrente(inis, lista) {
    const linhas = S.frentes.map((f) => {
      const is = inis.filter((i) => i.frente === f);
      if (!is.length) return '';
      const cs = lista.filter((c) => c.frente === f);
      const crit = cs.filter((c) => c.critico).length;
      const aten = cs.filter((c) => c.atencao).length;
      return `<tr class="clicavel" data-href="#/portfolio?frente=${encodeURIComponent(f)}"><td>${frenteHtml(f)}</td><td class="num">${is.length}</td><td class="num">${cs.length}</td>
        <td style="min-width:120px">${barraSeg(partesSit(cs), cs.length || 1)}</td>
        <td class="num ${crit ? '' : 'zero'}">${crit ? `<span class="tag alerta">${crit}</span>` : '–'}</td><td class="num ${aten ? '' : 'zero'}">${aten || '–'}</td></tr>`;
    }).join('');
    return `<div class="tabela-wrap"><table class="t"><thead><tr><th>Frente</th><th class="num">Inic.</th><th class="num">Comp.</th><th>Situação</th><th class="num">Decisão</th><th class="num">Atenção</th></tr></thead><tbody>${linhas}</tbody></table></div>`;
  }

  S.rotas[''] = function () {
    const cs = S.comps();
    const is = S.inis();
    const es = S.entregas();
    const as = S.acoes();
    const c26 = cs.filter((c) => c.data && c.data.startsWith('2026')).length;
    const c27 = cs.filter((c) => c.data && c.data.startsWith('2027')).length;
    const crit = cs.filter((c) => c.critico);
    const limCiencia = addMes(MES_ATUAL, 2);
    const aten = cs.filter((c) => c.atencao && c.data && c.data <= limCiencia);
    const atenTotal = cs.filter((c) => c.atencao).length;
    const valid = cs.filter((c) => c.analise === 'VALIDADO').length;
    const vencidos = cs.filter((c) => c.vencido).length;
    const fr = new Set(is.map((i) => i.frente)).size;
    const iniAnalisadas = is.filter((i) => i.analise === 'ANALISADO').length;

    const kpis = `<div class="kpis">
      <div class="kpi" data-href="#/portfolio"><div class="kpi-rotulo">Iniciativas estruturantes</div><div class="kpi-valor">${is.length}</div><div class="kpi-sub">${fr} frentes · ${iniAnalisadas} com ajustes propostos</div></div>
      <div class="kpi" data-href="#/compromissos"><div class="kpi-rotulo">Compromissos</div><div class="kpi-valor">${cs.length}</div><div class="kpi-sub">${c26} em 2026 · ${c27} em 2027</div></div>
      <div class="kpi critico" data-href="#/compromissos?f=critico"><div class="kpi-rotulo">Requerem decisão</div><div class="kpi-valor">${crit.length}</div><div class="kpi-sub">bloqueados, saúde vermelha ou prazo vencido</div></div>
      <div class="kpi alerta" data-href="#/compromissos?f=atencao"><div class="kpi-rotulo">Em atenção</div><div class="kpi-valor">${atenTotal}</div><div class="kpi-sub">${aten.length} com entrega até ${mesRot(limCiencia)}</div></div>
    </div>
    <div class="kpis-sec">
      <span><b>${pct(valid, cs.length)}%</b> dos compromissos validados pelas equipes</span>
      <a href="#/compromissos?f=vencido"><b>${vencidos}</b> com prazo vencido</a>
      <a href="#/contratacoes"><b>${cs.filter((c) => c.contratacao).length}</b> dependem de contratação</a>
      <a href="#/contratacoes"><b>${cs.filter((c) => c.capacitacao).length}</b> dependem de capacitação</a>
      <span><b>${cs.filter((c) => !c.data).length}</b> sem data</span>
      <a href="#/entregas"><b>${es.length}</b> entregas ao negócio</a>
      <a href="#/acoes"><b>${as.length}</b> ações relevantes</a>
    </div>`;

    const gCrit = agrupar(crit);
    const gAten = agrupar(aten);
    const agenda = `<div class="agenda">
      <div class="agenda-col decisao"><h3>Requer decisão <span class="n">${crit.length} comp. · ${gCrit.length} inic.</span></h3>${gCrit.map((g) => agItem(g)).join('') || '<div class="vazio-msg">Nenhum item crítico.</div>'}</div>
      <div class="agenda-col ciencia"><h3>Para ciência <span class="n">${aten.length} comp. até ${mesRot(limCiencia)}</span></h3>${gAten.map((g) => agItem(g, { motivos: false })).join('') || '<div class="vazio-msg">Nenhum item em atenção no período.</div>'}</div>
    </div>`;

    const distrib = `<div class="bloco-barra"><div class="bloco-barra-titulo">Situação</div>${barraSeg(partesSit(cs), cs.length)}${legenda(partesSit(cs), cs.length)}</div>
      <div class="bloco-barra"><div class="bloco-barra-titulo">Saúde</div>${barraSeg(partesSau(cs), cs.length)}${legenda(partesSau(cs), cs.length)}</div>
      <p class="nota">${cs.filter((c) => c.situacao === 'A validar' || !c.situacao).length} compromissos ainda sem situação de execução registrada (“A validar” ou vazio) — padronizar no próximo ciclo quinzenal.</p>`;

    const destaques = es.filter((e) => /Aten|Priorit/i.test(e.atencao) || e.saude === 'Amarelo');
    const tabEnt = destaques.length ? `<div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Entrega</th><th>Executor</th><th>Estágio</th><th>Decisão necessária</th></tr></thead><tbody>${destaques.map((e) => `<tr class="clicavel" data-item="${esc(e.id)}"><td class="cod">${esc(e.id)}</td><td><b>${esc(e.nome)}</b><div class="muda">${esc(e.atencao)}</div></td><td>${esc(e.executor)}</td><td>${esc(e.estagio)}</td><td>${esc(e.decisao)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="vazio-msg">Sem entregas em destaque.</div>';

    return cabPagina('Visão Executiva', 'Leitura por exceção do portfólio de governança de tecnologia da SETEC: o que exige decisão, o que vence nos próximos meses e onde está a carga.') +
      kpis +
      painel('Agenda de atenção', `<a href="#/pauta">Abrir pauta de deliberação →</a>`, agenda, { semPad: true }) +
      `<div class="grade g-12" style="margin-top:16px">${painel('Distribuição dos compromissos', '', distrib)}${painel('Cadência de entregas por mês', 'empilhado por situação', cadencia(cs))}</div>` +
      `<div style="margin-bottom:16px">${painel('Próximas entregas', 'mês corrente e dois seguintes', proximos(cs), { semPad: true })}</div>` +
      `<div class="grade g-2">${painel('Carga por unidade', 'papéis nos compromissos', cargaUnidades(cs), { semPad: true })}${painel('Por frente', '', porFrente(is, cs), { semPad: true })}</div>` +
      painel('Entregas ao negócio em destaque', `<a href="#/entregas">Ver todas →</a>`, tabEnt, { semPad: true });
  };

  S.rotas.pauta = function () {
    const cs = S.comps();
    const is = S.inis();
    const crit = cs.filter((c) => c.critico);
    const iniAnal = is.filter((i) => i.analise !== 'VALIDADO');
    const reservas = cs.filter((c) => Object.values(c.obs || {}).some((v) => v && !/^VALIDADO$/i.test(String(v).trim())));
    const semData = cs.filter((c) => !c.data);
    const discutir = cs.filter((c) => c.areaDiscutir || c.interesseSetec);
    const entDec = S.entregas().filter((e) => e.decisao);

    const passos = `<div class="passos">
      <div class="passo"><div class="n">1</div><b>DELIBERAR</b><span>${crit.length} compromissos críticos e ${iniAnal.length} iniciativas com ajustes propostos</span></div>
      <div class="passo"><div class="n">2</div><b>CONCLUIR</b><span>${cs.filter((c) => c.analise !== 'VALIDADO').length} compromissos com análise não validada</span></div>
      <div class="passo"><div class="n">3</div><b>PADRONIZAR</b><span>Matriz de papéis (R, CR, P, C, I) e situação/saúde</span></div>
      <div class="passo"><div class="n">4</div><b>VALIDAR</b><span>${cs.filter((c) => c.contratacao).length} contratações e ${semData.length} datas ausentes</span></div>
      <div class="passo"><div class="n">5</div><b>CONSOLIDAR</b><span>Instituir o baseline e o acompanhamento quinzenal</span></div>
    </div>`;

    const linhaComp = (c, extra) => `<tr class="clicavel" data-item="${esc(c.id)}"><td class="cod">${esc(c.id)}</td><td><b>${esc(c.nome)}</b><div class="muda">${esc(c.ini ? c.ini.nome : '')}</div></td><td>${respHtml(c.resp)}</td><td class="nowrap">${esc(mesRot(c.data))}</td><td>${tagSit(c.situacao)}</td><td>${tagSaude(c.saude)}</td><td>${extra(c)}</td></tr>`;
    const cabComp = (ult) => `<thead><tr><th>Código</th><th>Compromisso</th><th>Resp.</th><th>Prazo</th><th>Situação</th><th>Saúde</th><th>${ult}</th></tr></thead>`;

    const tCrit = crit.length ? `<div class="tabela-wrap"><table class="t">${cabComp('Motivo / ponto a validar')}<tbody>${crit.map((c) => linhaComp(c, (x) => x.motivos.map((m) => `<span class="tag alerta">${esc(m)}</span>`).join(' ') + (x.pontoValidar ? `<div class="muda" style="margin-top:3px">${esc(x.pontoValidar)}</div>` : ''))).join('')}</tbody></table></div>` : '<div class="vazio-msg">Nenhum compromisso crítico.</div>';

    const tIni = iniAnal.length ? iniAnal.map((i) => `<div class="ag-item" data-item="${esc(i.id)}" style="border-left-color:var(--ambar-forte);background:#FFFDF7">
      <div class="ag-topo"><span class="ag-titulo">${esc(i.id)} · ${esc(i.nome)}</span>${tagAnalise(i.analise)}</div>
      <div class="ag-meta"><span>${frenteHtml(i.frente)}</span><span>Resp.: ${respHtml(i.resp)}</span></div>
      ${Object.entries(i.obs || {}).filter(([, v]) => v && !/^VALIDADO$/i.test(String(v).trim())).map(([u, v]) => `<div class="d-obs destaque" style="margin-top:6px"><b>${esc(u)}</b>${esc(v)}</div>`).join('')}
    </div>`).join('') : '<div class="vazio-msg">Todas as iniciativas estão validadas.</div>';

    const tRes = reservas.length ? `<div class="tabela-wrap"><table class="t">${cabComp('Manifestação das unidades')}<tbody>${reservas.map((c) => linhaComp(c, (x) => Object.entries(x.obs).filter(([, v]) => v && !/^VALIDADO$/i.test(String(v).trim())).map(([u, v]) => `<div><b>${esc(u)}:</b> ${esc(v)}</div>`).join(''))).join('')}</tbody></table></div>` : '<div class="vazio-msg">Nenhuma ressalva registrada.</div>';

    const tEnt = entDec.length ? `<div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Entrega</th><th>Executor</th><th>Prioridade</th><th>Decisão necessária</th></tr></thead><tbody>${entDec.map((e) => `<tr class="clicavel" data-item="${esc(e.id)}"><td class="cod">${esc(e.id)}</td><td><b>${esc(e.nome)}</b><div class="muda">${esc(e.estagio)}</div></td><td>${esc(e.executor)}</td><td>${esc(e.prioridade || '—')}</td><td>${esc(e.decisao)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="vazio-msg">Nenhuma decisão pendente.</div>';

    const tDisc = discutir.length ? `<div class="tabela-wrap"><table class="t">${cabComp('Marcação')}<tbody>${discutir.map((c) => linhaComp(c, (x) => [x.areaDiscutir ? 'Área propõe discutir' : '', x.interesseSetec ? 'Interesse SETEC' : ''].filter(Boolean).join(' · '))).join('')}</tbody></table></div>` : '<div class="vazio-msg">Nenhum compromisso foi marcado pelas áreas como “discutir na reunião” ou “interesse SETEC” nesta versão da fonte operacional.</div>';

    return cabPagina('Pauta e deliberação', 'Roteiro da reunião: do que exige decisão para o que precisa ser concluído, padronizado e consolidado.') +
      `<div style="margin-bottom:16px">${painel('Próximos passos para consolidar o portfólio', '', passos, { semPad: true })}</div>` +
      `<div style="margin-bottom:16px">${painel('1 · Compromissos que requerem decisão', `${crit.length} itens`, tCrit, { semPad: true })}</div>` +
      `<div class="grade g-2">${painel('Iniciativas com ajustes propostos', `${iniAnal.length} itens`, tIni)}${painel('Marcados para discussão pelas áreas', '', tDisc, { semPad: true })}</div>` +
      `<div style="margin-bottom:16px">${painel('Compromissos com manifestação/ressalva das unidades', `${reservas.length} itens`, tRes, { semPad: true })}</div>` +
      painel('Entregas ao negócio com decisão necessária', `${entDec.length} itens`, tEnt, { semPad: true });
  };
})(window.SETEC);
