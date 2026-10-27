# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. A experiência deve atender tanto a dispositivos móveis quanto a outros formatos de tela. O briefing identifica busca por cidade, consulta do clima atual, previsão para cinco dias e escolha entre Celsius e Fahrenheit como capacidades centrais.

## Personas

As personas propostas durante o discovery são hipóteses a validar, não uma definição aprovada do público. As métricas abaixo são candidatas; a prioridade entre personas permanece em aberto.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso do ponto de vista da persona |
| --- | --- | --- | --- |
| Mariana, rotina urbana | Consultar o clima atual para decidir o que vestir antes de sair. | Mobile, pela manhã, com pouco tempo e conexão variável. | Encontrar sua cidade e entender as condições atuais em até 30 segundos, sem ajuda. |
| Rafael, viajante de curta duração | Consultar a previsão dos próximos cinco dias para preparar a mala e organizar passeios. | Desktop no planejamento e mobile próximo da viagem. | Identificar a cidade correta, inclusive entre homônimas, e consultar hoje e os quatro dias seguintes em até 1 minuto. |
| Alex, usuário habituado a Fahrenheit | Entender temperaturas na unidade que usa no cotidiano. | Mobile e desktop, consultando cidades de diferentes países. | Mudar para °F em uma ação, com todas as temperaturas atualizadas e a unidade claramente indicada. |

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o local desejado para consultar o clima.
- **RF-02 — Exibir clima atual:** apresentar as condições atuais para a cidade selecionada.
- **RF-03 — Exibir previsão:** apresentar a previsão do tempo para hoje e os quatro dias seguintes.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius (°C) e Fahrenheit (°F), atualizando as temperaturas exibidas.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade e compatibilidade móvel:** conteúdo e controles devem se adaptar a dispositivos móveis e outras larguras de tela, mantendo legibilidade e acesso às funcionalidades centrais. Como critério candidato a validar, considerar larguras de 320 px a 1440 px, sem rolagem horizontal ou perda de conteúdo essencial.
- **RNF-02 — Usabilidade:** busca, consulta e troca de unidade devem ser compreensíveis e operáveis sem etapas desnecessárias.
- **RNF-03 — Acessibilidade:** interface e controles devem permitir operação por teclado e uso com tecnologias assistivas. Conformidade com WCAG 2.2 nível AA é uma meta candidata a validar com as partes interessadas.
- **RNF-04 — Desempenho:** busca e consulta devem responder dentro de metas acordadas, em condições de rede e dispositivos definidos. Como referência para discussão, considerar exibição dos resultados em até 2 segundos no percentil 95, separando o tempo da aplicação de atrasos do provedor externo.
- **RNF-05 — Disponibilidade:** a disponibilidade mensal esperada e o tratamento de manutenção ou falha de dependências externas devem ser definidos. Uma meta de 99,9% é apenas uma referência candidata, sujeita à validação de custo e capacidade do provedor.
- **RNF-06 — Atualidade dos dados:** cada conjunto de dados deve ter horário de referência visível; a frequência de atualização e a idade máxima aceitável dos dados devem ser acordadas.
- **RNF-07 — Resiliência:** falhas de conexão ou do provedor devem ser comunicadas claramente. Se dados em cache forem exibidos, devem ser identificados com o horário da última atualização.

## Riscos

- **R-01 — Ambiguidade de localização:** cidades com nomes iguais ou semelhantes podem levar à consulta do local errado se os resultados não distinguirem país ou região.
- **R-02 — Dependência de dados externos:** indisponibilidade, atraso ou limites de uma fonte de dados meteorológicos podem impedir ou degradar as consultas.
- **R-03 — Escopo incerto da previsão:** “previsão de 5 dias” pode significar valores diários resumidos ou previsões em intervalos menores ao longo do período.
- **R-04 — Plataforma e compatibilidade pouco especificadas:** não há definição de navegadores, tamanhos de tela ou se a experiência deve ser um site responsivo, um PWA ou um aplicativo nativo.
- **R-05 — Expectativas de atualização indefinidas:** sem uma frequência acordada, usuários podem interpretar dados válidos como desatualizados ou esperar atualizações em tempo real.

## Decisões

- **D-01 — Fonte de dados: Open-Meteo, sem API key.** **Justificativa:** simplificar a integração de geocoding e previsão, sem gerenciamento de credenciais. **Resolve:** a escolha da fonte em **Provedor de dados**; permanecem pendentes a validação de cobertura, licença, atribuição, custo, limites de requisição e suporte.
- **D-02 — Previsão de cinco dias: hoje + quatro dias.** **Justificativa:** definir uma janela única de consulta que inclua o dia atual. **Resolve:** a inclusão de hoje e a quantidade de dias em **Período da previsão**; permanecem pendentes o fuso horário de referência e, em **Detalhe da previsão**, a granularidade e as variáveis exibidas.
- **D-03 — Unidade padrão: Celsius (°C).** **Justificativa:** oferecer uma apresentação inicial consistente, mantendo a alternância para Fahrenheit prevista no RF-04. **Resolve:** a unidade inicial em **Unidades e preferências**; permanecem pendentes o alcance da troca de unidade e a persistência local da preferência.
- **D-04 — Sem autenticação e sem persistência de servidor.** **Justificativa:** reduzir a complexidade do escopo inicial, dispensando contas e armazenamento de dados da aplicação no servidor. **Resolve:** a inclusão de contas em **Escopo adjacente**, que ficam fora do escopo, e a persistência de servidor em **Privacidade e telemetria**, que não será adotada. Persistência local, coleta de dados e telemetria ainda precisam de definição; esta decisão não implica ausência de registros pelo provedor externo.
- **D-05 — Idioma da UI: pt-BR.** **Justificativa:** manter textos, controles e mensagens da interface consistentes em português brasileiro. **Resolve:** o idioma da interface em **Telas, navegadores e idiomas**; permanecem pendentes as telas e os navegadores suportados, além da cobertura geográfica e dos idiomas aceitos na busca em **Cobertura geográfica e busca**.

