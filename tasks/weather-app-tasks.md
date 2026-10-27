# Weather App — Backlog de Tarefas

- **Entrada:** [plano técnico](../plans/weather-app-plan.md); requisitos e valores esperados na [spec](../specs/weather-app-spec.md).
- **Status:** todas as tarefas estão pendentes. Criar este backlog não aprova OQ, implementa funcionalidades ou comprova testes.
- **Granularidade:** cada tarefa altera no máximo dois arquivos relevantes e tem um único tipo: UI, Data, Test ou Infra. Os caminhos indicados são prováveis; não exigem criar arquivos vazios. Mudanças que excedam esse limite devem ser decompostas antes da execução.
- **Ordem:** priorizar as fatias verticais e suas dependências descritas ao final; a posição das tarefas por camada não impede entregar uma fatia antes das seguintes. IDs existentes são preservados para manter referências. Dependências devem estar concluídas antes da tarefa; tarefas independentes podem avançar em paralelo.
- **Testes por etapa:** a etapa Testes concentra a criação das suítes completas; não adia a validação focada de cada implementação. Usar testes existentes ou sondas temporárias até a suíte correspondente estar disponível. O setup T-03 é pré-requisito técnico, não a execução antecipada da etapa Testes. Hardening inclui avaliações especializadas de layout, segurança, desempenho e operação.
- **Conclusão de src/tests:** além da verificação indicada, executar pnpm lint, pnpm build e pnpm test. No bootstrap, registrar explicitamente gates ainda impossíveis por falta das fundações; não registrar falhas como sucesso nem fechar a entrega antes de T-38. E2E passa a ser gate das entregas integradas após T-39.
- **Evidências:** testes identificam os AC cobertos e executam separadamente suas variantes. Avaliações manuais registram versão, ambiente, responsável, resultado e evidência no plano; itens não executados permanecem pendentes. Ao alterar conteúdo de produto, atualizar a spec antes de tarefas dependentes.
- **P0/P1/P2:** P0 bloqueia a primeira entrega funcional ou o aceite dos requisitos do MVP; P1 é hardening/evidência exigida para prontidão; P2 requer observação operacional prolongada. Prioridade não remove requisitos: P2/T-52 deve iniciar assim que possível, e seu relatório segue obrigatório para fechar T-51 conforme OQ-10.
- **Tamanho P/M/G:** P = mudança pequena e localizada; M = esforço moderado em até dois arquivos; G = maior complexidade de coordenação, estados ou evidência, ainda limitada aos arquivos prováveis indicados.

## Pré-requisitos — Aprovações e Setup

### T-01 — Aprovar a baseline de produto
- **Tipo:** Infra
- **Descrição:** fechar as decisões propostas sem confundi-las com decisões já confirmadas.
- **Rastreabilidade:** RF-01 a RF-08; RNF-01 a RNF-11; OQ-01 a OQ-12.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** specs/weather-app-spec.md; plans/weather-app-plan.md.
- **Critérios de aceite:** cada OQ-01 a OQ-12 tem decisão aprovada ou revisão explícita, responsável e data; regras, critérios e plano refletem a mesma decisão. OQ-13 continua bloqueada até T-02, sem aprovação presumida.
- **Verificação:** revisão documental dos doze registros; se houver mudança de valores, atualizar as tarefas afetadas antes de iniciar código.

### T-02 — Validar o contrato real da Open-Meteo
- **Tipo:** Infra
- **Descrição:** comprovar viabilidade da fonte e fechar a interpretação temporal antes dos adaptadores.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-07; RNF-09; OQ-13.
- **Dependências:** T-01.
- **Arquivos prováveis:** plans/weather-app-plan.md.
- **Critérios de aceite:** registrar finalidade/tráfego, termos vigentes, atribuição exigida, limites, cobertura, custo e suporte; anexar exemplos dos dois endpoints, unidades, fuso, offset e acesso CORS, inclusive Retry-After quando disponível. Confirmar como current.time vira instante UTC e como daily.time preserva datas locais; se não comprovado, revisar o contrato antes de prosseguir.
- **Verificação:** documentação e consultas controladas com data e fonte registradas; exemplos inventados não contam como evidência e ausência de cabeçalho deve resultar no fallback da spec.

### T-03 — Preparar o setup de testes unitários
- **Tipo:** Infra
- **Descrição:** habilitar Testing Library na configuração Vitest existente.
- **Rastreabilidade:** RF-05, RF-08; RNF-03.
- **Dependências:** T-01.
- **Arquivos prováveis:** tests/setup.ts; vite.config.ts.
- **Critérios de aceite:** setup existente no caminho configurado, matchers jest-dom disponíveis e cleanup entre casos; ambiente jsdom e descoberta restrita a tests/unit, sem executar E2E no Vitest.
- **Verificação:** teste de sondagem temporário com duas renderizações isoladas passa; remover a sondagem após validar, sem criar um segundo runner.

## Entrega 1 — Tipos

### T-04 — Definir os contratos compartilhados
- **Tipo:** Data
- **Descrição:** consolidar os modelos e resultados discriminados do plano.
- **Rastreabilidade:** RF-01 a RF-08; RNF-08.
- **Dependências:** T-01, T-02, T-03.
- **Arquivos prováveis:** src/types/weather.ts.
- **Critérios de aceite:** exportar City, CurrentWeather, ForecastDay, WeatherData e Unit com literais celsius/fahrenheit, null explícito e instantes ISO UTC; erros/resultados distinguem vazio, falha e sucesso parcial. Nenhum any ou dependência React/DTO bruto no domínio.
- **Verificação:** checagem TypeScript strict e revisão dos campos contra Data Model do plano; documentar cardinalidade cinco como invariante do adaptador, não garantia automática de um array.

## Entrega 2 — Funções Puras

### T-05 — Validar termos de pesquisa
- **Tipo:** Data
- **Descrição:** implementar validação pura da entrada, sem rede.
- **Rastreabilidade:** RF-01; AC-01.4, AC-01.5; BR-01.
- **Dependências:** T-04.
- **Arquivos prováveis:** src/lib/search.ts.
- **Critérios de aceite:** remover somente espaços externos; aceitar 2 e 100 pontos de código com letra; rejeitar vazio, um caractere, 101 caracteres e símbolos sem letra. Preservar São Paulo, D'Oeste, Baden-Baden e espaços internos.
- **Verificação:** tabela de entradas com resultados esperados; função não acessa fetch, DOM ou armazenamento.

### T-06 — Converter e formatar temperaturas
- **Tipo:** Data
- **Descrição:** derivar apresentação de valores Celsius originais.
- **Rastreabilidade:** RF-04; AC-04.2, AC-04.3, AC-04.4; BR-10.
- **Dependências:** T-04.
- **Arquivos prováveis:** src/lib/temperature.ts.
- **Critérios de aceite:** 0 e 20 °C geram 32,0 e 68,0 °F; 1,25 e -1,25 °C aparecem como 1,3 e -1,3 °C; -0,01 °C aparece como 0,0 °C. null permanece Indisponível, sem unidade; não modificar o valor original nem arredondar etapas intermediárias.
- **Verificação:** executar os exemplos de AC-04.4 em dez ciclos, incluindo os três valores Fahrenheit esperados pela spec.

### T-07 — Definir o calendário e as referências temporais
- **Tipo:** Data
- **Descrição:** centralizar datas locais e apresentação de instantes com relógio explícito.
- **Rastreabilidade:** RF-03, RF-07; AC-03.2, AC-03.5, AC-07.1, AC-07.2, AC-08.3; RNF-06.
- **Dependências:** T-04.
- **Arquivos prováveis:** src/lib/calendar.ts.
- **Critérios de aceite:** rejeitar fuso inválido; 28/10/2026 01:00 UTC corresponde a 27/10 em America/Sao_Paulo; gerar 31/12 a 04/01 e 07 a 11/03/2026 em America/New_York sem pular datas. Formatar dd/MM/aaaa e HH:mm com fuso identificado; não inferir horário do modelo.
- **Verificação:** exemplos com relógio fornecido, dispositivo em fuso diferente e dias com mudança de duração.

