# Weather App — Especificação de Produto

## Overview

- **Fonte:** [Discovery](discovery.md).
- **Status:** rascunho para validação de produto; não representa aprovação das perguntas pendentes.
- **Objetivo:** permitir que usuários encontrem uma cidade, consultem o clima atual e a previsão de cinco dias e alternem a unidade de temperatura.
- **Experiência esperada:** consulta compreensível e acessível em celulares e outras telas, com indicação clara da localização e das condições dos dados apresentados.
- **Público:** usuários finais que consultam o tempo para organizar atividades cotidianas ou viagens. Persona prioritária e métricas de sucesso ainda dependem de validação (OQ-01).
- **Jornada principal:** pesquisar cidade → selecionar local → consultar clima atual e previsão → alternar Celsius/Fahrenheit quando necessário.

### Decisões confirmadas

| Origem | Decisão |
| --- | --- |
| D-01 | Open-Meteo como fonte de geocoding e previsão, sem API key. |
| D-02 | Cinco dias correspondem a hoje e aos quatro dias seguintes, não a 120 horas futuras. |
| D-03 | Celsius como unidade padrão, com alternância para Fahrenheit. |
| D-04 | Sem autenticação e sem persistência de dados da aplicação em servidor. |
| D-05 | Interface em pt-BR. |

Os RF-01 a RF-04 preservam os requisitos do discovery. Os RF-05 a RF-08 detalham comportamentos derivados de seus requisitos não funcionais e decisões. Os critérios abaixo propõem comportamentos verificáveis; detalhes que excedem as decisões confirmadas devem ser validados na aprovação desta especificação. Questões não resolvidas não são decisões implícitas.

## Functional Requirements

| ID | Requisito | Origem | História | Critérios |
| --- | --- | --- | --- | --- |
| RF-01 | Permitir pesquisar cidades e selecionar uma localização específica antes de consultar seu clima. Identificar resultados de modo a distinguir homônimos com região e país, quando disponíveis. | RF-01, R-01 | US-01 | AC-01.1 a AC-01.4 |
| RF-02 | Exibir clima atual da cidade selecionada, incluindo temperatura e condição meteorológica, com identificação da localização. Campos adicionais dependem de OQ-04. | RF-02 | US-02 | AC-02.1 a AC-02.3 |
| RF-03 | Exibir a previsão para hoje e os quatro dias seguintes, com identificação das datas e sem confundir esses dados com o clima atual. Granularidade, campos e fuso dependem de OQ-05. | RF-03, D-02 | US-03 | AC-03.1 a AC-03.3 |
| RF-04 | Iniciar em Celsius na ausência de preferência aplicável e permitir alternar entre Celsius e Fahrenheit, atualizando todas as temperaturas exibidas sem alterar cidade ou período. Persistência da preferência depende de OQ-06. | RF-04, D-03 | US-04 | AC-04.1 a AC-04.4 |
| RF-05 | Distinguir os estados inicial, carregando, sucesso e vazio em buscas e consultas. Não apresentar ausência de consulta como falha nem ausência de dados como temperatura zero. | RNF-02, RNF-07 | US-05 | AC-05.1 a AC-05.3 |
| RF-06 | Comunicar falhas de conexão ou do provedor, permitir nova tentativa e impedir que resultados obsoletos sejam apresentados como pertencentes à seleção mais recente. | RNF-07, R-02 | US-06 | AC-06.1 a AC-06.4 |
| RF-07 | Exibir o horário de referência de cada conjunto meteorológico apresentado. Se dados em cache forem autorizados e exibidos, identificá-los e informar sua última atualização. | RNF-06, RNF-07 | US-07 | AC-07.1 a AC-07.3 |
| RF-08 | Oferecer a jornada sem login, com textos, controles e mensagens próprios da aplicação em pt-BR. | D-04, D-05 | US-08 | AC-08.1 a AC-08.3 |

## User Stories

