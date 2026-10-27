# Weather App — Especificação de Produto

## Overview

- **Fonte:** [Discovery](discovery.md).
- **Status:** proposta de baseline para aprovação; não é autorização de lançamento.
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

Os RF-01 a RF-04 preservam as capacidades do discovery; RF-05 a RF-08 detalham seus requisitos não funcionais e decisões. **As regras adicionais desta revisão são propostas de produto, não decisões retroativamente atribuídas ao discovery.** Os critérios testam esse perfil proposto sem parâmetros indefinidos. As aprovações pendentes estão em Open Questions e devem preceder a baseline de implementação. Nenhuma escolha de biblioteca, endpoint ou arquitetura é feita aqui.

## Functional Requirements

| ID | Requisito | Origem | História | Critérios |
| --- | --- | --- | --- | --- |
| RF-01 | Pesquisar cidades, distinguir resultados e selecionar explicitamente uma localização válida. | Discovery RF-01, R-01 | US-01 | AC-01.1 a AC-01.8 |
| RF-02 | Exibir temperatura, condição e referência do clima atual da cidade selecionada, sem inventar valores ausentes. | Discovery RF-02 | US-02 | AC-02.1 a AC-02.5 |
| RF-03 | Exibir resumo diário com data, mínima, máxima e condição para hoje e os quatro dias seguintes no fuso da cidade. | Discovery RF-03, D-02 | US-03 | AC-03.1 a AC-03.6 |
| RF-04 | Iniciar em Celsius e alternar todas as temperaturas entre Celsius e Fahrenheit, sem alterar cidade ou período; manter unidade somente durante a visita. | Discovery RF-04, D-03 | US-04 | AC-04.1 a AC-04.6 |
| RF-05 | Distinguir início, carregamento, sucesso, sucesso parcial, vazio de busca e erro, conforme a matriz de estados. | Discovery RNF-02, RNF-07 | US-05 | AC-05.1 a AC-05.6 |
| RF-06 | Tratar falhas, timeout e concorrência, permitindo recuperação sem recarregar a página e sem apresentar resultados obsoletos. | Discovery RNF-07, R-02 | US-06 | AC-06.1 a AC-06.8 |
| RF-07 | Informar referência temporal, horário da consulta e validade dos dados; permitir atualização manual e automática, sem cache de recuperação. | Discovery RNF-06, RNF-07 | US-07 | AC-07.1 a AC-07.6 |
| RF-08 | Oferecer toda a jornada em pt-BR, sem conta, com controles acessíveis e atribuição da fonte. | D-01, D-04, D-05, Discovery RNF-03 | US-08 | AC-08.1 a AC-08.6 |

### Regras de busca e identidade

- **BR-01:** pesquisar por envio explícito via botão ou Enter; não pesquisar a cada tecla. Remover espaços externos. Aceitar de 2 a 100 caracteres Unicode, com ao menos uma letra; contar pontos de código após remover espaços externos. Preservar acentos, espaços internos, hífens e apóstrofos. Entrada inválida não gera chamadas externas nem muda a cidade selecionada.
- **BR-02:** apresentar até dez resultados válidos na ordem do provedor. Não prometer equivalência entre termos com e sem acento: preservar a entrada e apresentar as correspondências do provedor. Busca mundial sujeita à cobertura validada em OQ-13.
- **BR-03:** resultado selecionável exige nome não vazio e coordenadas finitas, latitude entre -90 e 90 e longitude entre -180 e 180. Exibir nome, região e país disponíveis; nunca usar o nome sozinho como identidade. Na ausência desses qualificadores ou se houver rótulos iguais, acrescentar coordenadas com quatro casas decimais. Excluir registros sem localização válida.
- **BR-04:** lista vazia ou campo de resultados ausente em resposta de sucesso válida significam nenhuma correspondência. Campo de resultados com tipo incorreto significa resposta inválida. Se todos os registros forem inválidos, mostrar erro de dados, não afirmar que a cidade não existe. Buscar outra cidade não altera a selecionada até nova seleção explícita.

### Regras meteorológicas e temporais

