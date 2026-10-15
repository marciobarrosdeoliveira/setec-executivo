# Governança de Tecnologia SETEC — Visão Executiva

Painel web estático (sem build) com a leitura executiva do portfólio de governança de tecnologia da SETEC/SOF:
Iniciativas Estruturantes, Compromissos, Entregas ao Negócio, Ações Relevantes e vínculos com o PEI.

**Acesso:** https://marciobarrosdeoliveira.github.io/setec-executivo/

## Visões

| Visão | Conteúdo |
|---|---|
| Visão Executiva | KPIs, Agenda de Atenção (requer decisão × para ciência), distribuição por situação/saúde, cadência mensal, próximas entregas, carga por unidade e por frente |
| Pauta e deliberação | Roteiro da reunião: críticos, iniciativas com ajustes propostos, ressalvas das unidades, decisões de Entregas ao Negócio |
| Iniciativas / Compromissos | Listas filtráveis (frente, responsável, mês, situação, saúde, destaque) |
| Cronograma | Matriz iniciativa × mês com marcos coloridos pela saúde |
| Capacidade por unidade | Mapa de calor de compromissos como responsável e detalhamento por unidade |
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
