# ADR 0019 — Validação e higienização de entradas

- **Status:** Aceita
- **Data:** 2026-10-28
- **Decisores:** Mike
- **Relação:** complementa a ADR 0011 (monorepo, novo pacote) e o documento 02 (convenções)

## Contexto

O Mike quer todos os campos de entrada higienizados em todo o projeto: texto livre protegido contra scripts maliciosos, CEP e telefones com máscara. Os usuários digitam em japonês e muitas vezes usam caracteres de largura total (`０９０`, `１２３－４５６７`). O sistema exporta planilhas (Excel/CSV) e gera PDFs, que também são saídas de texto digitado.

## Decisão

### Um esquema por tipo de campo, igual na tela e no servidor

- **Novo pacote `packages/validation`** com os esquemas Zod de cada tipo de campo. Ele é usado pelo app (formulários e Server Actions), pelas rotas da fila e pelos testes.
- **O servidor sempre valida de novo** e nunca confia no que veio da tela.
- **Tipos iniciais:** texto livre (curto e longo), nome, カナ, e-mail, CEP, celular, telefone fixo e fax, nº インボイス (`T` + 13 dígitos, com dígito verificador), valor em iene (inteiro), data, minutos, ID do funcionário (8 dígitos) e PIN (4 dígitos).

### Normalização antes de validar

- Unicode NFKC: largura total vira normal (`０９０` → `090`, `－` → `-`).
- Tira espaços nas pontas e remove caracteres invisíveis e de controle, menos a quebra de linha nos textos longos.
- Limite de tamanho em todo campo.

### Máscaras

| Campo | Exibição | No banco |
| --- | --- | --- |
| CEP (郵便番号) | `123-4567` | `1234567` |
| Celular (070/080/090) | `090-1234-5678` | `09012345678` |
| Telefone fixo e fax | Hífen pelo código de área, automático (ex.: `03-1234-5678`, `0123-45-6789`), com libphonenumber-js | Só dígitos |

- As máscaras são componentes do design system (`packages/ui`), com teclado numérico no celular (`inputMode="numeric"`), e aceitam colar com ou sem hífen.
- PDFs e exportações usam as mesmas funções de formatação.
- O CEP permite buscar o endereço (base dos correios japoneses, em fase futura).

### Proteção contra scripts e injeção

- **Todo texto é exibido como texto, nunca executado.** O React já escapa por padrão. `dangerouslySetInnerHTML` fica proibido por regra de lint, salvo o componente único de texto formatado.
- **Texto formatado** (o editor da fase 2) passa por um sanitizador de HTML (DOMPurify) no servidor, com lista do que é permitido, antes de ser gravado e de novo antes de ser exibido.
- **Cabeçalhos de segurança no app:** CSP restrito (sem scripts inline nem de origens não autorizadas), `X-Content-Type-Options`, `Referrer-Policy` e `frame-ancestors`.
- **Caracteres como `<` não são apagados** do texto livre. Isso estragaria textos legítimos (`<5人`, `A<B`) sem proteger mais do que exibir sempre como texto.
- **Exportação para Excel/CSV:** célula que começa com `=`, `+`, `-`, `@`, tabulação ou retorno de carro recebe um apóstrofo na frente, para não virar fórmula.
- **SQL:** só consultas parametrizadas (supabase-js e funções SQL). Montar SQL com texto concatenado é proibido.
- **Arquivos enviados:** tipo conferido pelo conteúdo (não pela extensão), tamanho máximo e nome trocado por um ID no Storage.

## Consequências

- Nenhum formulário cria validação própria: todo campo usa um tipo de `packages/validation`. Tipo novo entra no pacote, com teste.
- Cada tipo tem testes com entradas de largura total, colagem com hífen, espaços, caracteres de controle e tentativas de script.
- O CLAUDE.md passa a ter esta regra entre as que nunca podem ser quebradas.
- Bibliotecas novas: libphonenumber-js e DOMPurify (com isomorphic-dompurify no servidor).