### T-08 — Registrar o catálogo pt-BR
- **Tipo:** Data
- **Descrição:** centralizar mensagens e tradução dos códigos meteorológicos.
- **Rastreabilidade:** RF-02, RF-03, RF-08; AC-02.4, AC-08.2.
- **Dependências:** T-04.
- **Arquivos prováveis:** src/lib/messages.ts; src/lib/weatherCodes.ts.
- **Critérios de aceite:** mensagens e todos os códigos enumerados na spec têm os textos exatos; 0 retorna Céu limpo, 2 Parcialmente nublado, ausente/desconhecido Condição indisponível. Catálogo não executa efeitos colaterais.
- **Verificação:** comparar todas as entradas com as duas tabelas da seção Acceptance Criteria da spec.

## Entrega 3 — Services

### T-11 — Implementar o transporte HTTP
- **Tipo:** Data
- **Descrição:** classificar falhas, cancelamento e limite de espera comuns aos dois endpoints.
- **Rastreabilidade:** RF-06; AC-06.1, AC-06.4, AC-06.6; RNF-07, RNF-11.
- **Dependências:** T-05, T-06, T-07, T-08.
- **Arquivos prováveis:** src/services/http.ts.
- **Critérios de aceite:** obter e ler JSON como unknown em até 10 s; distinguir HTTP, rede, corpo inválido, timeout e cancelamento voluntário. Interpretar Retry-After numérico ou data futura; fallback 60 s; limpar timer em todos os desfechos e nunca repetir automaticamente.
- **Verificação:** promessas controladas demonstram espera em 9.999 ms e timeout em 10.000 ms, incluindo corpo que não termina de chegar.

### T-13 — Adaptar o geocoding
- **Tipo:** Data
- **Descrição:** enviar pesquisa válida e transformar resultados externos em City.
- **Rastreabilidade:** RF-01; AC-01.1, AC-01.2, AC-01.6, AC-01.7, AC-01.8.
- **Dependências:** T-05, T-11.
- **Arquivos prováveis:** src/services/geocoding.ts.
- **Critérios de aceite:** usar endpoint/parâmetros do plano e URLSearchParams; validar nome e coordenadas, preservar ordem e até dez válidos. Qualificar homônimos conforme BR-03; diferenciar vazio de tipo incorreto ou lista totalmente inválida. Sem chave de API ou país fixo.
- **Verificação:** respostas controladas com 12 registros, homônimos e qualificadores ausentes geram as saídas de AC-01.6 a AC-01.8.

### T-15 — Normalizar as condições atuais
- **Tipo:** Data
- **Descrição:** adaptar campos atuais e referência temporal usando o contrato comprovado.
- **Rastreabilidade:** RF-02, RF-07; AC-02.1 a AC-02.5, AC-07.1, AC-07.2; RNF-06.
- **Dependências:** T-02, T-07, T-08, T-11.
- **Arquivos prováveis:** src/services/forecast.ts.
- **Critérios de aceite:** preservar números finitos, rejeitar texto numérico e referência fora de consultedAt−3 h a consultedAt+5 min inclusivos. Referência inválida torna temperatura indisponível; código desconhecido não apaga temperatura válida. Não derivar atualização de generationtime_ms.
- **Verificação:** sondas de normalização com 0, negativos, campos nulos e instantes exatamente nos limites e 1 s além.

### T-16 — Normalizar os cinco dias locais
- **Tipo:** Data
- **Descrição:** acrescentar ao adaptador diário a montagem da janela da spec.
- **Rastreabilidade:** RF-03; AC-03.1 a AC-03.6.
- **Dependências:** T-15.
- **Arquivos prováveis:** src/services/forecast.ts.
- **Critérios de aceite:** cinco datas locais ordenadas; arrays associados pelo índice original; dias faltantes mantidos como lacuna; extras ignorados. Duplicata invalida o dia, mínima maior que máxima invalida o par e fuso inválido produz falha global.
- **Verificação:** entrada fora de ordem, arrays curtos, duplicatas e dia extra produzem os resultados de AC-03.3/AC-03.4, sem misturar snapshots.

### T-17 — Consultar e classificar o snapshot meteorológico
- **Tipo:** Data
- **Descrição:** expor getWeather e integrar a consulta única aos normalizadores.
- **Rastreabilidade:** RF-02, RF-03, RF-05, RF-07; AC-05.5, AC-05.6; RNF-09.
- **Dependências:** T-16.
- **Arquivos prováveis:** src/services/forecast.ts.
- **Critérios de aceite:** request único com current/daily/timezone/forecast_days do plano e Celsius; retornar completo somente com todos os campos exigidos, parcial com ao menos uma temperatura utilizável, erro sem nenhuma. consultedAt é a conclusão da consulta; respostas inválidas não geram sucesso vazio.
- **Verificação:** conferir URL e três classificações com payloads controlados, incluindo apenas atual e apenas diário utilizáveis.

## Entrega 4 — Hooks e Estado

### T-20 — Orquestrar a busca explícita
- **Tipo:** Data
- **Descrição:** criar o hook de busca com termo editado separado do enviado.
- **Rastreabilidade:** RF-01, RF-05; AC-01.4, AC-05.2, AC-05.3.
- **Dependências:** T-13.
- **Arquivos prováveis:** src/hooks/useCitySearch.ts.
- **Critérios de aceite:** idle/loading/success/empty/error exclusivos; editar não dispara rede; envio válido limpa resultados anteriores, entrada inválida não chama service. Vazio permite nova pesquisa e não é erro de rede.
- **Verificação:** usar service simulado para percorrer cada transição e contar chamadas.

### T-21 — Proteger a busca de respostas obsoletas
- **Tipo:** Data
- **Descrição:** acrescentar cancelamento, deduplicação, retry contextual e cooldown.
- **Rastreabilidade:** RF-06; AC-06.2, AC-06.5, AC-06.6, AC-06.7.
- **Dependências:** T-20.
- **Arquivos prováveis:** src/hooks/useCitySearch.ts.
- **Critérios de aceite:** só geração vigente altera resultados/erro/carregamento; envio igual pendente não duplica; edição após erro remove ação antiga; cooldown persiste entre termos e não dispara chamada ao expirar. Desmontagem cancela sem erro apresentado.
- **Verificação:** concluir B antes de A, depois rejeitar A; resultado B permanece e não há timers/listeners abandonados.

### T-23 — Orquestrar seleção e consulta meteorológica
- **Tipo:** Data
- **Descrição:** criar o estado da cidade e do snapshot vigente.
- **Rastreabilidade:** RF-02, RF-03, RF-05, RF-07; AC-01.3, AC-05.1, AC-05.4, AC-05.5, AC-05.6, AC-07.3, AC-07.4.
- **Dependências:** T-13, T-17.
- **Arquivos prováveis:** src/hooks/useWeather.ts.
- **Critérios de aceite:** iniciar idle sem cidade; seleção/Atualizar faz uma consulta; loading oculta dados anteriores; sucesso guarda um snapshot completo/parcial; erro não restaura cache e permite tentar novamente a cidade vigente.
- **Verificação:** percorrer seleção → loading → sucesso → atualização → falha com service simulado e inspeção do estado renderizável.

### T-24 — Proteger a consulta meteorológica concorrente
- **Tipo:** Data
- **Descrição:** acrescentar geração, cancelamento e bloqueio à consulta de cidade.
- **Rastreabilidade:** RF-06; AC-06.1, AC-06.2, AC-06.3, AC-06.4, AC-06.6, AC-06.7.
- **Dependências:** T-23.
- **Arquivos prováveis:** src/hooks/useWeather.ts.
- **Critérios de aceite:** troca de cidade invalida resposta/erro antigos, timeout invalida geração e abort voluntário é silencioso; chamada idêntica pendente não duplica. Cooldown não é reiniciado ou contornado por mudar a cidade.
- **Verificação:** simular resposta tardia após timeout e cidade A após B; cidade, resultado e erro de B não mudam.