## Perguntas em Aberto

As perguntas abaixo registram os pontos levantados no discovery. Nos itens parcialmente resolvidos, considerar como pendentes apenas os aspectos não definidos na seção **Decisões**.

- **Público e sucesso:** quem são os usuários-alvo e quais métricas definirão o sucesso do produto? **Impacto:** sem público e resultados esperados, não é possível priorizar a experiência nem avaliar se o lançamento atende ao objetivo.
- **Plataforma:** o produto será um site responsivo, um PWA ou também terá aplicativos nativos? Quais sistemas operacionais são necessários? **Impacto:** a resposta muda arquitetura, custo, cronograma e critérios de aceite.
- **Cobertura geográfica e busca:** quais países/regiões e idiomas serão cobertos? A busca aceitará nomes parciais e acentos? Como distinguir cidades homônimas, por exemplo, com estado/província e país? **Impacto:** cobertura insuficiente ou resultados ambíguos podem levar à consulta do local errado e influenciam a escolha do provedor.
- **Clima atual:** quais informações devem ser exibidas além da temperatura, como condição, sensação térmica, umidade, vento e precipitação? **Impacto:** sem definição, o conteúdo e o escopo da interface ficam sujeitos a interpretações diferentes.
- **Atualidade:** qual idade máxima dos dados é aceitável? Deve haver atualização automática e exibição do horário da última atualização? **Impacto:** usuários podem considerar dados antigos como atuais, sem critério para avaliar a qualidade da consulta.
- **Período da previsão:** os cinco dias incluem o dia atual ou correspondem aos próximos cinco dias completos/120 horas? Qual fuso horário determina a virada do dia? **Impacto:** usuários podem receber períodos diferentes conforme a interpretação e a localização.
- **Detalhe da previsão:** a previsão será um resumo diário ou incluirá horários? Quais variáveis serão exibidas? **Impacto:** o volume de dados, o desenho das telas e o esforço de implementação dependem dessa decisão.
- **Unidades e preferências:** Celsius/Fahrenheit afetam apenas temperatura? Qual é a unidade inicial e a preferência deve persistir entre visitas ou dispositivos? **Impacto:** sem uma regra, unidades podem ser inconsistentes e a escolha do usuário pode não ser preservada.
- **Provedor de dados:** qual fonte será usada e quais requisitos existem para cobertura, licença, atribuição, custo, limites de requisição e suporte? **Impacto:** uma fonte inadequada pode limitar a cobertura, elevar custos ou comprometer disponibilidade e atualidade.
- **Erros e dados em cache:** o que mostrar quando a cidade não é encontrada, a conexão falha ou o provedor está indisponível? Dados em cache podem ser exibidos? **Impacto:** sem comportamento definido, falhas podem parecer bugs e dados antigos podem ser apresentados sem contexto.
- **Desempenho:** quais tempos de resposta são aceitáveis para busca e consulta, em quais condições de rede e dispositivos? **Impacto:** não há um critério verificável para validar lentidão ou comparar soluções.
- **Disponibilidade:** qual meta de disponibilidade é esperada e como serão tratadas manutenção e falhas do provedor externo? **Impacto:** sem metas e responsabilidades, não é possível estabelecer expectativas operacionais ou medir confiabilidade.
- **Acessibilidade:** qual padrão de conformidade será adotado e existem necessidades específicas além de teclado e tecnologias assistivas? **Impacto:** usuários podem ser excluídos e não haverá critério objetivo de validação.
- **Telas, navegadores e idiomas:** quais dimensões/orientações, navegadores/versões e idiomas devem ser suportados? **Impacto:** a solução pode falhar para parte do público ou ampliar o escopo sem necessidade.
- **Privacidade e telemetria:** haverá coleta de localização, buscas ou dados de uso? O que será armazenado e por quanto tempo? **Impacto:** a coleta pode gerar obrigações de consentimento, segurança e retenção que afetam produto e implementação.
- **Escopo adjacente:** geolocalização automática, favoritos, alertas, contas e uso offline pertencem ao lançamento inicial ou ficam fora dele? **Impacto:** expectativas não delimitadas podem expandir o escopo e comprometer prazo e orçamento.

## Suposições

- O escopo inicial é uma aplicação voltada a usuários finais, acessível em navegador e utilizável em dispositivos móveis.
- Uma pesquisa deve resultar na seleção de uma cidade específica antes da exibição dos dados.
- A previsão de cinco dias inclui hoje e os quatro dias seguintes, conforme a decisão D-02; o fuso horário de referência ainda precisa ser definido.
- Celsius e Fahrenheit são unidades de apresentação; a troca não altera a localização nem o período consultado.
- Não há, neste briefing, exigência de contas de usuário, alertas, geolocalização automática ou dados meteorológicos históricos; esses itens ficam fora do escopo inicial até confirmação.
- As metas numéricas e os padrões sugeridos nos requisitos não funcionais são referências para discussão, não compromissos aprovados; precisam de validação com as partes interessadas.
