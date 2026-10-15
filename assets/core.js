/* Núcleo: dados derivados, utilitários, componentes e roteamento. */
(function () {
  'use strict';
  const D = window.DADOS;
  const U = D.meta.unidades;
  const ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const hoje = new Date();
  const MES_ATUAL = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mesRot = (ym) => (ym ? ABREV[+ym.slice(5, 7) - 1] + '/' + ym.slice(0, 4) : 'Sem data');
  const mesCurto = (ym) => ABREV[+ym.slice(5, 7) - 1] + '/' + ym.slice(2, 4);
  const addMes = (ym, n) => {
    const d = new Date(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + n, 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };
  const num = (s) => +(String(s).match(/\d+/) || [0])[0];
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const contar = (arr, fn) => arr.reduce((a, x) => { const k = fn(x); a[k] = (a[k] || 0) + 1; return a; }, {});

  // ---------- Índices ----------
  const iniPorId = {};
  D.iniciativas.forEach((i) => { iniPorId[i.id] = i; i.comps = []; });
  const frentes = [];
  D.iniciativas.forEach((i) => { if (!frentes.includes(i.frente)) frentes.push(i.frente); });
  const CORES_FRENTE = ['#1F4E8C', '#7A4FA0', '#1E7F7A', '#B5651D', '#A1321F', '#5B6B2E', '#2E6FA8', '#8A5A44', '#C0398C', '#4A5568', '#3B9460', '#6B7380'];
  const corFrente = (f) => CORES_FRENTE[frentes.indexOf(f) % CORES_FRENTE.length];

  const respDe = (papeis, ini) => {
    const r = U.filter((u) => papeis[u] === 'R');
    if (r.length) return r;
    const txt = ini ? [ini.analise, ini.origem].join(' ') : '';
    return /CGTEC/i.test(txt) ? ['CGTEC'] : [];
  };

  D.iniciativas.forEach((i) => { i.resp = respDe(i.papeis, i); });
  D.compromissos.forEach((c) => {
    const ini = iniPorId[c.iniciativa];
    c.ini = ini;
    c.frente = ini ? ini.frente : '';
    c.ord = num(c.iniciativa) * 100 + num((c.id.match(/C(\d+)$/) || [0, 0])[1]);
    c.curto = (c.id.match(/C\d+$/) || [c.id])[0];
    c.resp = respDe(c.papeis, ini);
    c.vencido = !!c.data && c.data < MES_ATUAL && c.situacao !== 'Concluído';
    c.bloqueado = c.situacao === 'Bloqueado';
    c.vermelho = c.saude === 'Vermelho';
    c.critico = c.bloqueado || c.vermelho || c.vencido;
    c.atencao = !c.critico && (c.situacao === 'Em atenção' || c.saude === 'Amarelo');
    c.motivos = [];
    if (c.bloqueado) c.motivos.push('Bloqueado');
    if (c.vermelho) c.motivos.push('Saúde vermelha');
    if (c.vencido) c.motivos.push('Prazo vencido');
    if (c.areaDiscutir) c.motivos.push('Área propõe discutir');
    if (c.interesseSetec) c.motivos.push('Interesse SETEC');
    if (ini) ini.comps.push(c);
  });
  D.compromissos.sort((a, b) => a.ord - b.ord);
  D.iniciativas.sort((a, b) => num(a.id) - num(b.id));

  const mesesDados = D.compromissos.map((c) => c.data).filter(Boolean).sort();
  const MES_INI = mesesDados[0] < MES_ATUAL ? mesesDados[0] : MES_ATUAL;
  const MES_FIM = mesesDados[mesesDados.length - 1];
  const MESES = [];
  for (let m = MES_INI; m <= MES_FIM; m = addMes(m, 1)) MESES.push(m);

  // ---------- Filtro global por unidade ----------
  const estado = { unidade: localStorage.getItem('setec.unidade') || '' };
  if (estado.unidade && !U.includes(estado.unidade)) estado.unidade = '';
  const envolve = (papeis) => !estado.unidade || !!papeis[estado.unidade];
  const comps = () => D.compromissos.filter((c) => envolve(c.papeis));
  const inis = () => D.iniciativas.filter((i) => envolve(i.papeis) || i.comps.some((c) => envolve(c.papeis)));
  const entregas = () => D.entregas.filter((e) => !estado.unidade || e.executor.includes(estado.unidade));
  const acoes = () => D.acoes.filter((a) => !estado.unidade || a.unidade.includes(estado.unidade));

  // ---------- Vocabulário visual ----------
  const SIT = [
    { v: 'Bloqueado', cls: 'est-bloq', cor: '#C8432F' },
    { v: 'Em atenção', cls: 'est-aten', cor: '#D4A017' },
    { v: 'A validar', cls: 'est-valid', cor: '#AEB6C1' },
    { v: 'Em andamento', cls: 'est-and', cor: '#1F4E8C' },
    { v: 'Planejado', cls: 'est-plan', cor: '#5B8DB8' },
    { v: 'Concluído', cls: 'est-conc', cor: '#3B9460' },
    { v: '', cls: 'est-nd', cor: '#E1E4E8', rot: 'Não informada' },
  ];
  const SAU = [
    { v: 'Vermelho', cls: 'vermelho', cor: '#C8432F' },
    { v: 'Amarelo', cls: 'amarelo', cor: '#D4A017' },
    { v: 'Verde', cls: 'verde', cor: '#3B9460' },
    { v: 'A definir', cls: 'indef', cor: '#C9CED4' },
    { v: '', cls: 'nd', cor: '#E8EAED', rot: 'Não informada' },
  ];
  const sitInfo = (v) => SIT.find((s) => s.v === v) || { v, cls: 'est-valid', cor: '#AEB6C1' };
  const sauInfo = (v) => SAU.find((s) => s.v === v) || { v, cls: 'nd', cor: '#E8EAED' };

  const tagSit = (v) => { const s = sitInfo(v); return `<span class="tag ${s.cls}">${esc(s.rot || v)}</span>`; };
  const tagSaude = (v) => { const s = sauInfo(v); return `<span class="saude ${s.cls}">${esc(s.rot || v)}</span>`; };
  const papel = (p) => `<span class="papel ${esc(p)}" title="${esc(PAPEL_NOME[p] || p)}">${esc(p)}</span>`;
  const PAPEL_NOME = { R: 'Responsável', CR: 'Corresponsável', P: 'Participante', C: 'Consultado', I: 'Informado' };
  const ORDEM_PAPEL = { R: 0, CR: 1, P: 2, C: 3, I: 4 };
  const papeisHtml = (papeis, opts = {}) => {
    const itens = Object.entries(papeis)
      .filter(([, p]) => !opts.semR || p !== 'R')
      .sort((a, b) => (ORDEM_PAPEL[a[1]] ?? 9) - (ORDEM_PAPEL[b[1]] ?? 9));
    if (!itens.length) return '<span class="muda">—</span>';
    return '<span class="papeis">' + itens.map(([u, p]) => `<span class="u">${papel(p)}${esc(u)}</span>`).join('') + '</span>';
  };
  const respHtml = (resp) => (resp.length ? resp.map((u) => `<b>${esc(u)}</b>`).join(' · ') : '<span class="muda">A definir</span>');
  const flags = (o) => (o.contratacao ? '<span class="flag on" title="Depende de contratação">Contrat.</span> ' : '') + (o.capacitacao ? '<span class="flag cap" title="Depende de capacitação">Capac.</span>' : '');
  const frenteHtml = (f) => `<span class="frente-dot" style="background:${corFrente(f)}"></span>${esc(f)}`;
  const tagAnalise = (a) => (a === 'VALIDADO' ? '<span class="tag est-conc">Validado</span>' : a === 'ANALISADO' ? '<span class="tag est-aten">Analisado · ajustes propostos</span>' : `<span class="tag info">${esc(a || 'Pendente')}</span>`);

  const barraSeg = (partes, total) => '<div class="barra-seg">' + partes.filter((p) => p.n).map((p) => `<span style="width:${(p.n / total) * 100}%;background:${p.cor}" title="${esc(p.rot)}: ${p.n}"></span>`).join('') + '</div>';
  const legenda = (partes, total) => '<div class="legenda">' + partes.filter((p) => p.n).map((p) => `<span><i style="background:${p.cor}"></i>${esc(p.rot)} <b>${p.n}</b> <span class="muda">(${pct(p.n, total)}%)</span></span>`).join('') + '</div>';
  const partesSit = (lista) => { const k = contar(lista, (c) => c.situacao); return SIT.map((s) => ({ rot: s.rot || s.v, n: k[s.v] || 0, cor: s.cor })); };
  const partesSau = (lista) => { const k = contar(lista, (c) => c.saude); return SAU.map((s) => ({ rot: s.rot || s.v, n: k[s.v] || 0, cor: s.cor })); };

  // ---------- Unidades, papéis e períodos ----------
  const CORES_UNIDADE = { COINF: '#1F4E8C', CODES: '#1E7F7A', COIND: '#7A4FA0', DISIN: '#B5651D', COGES: '#5B6B2E', CGTEC: '#8A9099' };
  const corUnidade = (u) => CORES_UNIDADE[u] || '#8A9099';
  const PAPEIS = ['R', 'CR', 'P', 'C', 'I'];
  const CORES_PAPEL = { R: '#1F4E8C', CR: '#4E77AE', P: '#9DB8DC', C: '#C3C9D1', I: '#E3E6EA' };
  const MODOS = [['R', 'Responsável (R)'], ['RCR', 'Responsável + corresponsável'], ['todos', 'Qualquer participação']];
  const casaPapel = (p, modo) => !!p && (!modo || modo === 'todos' || (modo === 'RCR' ? p === 'R' || p === 'CR' : p === modo));
  const PERIODOS = (() => {
    const l = [['atual', 'Mês corrente', MES_ATUAL, MES_ATUAL], ['prox3', 'Próximos 3 meses', MES_ATUAL, addMes(MES_ATUAL, 2)], ['prox6', 'Próximos 6 meses', MES_ATUAL, addMes(MES_ATUAL, 5)]];
    const a0 = +MES_INI.slice(0, 4);
    const a1 = +MES_FIM.slice(0, 4);
    for (let a = a0; a <= a1; a++) {
      l.push(['a' + a, 'Ano ' + a, a + '-01', a + '-12']);
      [['1', '01', '06'], ['2', '07', '12']].forEach(([s, i, f]) => {
        if (a + '-' + f >= MES_INI && a + '-' + i <= MES_FIM) l.push([`s${s}-${a}`, `${s}º semestre/${a}`, `${a}-${i}`, `${a}-${f}`]);
      });
    }
    return l;
  })();
  const ordenar = (de, ate) => { let a = de || '0000-00'; let b = ate || '9999-99'; if (a > b) [a, b] = [b, a]; return [a, b]; };
  const passaPeriodo = (c, de, ate) => {
    if (!de && !ate) return true;
    if (!c.data) return false;
    const [a, b] = ordenar(de, ate);
    return c.data >= a && c.data <= b;
  };
  const mesesPeriodo = (de, ate) => { const [a, b] = ordenar(de, ate); return MESES.filter((m) => m >= a && m <= b); };
  const opcoes = (lista, sel, todos) => (todos != null ? `<option value="">${todos}</option>` : '') + lista.map((o) => {
    const [v, r] = Array.isArray(o) ? o : [o, o];
    return `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(r)}</option>`;
  }).join('');
  const periodoHtml = (st) => `<label>Período <select data-f="periodo">${opcoes(PERIODOS.map((p) => [p[0], p[1]]), st.periodo || '', 'Todo o horizonte')}</select></label>
    <label>De <select data-f="de">${opcoes(MESES.map((m) => [m, mesRot(m)]), st.de || '', '—')}</select></label>
    <label>Até <select data-f="ate">${opcoes(MESES.map((m) => [m, mesRot(m)]), st.ate || '', '—')}</select></label>`;

  // Renderiza filtros uma vez e só atualiza os resultados (mantém o foco na busca).
  function ligarFiltros(st, desenhar, opts = {}) {
    const box = document.getElementById('filtros');
    const ler = () => box.querySelectorAll('[data-f]').forEach((el) => { st[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; });
    const aoMudar = (e) => {
      const f = e.target.dataset && e.target.dataset.f;
      const per = box.querySelector('[data-f=periodo]');
      if (per && f === 'periodo') {
        const p = PERIODOS.find((x) => x[0] === per.value);
        box.querySelector('[data-f=de]').value = p ? p[2] : '';
        box.querySelector('[data-f=ate]').value = p ? p[3] : '';
      } else if (per && (f === 'de' || f === 'ate')) per.value = '';
      ler();
      desenhar();
    };
    box.addEventListener('input', aoMudar);
    box.addEventListener('change', aoMudar);
    const limpar = box.querySelector('[data-limpar]');
    if (limpar) limpar.addEventListener('click', () => {
      box.querySelectorAll('[data-f]').forEach((el) => {
        if (el.type === 'checkbox') el.checked = false;
        else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
      });
      if (opts.aoLimpar) opts.aoLimpar();
      ler();
      desenhar();
    });
    ler();
    desenhar();
  }

  // Mapa de calor unidade × mês. Com o.link navega; sem ele, emite data-cap="unidade|mês" para seleção.
  function heatmap(lista, o) {
    const modo = o.modo || 'R';
    const cols = o.meses.slice();
    if (o.semData && lista.some((c) => !c.data)) cols.push('sd');
    const doMes = (c, m) => (m === 'sd' ? !c.data : c.data === m);
    const rot = (m) => (m === 'sd' ? 's/ data' : mesCurto(m));
    const sel = !o.link;
    const cel = U.map((u) => cols.map((m) => lista.filter((c) => doMes(c, m) && casaPapel(c.papeis[u], modo)).length));
    const max = Math.max(1, ...cel.flat());
    const alvo = (u, m) => (o.link ? `data-href="#/unidades?${u ? 'u=' + u : ''}${u && m ? '&' : ''}${m ? 'mes=' + m : ''}"` : `data-cap="${u}|${m}"`);
    const cab = `<tr><th>Unidade</th>${cols.map((m) => `<th class="${m === MES_ATUAL ? 'atual' : ''} ${sel && o.selM === m ? 'sel' : ''}" ${alvo('', m)} title="Detalhar ${m === 'sd' ? 'sem data' : mesRot(m)}">${rot(m)}</th>`).join('')}<th class="num">Total</th></tr>`;
    const linhas = U.map((u, i) => {
      const tot = cel[i].reduce((a, n) => a + n, 0);
      const tds = cols.map((m, j) => {
        const n = cel[i][j];
        const a = n / max;
        const k = contar(lista.filter((c) => doMes(c, m) && c.papeis[u]), (c) => c.papeis[u]);
        const tip = `${u} · ${m === 'sd' ? 'sem data' : mesRot(m)}: ` + (PAPEIS.filter((p) => k[p]).map((p) => `${p} ${k[p]}`).join(' · ') || 'sem participação');
        const cls = !sel ? '' : o.selU === u && o.selM === m ? 'sel' : (o.selU === u && !o.selM) || (o.selM === m && !o.selU) ? 'sel-fraca' : '';
        return `<td class="h ${cls}" ${alvo(u, m)} style="background:rgba(31,78,140,${(a * 0.85).toFixed(2)});color:${a > 0.5 ? '#fff' : 'inherit'}" title="${esc(tip)}">${n || '<span class="zero">·</span>'}</td>`;
      }).join('');
      return `<tr><td class="u-nome ${sel && o.selU === u ? 'sel' : ''}" ${alvo(u, '')}><span class="frente-dot" style="background:${corUnidade(u)}"></span>${u}</td>${tds}<td class="num"><b>${tot}</b></td></tr>`;
    }).join('');
    const totCol = cols.map((m) => lista.filter((c) => doMes(c, m) && U.some((u) => casaPapel(c.papeis[u], modo))).length);
    const totGeral = lista.filter((c) => cols.some((m) => doMes(c, m)) && U.some((u) => casaPapel(c.papeis[u], modo))).length;
    const rodape = `<tr class="tot"><td>Compromissos</td>${totCol.map((n) => `<td class="num" style="text-align:center">${n || '–'}</td>`).join('')}<td class="num">${totGeral}</td></tr>`;
    return `<div class="tabela-wrap"><table class="t heat"><thead>${cab}</thead><tbody>${linhas}${rodape}</tbody></table></div>`;
  }

  function barrasPapel(lista, o = {}) {
    const dados = U.map((u) => {
      const k = contar(lista.filter((c) => c.papeis[u]), (c) => c.papeis[u]);
      return { u, k, tot: PAPEIS.reduce((a, p) => a + (k[p] || 0), 0) };
    });
    const max = Math.max(1, ...dados.map((d) => d.tot));
    return '<div class="barras-papel">' + dados.map((d) => `<div class="bp-linha ${o.sel === d.u ? 'sel' : ''}" ${o.link ? `data-href="#/unidades?u=${d.u}&papel=todos"` : `data-cap="${d.u}|"`}>
      <span class="bp-u"><span class="frente-dot" style="background:${corUnidade(d.u)}"></span>${d.u}</span>
      <span class="bp-trilha">${PAPEIS.filter((p) => d.k[p]).map((p) => `<span style="width:${(d.k[p] / max) * 100}%;background:${CORES_PAPEL[p]};color:${p === 'R' || p === 'CR' ? '#fff' : 'var(--tinta-2)'}" title="${d.u} · ${PAPEL_NOME[p]}: ${d.k[p]}">${d.k[p] / max > 0.05 ? d.k[p] : ''}</span>`).join('')}</span>
      <span class="bp-tot">${d.tot}</span></div>`).join('') +
      `</div><div class="legenda">${PAPEIS.map((p) => `<span><i style="background:${CORES_PAPEL[p]}"></i>${p} · ${PAPEL_NOME[p]}</span>`).join('')}</div>`;
  }

  // Barras mensais empilhadas por unidade. modo 'resp' usa o responsável efetivo (inclui CGTEC).
  function cadenciaUnidades(lista, meses, modo, o = {}) {
    const unis = modo === 'resp' ? [...U, 'CGTEC'] : U;
    const conta = (c, u) => (modo === 'resp' ? c.resp.includes(u) : casaPapel(c.papeis[u], modo));
    const por = meses.map((m) => { const cs = lista.filter((c) => c.data === m); return unis.map((u) => cs.filter((c) => conta(c, u)).length); });
    const soma = (a) => a.reduce((x, y) => x + y, 0);
    const max = Math.max(1, ...por.map(soma));
    const barras = meses.map((m, i) => {
      const tot = soma(por[i]);
      const segs = unis.map((u, j) => (por[i][j] ? `<span style="height:${(por[i][j] / max) * 110}px;background:${corUnidade(u)}" title="${u} · ${mesRot(m)}: ${por[i][j]}"></span>` : '')).join('');
      const cls = [m === MES_ATUAL ? 'atual' : m < MES_ATUAL ? 'passado' : '', o.selM === m ? 'sel' : ''].join(' ');
      const alvo = o.link ? `data-href="${o.link(m)}"` : `data-cap="|${m}"`;
      return `<div class="mes ${cls}" ${alvo} title="${mesRot(m)}: ${tot}"><div class="mes-valor">${tot || ''}</div><div class="mes-barra">${segs}</div><div class="mes-rotulo">${mesCurto(m)}</div></div>`;
    }).join('');
    const totU = unis.map((u, j) => [u, soma(por.map((x) => x[j]))]).filter((x) => x[1]);
    return `<div class="meses">${barras}</div><div class="legenda">${totU.map(([u, n]) => `<span><i style="background:${corUnidade(u)}"></i>${u} <b>${n}</b></span>`).join('')}</div>`;
  }

  // Colunas por unidade, no formato da planilha (COINF, CODES, COIND, DISIN, COGES).
  const thUnidades = (selU) => U.map((u) => `<th class="u-col ${u === selU ? 'sel-col' : ''}">${u}</th>`).join('');
  const tdUnidades = (papeis, selU) => U.map((u) => `<td class="u-col ${u === selU ? 'sel-col' : ''}">${papeis[u] ? papel(papeis[u]) : ''}</td>`).join('');

  const painel = (titulo, sub, corpo, opts = {}) => `<section class="painel ${opts.cls || ''}">
    <div class="painel-cab"><h2>${titulo}</h2>${sub ? `<span class="sub">${sub}</span>` : ''}</div>
    <div class="painel-corpo ${opts.semPad ? 'sem-pad' : ''}">${corpo}</div></section>`;

  const cabPagina = (titulo, desc) => {
    const filtro = estado.unidade ? `<span class="aviso-filtro">Unidade: ${esc(estado.unidade)} <button data-limpa-unidade title="Remover filtro">✕</button></span>` : '';
    return `<div class="cab-pagina"><div><h1>${titulo}</h1>${desc ? `<p>${desc}</p>` : ''}</div>${filtro}</div>`;
  };

  // ---------- Roteamento ----------
  const rotas = {};
  const NAV = [
    { grupo: 'Reunião' },
    { r: '', rot: 'Visão Executiva' },
    { r: 'pauta', rot: 'Pauta e deliberação', n: () => comps().filter((c) => c.critico).length },
    { grupo: 'Portfólio' },
    { r: 'portfolio', rot: 'Iniciativas Estruturantes', n: () => inis().length },
    { r: 'compromissos', rot: 'Compromissos', n: () => comps().length },
    { r: 'cronograma', rot: 'Cronograma' },
    { r: 'unidades', rot: 'Capacidade por unidade' },
    { r: 'contratacoes', rot: 'Contratações e capacitação', n: () => comps().filter((c) => c.contratacao).length },
    { grupo: 'Demais camadas' },
    { r: 'entregas', rot: 'Entregas ao Negócio', n: () => entregas().length },
    { r: 'acoes', rot: 'Ações Relevantes', n: () => acoes().length },
    { r: 'pei', rot: 'Vínculos PEI' },
    { grupo: 'Referência' },
    { r: 'metodologia', rot: 'Metodologia' },
  ];

  function lerHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [rota, qs] = h.split('?');
    return { rota: rota || '', params: new URLSearchParams(qs || '') };
  }
  function irPara(rota, params) {
    const qs = params && [...params].length ? '?' + params.toString() : '';
    location.hash = '#/' + rota + qs;
  }
  function abrirItem(id) {
    const { rota, params } = lerHash();
    params.set('item', id);
    irPara(rota, params);
  }
  function fecharItem() {
    const { rota, params } = lerHash();
    if (!params.has('item')) return fecharDrawerUI();
    params.delete('item');
    irPara(rota, params);
  }

  const drawer = document.getElementById('drawer');
  const fundo = document.getElementById('drawer-fundo');
  const renderDrawer = {};
  function abrirDrawerUI(id) {
    let html = '';
    if (/^I-\d+$/.test(id)) html = renderDrawer.iniciativa(id);
    else if (/^E-\d+$/.test(id)) html = renderDrawer.entrega(id);
    else if (/^AR-\d+$/.test(id)) html = renderDrawer.acao(id);
    else html = renderDrawer.compromisso(id);
    if (!html) return fecharDrawerUI();
    document.getElementById('drawer-conteudo').innerHTML = html;
    drawer.scrollTop = 0;
    drawer.classList.add('aberto');
    drawer.setAttribute('aria-hidden', 'false');
    fundo.hidden = false;
  }
  function fecharDrawerUI() {
    drawer.classList.remove('aberto');
    drawer.setAttribute('aria-hidden', 'true');
    fundo.hidden = true;
  }

  let chaveAnterior = null;
  function render() {
    const { rota, params } = lerHash();
    const semItem = new URLSearchParams(params);
    semItem.delete('item');
    const chave = rota + '?' + semItem.toString() + '|' + estado.unidade;
    if (chave !== chaveAnterior) {
      chaveAnterior = chave;
      const view = rotas[rota] || rotas[''];
      const el = document.getElementById('conteudo');
      el.innerHTML = view(semItem);
      if (view.depois) view.depois(semItem);
      window.scrollTo(0, 0);
      renderNav(rota);
      if (rota !== 'busca') document.getElementById('campo-busca').value = '';
      document.getElementById('sidebar').classList.remove('aberta');
    }
    if (params.get('item')) abrirDrawerUI(params.get('item'));
    else fecharDrawerUI();
  }

  function renderNav(rota) {
    document.getElementById('nav').innerHTML = NAV.map((n) => {
      if (n.grupo) return `<div class="nav-grupo">${n.grupo}</div>`;
      const c = n.n ? `<span class="contagem">${n.n()}</span>` : '';
      return `<a href="#/${n.r}" class="${n.r === rota ? 'ativo' : ''}"><span>${n.rot}</span>${c}</a>`;
    }).join('');
  }

  function iniciar() {
    const sel = document.getElementById('filtro-unidade-global');
    sel.innerHTML = '<option value="">Todas</option>' + U.map((u) => `<option ${u === estado.unidade ? 'selected' : ''}>${u}</option>`).join('');
    sel.addEventListener('change', () => definirUnidade(sel.value));
    const fmt = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    document.getElementById('ref-data').textContent = 'Referência: ' + hoje.toLocaleDateString('pt-BR');
    document.getElementById('rodape-fonte').innerHTML = `<b>Fonte:</b> ${esc(D.meta.fonte)}<br>Atualizada em ${fmt(D.meta.fonteAtualizadaEm)}<br>Publicado em ${fmt(D.meta.geradoEm)}`;
    document.getElementById('form-busca').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('campo-busca').value.trim();
      if (q) irPara('busca', new URLSearchParams({ q }));
    });
    document.getElementById('btn-imprimir').addEventListener('click', () => window.print());
    document.getElementById('btn-menu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('aberta'));
    document.getElementById('drawer-fechar').addEventListener('click', fecharItem);
    fundo.addEventListener('click', fecharItem);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('aberto')) fecharItem(); });
    document.addEventListener('click', (e) => {
      const alvo = e.target.closest('[data-item]');
      if (alvo) { e.preventDefault(); abrirItem(alvo.getAttribute('data-item')); return; }
      if (e.target.closest('[data-limpa-unidade]')) { definirUnidade(''); return; }
      const href = e.target.closest('[data-href]');
      if (href) { location.hash = href.getAttribute('data-href'); }
    });
    window.addEventListener('hashchange', render);
    render();
  }
  function definirUnidade(u) {
    estado.unidade = u;
    localStorage.setItem('setec.unidade', u);
    document.getElementById('filtro-unidade-global').value = u;
    render();
  }

  window.SETEC = {
    D, U, MES_ATUAL, MESES, frentes, iniPorId, estado,
    esc, mesRot, mesCurto, addMes, num, pct, contar,
    comps, inis, entregas, acoes, corFrente,
    SIT, SAU, sitInfo, sauInfo, tagSit, tagSaude, papel, papeisHtml, respHtml, flags, frenteHtml, tagAnalise,
    barraSeg, legenda, partesSit, partesSau, painel, cabPagina,
    rotas, renderDrawer, irPara, lerHash, iniciar, PAPEL_NOME,
    CORES_UNIDADE, corUnidade, PAPEIS, CORES_PAPEL, MODOS, casaPapel, PERIODOS, passaPeriodo, mesesPeriodo,
    opcoes, periodoHtml, ligarFiltros, heatmap, barrasPapel, cadenciaUnidades, thUnidades, tdUnidades,
  };
})();