### T-25 — Agendar atualizações automáticas
- **Tipo:** Data
- **Descrição:** acrescentar prazo de atualização, visibilidade e mudança da data local.
- **Rastreabilidade:** RF-07, RF-06; AC-06.8, AC-07.5, AC-07.6; RNF-06.
- **Dependências:** T-24.
- **Arquivos prováveis:** src/hooks/useWeather.ts.
- **Critérios de aceite:** atualizar após 15 min visíveis e no primeiro evento após virada local; não iniciar periodicidade oculta; ao voltar, reavaliar prazo/data. Consolidar gatilhos coincidentes; falha automática suspende todos os gatilhos até sucesso manual/nova seleção; limpar timers/listeners ao desmontar.
- **Verificação:** relógio e visibilidade controlados demonstram uma única chamada por vencimento e zero chamadas nos intervalos suspensos.

## Entrega 5 — Componentes

### T-28 — Construir formulário e resultados de cidades
- **Tipo:** UI
- **Descrição:** apresentar busca e seleção por props, sem fetch no componente.
- **Rastreabilidade:** RF-01, RF-05, RF-08; AC-01.1, AC-01.2, AC-01.4, AC-01.6, AC-05.2, AC-05.3, AC-08.4, AC-08.5.
- **Dependências:** T-04, T-05, T-08, T-21.
- **Arquivos prováveis:** src/components/CitySearch.tsx.
- **Critérios de aceite:** botão/Enter emitam um envio; resultados identificados e selecionáveis por teclado; validação associada ao input, loading/empty/error distintos e mensagens do catálogo. Nenhuma seleção automática ou request durante render.
- **Verificação:** renderizações com props de cada estado e callbacks espiados; foco não se move por chegada de resultado/erro.

### T-30 — Apresentar condições atuais
- **Tipo:** UI
- **Descrição:** renderizar valores normalizados e unidade recebida por props.
- **Rastreabilidade:** RF-02, RF-04, RF-08; AC-02.1 a AC-02.4, AC-04.2, AC-04.3, AC-08.2.
- **Dependências:** T-06, T-08, T-21, T-25.
- **Arquivos prováveis:** src/components/CurrentWeather.tsx.
- **Critérios de aceite:** apresentar cidade, temperatura formatada e condição do catálogo; zero/negativos preservados, campos ausentes Indisponível e código desconhecido Condição indisponível. Troca de props de unidade altera apenas apresentação.
- **Verificação:** snapshots de dados controlados por inspeção de conteúdo/roles, sem snapshot de implementação ou chamadas externas.

### T-31 — Apresentar a previsão diária
- **Tipo:** UI
- **Descrição:** compor item diário e sequência das cinco datas normalizadas.
- **Rastreabilidade:** RF-03, RF-04; AC-03.1, AC-03.3, AC-04.2, AC-04.3.
- **Dependências:** T-06, T-07, T-08, T-21, T-25.
- **Arquivos prováveis:** src/components/ForecastDay.tsx; src/components/Forecast.tsx.
- **Critérios de aceite:** cinco datas com mínima/máxima/condição, incluindo lacunas, sem sexto dia ou repetição; key estável pela data, não índice. Rótulos de mínima/máxima e unidade são identificáveis sem depender de cor.
- **Verificação:** montar props com 27 a 31/10/2026 e ausência em 29/10; conferir data, valores e conteúdo indisponível.

### T-32 — Apresentar estados, atualização e referências
- **Tipo:** UI
- **Descrição:** renderizar status e ações, sem iniciar efeitos no componente.
- **Rastreabilidade:** RF-05, RF-06, RF-07, RF-08; AC-05.4, AC-05.5, AC-05.6, AC-06.1, AC-06.6, AC-07.1, AC-07.2, AC-07.4, AC-08.3, AC-08.5, AC-08.6.
- **Dependências:** T-07, T-08, T-21, T-25.
- **Arquivos prováveis:** src/components/WeatherStatus.tsx.
- **Critérios de aceite:** rótulos Válido em/Período/Consultado em e fuso corretos; aviso parcial/erro/carregamento conforme props; retry bloqueado no prazo; Atualizar emite callback. Atribuição Open-Meteo acessível e nenhum horário do modelo inferido; anúncios não deslocam foco nem repetem contagem a cada segundo.
- **Verificação:** props com relógios distintos e cooldown; inspecionar conteúdo, nomes acessíveis e eventos emitidos.

### T-33 — Apresentar seletor de unidade
- **Tipo:** UI
- **Descrição:** construir controle sem estado duplicado de temperatura.
- **Rastreabilidade:** RF-04, RF-08; AC-04.1, AC-04.2, AC-04.3, AC-08.4.
- **Dependências:** T-04, T-08, T-21, T-25.
- **Arquivos prováveis:** src/components/TemperatureToggle.tsx.
- **Critérios de aceite:** Celsius/Fahrenheit têm nomes acessíveis e seleção identificável programaticamente; ação emite Unit correspondente, inclusive durante loading. Sem fetch, persistência ou cópia de dados meteorológicos.
- **Verificação:** usar callbacks espiados para seleção por clique e teclado, com estado controlado por props.

## Entrega 6 — Integração

### T-54 — Compor a primeira fatia vertical de busca
- **Tipo:** UI
- **Descrição:** ligar formulário, hook e geocoding para publicar a primeira jornada utilizável antes da integração meteorológica.
- **Rastreabilidade:** RF-01, RF-05; AC-01.1, AC-01.2, AC-01.3, AC-05.1, AC-05.2, AC-05.3.
- **Dependências:** T-14, T-22, T-28, T-29.
- **Arquivos prováveis:** src/App.tsx; src/main.tsx.
- **Critérios de aceite:** abrir a aplicação sem cidade e sem dados meteorológicos; enviar busca válida apresenta resultados; vazio e erro são distintos; selecionar resultado preserva a identidade escolhida e apresenta o local selecionado, sem chamar forecast. Busca utilizável por teclado e sem login.
- **Verificação:** executar a fatia com services controlados após T-29; confirmar sequência de chamadas geocoding e zero chamadas forecast.

### T-36 — Compor a jornada da aplicação
- **Tipo:** UI
- **Descrição:** conectar componentes aos hooks sem mover regras dos services para a UI.
- **Rastreabilidade:** RF-01 a RF-08; AC-01.3, AC-04.1, AC-04.5, AC-04.6, AC-05.1, AC-07.3, AC-08.1.
- **Dependências:** T-21, T-25, T-28, T-30, T-31, T-32, T-33, T-54.
- **Arquivos prováveis:** src/App.tsx; src/main.tsx.
- **Critérios de aceite:** App é único dono de Unit; iniciar Celsius sem cidade, seleção inicia forecast, busca não altera seleção e troca de unidade não chama API. Durante consulta, nova unidade é respeitada na resposta; recarga não restaura dados ou preferências e nenhuma conta é solicitada. Não importar stylesheet inexistente: criação e conexão dos estilos globais pertencem a T-37.
- **Verificação:** jornada com serviços controlados e inspeção da contagem de chamadas; validar montagem e cleanup sob Strict Mode.

## Entrega 7 — Testes

