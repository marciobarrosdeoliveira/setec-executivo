/* Portfólio de iniciativas, compromissos e busca. */
(function (S) {
  'use strict';
  const { U, MESES, esc, mesRot, tagSit, tagSaude, papeisHtml, respHtml, flags, frenteHtml, painel, cabPagina, tagAnalise, SIT, SAU } = S;

  const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const casa = (q, ...campos) => !q || campos.some((c) => norm(c).includes(q));
  const opcoes = (lista, sel, todos) => `<option value="">${todos}</option>` + lista.map((o) => {
    const [v, r] = Array.isArray(o) ? o : [o, o];
    return `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(r)}</option>`;
  }).join('');

  // Renderiza filtros uma vez e só atualiza os resultados (mantém foco na busca).
  function ligarFiltros(estado, desenhar) {
    const box = document.getElementById('filtros');
    const atualizar = () => {
      box.querySelectorAll('[data-f]').forEach((el) => { estado[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.value; });
      desenhar();
    };
    box.addEventListener('input', atualizar);
    box.addEventListener('change', atualizar);
    const limpar = box.querySelector('[data-limpar]');
    if (limpar) limpar.addEventListener('click', () => {
      box.querySelectorAll('[data-f]').forEach((el) => { if (el.type === 'checkbox') el.checked = false; else el.value = ''; });
      atualizar();
    });
    desenhar();
  }

  // ---------- Portfólio ----------
  const fPort = {};
  S.rotas.portfolio = function (p) {
    Object.assign(fPort, { q: '', frente: p.get('frente') || '', analise: '', resp: '', contr: false });
    return cabPagina('Iniciativas Estruturantes', 'Camada estratégica do portfólio: iniciativas por frente, responsável, horizonte e estado dos compromissos vinculados.') +
      `<div class="filtros" id="filtros">
        <input type="search" data-f="q" placeholder="Filtrar por código ou texto…">
        <label>Frente <select data-f="frente">${opcoes(S.frentes, fPort.frente, 'Todas')}</select></label>
        <label>Responsável <select data-f="resp">${opcoes([...U, 'CGTEC'], '', 'Todos')}</select></label>
        <label>Análise <select data-f="analise">${opcoes([['VALIDADO', 'Validado'], ['ANALISADO', 'Ajustes propostos'], ['outro', 'Outros']], '', 'Todas')}</select></label>
        <label class="chk"><input type="checkbox" data-f="contr"> Com contratação</label>
        <button class="link-limpar" data-limpar>Limpar</button>
        <span class="total" id="total"></span>
      </div><section class="painel"><div class="painel-corpo sem-pad" id="res"></div></section>`;
  };
  S.rotas.portfolio.depois = () => ligarFiltros(fPort, () => {
    const q = norm(fPort.q);
    const lista = S.inis().filter((i) => casa(q, i.id, i.nome, i.resultado, i.referencia, i.origem, i.frente) &&
      (!fPort.frente || i.frente === fPort.frente) &&
      (!fPort.resp || i.resp.includes(fPort.resp)) &&
      (!fPort.analise || (fPort.analise === 'outro' ? !['VALIDADO', 'ANALISADO'].includes(i.analise) : i.analise === fPort.analise)) &&
      (!fPort.contr || i.contratacao || i.comps.some((c) => c.contratacao)));
    document.getElementById('total').textContent = `${lista.length} iniciativa(s)`;
    let html = '';
    S.frentes.forEach((f) => {
      const is = lista.filter((i) => i.frente === f);
      if (!is.length) return;
      html += `<tr class="grupo"><td colspan="8">${frenteHtml(f)} <span class="muda">· ${is.length}</span></td></tr>`;
      html += is.map((i) => {
        const cs = i.comps.filter((c) => S.comps().includes(c));
        const crit = cs.filter((c) => c.critico).length;
        const aten = cs.filter((c) => c.atencao).length;
        const datas = cs.map((c) => c.data).filter(Boolean).sort();
        return `<tr class="clicavel" data-item="${esc(i.id)}"><td class="cod">${esc(i.id)}</td>
          <td><b>${esc(i.nome)}</b><div class="muda trunc">${esc(i.resultado)}</div></td>
          <td>${respHtml(i.resp)}<div style="margin-top:3px">${papeisHtml(i.papeis, { semR: true })}</div></td>
          <td class="nowrap">${esc(i.horizonte || '—')}<div class="muda">${datas.length ? `${mesRot(datas[0])} → ${mesRot(datas[datas.length - 1])}` : ''}</div></td>
          <td class="nowrap">${esc(i.prioridade || '—')}<div class="muda">Impacto ${esc(i.impacto || '—')}</div></td>
          <td class="num">${cs.length}${crit ? ` <span class="tag alerta" title="Requerem decisão">${crit}</span>` : ''}${aten ? ` <span class="tag est-aten" title="Em atenção">${aten}</span>` : ''}</td>
          <td>${flags(i)}</td><td>${tagAnalise(i.analise)}</td></tr>`;
      }).join('');
    });
    document.getElementById('res').innerHTML = lista.length ? `<div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Iniciativa / resultado esperado</th><th>Responsável · participação</th><th>Horizonte</th><th>Prioridade</th><th class="num">Compromissos</th><th>Depende de</th><th>Análise</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="vazio-msg">Nenhuma iniciativa com esses filtros.</div>';
  });

  // ---------- Compromissos ----------
  const fComp = {};
  const DESTAQUES = [['critico', 'Requerem decisão'], ['atencao', 'Em atenção'], ['vencido', 'Prazo vencido'], ['contratacao', 'Dependem de contratação'], ['capacitacao', 'Dependem de capacitação'], ['semdata', 'Sem data']];
  S.rotas.compromissos = function (p) {
    Object.assign(fComp, { q: '', frente: p.get('frente') || '', sit: p.get('sit') || '', saude: p.get('saude') || '', mes: p.get('mes') || '', resp: p.get('resp') || '', f: p.get('f') || '' });
    const sits = SIT.map((s) => [s.v || '_', s.rot || s.v]);
    const saus = SAU.map((s) => [s.v || '_', s.rot || s.v]);
    return cabPagina('Compromissos', 'Camada tática: entregas concretas das iniciativas, com responsável, prazo, situação e saúde. Clique em uma linha para ver o detalhe.') +
      `<div class="filtros" id="filtros">
        <input type="search" data-f="q" placeholder="Filtrar por código ou texto…">
        <label>Destaque <select data-f="f">${opcoes(DESTAQUES, fComp.f, 'Todos')}</select></label>
        <label>Frente <select data-f="frente">${opcoes(S.frentes, fComp.frente, 'Todas')}</select></label>
        <label>Responsável <select data-f="resp">${opcoes([...U, 'CGTEC'], fComp.resp, 'Todos')}</select></label>
        <label>Mês <select data-f="mes">${opcoes(MESES.map((m) => [m, mesRot(m)]), fComp.mes, 'Todos')}</select></label>
        <label>Situação <select data-f="sit">${opcoes(sits, fComp.sit, 'Todas')}</select></label>
        <label>Saúde <select data-f="saude">${opcoes(saus, fComp.saude, 'Todas')}</select></label>
        <button class="link-limpar" data-limpar>Limpar</button>
        <span class="total" id="total"></span>
      </div><section class="painel"><div class="painel-corpo sem-pad" id="res"></div></section>`;
  };
  const passaDestaque = (c, f) => !f || (f === 'semdata' ? !c.data : !!c[f]);
  const igualOuVazio = (filtro, v) => !filtro || (filtro === '_' ? !v : v === filtro);
  S.rotas.compromissos.depois = () => ligarFiltros(fComp, () => {
    const q = norm(fComp.q);
    const lista = S.comps().filter((c) => casa(q, c.id, c.nome, c.ini && c.ini.nome, c.relato, c.observacoes, c.pontoValidar, c.objetoContratacao) &&
      passaDestaque(c, fComp.f) && (!fComp.frente || c.frente === fComp.frente) && (!fComp.resp || c.resp.includes(fComp.resp)) &&
      (!fComp.mes || c.data === fComp.mes) && igualOuVazio(fComp.sit, c.situacao) && igualOuVazio(fComp.saude, c.saude));
    document.getElementById('total').textContent = `${lista.length} compromisso(s)`;
    let html = '';
    let atual = null;
    lista.forEach((c) => {
      if (c.iniciativa !== atual) {
        atual = c.iniciativa;
        html += `<tr class="grupo clicavel" data-item="${esc(c.iniciativa)}"><td colspan="7"><span class="mono">${esc(c.iniciativa)}</span> · ${esc(c.ini ? c.ini.nome : '')} <span class="muda" style="font-weight:400">· ${esc(c.frente)}</span></td></tr>`;
      }
      html += `<tr class="clicavel" data-item="${esc(c.id)}"><td class="cod">${esc(c.id)}</td>
        <td><b>${esc(c.nome)}</b>${c.motivos.length ? `<div style="margin-top:3px">${c.motivos.map((m) => `<span class="tag alerta">${esc(m)}</span>`).join(' ')}</div>` : ''}</td>
        <td>${respHtml(c.resp)}<div style="margin-top:3px">${papeisHtml(c.papeis, { semR: true })}</div></td>
        <td class="nowrap">${esc(mesRot(c.data))}</td><td>${tagSit(c.situacao)}</td><td>${tagSaude(c.saude)}</td><td>${flags(c)}</td></tr>`;
    });
    document.getElementById('res').innerHTML = lista.length ? `<div class="tabela-wrap"><table class="t"><thead><tr><th>Código</th><th>Compromisso</th><th>Responsável · participação</th><th>Prazo</th><th>Situação</th><th>Saúde</th><th>Depende de</th></tr></thead><tbody>${html}</tbody></table></div>` : '<div class="vazio-msg">Nenhum compromisso com esses filtros.</div>';
  });

  // ---------- Busca ----------
  S.rotas.busca = function (p) {
    const termo = p.get('q') || '';
    const q = norm(termo);
    document.getElementById('campo-busca').value = termo;
    const grupos = [
      ['Iniciativas', S.inis().filter((i) => casa(q, i.id, i.nome, i.resultado, i.referencia, i.frente)), (i) => [i.id, i.nome, i.frente]],
      ['Compromissos', S.comps().filter((c) => casa(q, c.id, c.nome, c.relato, c.observacoes, c.pontoValidar, c.objetoContratacao)), (c) => [c.id, c.nome, `${c.ini ? c.ini.nome : ''} · ${mesRot(c.data)}`]],
      ['Entregas ao Negócio', S.entregas().filter((e) => casa(q, e.id, e.nome, e.produto, e.area, e.resultado, e.origem)), (e) => [e.id, e.nome, `${e.executor} · ${e.estagio}`]],
      ['Ações Relevantes', S.acoes().filter((a) => casa(q, a.id, a.nome, a.porque, a.resultado)), (a) => [a.id, a.nome, a.unidade]],
    ];
    const total = grupos.reduce((a, g) => a + g[1].length, 0);
    const corpo = grupos.filter((g) => g[1].length).map(([tit, itens, f]) => painel(tit, `${itens.length}`, `<table class="t"><tbody>${itens.map((x) => { const [id, nome, sub] = f(x); return `<tr class="clicavel" data-item="${esc(id)}"><td class="cod">${esc(id)}</td><td><b>${esc(nome)}</b><div class="muda">${esc(sub)}</div></td></tr>`; }).join('')}</tbody></table>`, { semPad: true })).join('<div style="height:16px"></div>');
    return cabPagina(`Busca: “${esc(termo)}”`, `${total} resultado(s)`) + (corpo || '<div class="painel"><div class="vazio-msg">Nada encontrado.</div></div>');
  };
})(window.SETEC);
