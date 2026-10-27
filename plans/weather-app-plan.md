# Weather App — Plano Técnico

## Architecture

- **Fonte da verdade:** [spec](../specs/weather-app-spec.md), incluindo a matriz US/RF/AC/RNF e o catálogo pt-BR.
- **Status:** proposta consolidada; registrar aprovação de OQ-01 a OQ-12 e evidências de OQ-13 antes da baseline de implementação. Este documento não aprova produto, contrato externo ou lançamento.
- SPA React estática por HTTPS, consumindo Open-Meteo diretamente. Componentes → hooks → services; hooks e services usam funções puras de lib e modelos de types. Nenhuma camada inferior importa componentes.
- Sem backend, roteador, store global, service worker, autenticação ou cache de recuperação. Preservar tema dark glassmorphism do projeto.
- Componentes apresentam props e emitem eventos; hooks controlam efeitos; services transportam e adaptam dados; lib concentra regras determinísticas. DTOs externos não são modelos da UI.
- [Backlog](../tasks/weather-app-tasks.md): aprovações e setup → tipos → funções puras → services → hooks → componentes → integração → testes → hardening e operação. IDs são estáveis; seguir a ordem e as dependências do backlog. A criação das suítes completas ocorre na etapa Testes, sem dispensar validação focada durante a implementação. Não implementar src/tests antes dos artefatos SDD correspondentes.

## Tech Stack

| Área | Decisão |
| --- | --- |
| UI e build | React/React DOM 19.2.7, TypeScript 6.0.3 strict, Vite 8.0.16. |
| Estilo e ferramentas | Tailwind CSS 3.4.19, Biome 2.5.0, pnpm 11.8.0, Node >=22, conforme package.json. |
| Unitários e componentes | Vitest 4.1.9, jsdom, Testing Library e user-event já declarados. |
| E2E | Playwright 1.61.0, ampliando a matriz atual para Chromium, Firefox e WebKit. |
| APIs do navegador | fetch, URLSearchParams, AbortController, Intl, Visibility API e timers; nenhuma dependência de estado, HTTP ou datas adicional por padrão. |

## Project Structure

Todos os caminhos src/tests abaixo são planejados, não código entregue por este documento.

| Pasta | Responsabilidades e módulos previstos |
| --- | --- |
| src/ | main.tsx, App.tsx e index.css: entrada, composição e estilos globais. |
| src/components/ | CitySearch, CurrentWeather, ForecastDay, Forecast, TemperatureToggle e WeatherStatus, um componente por arquivo. |
| src/hooks/ | useCitySearch e useWeather: operações independentes, efeitos, cancelamento e estado. |
| src/services/ | http, geocoding e forecast: transporte e adaptadores privados do provedor. |
| src/lib/ | search, calendar, temperature, weatherCodes e messages: regras e catálogo. |
| src/types/ | weather: contratos compartilhados, resultados e erros discriminados. |
| tests/ | setup, fixtures, unit e e2e; reutilizar as configurações existentes, sem criar runner paralelo. |

## Data Model

Contratos de domínio normalizados; estes nomes substituem as alternativas TemperatureUnit, DailyForecast e WeatherSnapshot discutidas anteriormente.

| Contrato | Campos e invariantes |
| --- | --- |
| Unit | União literal 'celsius' ou 'fahrenheit'; somente apresentação. |
| City | id:string estável; name:string; region:string ou null; country:string ou null; latitude:number; longitude:number. Nome/coordenadas válidos obrigatórios; fuso do geocoding não é condição de seleção. |
| CurrentWeather | temperatureC:number ou null; weatherCode:number ou null; validAt:string ISO 8601 UTC ou null. Invalidade do instante invalida a temperatura atual. |
| ForecastDay | date:string YYYY-MM-DD local validada; minTemperatureC:number ou null; maxTemperatureC:number ou null; weatherCode:number ou null; precipitationProbabilityPercent:number ou null, com null/ausente da fonte normalizado para 0. |
| WeatherData | city:City; timeZone:string IANA válida; current:CurrentWeather; forecast:readonly ForecastDay[]; consultedAt:string ISO 8601 UTC. Exatamente cinco datas distintas e crescentes, inclusive placeholders. |
| AppError | kind:network/http/timeout/rateLimit/invalidData; operation:search/weather; httpStatus:number ou null; retryAt:number epoch ms ou null. |
| SearchResult | results com cidades, empty ou failure com AppError. |
| WeatherResult | success com WeatherData e completeness complete/partial, ou failure com AppError. |
| RequestContext | signal:AbortSignal e now():number epoch ms; relógio substituível em testes. |

