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

Os cenários de sucesso pressupõem respostas válidas e completas do provedor. Falhas e respostas incompletas são tratadas separadamente. A verificação pode usar dados controlados, sem depender de condições meteorológicas reais. Critérios condicionados a Open Questions não autorizam escolher silenciosamente uma regra na implementação.

### US-01 / RF-01 — Busca e seleção

- **AC-01.1:** Dada uma busca por nome de cidade que retorne resultados, quando a busca terminar com sucesso, então a interface deve apresentar os locais retornados para seleção, com seus nomes.
- **AC-01.2:** Dados dois resultados com o mesmo nome e regiões ou países diferentes, quando forem exibidos, então região e país disponíveis devem permitir distingui-los antes da seleção.
- **AC-01.3:** Dado um resultado selecionado, quando os dados meteorológicos forem apresentados, então a localização identificada e os dados devem corresponder ao resultado escolhido, não apenas ao texto digitado.
- **AC-01.4:** Dado um campo vazio ou contendo apenas espaços, quando houver tentativa de pesquisa, então nenhuma cidade deve ser selecionada nem uma consulta meteorológica iniciada com essa entrada.

### US-02 / RF-02 — Clima atual

- **AC-02.1:** Dada uma resposta completa para a cidade selecionada, quando o clima atual for exibido, então devem estar visíveis o nome da cidade, a temperatura com unidade e a descrição da condição em pt-BR.
- **AC-02.2:** Dados valores meteorológicos controlados, quando exibidos, então devem corresponder à resposta da cidade selecionada, respeitando a unidade ativa; dados de previsão diária não devem ser rotulados como condições atuais.
- **AC-02.3:** Dado um campo ausente ou inválido, quando o restante dos dados puder ser apresentado, então o campo não deve ser substituído por zero ou por um valor inventado; a indisponibilidade deve ser identificável. O conjunto mínimo para sucesso parcial depende de OQ-04.

### US-03 / RF-03 — Cinco dias

- **AC-03.1:** Dada uma resposta completa, quando a previsão for apresentada, então o período deve conter exatamente cinco datas distintas, consecutivas e em ordem crescente: hoje, hoje + 1, hoje + 2, hoje + 3 e hoje + 4.
- **AC-03.2:** Dada a data de referência determinada pelo fuso a aprovar em OQ-05, quando a previsão for exibida, então sua primeira data deve corresponder a hoje nesse fuso, inclusive quando a data no dispositivo do usuário for diferente.
- **AC-03.3:** Dada uma resposta sem dados para uma das cinco datas, quando a previsão for exibida, então a indisponibilidade nessa data deve ser indicada, sem substituí-la por um sexto dia nem duplicar dados de outra data.

A lista de campos e a granularidade da previsão terão critérios adicionais após OQ-05; esta especificação não presume mínimas, máximas, precipitação ou intervalos horários como decisões aprovadas.

### US-04 / RF-04 — Unidades

- **AC-04.1:** Dada uma primeira visita sem preferência aplicável, quando temperaturas forem exibidas, então a unidade inicial deve ser Celsius, identificada por °C.
- **AC-04.2:** Dadas temperaturas em Celsius, quando Fahrenheit for selecionado, então todas as temperaturas visíveis do clima atual e da previsão devem passar a °F. Um valor de 0 °C deve corresponder a 32 °F, e 20 °C a 68 °F.
- **AC-04.3:** Dada a alternância de unidade, quando concluída, então cidade selecionada, datas e valores não relacionados à temperatura devem permanecer inalterados.
- **AC-04.4:** Dado o mesmo conjunto de dados, quando a unidade mudar de Celsius para Fahrenheit e voltar a Celsius, então os valores originais devem ser recuperados conforme a regra de arredondamento a aprovar em OQ-06, sem erro acumulado por alternâncias sucessivas.

### US-05 / RF-05 — Estados da consulta

- **AC-05.1:** Dada a abertura sem cidade selecionada, então a interface deve disponibilizar a busca sem exibir um erro de consulta nem dados de uma cidade não escolhida.
- **AC-05.2:** Dada uma busca ou consulta meteorológica em andamento, então deve existir uma indicação perceptível de carregamento; ao terminar, ela deve ser substituída pelo resultado, estado vazio ou erro correspondente.
- **AC-05.3:** Dada uma busca concluída com zero resultados, então a interface deve comunicar que nenhuma cidade foi encontrada e permitir editar o termo e pesquisar novamente, sem apresentar o caso como falha de conexão.

### US-06 / RF-06 — Falhas e recuperação

- **AC-06.1:** Dada uma falha de conexão ou do provedor, quando a operação terminar em erro, então a interface deve apresentar uma mensagem compreensível em pt-BR, sem expor detalhes técnicos internos como mensagem principal.
- **AC-06.2:** Dada uma operação que falhou, quando o usuário solicitar nova tentativa e o provedor responder com sucesso, então o erro deve ser substituído pelo resultado correspondente, sem exigir recarregamento da página.
- **AC-06.3:** Dadas as seleções sucessivas das cidades A e B, quando a resposta de A chegar depois da de B, então ela não deve substituir os dados apresentados para B.
- **AC-06.4:** Dado o limite de espera a aprovar em OQ-08, quando ele for excedido sem conclusão, então o carregamento deve terminar com mensagem de falha e possibilidade de nova tentativa, em vez de permanecer indefinidamente.

### US-07 / RF-07 — Referência temporal

- **AC-07.1:** Dado um conjunto meteorológico exibido, então seu horário ou período de referência deve ser visível e associado ao conjunto correspondente, com indicação do fuso usado.
- **AC-07.2:** Dado um horário de referência fornecido pelo provedor, então ele não deve ser substituído pelo horário de acesso e apresentado como se fosse uma nova atualização meteorológica.
- **AC-07.3:** Se o uso de cache for aprovado e dados em cache forem exibidos, então a interface deve identificá-los como dados armazenados e mostrar o horário da última atualização conhecida. Este critério não exige implementar cache.

### US-08 / RF-08 — Acesso e idioma

- **AC-08.1:** Dado um usuário sem conta, então buscar, selecionar cidade, consultar dados e alternar unidades deve ser possível sem cadastro ou autenticação.
- **AC-08.2:** Dados os estados inicial, carregando, sucesso, vazio e erro, então os textos e nomes acessíveis próprios da aplicação devem estar em pt-BR. Nomes próprios de localidades não precisam ser traduzidos.
- **AC-08.3:** Dadas datas e horários exibidos, então sua apresentação deve seguir convenções de pt-BR, sem alterar a data ou o fuso de referência dos dados.

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