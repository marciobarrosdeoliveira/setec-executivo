#!/usr/bin/env node
// Lê a Fonte Operacional (xlsx) e gera assets/dados.js consumido pelo site estático.
// Uso: node scripts/gerar-dados.js "<caminho da planilha .xlsx>"
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const PADRAO = path.join(
  process.env.USERPROFILE || '',
  'OneDrive - Ministério da Gestão e da Inovação dos Serv. Pub',
  'SETEC_SOF - Governança Integrada de Tecnologia da SETEC',
  'Fonte_Operacional_Governanca_SETEC_v0.5.xlsx'
);
const origem = process.argv[2] || PADRAO;
if (!fs.existsSync(origem)) {
  console.error('Planilha não encontrada: ' + origem);
  process.exit(1);
}

const UNIDADES = ['COINF', 'CODES', 'COIND', 'DISIN', 'COGES'];
const MESES_EN = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const MESES_PT = { jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };

const wb = XLSX.readFile(origem, { cellDates: true });

const limpar = (v) => {
  if (v === undefined || v === null) return '';
  if (v instanceof Date) return v;
  return String(v).replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{2,}/g, '\n').trim();
};

function linhas(nomeAba) {
  const ws = wb.Sheets[nomeAba];
  if (!ws) throw new Error('Aba não encontrada: ' + nomeAba);
  const brutas = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
  const cab = brutas[0].map((c) => limpar(c));
  return brutas.slice(1).map((l) => {
    const o = {};
    cab.forEach((c, i) => { if (c) o[c] = limpar(l[i]); });
    return o;
  });
}

function mesAno(v) {
  if (!v) return null;
  if (v instanceof Date) {
    // Datas do Excel chegam como meia-noite local; somar 12h evita deslocamento de fuso.
    const d = new Date(v.getTime() + 12 * 3600 * 1000);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
  }
  if (typeof v === 'number') {
    const p = XLSX.SSF.parse_date_code(v);
    return p.y + '-' + String(p.m).padStart(2, '0');
  }
  const m = String(v).toLowerCase().match(/([a-zç]{3})[a-zç]*[\/\-\s]*(\d{2,4})/);
  if (!m) return null;
  const mes = MESES_EN[m[1]] || MESES_PT[m[1]];
  if (!mes) return null;
  let ano = +m[2];
  if (ano < 100) ano += 2000;
  return ano + '-' + String(mes).padStart(2, '0');
}

const ABREV_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function rotuloMes(v) {
  if (!(v instanceof Date) && typeof v !== 'number') return texto(v);
  const [a, m] = mesAno(v).split('-');
  return ABREV_PT[+m - 1] + '/' + a;
}

const simNao = (v) => /^sim/i.test(String(v || ''));
const texto = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v || ''));
const vazioSeTraco = (v) => (texto(v) === '-' ? '' : texto(v));

const normAnalise = (v) => {
  const t = texto(v);
  if (/^validado/i.test(t)) return 'VALIDADO';
  if (/^analisado/i.test(t)) return 'ANALISADO';
  return t;
};

function papeis(r) {
  const p = {};
  UNIDADES.forEach((u) => { const v = texto(r[u]).toUpperCase().trim(); if (v) p[u] = v; });
  return p;
}

function obsUnidades(r) {
  const o = {};
  UNIDADES.forEach((u) => { const v = texto(r['PROPOSTA / OBS ' + u]); if (v) o[u] = v; });
  return o;
}

const iniciativas = linhas('Portfólio')
  .filter((r) => /^I-\d+/.test(texto(r['ID'])))
  .map((r) => ({
    id: texto(r['ID']),
    frente: texto(r['Frente Estratégica']),
    nome: texto(r['Iniciativa Estruturante']),
    resultado: texto(r['Resultado / escopo executivo']),
    referencia: texto(r['Referência técnica']),
    origem: texto(r['Origem / rastreabilidade']),
    analise: normAnalise(r['SITUAÇÃO ANÁLISE']),
    obs: obsUnidades(r),
    papeis: papeis(r),
    horizonte: texto(r['Horizonte']).replace(/-/g, '–'),
    impacto: texto(r['Impacto da não execução']),
    beneficio: texto(r['Benefício esperado']),
    prioridade: texto(r['Prioridade SETEC']),
    contratacao: simNao(r['Depende de contratação']),
    capacitacao: simNao(r['Depende de capacitação']),
    pei: texto(r['Vínculo estratégico / PEI']),
  }));

