-- Adiciona coluna details (descrição sensorial) à tabela products
-- e popula conteúdo editorial completo: notes, description, details,
-- suggested_use, composition, ritual para as 9 velas.

ALTER TABLE products ADD COLUMN IF NOT EXISTS details text;

-- ─────────────────────────────────────────────
-- Gin
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = 'zimbro — funcho doce — gerânio — citronela — palmarosa — canela',
  description = $$acorde aromático herbal especiado
uma construção de inspiração botânica, construída exclusivamente a partir de óleos essenciais
o zimbro conduz a abertura com perfil seco e resinoso, remetendo às botânicas clássicas do gin
funcho doce e gerânio introduzem nuances verdes e levemente anisadas, enquanto a citronela e a palmarosa ampliam a sensação de frescor e expansão
a canela aparece de forma contida, oferecendo calor sutil e sustentação ao conjunto$$,
  details = $$gin é um aroma de clareza ativa
fresco, estruturado e preciso, ocupa o espaço com leveza e definição
um perfume que estimula presença, circulação de ar e atenção contínua$$,
  suggested_use = 'indicada para encontros, áreas de convivência, momentos de troca ou ambientes que pedem energia limpa e foco compartilhado',
  composition = $$ceras vegetais de coco arroz e palma
óleos essenciais de zimbro funcho doce gerânio citronela palmarosa e canela
200 g — duração aproximada de 40 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'gin';

-- ─────────────────────────────────────────────
-- Campos
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = 'capim cidreira — litsea cubeba — cedro virgínia',
  description = $$acorde aromático cítrico-herbal amadeirado
construído a partir de matérias-primas de perfil verde e luminoso
o capim-cidreira e a litsea cubeba conduzem a abertura fresca e vibrante, com nuances cítricas secas e limpas
o cedro virgínia estrutura o acorde com base amadeirada suave, conferindo estabilidade e permanência ao aroma no ambiente$$,
  details = $$campos é um aroma de clareza e respiração ampla. fresco sem se agudo, cítrico sem doçura. um perfume que organiza o espaço, favorecendo estados de atenção leve, foco tranquilo e sensação de ar renovado$$,
  suggested_use = 'indicada para ambientes de trabalho, início do dia ou momentos que pedem lucidez e leveza',
  composition = $$ceras vegetais de coco arroz e palma
óleos essenciais de capim-cidreira litsea cubeba e cedro virgínia
200 g — duração aproximada de 40 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'campos';

-- ─────────────────────────────────────────────
-- Ícaro
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = 'lavanda — menta — cravo',
  description = $$acorde aromático herbal especiado, estruturado a partir de ervas aromáticas frescas e especiarias sutis. A lavanda sustenta o corpo do acorde com perfil limpo e aromático, enquanto a menta abre o aroma com frescor expansivo e sensação aérea. O cravo aparece de forma contida aquecendo a composição e conferindo profundidade sem pesar$$,
  details = $$ícaro é um aroma de equilíbrio e clareza
herbal, fresco e seco, organiza o espaço e favorece estados de atenção tranquila, respiração consciente e presença contínua$$,
  suggested_use = 'indicada para momentos de pausa, práticas contemplativas, leitura ou início do dia',
  composition = $$ceras vegetais de coco arroz e palma
óleos essenciais de lavanda menta e cravo
200 g — duração aproximada de 40 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'icaro';

-- ─────────────────────────────────────────────
-- Estela
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = 'palmarosa — patchouli — ylang ylang',
  description = $$acorde aromático floral terroso amadeirado
uma composição de flores densas e matérias de base profunda
a palmarosa conduz a abertura com um floral rosado de perfil verde e luminoso
o ylang ylang adiciona corpo e textura, com nuance cremosa e envolvente, enquanto o patchouli ancora o acorde com fundo terroso, seco e persistente$$,
  details = $$estela é um aroma de presença contínua
floral sem doçura, profundo sem peso
um perfume que se expande lentamente no ambiente, criando uma atmosfera de acolhimento silencioso e estabilidade sensorial$$,
  suggested_use = 'indicada para o final do dia, momentos de recolhimento, leitura ou ambientes que pedem pausa e densidade tranquila',
  composition = $$ceras vegetais de coco arroz e palma
óleos essenciais de palmarosa patchouli e ylang-ylang
200 g — duração aproximada de 40 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'estela';

-- ─────────────────────────────────────────────
-- Pomar
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = 'laranja doce — cedros — cravo',
  description = $$acorde aromático cítrico especiado amadeirado
uma composição de caráter luminoso e estruturado
a laranja doce abre o acorde com frescor suculento e natural, sem doçura excessiva
o cedro estabelece uma base seca e estável, enquanto o cravo atravessa a composição com calor discreto, sustentando o aroma no ambiente com sobriedade$$,
  details = $$pomar é um aroma de vitalidade serena
