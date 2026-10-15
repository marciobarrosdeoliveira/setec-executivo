/* Cronograma, unidades, contratações, demais camadas e metodologia. */
(function (S) {
  'use strict';
  const { D, U, MES_ATUAL, MESES, esc, mesRot, mesCurto, tagSit, tagSaude, papeisHtml, respHtml, flags, frenteHtml, painel, cabPagina, papel, PAPEL_NOME } = S;
  const SAU_CLS = { Verde: 'verde', Amarelo: 'amarelo', Vermelho: 'vermelho' };
  const chip = (c) => `<span class="marco ${SAU_CLS[c.saude] || 'indef'}" data-item="${esc(c.id)}" title="${esc(c.id)} · ${esc(c.nome)} · ${esc(c.situacao || 'sem situação')} · saúde ${esc(c.saude || 'não informada')}">${esc(c.curto)}</span>`;
  const linhaComp = (c) => `<tr class="clicavel" data-item="${esc(c.id)}"><td class="cod">${esc(c.id)}</td><td><b>${esc(c.nome)}</b><div class="muda">${esc(c.ini ? c.ini.nome : '')}</div></td><td>${respHtml(c.resp)}</td><td class="nowrap">${esc(mesRot(c.data))}</td><td>${tagSit(c.situacao)}</td><td>${tagSaude(c.saude)}</td></tr>`;
  const tabComp = (lista, vazio) => (lista.length ? `<div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Compromisso</th><th>Resp.</th><th>Prazo</th><th>Situação</th><th>Saúde</th></tr></thead><tbody>${lista.map(linhaComp).join('')}</tbody></table></div>` : `<div class="vazio-msg">${vazio}</div>`);

  // ---------- Cronograma ----------
  S.rotas.cronograma = function () {
    const cs = S.comps();
    const temSemData = cs.some((c) => !c.data);
    const cab = `<tr><th class="ini">Iniciativa</th>${MESES.map((m) => `<th class="${m === MES_ATUAL ? 'atual' : ''}">${mesCurto(m)}</th>`).join('')}${temSemData ? '<th>Sem data</th>' : ''}</tr>`;
    let corpo = '';
    S.frentes.forEach((f) => {
      const is = S.inis().filter((i) => i.frente === f);
      if (!is.length) return;
      corpo += `<tr class="grupo"><td colspan="${MESES.length + 2}">${frenteHtml(f)}</td></tr>`;
      is.forEach((i) => {
        const ci = cs.filter((c) => c.iniciativa === i.id);
        const cel = (m) => ci.filter((c) => c.data === m).map(chip).join('');
        corpo += `<tr><td class="ini"><a href="#" data-item="${esc(i.id)}" class="ini-nome" title="${esc(i.nome)}"><span class="mono">${esc(i.id)}</span> ${esc(i.nome)}</a><span class="muda" style="font-size:11.5px">Resp.: ${respHtml(i.resp)}</span></td>` +
          MESES.map((m) => `<td class="${m === MES_ATUAL ? 'atual' : ''} ${/-(01|07)$/.test(m) ? 'trim' : ''}">${cel(m)}</td>`).join('') +
          (temSemData ? `<td>${ci.filter((c) => !c.data).map(chip).join('')}</td>` : '') + '</tr>';
      });
    });
    const leg = `<div class="legenda" style="margin:0 0 10px"><span><span class="marco vermelho">C01</span> saúde vermelha</span><span><span class="marco amarelo">C01</span> amarela</span><span><span class="marco verde">C01</span> verde</span><span><span class="marco indef">C01</span> a definir / não informada</span><span class="muda">Coluna destacada = mês corrente (${mesRot(MES_ATUAL)}). Clique em um marco para detalhar.</span></div>`;
    return cabPagina('Cronograma de compromissos', 'Roadmap derivado dos compromissos (mês/ano), por iniciativa e frente.') + leg +
      `<section class="painel"><div class="crono-wrap"><table class="crono"><thead>${cab}</thead><tbody>${corpo}</tbody></table></div></section>`;
  };

  // ---------- Contratações ----------
  S.rotas.contratacoes = function () {
    const cs = S.comps();
    const contr = cs.filter((c) => c.contratacao).sort((a, b) => (a.data || '9') < (b.data || '9') ? -1 : 1);
    const cap = cs.filter((c) => c.capacitacao);
    const ate2026 = contr.filter((c) => c.data && c.data <= '2026-12').length;
    const t1 = contr.length ? `<div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Compromisso</th><th>Objeto da contratação</th><th>Resp.</th><th>Prazo</th><th>Situação</th><th>Saúde</th></tr></thead><tbody>${contr.map((c) => `<tr class="clicavel" data-item="${esc(c.id)}"><td class="cod">${esc(c.id)}</td><td><b>${esc(c.nome)}</b><div class="muda">${esc(c.ini ? c.ini.nome : '')}</div></td><td>${esc(c.objetoContratacao || '—')}</td><td>${respHtml(c.resp)}</td><td class="nowrap">${esc(mesRot(c.data))}</td><td>${tagSit(c.situacao)}</td><td>${tagSaude(c.saude)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="vazio-msg">Nenhum compromisso depende de contratação.</div>';
    const inisContr = S.inis().filter((i) => i.contratacao);
    const inisCap = S.inis().filter((i) => i.capacitacao);
    const listaIni = (is) => (is.length ? `<table class="t"><tbody>${is.map((i) => `<tr class="clicavel" data-item="${esc(i.id)}"><td class="cod">${esc(i.id)}</td><td>${esc(i.nome)}</td><td>${respHtml(i.resp)}</td></tr>`).join('')}</tbody></table>` : '<div class="vazio-msg">Nenhuma.</div>');
    return cabPagina('Contratações e capacitação', 'Dependências de contratação e de capacitação declaradas nos compromissos — insumo para o Mapa Integrado de Contratações e o Plano de Competências.') +
      `<div class="kpis-sec" style="padding-top:0"><span><b>${contr.length}</b> compromissos dependem de contratação (${S.pct(contr.length, cs.length)}%)</span><span><b>${ate2026}</b> deles com entrega até dez/2026 — prazo de tramitação é ponto de atenção</span><span><b>${cap.length}</b> dependem de capacitação</span></div>` +
      `<div style="margin-bottom:16px">${painel('Compromissos que dependem de contratação', `${contr.length}`, t1, { semPad: true })}</div>` +
      `<div style="margin-bottom:16px">${painel('Compromissos que dependem de capacitação', `${cap.length}`, tabComp(cap, 'Nenhum.'), { semPad: true })}</div>` +
      `<div class="grade g-2">${painel('Iniciativas com contratação prevista', `${inisContr.length}`, listaIni(inisContr), { semPad: true })}${painel('Iniciativas com capacitação prevista', `${inisCap.length}`, listaIni(inisCap), { semPad: true })}</div>`;
  };

  // ---------- Entregas ao Negócio ----------
  S.rotas.entregas = function () {
    const es = S.entregas();
    const exec = [...new Set(es.map((e) => e.executor))].sort();
    const destaque = (e) => /Aten|Priorit/i.test(e.atencao);
    const corpo = exec.map((x) => {
      const lista = es.filter((e) => e.executor === x);
      return `<tr class="grupo"><td colspan="7">${esc(x)} <span class="muda">· ${lista.length}</span></td></tr>` + lista.map((e) => `<tr class="clicavel" data-item="${esc(e.id)}"><td class="cod">${esc(e.id)}</td>
        <td><b>${esc(e.nome)}</b><div class="muda">${esc(e.produto)}${e.area ? ' · ' + esc(e.area) : ''}</div></td>
        <td>${esc(e.estagio)}</td><td>${esc(e.prazo || '—')}</td><td>${esc(e.prioridade || '—')}</td>
        <td>${destaque(e) ? `<span class="tag est-aten">${esc(e.atencao)}</span>` : `<span class="muda">${esc(e.atencao || '—')}</span>`}</td><td>${tagSaude(e.saude)}</td></tr>`).join('');
    }).join('');
    return cabPagina('Carteira de Entregas ao Negócio', 'Produtos e soluções pactuados com áreas de negócio. Governança ordinária pelos Coordenadores-Gerais, com escalonamento por exceção.') +
      `<div class="kpis-sec" style="padding-top:0"><span><b>${es.length}</b> entregas</span>${exec.map((x) => `<span>${esc(x)} <b>${es.filter((e) => e.executor === x).length}</b></span>`).join('')}<span><b>${es.filter(destaque).length}</b> em atenção/prioritárias</span><span><b>${es.filter((e) => /pausad/i.test(e.prioridade) || /estacion|preterid/i.test(e.estagio)).length}</b> pausadas/estacionadas</span></div>` +
      `<section class="painel"><div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Entrega</th><th>Estágio</th><th>Prazo</th><th>Prioridade</th><th>Atenção</th><th>Saúde</th></tr></thead><tbody>${corpo}</tbody></table></div></section>`;
  };

  // ---------- Ações Relevantes ----------
  S.rotas.acoes = function () {
    const as = S.acoes();
    return cabPagina('Agenda de Ações Relevantes', 'Ações não rotineiras, delimitadas e com resultado identificável, que merecem visibilidade sem configurar transformação estruturante.') +
      `<section class="painel"><div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Ação</th><th>Unidade</th><th>Prazo</th><th>Situação</th><th>Ponto de decisão</th></tr></thead><tbody>${as.map((a) => `<tr class="clicavel" data-item="${esc(a.id)}"><td class="cod">${esc(a.id)}</td><td><b>${esc(a.nome)}</b><div class="muda trunc">${esc(a.porque)}</div></td><td>${esc(a.unidade)}</td><td>${esc(a.prazo)}</td><td>${esc(a.situacao)}</td><td>${esc(a.ponto || '—')}</td></tr>`).join('') || '<tr><td colspan="6" class="vazio">Nenhuma ação.</td></tr>'}</tbody></table></div></section>`;
  };

  // ---------- PEI ----------
  S.rotas.pei = function () {
    const projs = [...new Set(D.pei.map((v) => v.projeto))];
    const idDe = (txt) => (String(txt).match(/^([A-Z]{1,2}-\d+)/) || [])[1];
    const corpo = projs.map((pj) => `<tr class="grupo"><td colspan="5">${esc(pj)}</td></tr>` + D.pei.filter((v) => v.projeto === pj).map((v) => {
      const id = idDe(v.objeto);
      return `<tr class="${id ? 'clicavel' : ''}" ${id ? `data-item="${esc(id)}"` : ''}><td><b>${esc(v.objeto)}</b><div class="muda">${esc(v.tipo)}</div></td><td class="nowrap">${esc(v.resultadoChave)}</td><td>${esc(v.vinculo)}</td><td>${esc(v.observacao)}</td></tr>`;
    }).join('')).join('');
    return cabPagina('Vínculos com o PEI', 'Rastreabilidade entre objetos de tecnologia e projetos/resultados-chave do Planejamento Estratégico Institucional.') +
      `<section class="painel"><div class="tabela-wrap"><table class="t"><thead><tr><th>Objeto</th><th>Resultado-chave</th><th>Vínculo</th><th>Observação</th></tr></thead><tbody>${corpo}</tbody></table></div></section>`;
  };

  // ---------- Metodologia ----------
  S.rotas.metodologia = function () {
    const papeis = Object.entries(PAPEL_NOME).map(([k, v]) => `<tr><td>${papel(k)}</td><td><b>${v}</b></td></tr>`).join('');
    return cabPagina('Metodologia de governança', 'Síntese da Metodologia de Governança de Tecnologia da SETEC (v0.4) aplicada a esta visão.') +
      `<blockquote class="citacao">Priorizar no nível correto, preservar autonomia técnica e gerir por exceção. O Portfólio responde “o que a SETEC decidiu perseguir”; os Compromissos respondem “o que será efetivamente entregue neste ciclo”.</blockquote>
      <div class="grade g-21"><section class="painel"><div class="painel-corpo texto-metodo">
        <h3 style="margin-top:0">Camadas de trabalho</h3>
        <table class="t"><thead><tr><th>Camada</th><th>Definição</th><th>Governança ordinária</th></tr></thead><tbody>
          <tr><td><b>Portfólio de Iniciativas Estruturantes</b></td><td>Transformações relevantes de capacidade, arquitetura, processo, governança, plataforma ou modelo operacional.</td><td>SETEC / Subsecretário</td></tr>
          <tr><td><b>Compromissos das Iniciativas</b></td><td>Resultados concretos que materializam uma Iniciativa no ciclo semestral; unidade principal do acompanhamento quinzenal.</td><td>Pactuados com a SETEC; atualizados pela unidade responsável</td></tr>
          <tr><td><b>Entregas ao Negócio</b></td><td>Produtos, soluções, integrações, painéis ou agentes pactuados com áreas de negócio.</td><td>Coordenadores-Gerais, escalonamento por exceção</td></tr>
          <tr><td><b>Ações Relevantes</b></td><td>Ações não rotineiras, delimitadas e com resultado identificável.</td><td>Coordenadores, escalonamento por exceção</td></tr>
          <tr><td><b>Rotina operacional / BAU</b></td><td>Sustentação, chamados, incidentes ordinários e pequenas evoluções.</td><td>Unidades técnicas; só sobe por exceção</td></tr>
        </tbody></table>
        <h3>Princípios</h3>
        <ul><li><b>Priorização executiva em camadas</b> — cada tipo de trabalho é priorizado pela autoridade compatível.</li>
          <li><b>Autonomia técnica com comunicação</b> — a SETEC decide “o que perseguir”; as unidades decidem “como executar”.</li>
          <li><b>Gestão por exceção</b> — sobem bloqueios, riscos, mudanças materiais, conflitos de capacidade e decisões. A reunião integrada não é rodada de status.</li></ul>
        <h3>Ciclo e cadência</h3>
        <p>Compromissos são pactuados por ciclo semestral (culminando em junho e dezembro), com data no nível de mês/ano para forçar cadenciamento realista sem falsa precisão. O acompanhamento é quinzenal.</p>
        <h3>Como esta visão classifica a atenção</h3>
        <ul><li><b>Requer decisão</b>: situação “Bloqueado”, saúde “Vermelho” ou prazo anterior ao mês corrente sem conclusão.</li>
          <li><b>Para ciência / em atenção</b>: situação “Em atenção” ou saúde “Amarelo”.</li>
          <li>Situação e saúde são lidas da Fonte Operacional; itens “A validar”/“A definir” ainda não tiveram acompanhamento registrado.</li></ul>
      </div></section>
      <div>${painel('Papéis na matriz de responsabilidades', '', `<table class="t"><tbody>${papeis}</tbody></table>`, { semPad: true })}
      <div class="nota-lateral" style="margin-top:16px"><b>Instrumentos transversais:</b> Mapa Integrado de Contratações e Custos, Plano de Desenvolvimento de Competências, Roadmap/Sequenciamento, Agenda de Atenção, Calendário Crítico e Registro de Decisões e Mudanças.</div></div></div>`;
  };
})(window.SETEC);