- searchCities(query:string, context:RequestContext) retorna Promise<SearchResult>; getWeather(city:City, context:RequestContext) retorna Promise<WeatherResult>. Falhas esperadas são resultados discriminados; cancelamento voluntário é silencioso no hook.
- Strings ISO UTC são a representação pública dos instantes; converter para epoch ms apenas para cálculo. Datas locais não são instantes nem devem ser interpretadas no fuso do dispositivo.
- Receber JSON como unknown, validar runtime e só depois construir modelos. null significa ausência; código desconhecido usa o fallback do catálogo. Não inventar instante de atualização do modelo: consultedAt não o representa.

## Data Flow

1. Validar envio explícito: trim externo, 2–100 pontos de código e ao menos uma letra. Entrada inválida não gera chamadas nem altera cidade.
2. Geocoding normaliza nome e coordenadas, filtra inválidos, preserva ordem e limita a dez. Qualificar homônimos com região/país e coordenadas quando necessário.
3. Seleção explícita inicia uma consulta combinada atual+diária. Ocultar números anteriores e preservar unidade. Buscar outro termo não muda a cidade selecionada.
4. Adaptador valida fuso, unidades, instantes e temperaturas; associa arrays diários por índice, monta cinco datas e classifica completo/parcial/erro segundo BR-07 a BR-09.
5. Hook publica apenas a geração vigente. UI deriva Fahrenheit dos Celsius originais, sem request, arredondamento intermediário ou cópia secundária de temperaturas.
6. Atualizar manualmente, a cada 15 min visíveis e após mudança da data local. Consolidar eventos simultâneos; retorno de visibilidade reavalia prazo e data.

## External APIs

| Endpoint GET | Parâmetros |
| --- | --- |
| https://geocoding-api.open-meteo.com/v1/search | name via URLSearchParams; count=10; language=pt; format=json; sem filtro fixo de país nem API key. |
| https://api.open-meteo.com/v1/forecast | latitude, longitude; current=temperature_2m,weather_code; daily=temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max; temperature_unit=celsius; timezone=auto; forecast_days=5; timeformat=iso8601. |

- Geocoding: id → City.id como string, admin1 → region, country → country; ausência de id válido usa coordenadas completas como chave. results ausente ou vazio é empty; tipo incorreto ou todos os registros inválidos é invalidData.
- Forecast: timezone → timeZone; current.temperature_2m/weather_code → current; daily.time/min/max/weather_code/precipitation_probability_max → forecast por índice. Arrays curtos geram campos null; probabilidade null/ausente vira 0; não filtrar arrays independentemente. time é campo retornado, não variável solicitada em daily.
- Datas diárias ISO são preservadas após validação. Para current.time sem offset, a proposta é converter componentes locais com utc_offset_seconds da mesma resposta, sem Date.parse local implícito. **Gate de contrato:** comprovar essa semântica e consistência com fuso/DST por documentação e amostras antes de implementar o adaptador. Se não comprovada, revisar esta decisão, não improvisar conversão. Offset inválido permite somente previsão parcial utilizável.
- Confirmar unidades e código WMO, CORS e acesso a Retry-After, inclusive em erro. Cabeçalho inacessível usa fallback de 60 s. Não inserir proxy sem revisão de plano.
- OQ-13 exige evidência de finalidade, licença, atribuição, tráfego, cobertura, custo, limites e suporte. Exemplos de conversa não substituem o contrato real.

## State Management

- App possui Unit, inicialmente celsius. useCitySearch possui termo editado/enviado e SearchState; useWeather possui cidade e WeatherState. Sem estado global ou persistência.
- SearchState: idle, loading, success, empty ou error; validação local do campo separada. WeatherState: idle, loading, success com completeness, ou error. Ausência total de dados não é empty meteorológico.
- Loading/error meteorológico não contém snapshot antigo renderizável. Busca em paralelo não apaga consulta meteorológica vigente. Recarga reinicia cidade vazia e Celsius.
- Cada operação controla geração, AbortController e chave pendente. Invalidação precede abort; sucesso/erro/finalização antigos não alteram estado. Timeout também invalida a geração. Cleanup remove timers/listeners e cancela operações, inclusive sob Strict Mode.
- Guardar bloqueio temporário e suspensão automática de forma independente da cidade/termo. Expiração só habilita ações. Falha automática suspende todos os gatilhos automáticos até sucesso manual ou de nova seleção; sucesso parcial utilizável também conta como sucesso.
- Estado derivado: conversão, rótulos e desatualização. Formatar uma casa decimal, empate afastado de zero e zero negativo normalizado; não usar Math.round sozinho para negativos.
- Para detectar mudança de data, usar checagem leve de calendário com cadência de até 1 s apenas quando visível, sem chamadas HTTP periódicas extras; a cada evento aplicar as guardas. Não supor que o dia local tem 24 h. Medir timeout com tempo monotônico quando disponível; validade meteorológica usa relógio civil injetável.