const compromissos = linhas('Compromissos das Iniciativas')
  .filter((r) => texto(r['ID Compromisso']))
  .map((r) => ({
    id: texto(r['ID Compromisso']),
    iniciativa: texto(r['ID Iniciativa']),
    nome: texto(r['Compromisso']),
    analise: normAnalise(r['SITUAÇÃO ANÁLISE']),
    obs: obsUnidades(r),
    data: mesAno(r['Data prevista']),
    papeis: papeis(r),
    situacao: texto(r['Situação']),
    saude: texto(r['Saúde']),
    contratacao: simNao(r['Depende de contratação']),
    objetoContratacao: vazioSeTraco(r['Objeto Resumido Contratação']),
    capacitacao: simNao(r['Depende de capacitação']),
    relato: texto(r['Relato do ciclo (somente se houver fato novo)']),
    areaDiscutir: simNao(r['Área propõe discutir?']),
    interesseSetec: simNao(r['Interesse SETEC?']),
    observacoes: texto(r['Observações']),
    evidencia: texto(r['Origem / evidência']),
    pontoValidar: texto(r['Ponto a validar']),
  }));

const entregas = linhas('Entregas Negócio')
  .filter((r) => /^E-\d+/.test(texto(r['ID'])))
  .map((r) => ({
    id: texto(r['ID']),
    origem: texto(r['Origem']),
    nome: texto(r['Projeto / entrega']),
    area: texto(r['Área demandante / dona do negócio']),
    patrocinador: texto(r['Patrocinador']),
    executor: texto(r['Executor técnico']),
    produto: texto(r['Produto / serviço']),
    estagio: texto(r['Estágio']),
    prazo: rotuloMes(r['Prazo / horizonte']),
    prioridade: texto(r['Prioridade do demandante']),
    atencao: texto(r['Atenção SETEC']),
    saude: texto(r['Saúde']),
    resultado: texto(r['Resultado esperado']),
    proximoMarco: texto(r['Próximo marco']),
    dependencias: texto(r['Dependências']),
    decisao: texto(r['Decisão necessária']),
    adocao: texto(r['Adoção / pós-entrega']),
    pei: texto(r['Vínculo estratégico / PEI']),
  }));

const acoes = linhas('Ações Relevantes')
  .filter((r) => /^AR-\d+/.test(texto(r['ID'])))
  .map((r) => ({
    id: texto(r['ID']),
    nome: texto(r['Ação relevante']),
    unidade: texto(r['Unidade R']),
    origem: texto(r['Origem / rastreabilidade']),
    porque: texto(r['Por que fica visível à SETEC']),
    prazo: texto(r['Horizonte / prazo']),
    resultado: texto(r['Resultado esperado']),
    situacao: texto(r['Situação']),
    apoios: texto(r['Apoios / interfaces']),
    contratacao: texto(r['Contratação / orçamento']),
    ponto: texto(r['Ponto para reunião / próximo marco']),
    observacoes: texto(r['Observações']),
  }));

const pei = linhas('Vínculos PEI')
  .filter((r) => texto(r['Objeto SETEC']))
  .map((r) => ({
    objeto: texto(r['Objeto SETEC']),
    tipo: texto(r['Tipo de objeto']),
    projeto: texto(r['Projeto PEI/MPO']),
    resultadoChave: texto(r['Resultado-chave']),
    vinculo: texto(r['Tipo de vínculo']),
    observacao: texto(r['Observação / ação sugerida']),
  }));

const stat = fs.statSync(origem);
const dados = {
  meta: {
    fonte: path.basename(origem),
    fonteAtualizadaEm: stat.mtime.toISOString(),
    geradoEm: new Date().toISOString(),
    unidades: UNIDADES,
  },
  iniciativas,
  compromissos,
  entregas,
  acoes,
  pei,
};

const destino = path.join(__dirname, '..', 'assets', 'dados.js');
fs.writeFileSync(destino, '// Gerado por scripts/gerar-dados.js — não editar manualmente.\nwindow.DADOS = ' + JSON.stringify(dados, null, 1) + ';\n');

const semData = compromissos.filter((c) => !c.data).length;
console.log(`OK: ${iniciativas.length} iniciativas, ${compromissos.length} compromissos (${semData} sem data), ${entregas.length} entregas, ${acoes.length} ações, ${pei.length} vínculos PEI`);
console.log('→ ' + destino);