### T-09 — Testar a validação pura da busca
- **Tipo:** Test
- **Descrição:** automatizar somente a validação e a preservação dos termos de pesquisa.
- **Rastreabilidade:** RF-01; AC-01.4, AC-01.5.
- **Dependências:** T-03, T-05.
- **Arquivos prováveis:** tests/unit/lib/search.test.ts.
- **Critérios de aceite:** cobrir vazio, espaços, 1/2/100/101 pontos de código, símbolos sem letras e caracteres Unicode fora do BMP; preservar acentos, hífens, apóstrofos e espaços internos. Cada cenário declara entrada e saída literal esperada; a conversão é verificada separadamente em T-53.
- **Verificação:** pnpm test -- tests/unit/lib/search.test.ts passa sem rede.

### T-53 — Testar a conversão de unidade isoladamente
- **Tipo:** Test
- **Descrição:** dedicar uma suíte Vitest à conversão e formatação dos valores Celsius originais, sem montar componentes.
- **Rastreabilidade:** RF-04; AC-04.2, AC-04.3, AC-04.4; BR-10.
- **Dependências:** T-03, T-06.
- **Arquivos prováveis:** tests/unit/lib/temperature.test.ts.
- **Critérios de aceite:** 0 e 20 °C aparecem como 32,0 e 68,0 °F; 1,25 e -1,25 °C aparecem como 1,3 e -1,3 °C e, em Fahrenheit, 34,3 e 29,8 °F. -0,01 °C aparece como 0,0 °C e 32,0 °F; null permanece Indisponível sem unidade. Dez alternâncias preservam os valores originais; nenhuma chamada de fetch ocorre em qualquer caso.
- **Verificação:** pnpm test -- tests/unit/lib/temperature.test.ts com saídas literais, spy de fetch e restauração dos mocks entre casos.

### T-10 — Testar calendário e códigos
- **Tipo:** Test
- **Descrição:** automatizar fusos, fronteiras de datas e catálogo meteorológico.
- **Rastreabilidade:** RF-02, RF-03, RF-07, RF-08; AC-02.4, AC-03.2, AC-03.5, AC-07.1, AC-07.2, AC-08.2, AC-08.3.
- **Dependências:** T-03, T-07, T-08.
- **Arquivos prováveis:** tests/unit/lib/calendar.test.ts; tests/unit/lib/weatherCodes.test.ts.
- **Critérios de aceite:** verificar fronteiras de mês/ano/DST e fuso inválido; percorrer todos os códigos da spec e o fallback. Resultados não dependem da data ou do fuso da máquina executora.
- **Verificação:** executar os dois arquivos no Vitest com instantes fixos.

### T-12 — Testar o transporte HTTP
- **Tipo:** Test
- **Descrição:** verificar o contrato do transporte com mock de fetch.
- **Rastreabilidade:** RF-06; AC-06.1, AC-06.4, AC-06.6; RNF-07.
- **Dependências:** T-03, T-11.
- **Arquivos prováveis:** tests/unit/services/http.test.ts.
- **Critérios de aceite:** variantes de rede, HTTP 500, JSON inválido, 429, Retry-After em segundos/data/inacessível e expiração durante leitura têm resultados distintos previstos. Abort por substituição não vira timeout nem erro visível; timers ficam limpos.
- **Verificação:** Vitest com fake timers e mock de fetch restaurado entre testes; chamadas inesperadas falham o teste e nenhum acesso à rede real é permitido.

### T-14 — Testar o adaptador de geocoding
- **Tipo:** Test
- **Descrição:** verificar request e normalização sem depender da fonte ao vivo.
- **Rastreabilidade:** RF-01; AC-01.1, AC-01.2, AC-01.5, AC-01.6, AC-01.7, AC-01.8; RNF-11.
- **Dependências:** T-03, T-13.
- **Arquivos prováveis:** tests/unit/services/geocoding.test.ts.
- **Critérios de aceite:** inspecionar parâmetros decodificados e resultados; validar extremos de coordenadas, números inválidos, nome ausente e chave estável. Uma entrada com marcação permanece texto, sem alterar host, parâmetros de controle ou documento.
- **Verificação:** teste focado com mock de fetch cobre cada variante isoladamente, verifica URL/parâmetros e restaura o mock após cada caso; nenhuma chamada real é permitida.

### T-18 — Testar normalização atual e validade
- **Tipo:** Test
- **Descrição:** testar o service de forecast com mock de fetch, focando o contrato temporal e os campos das condições atuais.
- **Rastreabilidade:** RF-02, RF-07; AC-02.1 a AC-02.5, AC-07.1, AC-07.2.
- **Dependências:** T-03, T-17.
- **Arquivos prováveis:** tests/unit/services/forecastCurrent.test.ts.
- **Critérios de aceite:** cobrir instante local sem offset segundo T-02, referência ausente/inconsistente, zero, negativos, código desconhecido e todas as fronteiras de AC-02.5; previsão válida sobrevive à invalidade atual.
- **Verificação:** teste focado com mock de fetch, relógio fixo e fixtures representativas do contrato validado; restaurar mocks e impedir chamadas reais ao provedor.

### T-19 — Testar janela diária e resultado do forecast
- **Tipo:** Test
- **Descrição:** testar o service de forecast com mock de fetch, verificando request, janela diária e classificação do snapshot inteiro.
- **Rastreabilidade:** RF-03, RF-05; AC-03.1 a AC-03.6, AC-05.5, AC-05.6.
- **Dependências:** T-03, T-17.
- **Arquivos prováveis:** tests/unit/services/forecast.test.ts.
- **Critérios de aceite:** verificar parâmetros, datas locais/DST, arrays desalinhados, duplicatas, pares invertidos e lacunas; testar completo, parcial e erro global. Cada resultado esperado é independente da disponibilidade real da API.
- **Verificação:** executar o arquivo no Vitest com mock de fetch e relógio controlado; verificar URL/parâmetros, restaurar mocks entre casos e impedir acesso ao provedor real.

### T-22 — Testar o hook de busca
- **Tipo:** Test
- **Descrição:** automatizar transições e concorrência de pesquisa.
- **Rastreabilidade:** RF-01, RF-05, RF-06; AC-01.4, AC-05.2, AC-05.3, AC-06.2, AC-06.5, AC-06.6, AC-06.7.
- **Dependências:** T-03, T-21.
- **Arquivos prováveis:** tests/unit/hooks/useCitySearch.test.ts.
- **Critérios de aceite:** cobrir os estados, edição, vazio, retry, duplicação, sucesso/erro antigo, expiração do bloqueio e desmontagem sob Strict Mode; nenhuma chamada causada apenas por digitação ou expiração do cooldown.
- **Verificação:** renderHook, promessas controladas e fake timers; nomes dos testes incluem os AC correspondentes.

### T-26 — Testar consulta, concorrência e recuperação
- **Tipo:** Test
- **Descrição:** automatizar a máquina de estado meteorológica sem atualização periódica.
- **Rastreabilidade:** RF-05, RF-06, RF-07; AC-05.1, AC-05.4, AC-05.5, AC-05.6, AC-06.1, AC-06.2, AC-06.3, AC-06.4, AC-06.6, AC-06.7, AC-07.3, AC-07.4.
- **Dependências:** T-03, T-24.
- **Arquivos prováveis:** tests/unit/hooks/useWeather.test.ts.
- **Critérios de aceite:** cobrir idle/loading/complete/partial/error, retry, ausência de cache, timeout e respostas antigas; seleção B permanece após sucesso/erro de A. Cleanup e bloqueio valem também sob Strict Mode.
- **Verificação:** renderHook com serviço e relógio controlados; testar carregamento e desfecho separadamente.

### T-27 — Testar atualização e visibilidade
- **Tipo:** Test
- **Descrição:** verificar os gatilhos periódicos e suas exceções.
- **Rastreabilidade:** RF-07, RF-06; AC-06.8, AC-07.5, AC-07.6; BR-16.
- **Dependências:** T-03, T-25.
- **Arquivos prováveis:** tests/unit/hooks/useWeatherRefresh.test.ts.
- **Critérios de aceite:** testar 15 min, página oculta, retorno, virada local antes de 15 min, gatilhos simultâneos e suspensão após erro; nenhum fetch ao simples vencer do cooldown. Indicação de consulta desatualizada deriva de consultedAt quando ainda houver snapshot visível com mais de 15 min.
- **Verificação:** fake timers e visibilitychange, sem esperas reais ou sleep fixo.