- **US-01:** Como Rafael, viajante de curta duração, quero buscar meu destino e distinguir cidades homônimas para planejar a viagem com os dados da localização correta. **Requisito: RF-01.**
- **US-02:** Como Mariana, usuária com rotina urbana, quero consultar a temperatura e a condição atual da minha cidade pelo celular para decidir o que vestir antes de sair. **Requisito: RF-02.**
- **US-03:** Como Rafael, viajante de curta duração, quero consultar a previsão de hoje e dos quatro dias seguintes para preparar a mala e organizar meus passeios. **Requisito: RF-03.**
- **US-04:** Como Alex, usuário habituado a Fahrenheit, quero alternar as temperaturas exibidas de Celsius para Fahrenheit para interpretar o clima na unidade que uso no cotidiano. **Requisito: RF-04.**
- **US-05:** Como Mariana, usuária com rotina urbana, quero distinguir uma consulta em carregamento de uma busca sem resultados para saber se devo aguardar ou corrigir a busca antes de sair. **Requisito: RF-05.**
- **US-06:** Como Mariana, usuária com rotina urbana, quero entender uma falha de conexão e tentar a consulta novamente para obter o clima da minha cidade mesmo após uma interrupção da rede. **Requisito: RF-06.**
- **US-07:** Como Rafael, viajante de curta duração, quero identificar o horário de referência dos dados e seu eventual uso de cache para avaliar se estão atualizados antes de organizar meus passeios. **Requisito: RF-07.**
- **US-08:** Como Mariana, usuária com rotina urbana, quero consultar o tempo em português brasileiro sem criar uma conta para acessar as informações diretamente durante minha rotina da manhã. **Requisito: RF-08.**