- **BR-05:** clima atual contém temperatura, condição textual e instante de validade da fonte. A previsão contém cinco resumos diários: data local, mínima, máxima e condição. Sensação térmica, vento, umidade, precipitação e detalhe horário não integram esta baseline.
- **BR-06:** usar o fuso IANA da cidade retornado pelo provedor para definir hoje e formatar horários. Falta ou invalidade do fuso impede apresentar dados meteorológicos; não adotar silenciosamente o fuso do dispositivo. Cinco dias são datas locais consecutivas, inclusive em viradas de mês, ano e horário de verão, não cinco intervalos fixos de 24 horas.
- **BR-07:** temperatura válida é um número finito, inclusive zero e negativos; não converter texto numérico por suposição. Data inválida não participa da previsão. Ignorar datas fora da janela e ordenar as demais. Data duplicada tem seus dados considerados indisponíveis, sem escolher arbitrariamente um registro. Se mínima > máxima, invalidar ambas nesse dia.
- **BR-08:** campo numérico indisponível aparece como “Indisponível”, sem zero substituto nem unidade isolada. Temperatura atual só é utilizável com instante de validade válido, não mais de 3 horas anterior à consulta nem mais de 5 minutos no futuro. Cada dia da previsão é utilizável se tiver ao menos uma temperatura válida. Código meteorológico ausente ou desconhecido recebe “Condição indisponível”, sem ocultar temperaturas válidas.
- **BR-09:** sucesso completo exige temperatura e condição atuais válidas e cinco dias com mínima, máxima e condição válidas. Havendo ao menos uma temperatura atual ou diária utilizável, apresentar sucesso parcial com “Alguns dados estão indisponíveis” e preservar campos válidos. Sem temperatura utilizável, mostrar erro global. Não misturar dados de cidades ou respostas diferentes para preencher lacunas.
- **BR-10:** converter a partir dos valores originais, sem arredondar valores intermediários. Exibir uma casa decimal, vírgula decimal e unidade em cada temperatura; arredondar ao décimo mais próximo, com empates afastados de zero. Normalizar zero negativo para 0,0. A escolha de unidade dura somente até recarregar ou fechar a página, sem persistência entre visitas.
- **BR-11:** identificar “Válido em” para o instante das condições atuais, “Período” para as cinco datas e “Consultado em” para a conclusão da consulta. Exibir datas como dd/MM/aaaa e horas como HH:mm, identificando o fuso IANA associado. Só exibir “Atualizado pelo provedor em” se esse instante existir na fonte; horário de consulta nunca substitui atualização meteorológica.
- **BR-12:** atualizar ao selecionar cidade, acionar “Atualizar”, a cada 15 minutos com a página visível e no primeiro evento após a virada da data local. Ao voltar à página, atualizar se passaram 15 minutos desde a consulta ou mudou a data local. Eventos simultâneos geram uma única atualização da cidade. Enquanto oculta, a página não inicia atualizações periódicas; uma operação já iniciada pode terminar.

### Estados, concorrência e falhas

| Operação / resultado | Estado visível | Recuperação |
| --- | --- | --- |
| Nenhuma cidade escolhida | Busca disponível; sem clima nem erro inicial. | Pesquisar e selecionar. |
| Busca pendente | “Buscando cidades”; resultados da busca anterior removidos; cidade selecionada preservada. | Editar termo e enviar nova busca. |
| Busca com correspondências | Lista selecionável. | Selecionar ou pesquisar novamente. |
| Busca sem correspondências | “Nenhuma cidade encontrada”. | Editar e enviar nova busca. |
| Entrada inválida | Erro associado ao campo; seleção atual preservada. | Corrigir entrada. |
| Consulta meteorológica pendente | “Consultando previsão”; números anteriores ocultos, cidade e unidade ativas visíveis. | Buscar ou selecionar outra cidade. |
| Resposta meteorológica utilizável | Sucesso completo ou parcial conforme BR-09. | Atualizar, trocar unidade ou cidade. |
| Falha de busca ou consulta | Mensagem correspondente e nova tentativa; carregamento encerrado. | Repetir operação, salvo bloqueio por limite. |

- **BR-13:** timeout de 10 segundos por operação de busca ou consulta meteorológica, contado desde seu início. Não há repetição automática após falha. Uma atualização automática que falhe suspende novas atualizações automáticas até uma tentativa manual ou nova seleção ter sucesso. Somente a operação vigente pode atualizar seus resultados, mensagens e carregamento; ignorar sucesso ou erro de operações substituídas ou expiradas.
- **BR-14:** nova tentativa repete o último termo enviado ou a consulta da cidade ainda selecionada. Se o usuário editar o termo após erro de busca, remover a ação antiga e exigir novo envio. Mudança de cidade invalida ações e mensagens da consulta anterior. Impedir envios idênticos simultâneos; uma busca diferente ou nova cidade pode substituir a operação pendente.
- **BR-15:** para limite de requisições, informar bloqueio e impedir chamadas à operação afetada até o prazo Retry-After válido; aceitar duração em segundos ou data HTTP futura. Na ausência de prazo válido, aguardar 60 segundos. Trocar unidade permanece possível e não chama o provedor. Não executar nova chamada automaticamente quando o prazo terminar.
- **BR-16:** não reutilizar respostas anteriores como cache visível após nova consulta, erro ou recarga. Dados de uma resposta bem-sucedida podem permanecer apenas em memória durante a visita. Ao ultrapassar 15 minutos desde a consulta, identificar “Consulta desatualizada” até iniciar nova consulta, que oculta os números. A idade da consulta não deve ser apresentada como idade do modelo meteorológico.

## User Stories