### T-29 — Testar estados e seleção do componente de busca
- **Tipo:** Test
- **Descrição:** verificar loading, erro, vazio e sucesso do componente de busca isolado por props, além de seleção e acessibilidade.
- **Rastreabilidade:** RF-01, RF-05, RF-08; AC-01.1, AC-01.2, AC-01.4, AC-01.5, AC-01.6, AC-05.2, AC-05.3, AC-08.4, AC-08.5.
- **Dependências:** T-03, T-28.
- **Arquivos prováveis:** tests/unit/components/CitySearch.test.tsx.
- **Critérios de aceite:** casos separados por props verificam loading com Buscando cidades e sem lista antiga; erro com mensagem do catálogo e ação de retry emitindo uma vez; vazio com Nenhuma cidade encontrada, sem mensagem de falha; sucesso com nomes/regiões/países e seleção correta. Validação é associada ao campo; Enter e clique disparam uma ação cada e teclado seleciona sem armadilha de foco. O componente não chama fetch.
- **Verificação:** Vitest com Testing Library, user-event, queries por role/nome acessível e callbacks espiados; rerender entre estados confirma remoção de mensagens/listas antigas, sem depender de classes Tailwind.

### T-34 — Testar componentes meteorológicos
- **Tipo:** Test
- **Descrição:** verificar conteúdo atual e diário sem hooks nem rede.
- **Rastreabilidade:** RF-02, RF-03, RF-04; AC-02.1 a AC-02.4, AC-03.1, AC-03.3, AC-04.2, AC-04.3.
- **Dependências:** T-03, T-30, T-31.
- **Arquivos prováveis:** tests/unit/components/CurrentWeather.test.tsx; tests/unit/components/Forecast.test.tsx.
- **Critérios de aceite:** dados completos, zero/negativos, lacunas, código desconhecido e duas unidades têm as saídas da spec; cinco datas permanecem após rerender, sem valores inventados.
- **Verificação:** testes de props e rerender com conteúdo literal esperado, sem snapshots extensos de HTML.

### T-35 — Testar status e seletor
- **Tipo:** Test
- **Descrição:** verificar ações, catálogo, referências e acessibilidade dos controles.
- **Rastreabilidade:** RF-04 a RF-08; AC-04.1, AC-05.4, AC-05.5, AC-05.6, AC-06.6, AC-07.1, AC-07.2, AC-07.4, AC-08.2, AC-08.3, AC-08.5, AC-08.6.
- **Dependências:** T-03, T-32, T-33.
- **Arquivos prováveis:** tests/unit/components/WeatherStatus.test.tsx; tests/unit/components/TemperatureToggle.test.tsx.
- **Critérios de aceite:** casos separados verificam loading com Consultando previsão e sem números antigos; erro com mensagem do catálogo e retry; sucesso parcial com aviso e campos indisponíveis; sucesso completo sem aviso parcial. Callbacks e seleção programática corretos, retry bloqueado sem chamar ação, rótulos temporais distintos e link de atribuição correto; erro não expõe stack trace/resposta bruta. Vazio de busca pertence a T-29; ausência total de temperaturas é erro, não empty meteorológico.
- **Verificação:** Testing Library com consultas acessíveis e contagem de callbacks.

### T-38 — Testar a composição da jornada
- **Tipo:** Test
- **Descrição:** verificar a integração React e fechar os gates de bootstrap.
- **Rastreabilidade:** RF-01 a RF-08; AC-01.3, AC-04.1 a AC-04.6, AC-05.1, AC-07.3, AC-08.1.
- **Dependências:** T-03, T-09, T-53, T-10, T-12, T-14, T-18, T-19, T-22, T-26, T-27, T-29, T-34, T-35, T-36.
- **Arquivos prováveis:** tests/unit/App.test.tsx.
- **Critérios de aceite:** seleção, carregamento, sucesso, parcial, erro, retry e toggle refletem o estado correto; unidade não gera request e inicia em Celsius em nova montagem. pnpm lint, pnpm build e pnpm test terminam com código zero; registrar falhas sem suprimir testes.
- **Verificação:** executar teste focado e os três gates, mantendo evidência de comandos e resultados.

### T-39 — Configurar a matriz Playwright
- **Tipo:** Infra
- **Descrição:** ampliar os projetos existentes sem duplicar runner ou servidor.
- **Rastreabilidade:** RF-08; RNF-01, RNF-10.
- **Dependências:** T-38.
- **Arquivos prováveis:** playwright.config.ts.
- **Critérios de aceite:** Chromium, Firefox, WebKit e projeto mobile executáveis; reaproveitar servidor/baseURL existentes e preservar traces/screenshots de falha. Nenhum teste E2E é descoberto pelo Vitest.
- **Verificação:** listagem de projetos/testes e execução de sondagem temporária nos quatro projetos, removida após validação.

### T-40 — Testar o fluxo principal E2E em desktop e mobile
- **Tipo:** Test
- **Descrição:** dedicar uma suíte Playwright ao fluxo busca → seleção → clima atual → cinco dias → troca de unidade, em desktop e viewport mobile.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-04, RF-08; AC-01.1, AC-01.2, AC-01.3, AC-02.1, AC-03.1, AC-04.1 a AC-04.6, AC-08.1, AC-08.6; RNF-01, RNF-10.
- **Dependências:** T-39.
- **Arquivos prováveis:** tests/e2e/weather.spec.ts.
- **Critérios de aceite:** interceptar ambos os hosts com fixtures; executar a jornada nos projetos desktop e mobile, incluindo viewport mobile de 375 × 812 CSS px com toque. Selecionar o destino homônimo correto, conferir 20,0 °C atuais e cinco datas com valores/referências previstos; alternar para 68,0 °F sem nova chamada a nenhum endpoint nem mudança de cidade/datas. Cobrir troca durante loading e recarga sem restauração; nenhuma conta é solicitada e atribuição visível. Controles necessários ficam visíveis e operáveis no mobile; a inspeção abrangente de layout permanece em T-42.
- **Verificação:** pnpm test:e2e -- tests/e2e/weather.spec.ts executa em todos os projetos configurados; conferir relatório de desktop e mobile, contagem de chamadas e resultados por role/nome acessível, sem acesso à API real ou sleep fixo.

### T-41 — Testar falhas e concorrência E2E
- **Tipo:** Test
- **Descrição:** comprovar os estados e a recuperação na integração completa.
- **Rastreabilidade:** RF-05, RF-06, RF-07; AC-05.1 a AC-05.6, AC-06.1 a AC-06.8, AC-07.3 a AC-07.6.
- **Dependências:** T-39.
- **Arquivos prováveis:** tests/e2e/weather-errors.spec.ts.
- **Critérios de aceite:** fixtures/relógio reproduzem vazio, parcial, resposta malformada, rede, timeout e 429; nova tentativa recupera sem recarga. Sucesso/erro antigo não altera cidade nova; atualização oculta números e não restaura cache; gatilhos automáticos obedecem visibilidade/suspensão.
- **Verificação:** Playwright sem sleep fixo; verificar mensagens e número de chamadas antes/depois de cada evento controlado.

### T-44 — Verificar teclado e anúncios E2E
- **Tipo:** Test
- **Descrição:** automatizar a parte observável da acessibilidade da jornada.
- **Rastreabilidade:** RF-08; AC-08.2 a AC-08.6; RNF-03.
- **Dependências:** T-39.
- **Arquivos prováveis:** tests/e2e/weather-accessibility.spec.ts.
- **Critérios de aceite:** Tab/Enter completam busca, seleção, toggle, retry e atribuição; foco permanece previsível e nomes correspondem ao catálogo pt-BR. Estados possuem semântica de anúncio e erros estão associados ao campo; não declarar WCAG atendida só por estas asserções.
- **Verificação:** Playwright por roles/labels e inspeção de foco/semântica; percepção real de leitor de tela é verificada em T-45.

