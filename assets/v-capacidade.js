/* Capacidade por unidade: período, papel, unidade × mês e detalhamento no formato da planilha. */
(function (S) {
  'use strict';
  const { D, U, MES_ATUAL, esc, mesRot, mesCurto, addMes, tagSit, tagSaude, painel, cabPagina, corUnidade, MODOS, casaPapel, passaPeriodo, mesesPeriodo, opcoes, periodoHtml, SIT, SAU, thUnidades, tdUnidades } = S;
  const f = {};
  const igual = (filtro, v) => !filtro || (filtro === '_' ? !v : v === filtro);
  const AGRUPAR = [['mes', 'Data prevista'], ['unidade', 'Unidade responsável'], ['iniciativa', 'Iniciativa'], ['frente', 'Frente']];
  const MODO_CURTO = { R: 'como responsável', RCR: 'como R ou CR', todos: 'qualquer participação' };

  S.rotas.unidades = function (p) {
    Object.assign(f, {
      periodo: '', de: p.get('de') || '', ate: p.get('ate') || '', modo: p.get('papel') || 'R', frente: p.get('frente') || '', sit: '', saude: '',
      selU: p.get('u') || S.estado.unidade || '', selM: p.get('mes') || '', agrupar: 'mes',
    });
    return cabPagina('Capacidade por unidade', 'Carga de compromissos por unidade e mês. Filtre o período e o papel; clique em uma unidade, mês ou célula para detalhar.') +
      `<div class="filtros" id="filtros">${periodoHtml(f)}
        <label>Papel <select data-f="modo">${opcoes(MODOS, f.modo)}</select></label>
        <label>Frente <select data-f="frente">${opcoes(S.frentes, f.frente, 'Todas')}</select></label>
        <label>Situação <select data-f="sit">${opcoes(SIT.map((s) => [s.v || '_', s.rot || s.v]), '', 'Todas')}</select></label>
        <label>Saúde <select data-f="saude">${opcoes(SAU.map((s) => [s.v || '_', s.rot || s.v]), '', 'Todas')}</select></label>
        <button class="link-limpar" data-limpar>Limpar</button>
        <span class="total" id="total"></span>
      </div><div id="res-cap"></div>`;
  };

  S.rotas.unidades.depois = () => {
    const res = document.getElementById('res-cap');
    res.addEventListener('click', (e) => {
      if (e.target.closest('[data-limpar-sel]')) { f.selU = ''; f.selM = ''; return desenhar(); }
      const el = e.target.closest('[data-cap]');
      if (!el) return;
      const [u, m] = el.dataset.cap.split('|');
      if (u && m) {
        const mesma = f.selU === u && f.selM === m;
        f.selU = mesma ? '' : u;
        f.selM = mesma ? '' : m;
      } else if (u) f.selU = f.selU === u ? '' : u;
      else if (m) f.selM = f.selM === m ? '' : m;
      desenhar();
    });
    res.addEventListener('change', (e) => {
      if (e.target.matches('[data-agrupar]')) { f.agrupar = e.target.value; desenhar(); }
    });
    S.ligarFiltros(f, desenhar, { aoLimpar: () => { f.selU = ''; f.selM = ''; } });
  };

  function cartoes(lista, meses) {
    const prox = addMes(MES_ATUAL, 2);
    return '<div class="u-cards">' + U.map((u) => {
      const cs = lista.filter((c) => casaPapel(c.papeis[u], f.modo));
      const porMes = meses.map((m) => cs.filter((c) => c.data === m).length);
      const mx = Math.max(1, ...porMes);
      const ip = porMes.indexOf(Math.max(...porMes));
      const crit = cs.filter((c) => c.critico).length;
      const proximos = cs.filter((c) => c.data && c.data >= MES_ATUAL && c.data <= prox).length;
      const inis = new Set(cs.map((c) => c.iniciativa)).size;
      return `<div class="u-card ${f.selU === u ? 'sel' : ''}" data-cap="${u}|" style="--cor:${corUnidade(u)}" title="Clique para detalhar ${u}">
        <div class="u-card-cab"><b>${u}</b><span class="muda">${inis} iniciativa(s)</span></div>
        <div class="u-num">${cs.length}</div>
        <div class="u-sub">${crit ? `<span class="tag alerta">${crit} requer decisão</span>` : '<span class="muda">sem críticos</span>'}<span class="muda">${proximos} até ${mesCurto(prox)}</span>${porMes[ip] ? `<span class="muda">pico ${mesCurto(meses[ip])} (${porMes[ip]})</span>` : ''}</div>
        <div class="spark">${porMes.map((n, i) => `<span class="${n ? '' : 'zero'} ${meses[i] === MES_ATUAL ? 'atual' : ''}" style="height:${n ? Math.max(8, (n / mx) * 100) : 6}%" title="${mesRot(meses[i])}: ${n}"></span>`).join('')}</div>
      </div>`;
    }).join('') + '</div>';
  }

  function chaveGrupo(c) {
    if (f.agrupar === 'unidade') return [c.resp[0] || 'Sem responsável'];
    if (f.agrupar === 'iniciativa') return [c.iniciativa];
    if (f.agrupar === 'frente') return [c.frente];
    return [c.data || 'sd'];
  }
  function rotuloGrupo(k) {
    if (f.agrupar === 'unidade') return `<span class="frente-dot" style="background:${corUnidade(k)}"></span>${esc(k)}`;
    if (f.agrupar === 'iniciativa') { const i = S.iniPorId[k]; return `<span class="mono">${esc(k)}</span> · ${esc(i ? i.nome : '')}`; }
    if (f.agrupar === 'frente') return S.frenteHtml(k);
    return k === 'sd' ? 'Sem data' : esc(mesRot(k)) + (k === MES_ATUAL ? ' · mês corrente' : k < MES_ATUAL ? ' · passado' : '');
  }
  function ordemGrupo(k) {
    if (f.agrupar === 'unidade') { const i = U.indexOf(k); return String(i < 0 ? 99 : i).padStart(2, '0'); }
    if (f.agrupar === 'iniciativa') return String(S.num(k)).padStart(3, '0');
    if (f.agrupar === 'frente') return String(S.frentes.indexOf(k)).padStart(2, '0');
    return k === 'sd' ? '9999' : k;
  }

  function detalhe(base, lista) {
    const fonte = f.selM ? base : lista;
    const det = fonte.filter((c) => (!f.selU || casaPapel(c.papeis[f.selU], f.modo)) && (!f.selM || (f.selM === 'sd' ? !c.data : c.data === f.selM)))
      .sort((a, b) => ((a.data || '9999') < (b.data || '9999') ? -1 : (a.data || '9999') > (b.data || '9999') ? 1 : a.ord - b.ord));
    const grupos = new Map();
    det.forEach((c) => chaveGrupo(c).forEach((k) => { if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(c); }));
    const chaves = [...grupos.keys()].sort((a, b) => (ordemGrupo(a) < ordemGrupo(b) ? -1 : 1));
    const NC = 10 + U.length;
    const corpo = chaves.map((k) => `<tr class="grupo"><td colspan="${NC}">${rotuloGrupo(k)} <span class="muda" style="font-weight:400">· ${grupos.get(k).length}</span></td></tr>` +
      grupos.get(k).map((c) => `<tr class="clicavel" data-item="${esc(c.id)}">
        <td class="cod">${esc(c.id)}</td><td class="cod">${esc(c.iniciativa)}</td>
        <td><div class="trunc" style="max-width:260px">${esc(c.ini ? c.ini.nome : '')}</div></td>
        <td><b>${esc(c.nome)}</b>${c.motivos.length ? `<div style="margin-top:3px">${c.motivos.map((m) => `<span class="tag alerta">${esc(m)}</span>`).join(' ')}</div>` : ''}</td>
        <td class="nowrap">${esc(mesRot(c.data))}</td>${tdUnidades(c.papeis, f.selU)}
        <td>${tagSit(c.situacao)}</td><td>${tagSaude(c.saude)}</td><td>${S.flags(c)}</td></tr>`).join('')).join('');
    const partes = [];
    if (f.selU) partes.push(`${f.selU} ${MODO_CURTO[f.modo]}`);
    if (f.selM) partes.push(f.selM === 'sd' ? 'sem data' : mesRot(f.selM));
    const titulo = 'Compromissos' + (partes.length ? ' · ' + esc(partes.join(' · ')) : ' do período');
    const sub = `<b>${det.length}</b> · Agrupar por <select data-agrupar>${opcoes(AGRUPAR, f.agrupar)}</select>${partes.length ? ' <button class="link-limpar" data-limpar-sel>Limpar seleção</button>' : ''}`;
    const tabela = det.length ? `<div class="tabela-wrap"><table class="t"><thead><tr><th>ID Compromisso</th><th>ID Inic.</th><th>Iniciativa Estruturante</th><th>Compromisso</th><th>Data prevista</th>${thUnidades(f.selU)}<th>Situação</th><th>Saúde</th><th>Depende de</th></tr></thead><tbody>${corpo}</tbody></table></div>` : '<div class="vazio-msg">Nenhum compromisso para a seleção.</div>';
    return painel(titulo, sub, tabela, { semPad: true });
  }

  function desenhar() {
    const base = D.compromissos.filter((c) => (!f.frente || c.frente === f.frente) && igual(f.sit, c.situacao) && igual(f.saude, c.saude));
    const lista = base.filter((c) => passaPeriodo(c, f.de, f.ate));
    const meses = mesesPeriodo(f.de, f.ate);
    const semPeriodo = !f.de && !f.ate;
    const modoRot = MODOS.find((x) => x[0] === f.modo)[1];
    const per = semPeriodo ? 'todo o horizonte' : meses.length === 1 ? mesRot(meses[0]) : `${mesRot(meses[0])} a ${mesRot(meses[meses.length - 1])}`;
    document.getElementById('total').textContent = `${lista.length} compromisso(s) · ${per}`;

    const heat = S.heatmap(lista, { meses, modo: f.modo, semData: semPeriodo, selU: f.selU, selM: f.selM }) +
      `<p class="nota" style="padding:0 16px 12px">Contagem de compromissos por unidade (${esc(MODO_CURTO[f.modo])}). Passe o mouse para ver a composição de papéis (R, CR, P, C, I). A linha “Compromissos” conta cada compromisso uma vez.</p>`;

    document.getElementById('res-cap').innerHTML = cartoes(lista, meses) +
      `<div style="margin-bottom:16px">${painel('Unidade × mês', esc(modoRot), heat, { semPad: true })}</div>` +
      `<div class="grade g-21">${painel('Cadência mensal por unidade', `${esc(modoRot)} · clique no mês para detalhar`, S.cadenciaUnidades(lista, meses, f.modo, { selM: f.selM }))}${painel('Carga por papel', 'todas as participações no período', S.barrasPapel(lista, { sel: f.selU }))}</div>` +
      detalhe(base, lista);
  }
})(window.SETEC);