- **US-01:** Como Rafael, viajante de curta duração, quero buscar meu destino e distinguir cidades homônimas para planejar a viagem com os dados da localização correta. **Requisito: RF-01.**
- **US-02:** Como Mariana, usuária com rotina urbana, quero consultar a temperatura e a condição atual da minha cidade pelo celular para decidir o que vestir antes de sair. **Requisito: RF-02.**
- **US-03:** Como Rafael, viajante de curta duração, quero consultar a previsão de hoje e dos quatro dias seguintes para preparar a mala e organizar meus passeios. **Requisito: RF-03.**
- **US-04:** Como Alex, usuário habituado a Fahrenheit, quero alternar as temperaturas exibidas de Celsius para Fahrenheit para interpretar o clima na unidade que uso no cotidiano. **Requisito: RF-04.**
- **US-05:** Como Mariana, usuária com rotina urbana, quero distinguir carregamento, ausência de resultados e dados parciais para saber se devo aguardar ou corrigir a consulta antes de sair. **Requisito: RF-05.**
- **US-06:** Como Mariana, usuária com rotina urbana, quero entender uma falha de conexão e tentar a consulta novamente para obter o clima da minha cidade mesmo após uma interrupção da rede. **Requisito: RF-06.**
- **US-07:** Como Rafael, viajante de curta duração, quero identificar a referência temporal e atualizar a consulta para planejar passeios com informações cuja atualidade consigo avaliar. **Requisito: RF-07.**
- **US-08:** Como Mariana, usuária com rotina urbana, quero consultar o tempo em português brasileiro sem criar conta e com controles acessíveis para acessar as informações diretamente. **Requisito: RF-08.**