## Entrega 8 — Hardening e Operação

### T-37 — Aplicar o layout responsivo e foco visível
- **Tipo:** UI
- **Descrição:** criar e conectar os estilos globais, aplicando o tema existente aos componentes já compostos.
- **Rastreabilidade:** RF-08; RNF-01, RNF-03.
- **Dependências:** T-40, T-41, T-44.
- **Arquivos prováveis:** src/index.css; src/main.tsx.
- **Critérios de aceite:** tema dark glassmorphism preservado; em 320, 375, 768, 1024, 1440 e 1920 CSS px não há corte, sobreposição ou rolagem horizontal; zoom 200% mantém controles operáveis e foco não encoberto.
- **Verificação:** inspeção nos estados inicial, carregando, sucesso, parcial, vazio e erro. Se forem necessárias alterações em mais de um componente, criar tarefa UI específica antes de ampliá-la.

### T-42 — Verificar viewport e layout mobile
- **Tipo:** Test
- **Descrição:** automatizar a ausência de overflow e registrar inspeção visual.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-08; RNF-01, RNF-10.
- **Dependências:** T-37, T-39, T-40.
- **Arquivos prováveis:** tests/e2e/weather-layout.spec.ts.
- **Critérios de aceite:** em 320/375/768/1024/1440/1920 px, testar estados e orientação; largura rolável não excede viewport, textos e controles essenciais têm caixas visíveis e sem sobreposição. Jornada mobile funciona por toque e a inspeção de capturas é registrada, não inferida apenas de DOM.
- **Verificação:** Playwright com screenshots e medidas de layout, mais inspeção de zoom real a 200% na avaliação manual T-45.

### T-43 — Verificar segurança e ausência de persistência
- **Tipo:** Test
- **Descrição:** exercitar entradas/respostas não confiáveis e inspecionar armazenamento/rede.
- **Rastreabilidade:** RF-01, RF-04, RF-08; AC-04.6, AC-08.1; RNF-08, RNF-11.
- **Dependências:** T-37, T-39.
- **Arquivos prováveis:** tests/e2e/weather-security.spec.ts.
- **Critérios de aceite:** nomes contendo marcação e manipuladores não executam scripts ou navegação; hosts permanecem previstos; recarga perde cidade/unidade; nenhum dado de uso é enviado a telemetria própria ou gravado em local/sessionStorage, IndexedDB ou cookies pela aplicação.
- **Verificação:** interceptar rede, observar execução e inspecionar armazenamento após jornada; registros externos são avaliados separadamente em T-50.

### T-45 — Auditar acessibilidade e navegadores reais
- **Tipo:** Test
- **Descrição:** registrar evidência que emulação e testes DOM não fornecem.
- **Rastreabilidade:** RF-08; AC-08.4, AC-08.5; RNF-01, RNF-03, RNF-10.
- **Dependências:** T-42, T-44.
- **Arquivos prováveis:** plans/weather-app-plan.md.
- **Critérios de aceite:** matriz registra versões/sistemas atual e anterior previstos, Safari/iOS, Chrome/Android, NVDA/Firefox e VoiceOver/Safari; jornada/estados, contraste, foco, zoom 200% e anúncios avaliados. Cada item tem resultado e evidência; itens sem ambiente disponível ficam pendentes, nunca passam por equivalência com WebKit.
- **Verificação:** relatório de auditoria identifica violações, responsável e decisão de correção; RNF-03 só fecha sem não conformidades AA conhecidas no escopo auditado.

### T-46 — Medir o orçamento de desempenho
- **Tipo:** Test
- **Descrição:** reproduzir a medição de latência aprovada da spec.
- **Rastreabilidade:** RF-01, RF-02, RF-03; RNF-04.
- **Dependências:** T-37, T-39, T-40.
- **Arquivos prováveis:** tests/e2e/weather-performance.spec.ts; plans/weather-app-plan.md.
- **Critérios de aceite:** cem medições por operação após aquecimento, resposta controlada em 500 ms e ambiente de referência registrado; p95 é o 95º valor ordenado e <=2 s. Separar medições reais do provedor, sem atribuir a ele garantia do benchmark.
- **Verificação:** relatório com amostras e cálculo reproduzível; ambiente diferente exige aprovação explícita, não resultado comparado silenciosamente.

### T-47 — Avaliar metas de usabilidade
- **Tipo:** Test
- **Descrição:** medir as jornadas das personas com participantes, sem substituir por teste de clique.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-04; RNF-02.
- **Dependências:** T-37, T-40.
- **Arquivos prováveis:** plans/weather-app-plan.md.
- **Critérios de aceite:** cinco participantes por jornada de Mariana/Rafael, ao menos quatro sem ajuda em <=30 s e <=60 s respectivamente; Alex troca unidade em uma ação. Registrar protocolo, tempos e resultados sem incluir dados pessoais desnecessários; ausência de participantes deixa avaliação pendente.
- **Verificação:** relatório anonimizado com resultados individuais e cálculo do atendimento das metas.

### T-48 — Definir monitoramento e responsabilidades
- **Tipo:** Infra
- **Descrição:** tornar operacional a medição de disponibilidade e seus limites.
- **Rastreabilidade:** RF-01, RF-02, RF-03; RNF-05; OQ-10.
- **Dependências:** T-02, T-37, T-40.
- **Arquivos prováveis:** plans/weather-app-plan.md.
- **Critérios de aceite:** registrar hospedagem aprovada, responsável, orçamento, origem da sonda e periodicidade de 5 min; separar página/jornada com provedor controlado da consulta real externa. Incluir falhas/manutenção e fórmula do percentual; não afirmar 99,9% sem janela medida.
- **Verificação:** revisão operacional e execução de uma sonda de sucesso e outra de falha com registro de horários e classificação.

### T-49 — Configurar publicação estática em ambiente de avaliação
- **Tipo:** Infra
- **Descrição:** publicar o build por HTTPS na hospedagem aprovada, sem promover produção implicitamente.
- **Rastreabilidade:** RF-08; RNF-05, RNF-11.
- **Dependências:** T-38, T-48.
- **Arquivos prováveis:** .github/workflows/deploy.yml; plans/weather-app-plan.md.
- **Critérios de aceite:** build publicado funciona sob VITE_BASE aprovado, recursos carregam sem 404 e todas as chamadas usam HTTPS; nenhuma credencial de usuário/API é introduzida. Reutilizar workflow existente se houver; upload/download de artifacts, quando usados, são v4 ou superior.
- **Verificação:** execução de pipeline e navegação no URL de avaliação, com evidência de base path, rede e ausência de promoção não aprovada.

### T-50 — Auditar o fluxo de dados externo
- **Tipo:** Test
- **Descrição:** completar a avaliação de privacidade da aplicação, hospedagem e provedor.
- **Rastreabilidade:** RF-01, RF-08; RNF-08, RNF-09, RNF-11; OQ-12, OQ-13.
- **Dependências:** T-43, T-49.
- **Arquivos prováveis:** plans/weather-app-plan.md.
- **Critérios de aceite:** inventariar IP, termos, coordenadas e metadados transmitidos, hosts, finalidade e retenção externa conhecida; identificar lacunas de informação ao usuário e responsáveis. Confirmar ausência de armazenamento/telemetria próprios; retenção desconhecida não é documentada como inexistente.
- **Verificação:** inspeção de rede e confronto com configurações e termos, com resultado explícito aprovado, reprovado ou pendente.

