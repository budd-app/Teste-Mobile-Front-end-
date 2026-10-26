# budd — Redesign mobile

Redesign do app **budd** (descoberta de bares, eventos e experiências) em **React Native + Expo**.
O enunciado original do desafio está em [`docs/DESAFIO.md`](docs/DESAFIO.md).

> Interface escura, energia em verde e resposta a cada toque. O app foi desenhado primeiro (Design System + 13 pranchetas) e depois implementado seguindo esses tokens.

---

## Sumário

1. [Como executar](#como-executar)
2. [O que foi entregue](#o-que-foi-entregue)
3. [Arquitetura e organização](#arquitetura-e-organização)
4. [Bibliotecas e justificativas](#bibliotecas-e-justificativas)
5. [Decisões técnicas](#decisões-técnicas)
6. [Design System](#design-system)
7. [Motion design](#motion-design)
8. [Performance](#performance)
9. [Acessibilidade](#acessibilidade)
10. [Segurança](#segurança)
11. [Testes e qualidade](#testes-e-qualidade)
12. [Roteiro para a demonstração](#roteiro-para-a-demonstração)
13. [Limitações conhecidas e melhorias futuras](#limitações-conhecidas-e-melhorias-futuras)

---

## Como executar

**Pré-requisitos:** Node.js 20+ e o app **Expo Go** (SDK 58) no celular, ou um emulador Android / simulador iOS.

```bash
npm install
npm start          # abre o Expo Dev Server; escaneie o QR code com o Expo Go
```

Atalhos: `npm run android` · `npm run ios`.

| Script | O que faz |
|---|---|
| `npm run typecheck` | TypeScript em modo `strict` |
| `npm run lint` | ESLint (`eslint-config-expo`, inclui regras do React Compiler) |
| `npm test` | Jest + React Native Testing Library (31 testes) |
| `npm run check` | Os três acima em sequência |
| `npm run format` | Prettier em `src/` |

### Gerar o APK

O APK é gerado na nuvem pelo **EAS Build**, sem precisar de Android Studio. O perfil `preview` do [`eas.json`](eas.json) já está configurado para gerar um `.apk` instalável.

```bash
npx eas-cli@latest login                                        # conta gratuita em expo.dev
npx eas-cli@latest build --platform android --profile preview   # leva ~10–20 min
```

Na primeira vez o EAS pergunta se pode criar o projeto e o keystore de assinatura: responda **sim** às duas. No fim ele mostra um link e um QR code para baixar o APK.

**Mapa no APK:** no Android, o Google Maps exige uma chave de API em builds próprios (no Expo Go não). A chave nunca vai para o repositório: entra pela variável de ambiente `GOOGLE_MAPS_API_KEY`, lida em [`app.config.js`](app.config.js).

```bash
npx eas-cli@latest env:create --name GOOGLE_MAPS_API_KEY --value "<sua-chave>" --environment preview --visibility sensitive
```

Sem a chave, o app **não quebra**: a aba Mapa mostra um aviso e continua listando os bares próximos.

---

## O que foi entregue

Todas as telas do fluxo sugerido, conectadas numa experiência só:

| # | Tela | Destaques |
|---|---|---|
| 1 | **Splash animada** | Pontos (pessoas/lugares) acendem → linhas os conectam → tudo converge num ponto verde que pulsa e vira o pingo do "budd". Respeita "reduzir movimento". |
| 2 | **Home** | Busca com foco animado, filtros rápidos, carrossel de destaques com profundidade, promoções, eventos próximos e feed de bares. Pull-to-refresh, skeleton e estado vazio. |
| 3 | **Perfil do bar** | Capa com parallax, cabeçalho que surge ao rolar, ações rápidas, horário que expande para a semana, galeria, mais pedidos, eventos/promoções, informações e reserva com escolha de horário. |
| 4 | **Catálogo** | Abas por categoria com ícone e cor próprios, botão "+" que vira seletor de quantidade, barra do pedido que entra deslizando. |
| 5 | **Detalhe do produto** | Modal com opções (radio), quantidade e total que atualiza ao vivo. |
| 6 | **Pagamento (conceitual)** | Cupom com validação (`BUDD10`), Pix / cartão / carteira, resumo com taxa e desconto, estado de erro. |
| 6b | **Pedido confirmado** | Check com explosão de partículas, código de retirada e linha do tempo que avança sozinha (pago → preparando → pronto). |
| 7 | **Mapa** | Mapa escuro, pins customizados por categoria, carrossel de bares sincronizado com o mapa, filtros e localização. |
| 8 | **Perfil do usuário** | Foto, nível, estatísticas, preferências editáveis que **recalculam as recomendações na hora**, favoritos. |
| 9 | **budd AI** | Assistente que entende o pedido em linguagem natural ("bar tranquilo com drink autoral, a pé, pra 4") e responde com cards, % de compatibilidade e ações. |
| 10 | **Filtros** | Bottom sheet próprio (arrastar para fechar), com prévia ao vivo de quantos lugares batem com os filtros antes de aplicar. |
| + | **Pedidos** e **404** | Lista de pedidos com status e estados vazios com saída. |

---

## Arquitetura e organização

```
src/
├── app/                  # Rotas (Expo Router: cada arquivo é uma tela)
│   ├── (tabs)/           # Início, Mapa, Pedidos, Perfil + barra flutuante
│   ├── bar/[id]/         # Perfil do bar e cardápio
│   ├── product/[id].tsx  # Modal de produto
│   ├── order/[id].tsx    # Pedido confirmado
│   ├── assistant.tsx · checkout.tsx · filters.tsx
│   └── _layout.tsx       # Providers, fontes, splash, toast
├── components/           # Componentes reutilizáveis, sem regra de negócio de tela
│   ├── ui/               # Design System: Button, Chip, Text, Skeleton, BottomSheet...
│   ├── bar/ · product/   # Componentes de domínio usados em várias telas
│   ├── icons/            # Set de ícones SVG próprio
│   └── navigation/       # Barra de abas flutuante
├── features/             # Código específico de uma funcionalidade
│   ├── assistant/        # Motor do budd AI (puro e testado) + UI do chat
│   ├── discovery/        # Filtros e busca (funções puras)
│   ├── checkout/         # Cálculo de preço (puro) e progresso do pedido
│   └── home/ · bar/ · map/ · splash/
├── services/             # Camada de dados (api mock + React Query)
├── store/                # Estado global do cliente (Zustand)
├── theme/                # Tokens do Design System e categorias
├── types/                # Modelos de domínio
├── utils/ · hooks/
└── __tests__/
```

**Regra de dependência:** `app → features → components → theme/utils`. Componentes de `ui/` não conhecem o domínio, e `features/*` não importa outra feature (exceto funções puras compartilhadas). Regra de negócio (preço, filtros, motor do assistente) fica em **funções puras sem React**, o que deixa tudo testável sem renderizar nada.

---

## Bibliotecas e justificativas

Critérios usados para cada escolha: manutenção ativa, publicação recente, compatibilidade com Expo SDK 58 / React Native 0.88 (Nova Arquitetura), histórico de vulnerabilidades e tamanho da comunidade. As versões nativas foram resolvidas pelo `expo install`, que garante compatibilidade com o SDK.

| Biblioteca | Versão | Por quê |
|---|---|---|
| **expo** / **react-native** | 58 / 0.88 | SDK estável mais recente, compatível com o Expo Go atual. |
| **expo-router** | 58 | Navegação por arquivos (padrão oficial do Expo), deep links e rotas tipadas de graça. Traz `expo-linking` e `expo-constants` como dependências obrigatórias. |
| **react-native-reanimated** + **react-native-worklets** | 4.7 / 0.13 | Animações na UI thread a 60/120 fps. É o padrão da comunidade, mantido pela Software Mansion. |
| **react-native-gesture-handler** | 3.3 | Gestos nativos (arrastar o bottom sheet). Usei a API v3 de hooks (`usePanGesture`). |
| **react-native-svg** | 15 | Ícones vetoriais e linhas animadas da splash. Evita imagens rasterizadas. |
| **react-native-maps** | 1.29 | Mapa nativo (Google no Android, Apple no iOS) e incluso no Expo Go. |
| **react-native-safe-area-context** / **-screens** | — | Áreas seguras (notch) e telas nativas, exigidas pelo Expo Router. |
| **expo-image** | 58 | Cache em disco e memória e transição suave. Mais performático que o `Image` do RN. |
| **expo-haptics** | 58 | Feedback tátil em ações importantes (adicionar, pagar, favoritar). |
| **expo-font** + **@expo-google-fonts/** | — | Bricolage Grotesque (títulos) e Inter (texto). Importadas **por peso** para embutir só as 6 usadas. |
| **expo-splash-screen** / **expo-system-ui** / **expo-status-bar** | 58 | Splash nativa preta para emendar sem "piscar" na animada, e fundo/status bar escuros. |
| **@tanstack/react-query** | 5 | Estado do servidor: cache, retry, refetch, pull-to-refresh e estados de loading/erro sem código repetido. |
| **zustand** | 5 | Estado do cliente (carrinho, favoritos, filtros). ~1 KB e sem provider. Com seletores, cada componente re-renderiza só quando a sua fatia muda. |
| *dev:* jest-expo, @testing-library/react-native, eslint-config-expo, prettier, typescript | — | Testes, lint (com regras do React Compiler) e formatação. |
| *peer:* react-dom | 19.3 | Exigido como peer por uma dependência web do Expo Router. Fixado na mesma versão do `react` para não haver conflito. Não é usado pelo app mobile. |

**O que deixei de fora de propósito:**
- **Biblioteca de ícones.** O app usa uns 40 glifos. Um set SVG próprio, desenhado no grid do DS, pesa menos e garante consistência.
- **Biblioteca de bottom sheet.** Fiz o meu com Reanimated + Gesture Handler. São ~90 linhas, sem dependência nativa extra e com controle total do motion.
- **Redux.** Exagero para o tamanho do estado. Zustand resolve com menos código.
- **Lottie.** A splash é feita em código (SVG + Reanimated). Sem arquivo pesado e animável por token.

---

## Decisões técnicas

- **Estado do servidor ≠ estado do cliente.** Dados de bares, cardápio e produto passam pelo React Query (cache, retry, loading/erro). Carrinho, favoritos, filtros e preferências ficam no Zustand. Misturar os dois em um store só é a origem clássica de bug de sincronização.
- **API mock com contrato real.** `services/api.ts` simula latência e erro, mas expõe funções `async` que retornam o domínio. Trocar por `fetch` não muda nenhuma tela.
- **Funções puras para regra de negócio.** `computeTotals`, `applyFilters`, `searchBars`, `parseIntent` e `rankBars` não dependem de React e são cobertas por testes unitários.
- **budd AI local e determinístico.** O motor extrai intenções (vibe, distância, preço, tamanho do grupo), pontua os bares e monta a resposta. **Não chamei um LLM direto do app de propósito:** a chave de API iria dentro do bundle e qualquer pessoa conseguiria extraí-la. A integração real deve passar por um backend, e a função `reply()` já é essa fronteira.
- **Um pedido = um bar.** Adicionar item de outro bar troca o carrinho e avisa com um toast. É regra de negócio, então está no store e coberta por teste.
- **Filtros como rascunho.** O bottom sheet edita uma cópia local e só aplica ao confirmar. A Home não refiltra a cada toque e fechar descarta as mudanças.
- **Estado derivado sem `setState` em effect.** Segui as regras do React Compiler (ESLint) e escrevi shared values com `.set()`.
- **Status do pedido simulado.** A linha do tempo avança sozinha (3 s → preparando, 9 s → pronto, com toast), simulando o push que o backend mandaria.

---

## Design System

Tokens em [`src/theme/tokens.ts`](src/theme/tokens.ts), espelhando a prancheta "Design System" aprovada:

- **Cores:** marca `#76EB3C` + `#000000`, escala lime (50–900), 8 neutros nomeados por função (`surface0..2`, `border`, `text1..3`) e semânticas (erro, atenção, info).
- **Categorias** ([`theme/categories.ts`](src/theme/categories.ts)): cada uma tem ícone e cor próprios (Drinks rosa, Bebidas âmbar, Comidas laranja, Ingressos lime, Eventos violeta, Serviços ciano), usados em abas, cards, pins do mapa e itens do pedido.
- **Tipografia:** 10 estilos nomeados (`display`, `h1`–`h3`, `body`, `caption`, `overline`...), aplicados pelo componente `<Text variant>`.
- **Espaço:** grid de 4pt. **Raios:** 8 → 32 + pill. **Sombras:** `floating` e `brandGlow`.
- **Motion:** durações (`press` 120 ms, `micro` 200 ms, `enter` 320 ms), stagger de 40 ms, escala de toque 0.96 e spring padrão.

Nenhuma tela usa cor, espaçamento ou fonte "solta": tudo vem dos tokens.

---

## Motion design

| Onde | O quê |
|---|---|
| Toda superfície tocável | `PressableScale`: escala 0.96 na UI thread + haptic opcional |
| Splash | Sequência coreografada com SVG animado (linhas desenhadas por `strokeDashoffset`) |
| Listas | Entrada em cascata (`FadeInDown` + stagger), mudança de layout com spring |
| Chips / busca | Cor e borda interpoladas, anel de foco com glow |
| Carrossel | Escala e opacidade pela posição do scroll e paginação que "estica" |
| Perfil do bar | Parallax e zoom da capa, cabeçalho que aparece ao rolar |
| Horários | Expansão do card com layout animation e chevron girando |
| Carrinho | "+" vira seletor de quantidade, número "pula" a cada mudança, barra do pedido entra deslizando |
| Favoritar | Coração com "pop" elástico + haptic de sucesso |
| Bottom sheet | Entrada com spring, arrastar para fechar (distância ou velocidade) |
| Assistente | Bolhas entram com spring, indicador de digitação com ondas |
| Sucesso | Check com spring, anel expandindo e explosão de partículas |
| Erro | Shake curto + haptic de erro |
| Skeleton | Um único relógio de shimmer por grupo (uma animação, não uma por bloco) |

**Reduzir movimento:** a splash e o shimmer consultam `useReducedMotion()` e caem para um fade simples.

---

## Performance

- Animações 100% na **UI thread** (Reanimated). O JS thread fica livre.
- `FlatList` nos feeds com `initialNumToRender`/`windowSize` ajustados, `getItemLayout` no carrossel do mapa e componentes de item com `memo`.
- **Seletores do Zustand** (`useCart(selectCount)`): cada componente só re-renderiza quando a fatia que usa muda.
- Busca com `useDeferredValue`: a digitação nunca trava enquanto o feed filtra.
- Pins do mapa com `tracksViewChanges` ligado só por 400 ms depois de mudar de estado. Deixar ligado faz o mapa redesenhar todos os markers a cada frame.
- Fontes importadas por peso: o bundle leva só as **6** usadas, não as 20+ dos pacotes.
- `expo-image` com cache em memória e disco.

---

## Acessibilidade

- Contraste AA em todos os pares de texto (o verde da marca sobre preto passa folgado. Texto sobre verde usa preto).
- Áreas de toque de **44×44** no mínimo (`hitSlop` onde o visual é menor).
- `accessibilityLabel` em todo botão que só tem ícone. `accessibilityRole`/`State` corretos (`tab`, `radio`, `selected`, `checked`, `expanded`, `busy`).
- Toasts anunciados ao leitor de tela (`announceForAccessibility`). Erros com `role="alert"`.
- Fontes acompanham o tamanho do sistema, limitadas a 1.4× para não quebrar layout.
- Nada de informação só por cor: status vêm com texto ("Aberto até 02h"), não só com a bolinha verde.

---

## Segurança

- **Nenhum segredo no código.** Sem chaves de API (veja a decisão do budd AI acima).
- **Pagamento conceitual:** nenhum dado de cartão é coletado ou trafegado. Isso está dito na própria tela.
- **`npm audit`:** acusa 4 vulnerabilidades altas, **todas no `node-forge`**, que vem do `@expo/cli` (ferramenta de desenvolvimento para certificados de code signing). Não entra no bundle do app. A correção sugerida pelo npm (`audit fix --force`) faria downgrade para o Expo 44, o que seria muito pior. Fica monitorado até o Expo atualizar a dependência.
- Entradas do usuário (busca, cupom, mensagem) são só texto exibido, sem `eval` nem HTML. A mensagem do assistente é limitada a 300 caracteres.

---

## Testes e qualidade

```bash
npm run check   # typecheck + lint + 31 testes
```

- **Unitários:** formatação (moeda, horário que atravessa a meia-noite), carrinho (opções, troca de bar), preços (cupom, taxa, cashback), filtros, busca sem acento e o motor do budd AI.
- **De renderização/fluxo:** Home (skeleton → feed, busca → estado vazio), card de produto (adicionar, produto com opções), budd AI (pergunta → digitando → sugestões), perfil do bar (sucesso, não encontrado, offline), pagamento (carrinho vazio, cupom, pedido concluído) e perfil (preferências).
- Bundle de produção validado com `npx expo export` para Android e iOS.

---

## Roteiro para a demonstração

1. Abra o app e veja a **splash**.
2. Na Home, puxe para atualizar, troque os filtros rápidos e abra **Filtros** (arraste para fechar).
3. Toque num destaque → **Perfil do bar** → role para ver o parallax, expanda o horário e reserve um horário.
4. **Cardápio** → adicione itens → abra um drink com opções → **Ver pedido** → cupom **`BUDD10`** → pagar.
5. Veja a linha do tempo do **pedido** avançar sozinha.
6. Toque no botão verde central (**budd AI**) e peça: *"bar tranquilo com drink autoral, a pé, pra 4 pessoas"*.
7. No **Perfil**, mude suas preferências e veja "Feito pra você" mudar na hora.
8. Ainda no Perfil, ligue **"Simular falha de rede"** e volte à Home / abra um bar para ver os **estados de erro**.

---

## Limitações conhecidas e melhorias futuras

**Limitações honestas desta entrega:**
- **Fotos:** os bares e produtos usam capas tonais com o ícone da categoria (o componente `Cover` já aceita `uri` e troca pela foto real com cache).
- **Validação em aparelho:** este código foi verificado por typecheck, lint, testes de renderização e bundle de produção. A validação visual final é em aparelho físico / Expo Go.
- **Persistência:** carrinho, favoritos e pedidos vivem em memória e se perdem ao fechar o app.
- **Localização:** a posição do usuário é fixa (Pinheiros, SP).

**Próximos passos:**
- Backend real + **proxy para LLM** no budd AI (streaming de resposta, histórico, contexto do usuário).
- Persistência com `react-native-mmkv` (rápido e síncrono) para carrinho, favoritos e preferências.
- Geolocalização real com `expo-location` e distâncias calculadas.
- Transições de elemento compartilhado (capa do card → capa do bar) quando a API do Reanimated estabilizar.
- Testes E2E com **Maestro** e testes visuais de regressão.
- Internacionalização (pt-BR / en / es) e modo claro opcional.
- Pagamento real via provedor certificado PCI (Pix com QR dinâmico, tokenização de cartão).