As histórias usam as personas registradas no [discovery](discovery.md#personas), ainda como hipóteses a validar. Cada história mantém seu vínculo com os critérios de aceite existentes; a persona prioritária permanece pendente em OQ-01.

## Acceptance Criteria

Cada linha é um cenário automatizável. Usar respostas, relógio, visibilidade da página e ordem de conclusão controlados; não depender da API real. Todos os resultados da linha são obrigatórios. Executar separadamente cada variante enumerada. Salvo indicação contrária, as respostas têm cidade, fuso e referência temporal válidos e Celsius está ativo. Os valores esperados seguem BR-01 a BR-16 e o catálogo desta seção. Os IDs anteriores foram mantidos; AC-07.3 agora verifica a política explícita de não reutilizar cache. Os critérios verificam a baseline proposta, cuja aprovação ainda é necessária.

### US-01 / RF-01 — Busca e seleção

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-01.1 | Busca por Campinas com resposta de um registro válido, São Paulo, Brasil. | Enviar pelo botão e, em outro teste, por Enter. | Uma chamada de busca por envio; resultado com nome, região e país; nenhuma consulta meteorológica antes de selecionar. |
| AC-01.2 | A resposta da busca contém duas cidades chamadas Santa Maria: uma no Rio Grande do Sul, Brasil, e outra na Califórnia, Estados Unidos. | A busca termina com sucesso. | Dois resultados selecionáveis são apresentados, cada um com Santa Maria, sua respectiva região e seu país. |
| AC-01.3 | As duas cidades de AC-01.2 têm temperaturas de 20 °C e 10 °C, respectivamente. | Selecionar a cidade dos Estados Unidos e concluir consulta. | Identidade corresponde à cidade selecionada e clima atual mostra 10,0 °C, não 20,0 °C. |
| AC-01.4 | Entrada vazia, só espaços, um caractere, 101 caracteres ou apenas símbolos. | Tentar enviar cada entrada. | Nenhuma chamada externa; erro de entrada associado ao campo; cidade já selecionada, se houver, inalterada. |
| AC-01.5 | Entradas “ São Paulo ”, “D'Oeste” e “Baden-Baden”; o provedor retorna um resultado válido para cada uma. | Enviar cada entrada. | Enviar respectivamente São Paulo, D'Oeste e Baden-Baden como texto; resultados retornados selecionáveis, sem remover acentos ou pontuação interna. |
| AC-01.6 | A busca retorna 12 registros válidos, um sem país e região, e dois com o mesmo rótulo entre os dez primeiros. | Exibir resultados. | No máximo dez, na ordem recebida; os casos sem qualificação ou com rótulos iguais têm coordenadas com quatro casas decimais. |
| AC-01.7 | Respostas com registro sem nome, coordenada não numérica ou latitude 91. | Processar cada caso isoladamente. | Registro inválido não é selecionável; se não restar nenhum válido, mostrar erro de dados, não nenhuma correspondência. |
| AC-01.8 | Uma resposta de sucesso tem lista vazia ou campo de resultados ausente; outra tem resultados com tipo incorreto. | Processar cada resposta. | Os dois primeiros casos mostram nenhuma correspondência; o terceiro mostra erro de dados e nova tentativa. |

### US-02 / RF-02 — Clima atual

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-02.1 | Campinas selecionada, 20 °C, código 0 e instante de validade dentro dos limites de BR-08. | A consulta termina. | Exibir Campinas, 20,0 °C, “Céu limpo” e referência temporal. |
| AC-02.2 | Temperaturas atuais de 0 °C e -5 °C; previsão com valores diferentes. | Apresentar cada resposta. | Clima atual mostra respectivamente 0,0 °C e -5,0 °C, sem usar temperatura diária como atual. |
| AC-02.3 | Temperatura atual ausente, nula, texto “20” ou não finita, com previsão utilizável. | Processar cada resposta. | Temperatura atual “Indisponível”, previsão preservada e aviso de sucesso parcial; nunca zero substituto. |
| AC-02.4 | Temperatura válida com código ausente ou desconhecido. | A consulta termina. | Temperatura exibida e “Condição indisponível”; não ocorrer erro global apenas pelo código. |
| AC-02.5 | Instante atual ausente, inválido, anterior à consulta por 3 h e 1 s ou posterior por 5 min e 1 s. | Processar cada caso. | Não exibir temperatura atual como válida; limites exatos de 3 h e 5 min são aceitos em testes separados. |

### US-03 / RF-03 — Cinco dias

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-03.1 | Hoje local é 27/10/2026; cinco dias completos com mínima 10 °C, máxima 20 °C e código 0. | Exibir previsão. | Exatamente 27 a 31/10/2026 em ordem; cada dia mostra 10,0 °C, 20,0 °C e “Céu limpo”, sob identificação de previsão. |
| AC-03.2 | Instante 28/10/2026 às 01:00 UTC, cidade em America/Sao_Paulo e dispositivo em UTC. | Exibir previsão. | Hoje é 27/10 na cidade; janela de 27 a 31/10, independentemente do dispositivo. |
| AC-03.3 | A data de referência é 27/10/2026 e a resposta contém dados distintos para 27, 28, 30 e 31/10 e 01/11/2026, mas nenhum dado para 29/10/2026. | A previsão é apresentada. | A janela continua de 27 a 31/10/2026; 29/10 indica indisponibilidade, as outras quatro datas mantêm seus próprios dados e 01/11 não é incluído para preencher a lacuna. |
| AC-03.4 | Dias fora de ordem, uma data duplicada e um par mínima 25 °C / máxima 15 °C. | Processar resposta. | Ordenar datas; data duplicada indisponível; par invertido indisponível; aviso parcial se houver temperatura utilizável. |
| AC-03.5 | Hoje local é 31/12/2026; em outro teste é 07/03/2026 em America/New_York, antes da mudança de horário de verão. | Exibir cinco dias. | Primeiro caso: 31/12 a 04/01/2027; segundo: 07 a 11/03, sem pular ou duplicar datas pela mudança de duração do dia. |
| AC-03.6 | Fuso da cidade ausente ou identificador inválido. | Processar a consulta. | Erro de dados, sem temperaturas meteorológicas exibidas; não usar o fuso do dispositivo como substituto. |

### US-04 / RF-04 — Unidades

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-04.1 | Primeira visita com dados disponíveis. | Apresentar temperaturas. | Celsius selecionado; todas as temperaturas têm uma casa decimal e °C. |
| AC-04.2 | Temperaturas 0 °C e 20 °C distribuídas entre clima atual e previsão. | Selecionar Fahrenheit. | Exibir respectivamente 32,0 °F e 68,0 °F em todos os campos correspondentes; nenhuma chamada externa adicional. |
| AC-04.3 | Cidade, datas e condições registrados antes da troca. | Alternar unidade. | Esses dados permanecem iguais; valores indisponíveis continuam indisponíveis, sem unidade isolada. |
| AC-04.4 | Dados originais de 1,25 °C, -1,25 °C e -0,01 °C. | Alternar para Fahrenheit e voltar dez vezes. | Em cada retorno mostrar 1,3 °C, -1,3 °C e 0,0 °C; em Fahrenheit mostrar 34,3 °F, 29,8 °F e 32,0 °F. |
| AC-04.5 | Consulta pendente com Celsius inicialmente ativo. | Selecionar Fahrenheit antes da resposta de 20 °C. | Resposta exibida em 68,0 °F, sem restaurar Celsius. |
| AC-04.6 | Fahrenheit ativo e cidade selecionada. | Recarregar a página. | Celsius e estado inicial sem cidade; nenhuma restauração de preferências ou de dados meteorológicos armazenados. |

### US-05 / RF-05 — Estados da consulta

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-05.1 | A aplicação é aberta sem cidade selecionada e nenhuma consulta foi iniciada. | A tela inicial termina de carregar. | A busca está disponível, não há indicador de consulta em andamento, erro de consulta nem dados meteorológicos de uma cidade não escolhida. |
| AC-05.2 | Busca enviada com resposta retida. | Liberar resposta com correspondências. | Durante espera mostrar “Buscando cidades”; ao concluir remover carregamento e apresentar a lista. |
| AC-05.3 | Uma busca tem resposta de sucesso com zero resultados. | A busca termina e o usuário edita o termo e inicia outra busca com resultado válido. | Primeiro é exibida a indicação de nenhuma cidade encontrada, sem mensagem de falha de conexão; depois, o estado vazio é substituído pelos resultados da nova busca. |
| AC-05.4 | Cidade selecionada com consulta retida. | Liberar resposta completa. | Durante espera mostrar “Consultando previsão”, sem números antigos; ao concluir apresentar dados e remover carregamento. |
| AC-05.5 | Só clima atual utilizável, só previsão utilizável ou mínima diária sem máxima. | Processar cada resposta separadamente. | Preservar temperaturas utilizáveis, identificar campos ausentes e mostrar “Alguns dados estão indisponíveis”. |
| AC-05.6 | Resposta vazia, conteúdo malformado ou nenhuma temperatura utilizável. | Processar cada caso. | Erro global de dados e nova tentativa, sem lista de temperaturas zero ou sucesso vazio. |

### US-06 / RF-06 — Falhas e recuperação

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-06.1 | Busca ou consulta pendente. | Falhar por rede ou erro do provedor que não seja limite de requisições. | Remover carregamento, mostrar mensagem do catálogo e nova tentativa; não expor stack trace ou resposta bruta; nenhuma repetição automática. |
| AC-06.2 | Uma operação falhou e sua ação de nova tentativa está disponível. | O usuário solicita nova tentativa e a mesma busca ou consulta recebe resposta válida. | O resultado correspondente é exibido, a mensagem de erro e o carregamento desaparecem e a página não é recarregada. |
| AC-06.3 | Campinas pendente, depois Curitiba concluída com 10 °C. | Campinas termina com sucesso de 20 °C ou com erro. | Curitiba permanece com 10,0 °C; não mostrar dados ou erro de Campinas. |
| AC-06.4 | Operação sem resposta. | Avançar relógio para 9.999 ms e depois para 10.000 ms. | Primeiro mantém carregamento; ao processar 10.000 ms encerra com timeout e nova tentativa. Resposta posterior não altera esse estado. |
| AC-06.5 | Busca A pendente, depois busca B concluída. | Busca A termina com lista ou erro. | Lista e estado de B permanecem; não reintroduzir resultados ou mensagens de A. |
| AC-06.6 | Limite de requisições com Retry-After de 120 segundos; repetir com data HTTP futura equivalente e com prazo inválido. | Tentar nova operação afetada antes e após o prazo. | Nenhuma chamada antes do prazo; nos dois primeiros casos liberar após 120 s, no inválido após 60 s; exigir ação explícita para nova tentativa. |
| AC-06.7 | Operação pendente; em outro teste, erro de busca seguido de edição do termo. | Repetir envio idêntico durante espera ou acionar contexto antigo após edição. | Sem chamada idêntica simultânea; após edição, ação antiga removida e próximo envio usa o novo termo. |
| AC-06.8 | Atualização automática falhou. | Avançar dois intervalos de 15 minutos e depois concluir atualização manual com sucesso. | Nenhuma chamada automática nos intervalos suspensos; sucesso manual reativa o ciclo. |

### US-07 / RF-07 — Referência temporal

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-07.1 | Dados atuais válidos às 09:00 UTC e previsão de 27 a 31/10/2026; fuso de apresentação Etc/UTC. | Consulta termina em 27/10/2026 às 09:10 UTC. | Mostrar “Válido em” 27/10/2026 09:00, “Período” 27/10 a 31/10/2026 e “Consultado em” 27/10/2026 09:10; fuso identificado. |
| AC-07.2 | Consulta às 09:10 com validade atual às 09:00 e sem instante de atualização do provedor. | Apresentar dados. | Não rotular 09:10 como atualização ou validade; não exibir “Atualizado pelo provedor em” sem fonte correspondente. |
| AC-07.3 | Dados visíveis de uma consulta anterior. | Iniciar nova consulta e fazê-la falhar. | Números anteriores ocultos desde o início; após falha não restaurá-los como cache; mostrar erro e nova tentativa. |
| AC-07.4 | Cidade selecionada e página visível. | Acionar “Atualizar”. | Uma nova consulta; cidade e unidade preservadas; indicador de carregamento e horários substituídos após sucesso. |
| AC-07.5 | Consulta bem-sucedida no instante inicial. | Avançar 15 minutos com página visível; repetir com página oculta e depois torná-la visível. | No primeiro caso uma atualização automática; no segundo nenhuma enquanto oculta e uma ao voltar. Se data local e intervalo vencerem juntos, fazer só uma chamada. |
| AC-07.6 | Cidade com data local prestes a mudar e consulta com menos de 15 minutos. | Ocorre virada do dia com página visível; repetir ocultando a página e retornando depois. | Iniciar atualização no primeiro evento visível após a virada e apresentar janela iniciada na nova data, sem aguardar completar 15 minutos. |

### US-08 / RF-08 — Acesso e idioma

| Critério | Given | When | Then |
| --- | --- | --- | --- |
| AC-08.1 | O usuário não possui conta nem sessão autenticada e as respostas das consultas são válidas. | Ele abre a aplicação, pesquisa, seleciona uma cidade, consulta o clima atual e a previsão e alterna para Fahrenheit. | A jornada é concluída sem solicitar cadastro, login, credenciais ou API key. |
| AC-08.2 | Cada estado, código conhecido e código desconhecido tem resposta controlada. | Apresentar cada variante. | Textos correspondem ao catálogo desta seção; localidades permanecem nomes próprios; código desconhecido mostra “Condição indisponível”. |
| AC-08.3 | Os dados exibidos representam 27/10/2026 às 09:05 no fuso de apresentação informado. | A interface apresenta a data e o horário em formato numérico. | A data é apresentada como 27/10/2026 e o horário como 09:05, com indicação do fuso associado; a formatação não muda a data nem o instante representado. |
| AC-08.4 | Navegação somente por teclado. | Buscar, selecionar resultado, alternar unidade e tentar novamente após erro. | Tab alcança controles com foco visível, Enter ativa ações, não há armadilha de foco e a ordem acompanha a leitura. |
| AC-08.5 | Leitor de tela ativo e foco no campo de busca. | Concluir busca vazia e depois consulta com erro. | Mudanças anunciadas sem deslocar foco; campo e ações têm nomes acessíveis em pt-BR e erro de entrada é associado ao campo. |
| AC-08.6 | Dados meteorológicos exibidos. | Inspecionar atribuição e ativar seu link por teclado. | “Dados: Open-Meteo” visível, com link para https://open-meteo.com/; exigências adicionais de licença seguem OQ-13. |

### Catálogo mínimo de mensagens

Nomes acessíveis mínimos: “Buscar cidade”, “Pesquisar”, “Selecionar {localização}”, “Celsius”, “Fahrenheit”, “Atualizar” e “Tentar novamente”. Indicar programaticamente a unidade selecionada. Anunciar carregamento, resultado vazio e erro sem mover o foco. Não anunciar contagem regressiva a cada segundo ao leitor de tela.

| Situação | Texto |
| --- | --- |
| Entrada inválida | Informe de 2 a 100 caracteres, incluindo pelo menos uma letra. |
| Busca pendente / consulta pendente | Buscando cidades / Consultando previsão |
| Nenhuma correspondência | Nenhuma cidade encontrada |
| Falha de busca / consulta | Não foi possível buscar cidades. / Não foi possível consultar a previsão. |
| Resposta inválida ou sem dados utilizáveis | Os dados recebidos estão indisponíveis. |
| Timeout | A consulta demorou mais que o esperado. Tente novamente. |
| Limite de requisições | Limite de consultas atingido. Tente novamente em {segundos} segundos. |
| Sucesso parcial | Alguns dados estão indisponíveis |
| Campo numérico ausente / condição ausente | Indisponível / Condição indisponível |
| Consulta com mais de 15 minutos | Consulta desatualizada |

| Código meteorológico Open-Meteo | Descrição pt-BR |
| --- | --- |
| 0 | Céu limpo |
| 1 / 2 / 3 | Predominantemente limpo / Parcialmente nublado / Nublado |
| 45 / 48 | Neblina / Neblina com geada |
| 51 / 53 / 55 | Garoa leve / Garoa moderada / Garoa intensa |
| 56 / 57 | Garoa congelante leve / Garoa congelante intensa |
| 61 / 63 / 65 | Chuva leve / Chuva moderada / Chuva intensa |
| 66 / 67 | Chuva congelante leve / Chuva congelante intensa |
| 71 / 73 / 75 / 77 | Neve leve / Neve moderada / Neve intensa / Grãos de neve |
| 80 / 81 / 82 | Pancadas de chuva leves / Pancadas de chuva moderadas / Pancadas de chuva intensas |
| 85 / 86 | Pancadas de neve leves / Pancadas de neve intensas |
| 95 / 96 / 99 | Trovoadas / Trovoadas com granizo leve / Trovoadas com granizo intenso |
| Demais valores, ausente ou inválido | Condição indisponível |

## Non-Functional Requirements

Os valores abaixo são critérios propostos de aprovação da baseline, não SLAs já acordados. A validação de release deve registrar ambiente, versão, resultado e evidência de cada requisito.

| ID | Requisito verificável | Evidência de aceite |
| --- | --- | --- |
| RNF-01 | Layout entre 320 e 1440 CSS px, em retrato e paisagem, sem rolagem horizontal da página, sobreposição ou perda de controles essenciais. | Jornada nas larguras 320, 375, 768, 1024 e 1440 px, mais 1920 px para verificar continuidade fora da faixa mínima. |
| RNF-02 | Mariana conclui busca e leitura atual em até 30 s; Rafael identifica destino e cinco dias em até 60 s; Alex muda unidade em uma ação. | Sessões com cinco participantes por jornada de Mariana/Rafael, ao menos quatro dentro da meta, sem ajuda; requisito de Alex verificado funcionalmente. |
| RNF-03 | WCAG 2.2 AA: teclado, foco visível não encoberto, contraste, nomes, mensagens de estado e redimensionamento a 200%, sem perda de conteúdo ou operação. | Auditoria das páginas e estados, verificação automática sem violações detectadas e avaliação manual com NVDA/Firefox e VoiceOver/Safari; scanner sozinho não comprova conformidade. |
| RNF-04 | Com respostas controladas após 500 ms, p95 de envio até resultado renderizado <= 2 s por busca e consulta. Ambiente: 4 núcleos lógicos, 8 GB RAM, navegador estável e viewport 375 × 812. | Cem execuções por operação após aquecimento; p95 é o 95º valor ordenado. Registrar separadamente desempenho com provedor real, sem tratá-lo como garantia externa. |
| RNF-05 | Página inicial e jornada sintética com provedor controlado disponíveis em pelo menos 99,9% das sondagens mensais, a cada 5 min. Falhas reais do provedor são medidas separadamente como sucesso da consulta de ponta a ponta. | Relatório operacional com falhas e manutenção incluídas, ponto de medição definido no plano de operação; compromisso condicionado a OQ-10. |
| RNF-06 | Validar referência atual com limites de 3 h de atraso e 5 min de avanço; atualização e mudança de dia seguem BR-08 e BR-12. | Relógio controlado nos limites e além deles; AC-02.5 e AC-07.4 a AC-07.6. Não promete idade do modelo diário desconhecida. |
| RNF-07 | Toda operação conclui ou expira em 10 s; erro não causa repetição automática nem mistura respostas. | AC-05.5, AC-05.6 e AC-06.1 a AC-06.8. |
| RNF-08 | Sem autenticação, persistência de servidor, armazenamento local de cidade/unidade ou telemetria de uso da aplicação nesta baseline. | Revisão do fluxo de dados e inspeção de rede e armazenamento após a jornada; logs do provedor e da hospedagem avaliados separadamente. |
| RNF-09 | Fonte e atribuição compatíveis com licença e modalidade de uso aprovadas. | Evidência de termos, limites, cobertura, custo e suporte em OQ-13; AC-08.6. Sem essa evidência, lançamento bloqueado. |
| RNF-10 | Jornada funcional nas versões estável atual e anterior de Chrome, Edge, Firefox e Safari; Safari no iOS e Chrome no Android. | Fixar números de versão e sistemas na aprovação de release; automação em Chromium, Firefox e WebKit não substitui verificação nos navegadores reais. |
| RNF-11 | Distribuição e chamadas externas por HTTPS; entradas e valores do provedor exibidos como texto, nunca interpretados como HTML executável. | Testar nomes de entrada e resposta contendo marcação e manipuladores de evento: nenhuma execução, navegação inesperada ou alteração estrutural do documento. |

## Edge Cases

| Caso | Comportamento esperado | Referência |
| --- | --- | --- |
| Cidade inexistente ou fora da cobertura | Estado sem correspondências, sem afirmar inexistência geográfica; permitir corrigir termo. | AC-05.3 |
| Campo vazio, espaços, excesso de tamanho ou símbolos sem letras | Erro local, nenhuma chamada, seleção anterior preservada. | AC-01.4 |
| Acentos, apóstrofos e hífens | Preservar entrada; apresentar resultados do provedor sem prometer equivalência linguística. | AC-01.5 |
| Geocoding vazio ou sem campo de resultados | Nenhuma correspondência; tipo incorreto ou todos os registros inválidos são erro de dados. | AC-01.7, AC-01.8 |
| Homônimos, região ou país ausentes | Qualificar pelo que existir e usar coordenadas quando necessário. | AC-01.2, AC-01.6 |
| API indisponível, timeout, limite | Encerrar estado pendente, mensagem específica e recuperação sem ciclo automático. | AC-06.1, AC-06.4, AC-06.6 |
| Resposta parcial, vazia ou malformada | Preservar partes válidas ou erro global conforme BR-09; nunca completar com zero. | AC-05.5, AC-05.6 |
| Código desconhecido, temperatura zero ou negativa | Fallback textual para condição; preservar temperaturas válidas. | AC-02.2, AC-02.4 |
| Datas ausentes, duplicadas, fora de ordem ou temperaturas invertidas | Manter janela, ordenar e marcar lacunas; não escolher dados conflitantes. | AC-03.3, AC-03.4 |
| Fuso inválido, virada de dia, mês, ano ou horário de verão | Não inferir fuso; usar calendário local; atualizar janela na virada. | AC-03.2, AC-03.5, AC-03.6, AC-07.6 |
| Resposta ou erro antigo após nova busca, cidade ou timeout | Ignorar evento obsoleto sem alterar estado vigente. | AC-06.3 a AC-06.5 |
| Mudança de unidade durante consulta ou repetidamente | Usar unidade ativa e valores originais sem acumular arredondamento. | AC-04.4, AC-04.5 |
| Página oculta ou rede interrompida durante atualização | Não iniciar consultas periódicas ocultas; atualizar ao voltar quando necessário; suspender ciclo após erro. | AC-06.8, AC-07.5 |
| Consulta por teclado ou leitor de tela | Controles e estados perceptíveis e operáveis sem deslocamento automático de foco. | AC-08.4, AC-08.5 |

## Assumptions

- **AS-01:** o perfil proposto detalha um site responsivo, sem PWA nem aplicativos nativos. Aprovação em OQ-02.
- **AS-02:** seleção explícita inicia a consulta; nenhuma cidade é inferida por IP, dispositivo ou geolocalização.
- **AS-03:** mínimas e máximas de hoje descrevem o dia local inteiro segundo o provedor, não apenas as horas restantes; dados meteorológicos são estimativas, não garantia de observação em tempo real.
- **AS-04:** memória durante a visita não equivale a persistência entre visitas; Celsius e cidade vazia após recarga fazem parte da proposta de OQ-06.
- **AS-05:** Mariana, Rafael e Alex são personas candidatas do discovery; aprovação de prioridade em OQ-01.
- **AS-06:** instante do modelo diário pode não estar disponível; não o inferir do instante de consulta nem das datas previstas.
- **AS-07:** metas e catálogo são verificáveis, mas dependem de aprovação registrada; esta revisão não aprova licenças, capacidade ou SLA externo.
- **AS-08:** ausência de persistência de servidor não determina arquitetura nem elimina registros externos. Validar fluxo de dados em OQ-12 e OQ-13.

## Risks

| ID | Risco | Mitigação / condição de liberação |
| --- | --- | --- |
| R-01 | Cidade incorreta por homônimos ou dados incompletos. | Seleção explícita e identidade por localização válida; AC-01.2, AC-01.3 e AC-01.6. |
| R-02 | Uso pretendido incompatível com modalidade sem API key ou limites externos. | Validar OQ-13; se incompatível, retornar à decisão D-01 antes de implementar alternativa. |
| R-03 | Divergência entre baseline proposta e expectativas dos stakeholders. | Aprovação rastreável de OQ-01 a OQ-12 e atualização do discovery antes do plano. |
| R-04 | Mudança de plataforma ou matriz de suporte aumenta escopo. | Aprovar OQ-02 antes de consolidar a arquitetura. |
| R-05 | Datas incorretas, dados antigos ou testes só com mocks ocultam incompatibilidades reais. | Testes de fronteira e validação de contratos e amostras reais do provedor no plano; suíte determinística não substitui essa verificação. |
| R-06 | Metas operacionais propostas não serem sustentáveis na hospedagem. | Validar orçamento, sondagens e condições de RNF-04 e RNF-05 antes de assumir compromisso. |
| R-07 | Registros externos expõem buscas ou coordenadas apesar de não haver banco da aplicação. | Avaliar registros, retenção e informação ao usuário em OQ-12 e OQ-13. |
| R-08 | Funcionalidades adjacentes ampliam o MVP. | Exigir decisão explícita de escopo e atualização dos requisitos e critérios. |

## Out of Scope

### Exclusões confirmadas

- Cadastro, login, contas e funcionalidades dependentes de autenticação.
- Persistência de dados da aplicação em servidor, incluindo histórico pessoal e sincronização de preferências por conta.
- Interface multilíngue; a UI será em pt-BR. Isso não restringe automaticamente a cobertura geográfica.

### Exclusões da baseline proposta, sujeitas à aprovação

- Geolocalização automática, favoritos, alertas, notificações, mapas, radar e histórico.
- Funcionamento offline, instalação como PWA, aplicativos nativos e cache de recuperação.
- Previsão horária, dias além de hoje + quatro, sensação térmica, vento, umidade e precipitação.
- Persistência local de cidade/unidade e telemetria de uso própria.

As exclusões propostas não substituem a aprovação em OQ-02, OQ-04 a OQ-06, OQ-08 e OQ-12. A arquitetura e os mecanismos internos pertencem ao plano técnico.

## Open Questions

Pendências de aprovação, não valores livres para a implementação. Produto aprova a baseline; operação valida metas; responsável pela integração documenta viabilidade externa. Registrar responsável, data e evidência na resolução. Lançamento exige todas as linhas aprovadas ou revisão explícita dos requisitos afetados, além da validação de RNF-01 a RNF-11. Este documento não declara esses gates cumpridos.

| ID | Proposta / validação necessária | Evidência para encerrar |
| --- | --- | --- |
| OQ-01 | Mariana como persona primária; Rafael e Alex como secundárias; metas de RNF-02. | Aprovação de produto e avaliação das jornadas. |
| OQ-02 | Site responsivo, dimensões de RNF-01 e navegadores de RNF-10. | Matriz de suporte aprovada. |
| OQ-03 | Busca mundial, envio explícito, 2 a 100 caracteres, dez resultados e qualificação de BR-01 a BR-04. | Aprovação de produto e amostras do provedor para localidades e caracteres representativos. |
| OQ-04 | Conteúdo atual mínimo e sucesso parcial definidos em BR-05 a BR-09. | Aprovação de campos, fallback e estados; contrato validado com a fonte. |
| OQ-05 | Resumo diário com mínima, máxima e condição; fuso IANA da cidade e janela local. | Aprovação do conteúdo e cenários de fronteira de datas. |
| OQ-06 | Uma casa decimal, empates afastados de zero, unidade somente em memória e Celsius após recarga. | Aprovação das regras de exibição e preferência. |
| OQ-07 | Atualização manual, a cada 15 min visíveis e na virada local; validade atual de 3 h e tolerância futura de 5 min. | Aprovação de produto e compatibilidade com frequência e semântica do provedor. |
| OQ-08 | Timeout de 10 s, sem repetição automática após falha, sem cache de recuperação e bloqueio por limite segundo BR-15. | Aprovação dos estados e impacto no tráfego esperado. |
| OQ-09 | Meta e método de desempenho de RNF-04. | Aprovação do ambiente de referência e orçamento de desempenho. |
| OQ-10 | Disponibilidade da aplicação segundo RNF-05, sem prometer SLA do provedor. | Hospedagem, custo, ponto de medição e responsável operacional definidos. |
| OQ-11 | WCAG 2.2 AA e matriz assistiva de RNF-03. | Critérios aprovados e auditoria antes do lançamento. |
| OQ-12 | Sem telemetria própria nem persistência local; chamadas externas e registros da hospedagem sujeitos a análise. | Fluxo de dados, finalidade, retenção externa conhecida e informação ao usuário documentados. |
| OQ-13 | Confirmar uso educacional, pessoal ou comercial, tráfego, cobertura, licença, atribuição, custo, limites e suporte do Open-Meteo sem API key. | Evidência dos termos vigentes e adequação ao uso real. Se inviável, bloquear lançamento e revisar D-01 com stakeholders. |