### T-52 — Medir disponibilidade na janela operacional
- **Tipo:** Test
- **Descrição:** produzir a evidência mensal que não existe antes de operar o ambiente.
- **Rastreabilidade:** RF-01, RF-02, RF-03; RNF-05.
- **Dependências:** T-48, T-49.
- **Arquivos prováveis:** plans/weather-app-plan.md.
- **Critérios de aceite:** relatório de um mês com sondagens a cada 5 min, sucessos, falhas e manutenção; percentual da aplicação >=99,9% e sucesso externo medido separadamente. Janela incompleta permanece pendente; eventual política de liberação inicial exige revisão explícita de OQ-10, não evidência fictícia.
- **Verificação:** relatório exportado do monitoramento e cálculo reproduzível, entregue como entrada para a auditoria final T-51.

### T-51 — Auditar rastreabilidade e prontidão da entrega
- **Tipo:** Test
- **Descrição:** verificar se o conjunto implementado tem evidências suficientes, sem declarar produção pronta por checklist vazio.
- **Rastreabilidade:** RF-01 a RF-08; RNF-01 a RNF-11.
- **Dependências:** T-38, T-40, T-41, T-42, T-43, T-44, T-45, T-46, T-47, T-48, T-49, T-50, T-52.
- **Arquivos prováveis:** tasks/weather-app-tasks.md; plans/weather-app-plan.md.
- **Critérios de aceite:** cada um dos 51 AC tem teste/evidência referenciado e resultado; pnpm lint/build/test/test:e2e têm código zero. Cada RNF e OQ tem evidência ou bloqueio declarado; incorporar o relatório mensal de T-52, ou a revisão formal do requisito antes de considerá-lo atendido. A revisão não autoriza lançamento enquanto gates da spec não forem atendidos ou formalmente revisados.
- **Verificação:** conferir matriz, relatórios, comandos e bloqueios; tarefas não executadas não podem ser marcadas concluídas.

## Prioridade e Tamanho

P0 = caminho crítico até uma fatia funcional e seus critérios centrais. P1 = hardening/evidências para prontidão; continua obrigatório quando exigido pela spec. P2 = atividade que precisa amadurecer ao longo da operação; não é removida do escopo e continua ligada ao gate de T-51. Tamanho P/M/G representa esforço relativo da tarefa, não quantidade de arquivos; o limite de até dois arquivos prováveis permanece.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | G |
| T-03 | P0 | M |
| T-04 | P0 | M |
| T-05 | P0 | P |
| T-06 | P0 | M |
| T-07 | P0 | G |
| T-08 | P0 | M |
| T-09 | P0 | P |
| T-10 | P0 | M |
| T-11 | P0 | G |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P0 | M |
| T-17 | P0 | M |
| T-18 | P0 | M |
| T-19 | P0 | M |
| T-20 | P0 | M |
| T-21 | P0 | G |
| T-22 | P0 | M |
| T-23 | P0 | M |
| T-24 | P0 | G |
| T-25 | P0 | G |
| T-26 | P0 | M |
| T-27 | P0 | M |
| T-28 | P0 | M |
| T-29 | P0 | M |
| T-30 | P0 | P |
| T-31 | P0 | M |
| T-32 | P0 | M |
| T-33 | P0 | P |
| T-34 | P0 | M |
| T-35 | P0 | M |
| T-36 | P0 | G |
| T-37 | P1 | M |
| T-38 | P0 | M |
| T-39 | P1 | M |
| T-40 | P0 | G |
| T-41 | P0 | G |
| T-42 | P1 | G |
| T-43 | P1 | G |
| T-44 | P0 | M |
| T-45 | P1 | G |
| T-46 | P1 | G |
| T-47 | P1 | G |
| T-48 | P1 | M |
| T-49 | P1 | M |
| T-50 | P0 | G |
| T-51 | P0 | G |
| T-52 | P2 | G |
| T-53 | P0 | P |
| T-54 | P0 | M |

## Sequência de Fatias Verticais

Executar as IDs abaixo respeitando a ordem da lista e as dependências individuais. Cada fatia termina em resultado demonstrável; validação por fixtures não substitui os gates de release.

| Fatia | Tarefas na sequência | Resultado visível/verificável |
| --- | --- | --- |
| 0. Fundamentos aprovados | T-01 → T-02 → T-03 → T-04 → T-05/T-06/T-07/T-08 → T-09/T-10/T-53 | Baseline e contrato externo registrados; tipos e funções puras cobertos por testes focados. |
| 1. Buscar e selecionar cidade | T-11 → T-13 → T-12/T-14 → T-20 → T-21 → T-22 → T-28 → T-29 → T-54 | Primeira tela executável: pesquisar, distinguir resultados, ver estados loading/erro/vazio/sucesso e selecionar cidade; sem depender do forecast. |
| 2. Clima atual, previsão e unidade | T-15 → T-16 → T-17 → T-18/T-19 → T-23 → T-24 → T-25 → T-26/T-27 → T-30/T-31/T-32/T-33 → T-34/T-35 → T-36 → T-38 | Jornada completa com clima atual, cinco dias locais, conversão derivada, atualização e estados de recuperação verificados. |
| 3. E2E da aplicação | T-39 → T-40/T-41/T-44 | Fluxos principal, erro/concorrência e teclado executados em navegador, com APIs interceptadas e viewport mobile. |
| 4. Hardening e prontidão | T-37 → T-42/T-43 → T-45/T-46/T-47/T-48 → T-49 → T-50 → T-52 → T-51 | Layout, segurança, acessibilidade, desempenho, usabilidade, operação e gates documentados; disponibilidade medida no período exigido antes de fechar prontidão. |

**Primeiro incremento visível:** a fatia 1 publica a busca e seleção antes de concluir a integração meteorológica. T-54 compõe essa primeira experiência; T-36 amplia a mesma aplicação para a jornada completa. P2/T-52 deve começar assim que T-48 e T-49 permitirem, em paralelo com atividades compatíveis, pois a janela mensal não pode ser encurtada por priorização.

## Prioridade e Tamanho

**P0** = caminho crítico até uma fatia funcional e seus critérios centrais. **P1** = hardening/evidências necessárias para prontidão; prioridade menor não torna requisitos da spec opcionais. **P2** = evidência operacional que precisa amadurecer ao longo do tempo; continua necessária para fechar T-51 conforme OQ-10. **P** = esforço pequeno e localizado; **M** = moderado, em até dois arquivos prováveis; **G** = maior complexidade de coordenação, estados ou observação, ainda respeitando o limite de arquivos.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | G |
| T-03 | P0 | M |
| T-04 | P0 | M |
| T-05 | P0 | P |
| T-06 | P0 | M |
| T-07 | P0 | G |
| T-08 | P0 | M |
| T-09 | P0 | P |
| T-10 | P0 | M |
| T-11 | P0 | G |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P0 | M |
| T-17 | P0 | M |
| T-18 | P0 | M |
| T-19 | P0 | M |
| T-20 | P0 | M |
| T-21 | P0 | G |
| T-22 | P0 | M |
| T-23 | P0 | M |
| T-24 | P0 | G |
| T-25 | P0 | G |
| T-26 | P0 | M |
| T-27 | P0 | M |
| T-28 | P0 | M |
| T-29 | P0 | M |
| T-30 | P0 | P |
| T-31 | P0 | M |
| T-32 | P0 | M |
| T-33 | P0 | P |
| T-34 | P0 | M |
| T-35 | P0 | M |
| T-36 | P0 | G |
| T-37 | P1 | M |
| T-38 | P0 | M |
| T-39 | P0 | M |
| T-40 | P0 | G |
| T-41 | P0 | G |
| T-42 | P1 | G |
| T-43 | P1 | G |
| T-44 | P0 | M |
| T-45 | P1 | G |
| T-46 | P1 | G |
| T-47 | P1 | G |
| T-48 | P1 | M |
| T-49 | P1 | M |
| T-50 | P0 | G |
| T-51 | P0 | G |
| T-52 | P2 | G |
| T-53 | P0 | P |
| T-54 | P0 | M |