há energia, mas sem agitação
o cítrico aparece domado, apoiado por madeiras e especiarias que organizam o espaço e trazem sensação de conforto claro e contínuo$$,
  suggested_use = 'indicada para áreas de convivência, cozinhas, salas de estar ou momentos de circulação e presença ativa',
  composition = $$ceras vegetais de coco arroz e palma
óleos essenciais de laranja doce cedro virgínia cedro atlas e cravo
200 g — duração aproximada de 40 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'pomar';

-- ─────────────────────────────────────────────
-- Dulce
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = 'baunilha — palmarosa — ylang ylang — vetiver — canela',
  description = $$acorde aromático especiado floral amadeirado
uma composição de camadas densas e bem integradas
a baunilha aparece de forma seca e contida, sem dulçor excessivo, servindo como eixo de ligação entre flores e madeiras
a palmarosa e o ylang-ylang constroem um corpo floral encorpado e envolvente, enquanto o vetiver aporta estrutura terrosa e verticalidade
a canela atravessa o acorde com calor preciso, conferindo profundidade e continuidade$$,
  details = $$dulce é um aroma de interioridade e repouso
quente, estável e progressivo, ocupa o espaço de maneira constante, criando uma atmosfera de recolhimento, densidade confortável e permanência sensorial$$,
  suggested_use = 'indicada para o final do dia, ambientes de descanso, salas íntimas ou momentos de desaceleração prolongada',
  composition = $$ceras vegetais de coco arroz e palma
composição aromática com baunilha e óleos essenciais de palmarosa ylang-ylang, vetiver e canela
200 g — duração aproximada de 40 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'dulce';

-- ─────────────────────────────────────────────
-- Bosque
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = 'alecrim — eucalipto — cravo',
  description = $$acorde aromático verde resinoso canforado
uma construção botânica de caráter silvestre, onde notas verdes e canforadas se entrelaçam a nuances especiadas e resinosas
a abertura é nítida e aérea, com frescor balsâmico que evoca folhagens úmidas e ar de mata
no desenvolvimento, o calor seco das especiarias sustenta a coposição, criando profundidade e permanência sem densidade excessiva$$,
  details = $$bosque cria um ambiente de respiração ampla e foco sereno
um aroma que organiza o espaço, amplia a sensação de ar e convida à presença atenta
verde, vivo e silenciosamente estruturado$$,
  suggested_use = 'indicada para momentos de recolhimento ativo, práticas de concentração, leitura ou ambientes que pedem clareza e oxigenação sensorial',
  composition = $$ceras vegetais de coco arroz e palma
óleos essenciais de alecrim eucalipto e cravo
300 g — duração aproximada de 50 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'bosque';

-- ─────────────────────────────────────────────
-- Caramelo
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = NULL,
  description = $$acorde aromático chipre frutado cremoso
uma construção aromática de perfil envolvente, onde frutas luminosas encontram um corpo cremoso e um fundo ambarado macio
a abertura é redonda e convidativa, com doçura controlada e frescor sutil
no desenvolvimento, flores suaves e notas lacônicas criam textura, enquanto o fudo adocicado e almiscarado sustenta a composição com conforto e permanência$$,
  details = $$caramelo propõe uma leitura contemporânea de acordes adocicados e cremosos, tratados com contenção
o resultado é um aroma de calor moderado, com textura e profundidade, pensado para permanecer no ambiente sem dominar$$,
  suggested_use = 'indicada para salas de estar, encontros informais, rituais de descanso ou momentos em que o ambiente pede aconchego com elegância',
  composition = $$ceras vegetais de coco arroz e palma
composição aromática de perfil chipre frutado, enriquecida com óleo essencial de patchouli
300 g — duração aproximada de 50 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'caramelo';

-- ─────────────────────────────────────────────
-- Ritual
-- ─────────────────────────────────────────────
UPDATE products SET
  notes = NULL,
  description = $$acorde aromático amadeirado ambarado couro
uma construção aromática de perfil profundo e bem arquitetado
a abertura traz especiarias frias e um acorde alcoólico discreto, que conduzem a um corpo ambarado de caráter seco e floral
no fundo, madeiras quentes e couro macio firmam a base e dão sustentação ao conjunto$$,
  details = $$Ritual estabelece uma atmosfera de recolhimento lúcido
amadeirado e escuro, organiza o ambiente e convida a um ritmo mais lento de presença
um perfume que permanece no ar com sobriedade e peso justo$$,
  suggested_use = 'indicada para o início ou encerramento do dia, práticas de silêncio, escrita, leitura noturna ou ambientes que pedem contenção aromática e foco interior',
  composition = $$ceras vegetais de coco arroz e palma
composição aromática de perfil amadeirado ambarado couro
300 g — duração aproximada de 50 h
produção artesanal — bragança paulista — sp$$,
  ritual = $$utilize sobre superfícies estáveis e resistentes ao calor
permita que a cera derreta por completo nas primeiras e demais utilizações
apare o pavio regularmente para melhor desempenho e queima limpa$$
WHERE slug = 'ritual';
