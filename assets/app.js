/* Painel lateral de detalhe e inicialização. */
(function (S) {
  'use strict';
  const { D, esc, mesRot, tagSit, tagSaude, papeisHtml, respHtml, flags, frenteHtml, tagAnalise, papel, PAPEL_NOME } = S;

  const campo = (rot, val) => (val == null || val === '' ? '' : `<dt>${esc(rot)}</dt><dd>${val}</dd>`);
  const txt = (v) => (v ? esc(v) : '');
  const sec = (tit, corpo) => (corpo ? `<div class="d-sec"><h3>${tit}</h3>${corpo}</div>` : '');
  const obsHtml = (obs) => {
    const it = Object.entries(obs || {}).filter(([, v]) => v);
    if (!it.length) return '';
    return it.map(([u, v]) => `<div class="d-obs ${/^VALIDADO$/i.test(String(v).trim()) ? '' : 'destaque'}"><b>${esc(u)}</b>${esc(v)}</div>`).join('');
  };
  const matriz = (papeis) => {
    const it = Object.entries(papeis);
    if (!it.length) return '';
    return `<table class="t"><tbody>${it.map(([u, p]) => `<tr><td><b>${esc(u)}</b></td><td>${papel(p)} ${esc(PAPEL_NOME[p] || p)}</td></tr>`).join('')}</tbody></table>`;
  };

  S.renderDrawer.iniciativa = (id) => {
    const i = S.iniPorId[id];
    if (!i) return '';
    const cs = i.comps;
    const lista = cs.length ? `<ul class="d-lista">${cs.map((c) => `<li data-item="${esc(c.id)}"><span class="mono">${esc(c.id)}</span><span>${esc(c.nome)}<div class="muda" style="font-size:12px">${esc(mesRot(c.data))} · Resp.: ${respHtml(c.resp)}${c.motivos.length ? ' · <span style="color:var(--vermelho)">' + esc(c.motivos.join(', ')) + '</span>' : ''}</div></span><span>${tagSaude(c.saude)}</span></li>`).join('')}</ul>` : '<div class="muda">Sem compromissos.</div>';
    return `<div class="d-cab"><div class="d-tipo">Iniciativa Estruturante · ${frenteHtml(i.frente)}</div><h2>${esc(i.id)} · ${esc(i.nome)}</h2>
      <div class="tags">${tagAnalise(i.analise)} ${flags(i)}</div></div>
      ${sec('Resultado esperado', `<p>${txt(i.resultado)}</p>`)}
      <div class="d-sec"><h3>Dados</h3><dl class="d-grid">${campo('Responsável', respHtml(i.resp))}${campo('Horizonte', txt(i.horizonte))}${campo('Impacto', txt(i.impacto))}${campo('Benefício', txt(i.beneficio))}${campo('Prioridade', txt(i.prioridade))}${campo('Contratação', i.contratacao ? 'Sim' : 'Não')}${campo('Capacitação', i.capacitacao ? 'Sim' : 'Não')}${campo('Vínculo PEI', txt(i.pei))}${campo('Referência', txt(i.referencia))}${campo('Origem', txt(i.origem))}</dl></div>
      ${sec('Matriz de responsabilidades', matriz(i.papeis))}
      ${sec('Manifestação das unidades', obsHtml(i.obs))}
      ${sec(`Compromissos (${cs.length})`, lista)}`;
  };

  S.renderDrawer.compromisso = (id) => {
    const c = D.compromissos.find((x) => x.id === id);
    if (!c) return '';
    const i = c.ini;
    return `<div class="d-cab"><div class="d-tipo">Compromisso · <a href="#" data-item="${esc(c.iniciativa)}">${esc(c.iniciativa)} ${esc(i ? i.nome : '')}</a></div><h2>${esc(c.id)} · ${esc(c.nome)}</h2>
      <div class="tags">${tagSit(c.situacao)} ${tagSaude(c.saude)} ${c.motivos.map((m) => `<span class="tag alerta">${esc(m)}</span>`).join(' ')} ${flags(c)}</div></div>
      ${c.pontoValidar ? sec('Ponto a validar', `<div class="d-pergunta">${esc(c.pontoValidar)}</div>`) : ''}
      <div class="d-sec"><h3>Dados</h3><dl class="d-grid">${campo('Responsável', respHtml(c.resp))}${campo('Prazo', esc(mesRot(c.data)))}${campo('Frente', c.frente ? frenteHtml(c.frente) : '')}${campo('Análise', tagAnalise(c.analise))}${campo('Objeto da contratação', txt(c.objetoContratacao))}${campo('Evidência / origem', txt(c.evidencia))}</dl></div>
      ${sec('Participação das unidades', matriz(c.papeis))}
      ${sec('Relato de acompanhamento', c.relato ? `<div class="d-obs">${esc(c.relato)}</div>` : '')}
      ${sec('Observações', c.observacoes ? `<div class="d-obs">${esc(c.observacoes)}</div>` : '')}
      ${sec('Manifestação das unidades', obsHtml(c.obs))}`;
  };

  S.renderDrawer.entrega = (id) => {
    const e = D.entregas.find((x) => x.id === id);
    if (!e) return '';
    return `<div class="d-cab"><div class="d-tipo">Entrega ao Negócio · ${esc(e.executor)}</div><h2>${esc(e.id)} · ${esc(e.nome)}</h2>
      <div class="tags"><span class="tag">${esc(e.estagio)}</span> ${tagSaude(e.saude)} ${/Aten|Priorit/i.test(e.atencao) ? `<span class="tag est-aten">${esc(e.atencao)}</span>` : ''}</div></div>
      ${e.decisao ? sec('Decisão necessária', `<div class="d-pergunta">${esc(e.decisao)}</div>`) : ''}
      ${sec('Resultado esperado', e.resultado ? `<p>${esc(e.resultado)}</p>` : '')}
      <div class="d-sec"><h3>Dados</h3><dl class="d-grid">${campo('Produto', txt(e.produto))}${campo('Área de negócio', txt(e.area))}${campo('Patrocinador', txt(e.patrocinador))}${campo('Executor', txt(e.executor))}${campo('Prazo', txt(e.prazo))}${campo('Prioridade', txt(e.prioridade))}${campo('Atenção', txt(e.atencao))}${campo('Próximo marco', txt(e.proximoMarco))}${campo('Dependências', txt(e.dependencias))}${campo('Adoção', txt(e.adocao))}${campo('Vínculo PEI', txt(e.pei))}${campo('Origem', txt(e.origem))}</dl></div>`;
  };

  S.renderDrawer.acao = (id) => {
    const a = D.acoes.find((x) => x.id === id);
    if (!a) return '';
    return `<div class="d-cab"><div class="d-tipo">Ação Relevante · ${esc(a.unidade)}</div><h2>${esc(a.id)} · ${esc(a.nome)}</h2><div class="tags"><span class="tag">${esc(a.situacao)}</span></div></div>
      ${a.ponto ? sec('Ponto de decisão', `<div class="d-pergunta">${esc(a.ponto)}</div>`) : ''}
      ${sec('Por que importa', a.porque ? `<p>${esc(a.porque)}</p>` : '')}
      <div class="d-sec"><h3>Dados</h3><dl class="d-grid">${campo('Unidade', txt(a.unidade))}${campo('Origem', txt(a.origem))}${campo('Prazo', txt(a.prazo))}${campo('Resultado esperado', txt(a.resultado))}${campo('Apoios', txt(a.apoios))}${campo('Contratação', txt(a.contratacao))}</dl></div>
      ${sec('Observações', a.observacoes ? `<div class="d-obs">${esc(a.observacoes)}</div>` : '')}`;
  };

  S.iniciar();
})(window.SETEC);
