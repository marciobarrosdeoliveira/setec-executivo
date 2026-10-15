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
  };
})();