As histórias usam as personas registradas no [discovery](discovery.md#personas), ainda como hipóteses a validar. Cada história mantém seu vínculo com os critérios de aceite existentes; a persona prioritária permanece pendente em OQ-01.

## Acceptance Criteria

Cada linha abaixo representa um cenário Given/When/Then: precondições, ação ou evento e resultados observáveis. Todos os resultados da mesma linha devem ser verificados. Os exemplos usam relógio, respostas e ordem de conclusão controlados, sem depender do clima real ou de uma API externa disponível. Cada conjunto meteorológico deve ser associado à cidade correspondente no cenário.

Datas, temperaturas, cidades e horários dos exemplos são dados de teste, não novas decisões de produto. Os rótulos citados como indicação de estado descrevem seu significado; não exigem um texto literal, salvo unidades e valores explícitos.

**Dependências para automação:** AC-03.1 e AC-03.3 verificam a janela de datas com uma data de referência fixada no teste; a política real de fuso de AC-03.2 ainda depende de OQ-05. AC-06.4 depende do timeout de OQ-08. AC-07.3 só é aplicável se cache for aprovado em OQ-08. Esses cenários condicionados não devem ser considerados aprovados por usar parâmetros arbitrários nos testes. Conteúdo meteorológico adicional e arredondamento continuam pendentes em OQ-04 a OQ-06; os exemplos inteiros de conversão abaixo não escolhem uma precisão decimal.

### US-01 / RF-01 — Busca e seleção

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-01.1 | Nenhuma cidade está selecionada e uma busca por Campinas tem resposta controlada com Campinas, São Paulo, Brasil. | O usuário pesquisa Campinas e a busca termina com sucesso. | O resultado exibe Campinas, São Paulo e Brasil e está disponível para seleção; os dados meteorológicos desse resultado não são apresentados antes da seleção. |
| AC-01.2 | A resposta da busca contém duas cidades chamadas Santa Maria: uma no Rio Grande do Sul, Brasil, e outra na Califórnia, Estados Unidos. | A busca termina com sucesso. | Dois resultados selecionáveis são apresentados, cada um com Santa Maria, sua respectiva região e seu país. |
| AC-01.3 | Os dois resultados de AC-01.2 estão disponíveis e têm respostas meteorológicas distintas: 20 °C para a cidade brasileira e 10 °C para a cidade dos Estados Unidos. | O usuário seleciona Santa Maria, Califórnia, Estados Unidos, e a consulta termina com sucesso. | A localização selecionada é identificada como a cidade dos Estados Unidos e sua temperatura é 10 °C; os 20 °C da outra cidade não são apresentados como dados da seleção. |
| AC-01.4 | Nenhuma cidade está selecionada e o campo de busca está vazio ou contém apenas espaços; cada entrada é verificada separadamente. | O usuário tenta iniciar a pesquisa. | Nenhuma cidade é selecionada, nenhuma consulta meteorológica é iniciada e nenhum resultado meteorológico é apresentado para essa entrada. |

### US-02 / RF-02 — Clima atual

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-02.1 | Campinas está selecionada, Celsius está ativo e a resposta contém temperatura atual de 20 °C e condição de céu limpo. | A consulta termina com sucesso. | O clima atual exibe Campinas, 20 °C e uma descrição de céu limpo em pt-BR. |
| AC-02.2 | A cidade selecionada tem temperatura atual de 0 °C, e as temperaturas da previsão são diferentes de zero. | A consulta termina com sucesso em Celsius; o cenário também é executado com temperatura atual de -5 °C. | A área de clima atual exibe respectivamente 0 °C e -5 °C, sem substituir esses valores por temperaturas da previsão ou por indicação de dado ausente. |
| AC-02.3 | A resposta não contém uma temperatura atual válida: o campo está ausente, nulo ou contém um valor não numérico; cada caso é verificado separadamente. | A resposta é processada para a cidade selecionada. | A indisponibilidade da temperatura atual é indicada e nenhum número substituto é apresentado como temperatura atual. A apresentação de outros campos ou de erro do conjunto depende da política de sucesso parcial de OQ-04. |

### US-03 / RF-03 — Cinco dias

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-03.1 | A data de referência controlada é 27/10/2026 e há dados completos para hoje e os quatro dias seguintes. | A previsão da cidade selecionada é apresentada. | O período contém exatamente as datas 27/10/2026, 28/10/2026, 29/10/2026, 30/10/2026 e 31/10/2026, nessa ordem, sem datas duplicadas e identificado como previsão, não como clima atual. |
| AC-03.2 | O fuso de referência foi aprovado em OQ-05 e, no instante controlado do teste, nele é 27/10/2026, enquanto no dispositivo é 28/10/2026. | A previsão é apresentada. | A primeira data é 27/10/2026 e a última é 31/10/2026, seguindo o fuso aprovado, não a data do dispositivo. |
| AC-03.3 | A data de referência é 27/10/2026 e a resposta contém dados distintos para 27, 28, 30 e 31/10 e 01/11/2026, mas nenhum dado para 29/10/2026. | A previsão é apresentada. | A janela continua de 27 a 31/10/2026; 29/10 indica indisponibilidade, as outras quatro datas mantêm seus próprios dados e 01/11 não é incluído para preencher a lacuna. |

A lista de campos e a granularidade da previsão terão critérios adicionais após OQ-05; esta especificação não presume mínimas, máximas, precipitação ou intervalos horários como decisões aprovadas.

### US-04 / RF-04 — Unidades

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-04.1 | É a primeira visita, não há preferência aplicável e os dados da cidade selecionada estão disponíveis. | As temperaturas são apresentadas sem interação com o seletor de unidade. | Celsius está selecionado e todas as temperaturas visíveis são identificadas por °C. |
| AC-04.2 | O clima atual e a previsão estão visíveis em Celsius e as temperaturas de teste são 0 °C e 20 °C, distribuídas entre os conjuntos. | O usuário seleciona Fahrenheit. | Todas as temperaturas visíveis passam a °F, com 0 °C representado por 32 °F e 20 °C por 68 °F; nenhuma temperatura desses conjuntos permanece em °C. |
| AC-04.3 | A cidade, as datas, as condições e os valores não relacionados à temperatura estão registrados antes da troca. | O usuário alterna de Celsius para Fahrenheit. | Cidade selecionada, datas, condições e valores não relacionados à temperatura são iguais aos registrados antes da troca. |
| AC-04.4 | O mesmo conjunto de dados contém 0 °C, 20 °C e -5 °C, sem receber nova atualização meteorológica. | O usuário alterna de Celsius para Fahrenheit e volta a Celsius, repetindo esse ciclo dez vezes. | Após cada retorno, os valores exibidos são 0 °C, 20 °C e -5 °C nos mesmos campos, sem variação entre os ciclos. Casos com casas decimais serão complementados após OQ-06. |

### US-05 / RF-05 — Estados da consulta

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-05.1 | A aplicação é aberta sem cidade selecionada e nenhuma consulta foi iniciada. | A tela inicial termina de carregar. | A busca está disponível, não há indicador de consulta em andamento, erro de consulta nem dados meteorológicos de uma cidade não escolhida. |
| AC-05.2 | Uma busca ou consulta meteorológica foi iniciada e sua resposta está retida pelo teste. | A operação permanece pendente e depois recebe um desfecho controlado: sucesso, vazio ou erro, verificados separadamente quando aplicáveis. | Enquanto pendente, a operação tem indicação de carregamento; após o desfecho, essa indicação desaparece e o resultado, estado vazio ou erro correspondente é exibido. |
| AC-05.3 | Uma busca tem resposta de sucesso com zero resultados. | A busca termina e o usuário edita o termo e inicia outra busca com resultado válido. | Primeiro é exibida a indicação de nenhuma cidade encontrada, sem mensagem de falha de conexão; depois, o estado vazio é substituído pelos resultados da nova busca. |

### US-06 / RF-06 — Falhas e recuperação

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-06.1 | Uma busca ou consulta meteorológica está pendente. | Ela termina com falha de rede ou erro do provedor, incluindo limite de requisições; cada falha é verificada separadamente. | O carregamento termina, uma mensagem em pt-BR informa que não foi possível concluir a operação e há uma ação para tentar novamente; stack trace e resposta técnica bruta não são usados como mensagem principal. |
| AC-06.2 | Uma operação falhou e sua ação de nova tentativa está disponível. | O usuário solicita nova tentativa e a mesma busca ou consulta recebe resposta válida. | O resultado correspondente é exibido, a mensagem de erro e o carregamento desaparecem e a página não é recarregada. |
| AC-06.3 | A consulta de Campinas foi iniciada, depois o usuário selecionou Curitiba, e Curitiba já apresenta sua resposta controlada de 10 °C. | A resposta atrasada de Campinas chega com 20 °C. | Curitiba permanece selecionada com 10 °C e os dados apresentados para Curitiba não são substituídos pelos de Campinas. |
| AC-06.4 | O limite de espera T foi aprovado em OQ-08 e uma operação não recebe resposta. | O relógio controlado avança até o processamento da expiração de T. | O indicador de carregamento termina e são exibidos uma mensagem de falha e uma ação de nova tentativa; a operação não continua no estado de carregamento. |

### US-07 / RF-07 — Referência temporal

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-07.1 | A resposta de clima atual tem referência em 27/10/2026 às 09:00 UTC e a previsão tem período de 27 a 31/10/2026, com fuso UTC informado nos dados controlados. | Ambos os conjuntos são apresentados. | O clima atual tem sua referência temporal visível, a previsão tem seu período visível e cada referência é associada ao conjunto correspondente, com indicação do fuso da apresentação. Se houver conversão de fuso, o instante e as datas continuam correspondendo aos dados de origem. |
| AC-07.2 | A referência meteorológica é 27/10/2026 às 09:00 UTC e a consulta é concluída às 09:10 UTC. | O clima atual é apresentado com seu horário de referência. | A referência corresponde a 09:00 UTC, ou ao mesmo instante no fuso de apresentação, e não a 09:10 UTC; eventual horário de consulta é identificado separadamente, sem ser apresentado como atualização meteorológica. |
| AC-07.3 | A política de cache foi aprovada em OQ-08 e autoriza exibir um conjunto armazenado cuja última atualização conhecida é 27/10/2026 às 09:00 UTC. | Esse conjunto é apresentado sem nova atualização do provedor. | Uma indicação de dados armazenados está associada ao conjunto e sua última atualização conhecida corresponde a 09:00 UTC, com o fuso informado, sem atribuir a ele o horário de acesso como nova atualização. |

### US-08 / RF-08 — Acesso e idioma

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-08.1 | O usuário não possui conta nem sessão autenticada e as respostas das consultas são válidas. | Ele abre a aplicação, pesquisa, seleciona uma cidade, consulta o clima atual e a previsão e alterna para Fahrenheit. | A jornada é concluída sem solicitar cadastro, login, credenciais ou API key. |
| AC-08.2 | O teste possui um catálogo de textos e nomes acessíveis aprovados em pt-BR, e respostas controladas para cada estado. | Os estados inicial, carregando, sucesso, vazio e erro são apresentados, um por vez. | Os textos e nomes acessíveis próprios da aplicação correspondem ao catálogo pt-BR, incluindo condições meteorológicas; nomes próprios de localidades não são obrigados a ser traduzidos. |
| AC-08.3 | Os dados exibidos representam 27/10/2026 às 09:05 no fuso de apresentação informado. | A interface apresenta a data e o horário em formato numérico. | A data é apresentada como 27/10/2026 e o horário como 09:05, com indicação do fuso associado; a formatação não muda a data nem o instante representado. |

## Non-Functional Requirements

| ID | Requisito e forma de verificação | Status / pendência |
| --- | --- | --- |
| RNF-01 | Manter conteúdo essencial legível e controles utilizáveis em celulares e outras telas. Verificar ausência de sobreposição, corte e rolagem horizontal nas larguras aprovadas. | Faixa de 320 px a 1440 px é candidata, não aprovada; OQ-02. |
| RNF-02 | Permitir completar a jornada principal sem etapas de cadastro ou ações sem relação com a consulta. Validar com execução da jornada e avaliação com o público escolhido. | Meta de tempo e taxa de sucesso pendentes; OQ-01. |
| RNF-03 | Permitir operação por teclado, foco perceptível, nomes acessíveis dos controles e percepção dos estados com tecnologia assistiva; não depender exclusivamente de cor. | WCAG 2.2 AA é meta candidata; confirmar abrangência e matriz de avaliação em OQ-11. |
| RNF-04 | Medir tempos de busca e consulta separadamente, registrando condições de dispositivo e rede e distinguindo tempo total percebido do tempo atribuível à aplicação. | Até 2 s no percentil 95 é referência não aprovada; janela e método pendentes em OQ-09. |
| RNF-05 | Definir disponibilidade do produto, janela de medição e tratamento de falhas externas antes de assumir um compromisso operacional. | 99,9% mensal não é SLA aprovado nem garantia do Open-Meteo; OQ-10. |
| RNF-06 | Tornar verificável a referência temporal dos dados por RF-07 e definir idade máxima aceitável e gatilhos de atualização. | Limites e frequência pendentes; OQ-07. |
| RNF-07 | Tratar indisponibilidade, resposta incompleta e expiração da espera sem travamento nem atribuição de dados à cidade errada; verificar AC-02.3, AC-03.3 e AC-06.1 a AC-06.4. | Política de cache, timeout e recuperação parcial pendente; OQ-08. |
| RNF-08 | Não exigir API key do usuário, autenticação ou persistência dos dados da aplicação em servidor. Verificar a jornada e o desenho de tratamento de dados no plano. | Decisões confirmadas D-01 e D-04; armazenamento local e telemetria pendentes em OQ-06 e OQ-12. |
| RNF-09 | Usar Open-Meteo conforme condições aplicáveis ao uso pretendido, incluindo atribuição quando exigida. | Validar licença, cobertura, custo e limites antes de aprovar a integração; OQ-13. |

## Edge Cases

| Caso | Resultado esperado / regra pendente | Rastreabilidade |
| --- | --- | --- |
| Entrada vazia ou apenas espaços | Não iniciar consulta meteorológica nem selecionar cidade. | AC-01.4 |
| Nome com acentos, parcial ou em outro idioma | Cobertura e equivalência de busca precisam ser definidas; não prometer correspondências ainda não validadas. | OQ-03 |
| Cidades homônimas | Exibir região e país disponíveis para distinguir os resultados. | AC-01.2 |
| Resultado sem região ou sem país | Não inventar informação; definir identificação alternativa quando a distinção continuar insuficiente. | OQ-03 |
| Nenhuma cidade encontrada | Estado vazio distinto de erro, com possibilidade de corrigir a busca. | AC-05.3 |
| Troca rápida de cidade | Resposta antiga não substitui a seleção mais recente. | AC-06.3 |
| Falha de rede, erro do provedor ou limite de requisições | Mensagem compreensível e nova tentativa; política de tentativas automáticas permanece pendente. | AC-06.1, AC-06.2, OQ-08 |
| Provedor não conclui a resposta | Encerrar a espera conforme limite a aprovar; não manter carregamento infinito. | AC-06.4 |
| Campo meteorológico ausente ou inválido | Indicar indisponibilidade, sem usar zero como substituto; critérios de sucesso parcial pendentes. | AC-02.3, OQ-04, OQ-08 |
| Previsão com menos de cinco datas | Identificar lacunas sem deslocar a janela hoje + quatro dias. | AC-03.3 |
| Temperatura zero ou negativa | Tratar como valor válido quando fornecido validamente pelo provedor, com unidade correta. | AC-02.2, AC-04.2 |
| Usuário e cidade em fusos diferentes; virada do dia ou horário de verão | Datas seguem o fuso de referência a aprovar, não uma janela fixa de 120 horas. Gatilho de atualização na virada depende de OQ-07. | AC-03.1, AC-03.2, OQ-05 |
| Alternâncias repetidas de unidade | Não alterar localização, período ou acumular erros de conversão. | AC-04.3, AC-04.4 |
| Dados em cache após falha | Exibir apenas se a política for aprovada, com identificação e atualização conhecida. | AC-07.3, OQ-08 |
| Consulta por teclado ou leitor de tela | Controles e estados devem permanecer perceptíveis e operáveis. | RNF-03 |

## Assumptions

- **AS-01:** A primeira versão é acessível em navegador e utilizável em dispositivos móveis, conforme suposição do discovery. Não confirma PWA ou aplicativos nativos; validar OQ-02.
- **AS-02:** A consulta meteorológica depende da seleção de uma cidade específica; não há cidade inicial automática confirmada.
- **AS-03:** A alternância Celsius/Fahrenheit altera somente temperaturas, não localização, período, vento ou precipitação. A apresentação de outras grandezas depende dos campos aprovados.
- **AS-04:** Temperatura e descrição da condição constituem a proposta mínima para clima atual. A lista definitiva, inclusive campos adicionais e obrigatoriedade, depende de OQ-04.
- **AS-05:** As histórias usam Mariana, Rafael e Alex, personas candidatas registradas no discovery; não substituem validação de público nem aprovam sua priorização.
- **AS-06:** Disponibilidade e completude do provedor são dependências, não garantias. A fonte pode fornecer estimativas meteorológicas; a aplicação não promete observação em tempo real nem exatidão absoluta.
- **AS-07:** As metas numéricas, o padrão formal de acessibilidade e as regras explicitamente pendentes só se tornam compromissos após aprovação registrada.
- **AS-08:** Sem persistência de servidor não implica ausência de backend, cache local ou registros do provedor. Essas escolhas não estão autorizadas por inferência e devem respeitar OQ-06 e OQ-12.

## Risks

| ID | Risco e impacto | Mitigação proposta |
| --- | --- | --- |
| R-01 | Seleção de cidade homônima gera consulta do local errado. | Identificação regional, seleção explícita e validação das buscas de OQ-03. |
| R-02 | Falhas, limites ou condições de uso do provedor inviabilizam consultas ou o uso pretendido. | Validar OQ-13 e definir tratamento de falhas; não prometer SLA externo. |
| R-03 | Campos e granularidade indefinidos provocam retrabalho na experiência e nos contratos de dados. | Resolver OQ-04 e OQ-05 antes de aprovar esses contratos no plano. |
| R-04 | Mudança de plataforma ou matriz de suporte aumenta escopo e custo. | Aprovar OQ-02 antes de consolidar a arquitetura. |
| R-05 | Dados antigos ou datas calculadas no fuso errado induzem decisões equivocadas. | Referência temporal visível e aprovação de fuso, validade e atualização. |
| R-06 | Metas candidatas serem interpretadas como compromissos impede avaliação objetiva da entrega. | Aprovar critérios e condições de medição, mantendo status das pendências explícito. |
| R-07 | Persistência local, telemetria ou chamadas ao provedor expõem dados além do esperado pelo usuário. | Definir fluxo de dados e política de privacidade antes de introduzir coleta; considerar registros externos. |
| R-08 | Inclusão implícita de favoritos, alertas ou uso offline amplia o MVP. | Exigir decisão explícita de escopo e atualização desta especificação. |

## Out of Scope

### Exclusões confirmadas

- Cadastro, login, contas e funcionalidades dependentes de autenticação.
- Persistência de dados da aplicação em servidor, incluindo histórico pessoal e sincronização de preferências por conta.
- Interface multilíngue; a UI será em pt-BR. Isso não restringe automaticamente a cobertura geográfica.

### Não incluído nesta versão sem nova decisão de escopo

- Geolocalização automática, favoritos, alertas meteorológicos e notificações.
- Histórico meteorológico, mapas, radar e funcionalidades não descritas nos requisitos.
- Garantia de funcionamento offline, instalação como PWA e aplicativos nativos.
- Previsão além da janela de hoje e dos quatro dias seguintes.

Persistência local da unidade e eventual cache não são exclusões confirmadas nem funcionalidades aprovadas: permanecem pendentes. Esta especificação não escolhe arquitetura, bibliotecas, componentes, endpoints ou mecanismos de armazenamento.

## Open Questions

| ID | Pergunta / decisão necessária | Impacto e momento de resolução |
| --- | --- | --- |
| OQ-01 | Qual público/persona é prioritário? Quais metas de conclusão, tempo e satisfação representam sucesso? | Define prioridade e validação de usabilidade; resolver antes da aprovação de produto. |
| OQ-02 | Confirmamos site responsivo em navegador? Quais navegadores, versões, sistemas, orientações e larguras serão suportados? A faixa candidata de 320 px a 1440 px será adotada? | Define matriz de suporte e testes; resolver antes do plano técnico. |
| OQ-03 | Quais países e idiomas de busca serão cobertos? Haverá busca parcial e equivalência de acentos? Como tratar localidades sem região/país e resultados numerosos? | Fecha o contrato de busca e identificação; resolver antes de aprovar RF-01. |
| OQ-04 | Além de temperatura e condição, quais campos atuais são obrigatórios? Quando dados parciais ainda constituem uma consulta útil? | Define conteúdo, estados e critérios de completude; resolver antes de aprovar RF-02. |
| OQ-05 | Qual fuso define hoje? Recomenda-se o da cidade, mas ainda exige aprovação. A previsão será diária ou por horários? Quais campos e regras para o dia atual serão exibidos? | Fecha datas, conteúdo e granularidade; resolver antes de aprovar RF-03. |
| OQ-06 | A unidade será mantida entre visitas por armazenamento local ou apenas durante a visita? Qual precisão e arredondamento serão usados? | Fecha AC-04.4 e persistência de preferência; resolver antes de aprovar RF-04. |
| OQ-07 | Qual a idade máxima aceitável? Quando atualizar: nova seleção, ação manual, intervalo, retorno à página ou virada do dia? Como tratar referência temporal ausente? | Define validade e atualização sem prometer tempo real; resolver antes de aprovar RF-07. |
| OQ-08 | Qual o timeout? Haverá tentativas automáticas? Dados anteriores ficam visíveis durante carregamento ou erro? Cache será permitido, por quanto tempo e com qual recuperação parcial? | Fecha comportamento de falhas e dados antigos; resolver antes da implementação de RF-05 a RF-07. |
| OQ-09 | A meta de até 2 s no percentil 95 será adotada? Para quais operações, dispositivos, redes, janela de amostragem e fronteira de medição? | Torna desempenho verificável e separa dependência externa; resolver antes de aprovar RNF-04. |
| OQ-10 | Haverá meta de disponibilidade? Qual janela, ponto de medição, tratamento de manutenção e responsabilidade por falhas externas? | Evita assumir 99,9% sem sustentação; resolver antes de firmar compromisso operacional. |
| OQ-11 | WCAG 2.2 AA será exigida? Quais tecnologias assistivas e cenários integrarão a avaliação? | Fecha o padrão formal de acessibilidade; resolver antes de aprovar a estratégia de validação. |
| OQ-12 | Haverá telemetria, coleta de buscas ou localização e armazenamento local? Quais finalidade, retenção e informação ao usuário? | Define privacidade e tratamento de dados sem contrariar D-04; resolver antes de introduzir coleta ou armazenamento. |
| OQ-13 | O uso será educacional, pessoal ou comercial? Quais tráfego esperado, cobertura, licença, atribuição, custo, limites e suporte aplicáveis ao Open-Meteo sem API key? | Valida a viabilidade da fonte escolhida; resolver antes de aprovar sua integração no plano. |

As decisões D-01 a D-05 não devem ser reabertas por implementação. As respostas às perguntas acima devem atualizar os requisitos, critérios e premissas afetados antes de sua aprovação. É possível avançar na discussão da especificação, mas as pendências impedem tratá-la integralmente como um contrato fechado de implementação.