## Sequência de Fatias Verticais

As setas indicam dependência sequencial; tarefas entre parênteses podem ocorrer em paralelo quando suas dependências individuais estiverem concluídas. IDs permanecem estáveis. P2 descreve tempo de maturação, não permissão para ignorar o requisito.

| Fatia | Sequência sugerida | Entrega demonstrável |
| --- | --- | --- |
| 0. Fundamentos | T-01 → (T-02, T-03) → T-04 → (T-05, T-06, T-07, T-08) → (T-09, T-10, T-53) | Decisões/contrato registrados; tipos e funções puras com testes focados. |
| 1. Busca visível | T-11 → (T-12, T-13) → (T-14, T-20) → T-21 → (T-22, T-28) → T-29 → T-54 | Aplicação executável para buscar, distinguir, selecionar e exibir uma cidade; vazio/erro acessíveis; nenhum request de forecast ainda. É a primeira entrega visível. |
| 2. Clima, previsão e unidade | T-15 → T-16 → T-17 → (T-18, T-19, T-23) → T-24 → T-25 → (T-26, T-27, T-30, T-31, T-32, T-33) → (T-34, T-35) → T-36 → T-38 | Jornada completa com clima atual, cinco dias locais, conversão derivada, atualização e estados completos/parciais/erro. |
| 3. E2E | T-39 → (T-40, T-41, T-44) | Fluxo principal e recuperação testados em desktop/mobile com APIs interceptadas. |
| 4. Hardening | T-37 → (T-42, T-43, T-46, T-47, T-48) → (T-45 após T-42; T-49 após T-48) → (T-50 após T-43/T-49; T-52 após T-48/T-49) → T-51 | Responsividade, segurança, acessibilidade, desempenho, usabilidade, operação e gates avaliados. T-52 precisa da janela mensal; iniciá-la assim que T-48/T-49 permitirem. |

**Tamanho por fatia:** fatia 0 é curta, embora T-02/T-07 tenham incerteza alta; fatia 1 é a menor entrega visível; fatia 2 é a maior por combinar API temporal, atualização e UI; fatia 3 é controlada por mocks; fatia 4 tem atividades paralelas, mas inclui a janela temporal de T-52.

## Matriz RF → Tarefas

Tarefas **Implementação** criam comportamento; **Verificação** comprova critérios e não substitui implementação. T-04 define contratos compartilhados. T-01 a T-03 são pré-requisitos gerais, omitidos das linhas para manter o foco funcional.

| Requisito funcional | Tarefas de implementação | Tarefas de verificação | Lacuna |
| --- | --- | --- | --- |
| RF-01 — Buscar e selecionar cidades | T-05 valida entrada; T-13 adapta geocoding; T-20/T-21 orquestram busca; T-28 apresenta resultados; T-54 entrega busca antes do forecast; T-36 completa a jornada. | T-09, T-14, T-22, T-29, T-40. | Nenhuma identificada. |
| RF-02 — Exibir clima atual | T-08 traduz condições; T-15 normaliza dados atuais; T-17 fornece consulta; T-23/T-24 guardam e atualizam estado; T-30/T-32 apresentam clima e referência; T-36 integra. | T-10, T-18, T-26, T-34, T-35, T-38, T-40. | Nenhuma identificada. |
| RF-03 — Previsão de hoje e quatro dias | T-07 trata datas/fusos; T-08 traduz condições; T-16 normaliza os cinco dias; T-17 consulta; T-23/T-25 mantêm e atualizam estado; T-31/T-32 apresentam previsão/período; T-36 integra. | T-10, T-19, T-26, T-27, T-34, T-38, T-40. | Nenhuma identificada. |
| RF-04 — Alternar Celsius/Fahrenheit | T-06 converte/formata; T-30/T-31 derivam a apresentação; T-33 controla seleção; T-36 mantém Unit e evita novo request. | T-53, T-34, T-35, T-38, T-40. | Nenhuma identificada. |
| RF-05 — Estados inicial, loading, sucesso, vazio e erro | T-20/T-21 modelam estados da busca; T-23/T-24 modelam resultado meteorológico; T-28/T-32 apresentam estados; T-54 compõe a busca isolada; T-36 completa a jornada. | T-22, T-26, T-29, T-35, T-38, T-41. | Nenhuma identificada. |
| RF-06 — Falhas, timeout e concorrência | T-11 classifica transporte; T-21/T-24 protegem operações concorrentes; T-25 suspende atualização automática após falha; T-32 apresenta retry/bloqueio; T-36 integra. | T-12, T-22, T-26, T-27, T-35, T-38, T-41. | Nenhuma identificada. |
| RF-07 — Referências temporais e atualização | T-07 formata datas/fusos; T-15/T-17 produzem referências e consultedAt; T-25 agenda atualização; T-32 apresenta horários/ação Atualizar; T-36 integra. | T-10, T-18, T-19, T-26, T-27, T-35, T-38, T-41. | Nenhuma identificada. |
| RF-08 — pt-BR, sem conta, acessível e com atribuição | T-08 fornece catálogo; T-28/T-30/T-31/T-32/T-33 apresentam textos e controles; T-32 apresenta atribuição; T-36 oferece jornada sem conta; T-37 aplica estilos/foco. | T-10, T-29, T-35, T-38, T-40, T-44, T-45. | Nenhuma identificada; auditoria manual continua sendo gate, não implementação. |

**Resultado da análise:** todos os RF-01 a RF-08 têm pelo menos uma tarefa de implementação, distinta das tarefas de teste. A matriz indica cobertura planejada, não tarefas concluídas; a auditoria de acessibilidade/navegadores e outras evidências de release permanecem sujeitas aos critérios dos RNFs e às aprovações pendentes.

## Matriz de Cobertura Planejada

Associação não significa execução. Tarefas UI/Data implementam recortes; tarefas Test comprovam os critérios completos. RNF-01, RNF-03, RNF-08, RNF-10 e RNF-11 também se aplicam transversalmente conforme a spec.

| História / requisito | Critérios da spec | Evidência principal planejada |
| --- | --- | --- |
| US-01 / RF-01 | AC-01.1 a AC-01.8 | T-09, T-14, T-22, T-29, T-40. |
| US-02 / RF-02 | AC-02.1 a AC-02.5 | T-18, T-34, T-40. |
| US-03 / RF-03 | AC-03.1 a AC-03.6 | T-10, T-19, T-34, T-40. |
| US-04 / RF-04 | AC-04.1 a AC-04.6 | T-53, T-34, T-35, T-38, T-40. |
| US-05 / RF-05 | AC-05.1 a AC-05.6 | T-19, T-22, T-26, T-29, T-35, T-41. |
| US-06 / RF-06 | AC-06.1 a AC-06.8 | T-12, T-22, T-26, T-27, T-41. |
| US-07 / RF-07 | AC-07.1 a AC-07.6 | T-10, T-18, T-26, T-27, T-35, T-41. |
| US-08 / RF-08 | AC-08.1 a AC-08.6 | T-10, T-29, T-35, T-38, T-40, T-44, T-45. |

| Requisito não funcional | Evidência específica planejada |
| --- | --- |
| RNF-01 | T-42, T-45. |
| RNF-02 | T-40, T-47. |
| RNF-03 | T-29, T-35, T-44, T-45. |
| RNF-04 | T-46. |
| RNF-05 | T-48, T-49, T-52. |
| RNF-06 | T-10, T-18, T-27. |
| RNF-07 | T-12, T-22, T-26, T-27, T-41. |
| RNF-08 | T-43, T-50. |
| RNF-09 | T-02, T-40, T-50. |
| RNF-10 | T-39, T-42, T-45. |
| RNF-11 | T-14, T-43, T-49, T-50. |