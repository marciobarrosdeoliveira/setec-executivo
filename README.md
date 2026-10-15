# Governança de Tecnologia SETEC — Visão Executiva

Painel web estático (sem build) com a leitura executiva do portfólio de governança de tecnologia da SETEC/SOF:
Iniciativas Estruturantes, Compromissos, Entregas ao Negócio, Ações Relevantes e vínculos com o PEI.

**Acesso:**

- Apresentação executiva (slides): https://marciobarrosdeoliveira.github.io/setec-executivo/apresentacao/
- Visão detalhada (formato sistema, alternativa — tag `v1-sistema`): https://marciobarrosdeoliveira.github.io/setec-executivo/

## Apresentação executiva (`apresentacao/`)

Deck 16:9 gerado a partir do mesmo `assets/dados.js`, seguindo o roteiro da reunião:

1. **Panorama do portfólio** — números gerais, carga por área e frente, distribuição por datas (picos), matriz unidade × mês e a última revisão macro de quantidade/datas (viabilidade).
2. **Primeiras entregas** — compromissos previstos para setembro e outubro/2026 e os pontos a validar com as áreas.
3. **Rodadas de acompanhamento** — fluxo quinzenal por exceção e regra de pauta.
4. **Monitoramento dinâmico** — sinais acompanhados a cada rodada e encaminhamentos.

Navegação: setas ←/→, PgUp/PgDn, espaço, Home/End, `F` (tela cheia), toque/arrastar e `#n` na URL. O botão **PDF** imprime um slide por página.

## Visões (versão detalhada)

| Visão | Conteúdo |
|---|---|
| Visão Executiva | KPIs, Agenda de Atenção (requer decisão × para ciência), distribuição por situação/saúde, cadência mensal (por situação ou por unidade responsável), próximas entregas, mapa unidade × mês, carga por unidade e papel, carga por frente |
| Pauta e deliberação | Roteiro da reunião: críticos, iniciativas com ajustes propostos, ressalvas das unidades, decisões de Entregas ao Negócio |
| Iniciativas / Compromissos | Listas filtráveis (frente, responsável, período De/Até, unidade e papel R/CR/todos, situação, saúde, destaque); compromissos no formato da planilha, com uma coluna por unidade (COINF, CODES, COIND, DISIN, COGES) |
| Cronograma | Matriz iniciativa × mês com marcos coloridos pela saúde |
| Capacidade por unidade | Filtros de período (atalhos e De/Até), papel, frente, situação e saúde; cartões por unidade com mini-série mensal; mapa de calor unidade × mês clicável; cadência mensal empilhada por unidade; carga por papel; tabela detalhada agrupável por data, unidade, iniciativa ou frente |
| Contratações e capacitação | Dependências declaradas nos compromissos |
| Entregas, Ações, PEI, Metodologia | Demais camadas e síntese da metodologia v0.4 |

O seletor **Unidade** (topo) filtra todas as visões pela participação da unidade. Clique em qualquer item para abrir o detalhe; o link da página preserva o item aberto (`#/rota?item=I-12`).

### Regras de atenção

- **Requer decisão**: situação *Bloqueado*, saúde *Vermelho* ou mês previsto anterior ao mês corrente sem conclusão.
- **Em atenção**: situação *Em atenção* ou saúde *Amarelo*.

## Atualizar os dados

Os dados ficam em `assets/dados.js`, gerado a partir da planilha **Fonte Operacional** (abas Iniciativas, Compromissos, Entregas, Ações e PEI).

```powershell
npm install
node scripts/gerar-dados.js "C:\caminho\Fonte_Operacional_Governanca_SETEC_v0.5.xlsx"
git add assets/dados.js; git commit -m "Atualiza dados"; git push
```

Sem argumento, o script procura a planilha na pasta padrão do OneDrive da SETEC_SOF. O GitHub Pages republica em ~1 minuto.

## Executar localmente

Basta abrir `index.html` no navegador (ou servir a pasta com qualquer servidor estático).

> ⚠️ O repositório e o site são públicos. A página usa `noindex`, mas qualquer pessoa com o link pode acessá-la. Para uso permanente, considere repositório privado com Pages restrito ou hospedagem interna.