## Error Handling

- Transporte classifica 429 como rateLimit, demais HTTP não exitosos como http, falha de transporte como network, corpo malformado como invalidData e expiração de 10 s como timeout. O limite inclui obtenção e leitura do corpo; sempre limpar timer.
- Repetição manual usa somente o contexto ainda vigente; editar termo após erro remove ação antiga. Deduplicar envios iguais; operação diferente pode substituir a pendente. Cancelamento voluntário não mostra erro.
- Retry-After aceita segundos ou data HTTP futura, com fallback de 60 s. Bloquear a classe de operação afetada durante o prazo; não chamar automaticamente quando terminar. Troca de unidade permanece local.
- Aplicar o catálogo exato da spec, sem detalhes técnicos ou logs de uso próprios. Dados inválidos por campo viram indisponíveis, nunca zero. Fuso inválido ou nenhuma temperatura utilizável gera erro global.
- Atual válido entre consultedAt−3 h e consultedAt+5 min inclusivos. Previsão não ganha timestamp do modelo inferido. Não restaurar dados antigos após falha.

## Testing Strategy

| Escopo | Verificação e rastreabilidade |
| --- | --- |
| Vitest/lib | Entrada Unicode, coordenadas, calendário IANA/DST, cinco datas, probabilidade diária, conversão decimal e códigos; AC-01.4 a AC-01.8, AC-02.2, AC-03.2 a AC-03.5, AC-03.7, AC-04.4. |
| Vitest/services | Mock de fetch, parâmetros, unknown, arrays parciais, fuso, referência atual e null→0 para probabilidade diária, timeout e Retry-After; RF-01 a RF-03, RF-06 e RF-07. |
| Testing Library/hooks/UI | Estados, callbacks, geração vigente, unidade durante fetch, visibilidade e limpeza; RF-04 a RF-08. Relógio e promessas controlados, sem sleep. |
| Playwright | Jornada completa, erros, vazio, parcial, concorrência, teclado, recarga e mobile; interceptar ambos os hosts. Cobertura dos 52 AC identificada no backlog. |
| Qualidade e operação | Evidências específicas de RNF-01 a RNF-11; mocks não comprovam licença, CORS, WCAG, usabilidade, disponibilidade ou compatibilidade em aparelhos reais. |

- Reutilizar vite.config.ts (tests/setup.ts, jsdom e tests/unit) e playwright.config.ts. Adicionar Firefox/WebKit e manter projeto mobile; fixar versões reais na evidência de release.
- Gates de tarefas src/tests: teste focado, pnpm lint, pnpm build e pnpm test. Acrescentar pnpm test:e2e ao concluir entregas integradas. Coverage é relatório, sem percentual arbitrário. Esta fase documental não executa gates da aplicação.
- Desempenho: 100 execuções/operação, resposta controlada em 500 ms e p95 <=2 s no ambiente da spec. Usabilidade e auditoria assistiva são avaliações próprias. Disponibilidade mensal exige operação real; não inventar histórico para aprovar lançamento inicial.

## Risks & Trade-offs

| Decisão / risco | Alternativa e limite |
| --- | --- |
| SPA + fetch direto simplifica infraestrutura, mas depende de CORS e limites e transmite dados ao provedor. | Proxy só com justificativa e revisão de escopo/privacidade. |
| Estado local evita dependências; cancelamento e atualização precisam de testes próprios. | Redux/Zustand/TanStack Query não necessários sem múltiplas páginas ou política de cache aprovada. |
| Intl e calendário por componentes evitam biblioteca de datas, mas exigem fronteiras bem testadas. | Adotar biblioteca apenas se reduzir complexidade comprovada sem alterar a spec. |
| Uma consulta e Celsius original evitam divergência e requests de unidade. | Não solicitar Fahrenheit à API nem misturar formatos temporais. |
| Sem cache melhora clareza dos dados, mas reduz continuidade visual e elimina offline. | Stale-while-revalidate contraria BR-16 nesta baseline. |
| Fixtures tornam testes determinísticos, mas podem divergir da API. | Gate real de contrato antes dos serviços e revisão de amostras quando houver mudança externa. |
| OQ-01 a OQ-13 continuam pendentes; disponibilidade e privacidade dependem da hospedagem. | Registrar responsáveis/evidências, revisar requisitos se inviáveis e não declarar produção pronta apenas por testes automatizados. |