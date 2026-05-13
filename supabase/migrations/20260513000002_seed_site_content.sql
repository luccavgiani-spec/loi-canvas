-- =========================================================================
-- Seed inicial de site_content + site_content_list_items.
-- Espelha 1:1 o conteúdo hardcoded nas páginas em escopo
-- (ver MAPEAMENTO_PAINEL.md).
-- =========================================================================

-- ─── HOME ─────────────────────────────────────────────────────────────
INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_text) VALUES
  ('home','hero','cta_primario','text','navegar'),
  ('home','hero','cta_secundario','text','nossa história'),
  ('home','bestsellers','eyebrow','text','bestsellers'),
  ('home','bestsellers','titulo','text','mais pedidas'),
  ('home','descubra_novos_aromas','titulo','text','Descubra novos aromas'),
  ('home','descubra_novos_aromas','cta','text','ver toda a coleção'),
  ('home','colaboracoes','eyebrow','text','collabs'),
  ('home','colaboracoes','titulo','text','Colaborações'),
  ('home','colaboracoes','cta','text','ver todas as colaborações'),
  ('home','faq','eyebrow','text','dúvidas'),
  ('home','faq','titulo','text','Perguntas frequentes');

INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_ref_id)
SELECT 'home','descubra_novos_aromas','colecao_ref','collection_ref', id
FROM public.collections WHERE slug = 'refugio';

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields) VALUES
  ('home','hero','banners',0,'{"url":"https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banner%2010.jpg"}'::jsonb),
  ('home','hero','banners',1,'{"url":"https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banner%209.jpg"}'::jsonb),
  ('home','hero','banners',2,'{"url":"https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banners%20(1).webp"}'::jsonb),
  ('home','hero','banners',3,'{"url":"https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banners%20(3).webp"}'::jsonb),
  ('home','hero','banners',4,'{"url":"https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banners%20(5).webp"}'::jsonb),
  ('home','hero','banners',5,'{"url":"https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banners%20(6).webp"}'::jsonb),
  ('home','hero','banners',6,'{"url":"https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banners%20(7).webp"}'::jsonb);

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields)
SELECT 'home','produto_foco','slots',0, jsonb_build_object(
  'produto_id', p.id::text,
  'video_url','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos/loie_vela_bosque_compress%20(1).mp4'
)
FROM public.products p WHERE p.slug = 'bosque';

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields)
SELECT 'home','produto_foco','slots',1, jsonb_build_object(
  'produto_id', p.id::text,
  'video_url','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos/LOIE.pomarOverdelivery.mp4'
)
FROM public.products p WHERE p.slug = 'pomar';

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields) VALUES
  ('home','faq','perguntas',0, jsonb_build_object(
    'pergunta','Qual o tempo de queima das velas?',
    'resposta',E'cotidianas 160g ————————— aprox. 20 horas\nsala 200g —————————————— aprox. 45 horas\nrefúgio 300g ——————————— aprox. 55 horas\nbotânicas & florais 400g —— aprox. 65 horas\n\npara queimas saudáveis e seguras, recomendamos sessões de até 4 horas seguidas — tempo suficiente para perfumar o ambiente sem comprometer o desempenho da vela.'
  )),
  ('home','faq','perguntas',1, jsonb_build_object(
    'pergunta','Por que o aroma não se comporta igual em todos os ambientes?',
    'resposta',E'A percepção de uma composição aromática no ambiente depende de fatores físicos e de uso. não se trata apenas da fragrância em si, mas de como ela se difunde e se mantém no espaço.\n\nos principais pontos são:\n\ntamanho do ambiente\nA escala do espaço influencia diretamente a intensidade percebida. Ambientes maiores diluem mais rapidamente o aroma, exigindo maior carga ou reforço de aplicação. Ambientes menores concentram, o que pede moderação para evitar saturação.\n\ncirculação de ar\na movimentação do ar acelera a dispersão das partículas aromáticas. locais com janelas abertas, ventilação constante ou ar-condicionado tendem a reduzir a duração do aroma. ambientes fechados favorecem maior permanência.\n\nforma de uso\ncada produto atua de maneira diferente na liberação da composição aromática:\n• velas aromáticas: a liberação ocorre pelo aquecimento da cera, promovendo difusão gradual e contínua enquanto acesa.\n• sprays de ambiente: liberam partículas no ar de forma imediata, com efeito mais rápido e duração mais curta.\n\nposicionamento\na localização do produto interfere na distribuição do aroma. pontos de circulação favorecem a propagação. superfícies muito isoladas tendem a limitar o alcance.'
  )),
  ('home','faq','perguntas',2, jsonb_build_object(
    'pergunta','As velas são veganas e cruelty-free?',
    'resposta','Sim. Utilizamos exclusivamente ceras vegetais de coco, arroz e palma, pavios de algodão e óleos essenciais puros — sem nenhum componente de origem animal. Nenhum produto Loiê é testado em animais.'
  )),
  ('home','faq','perguntas',3, jsonb_build_object(
    'pergunta','Posso trocar ou devolver?',
    'resposta','Aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto esteja sem uso. Para solicitar, basta entrar em contato pelo e-mail ou WhatsApp — resolvemos com agilidade.'
  )),
  ('home','faq','perguntas',4, jsonb_build_object(
    'pergunta','As velas são seguras para uso com pets ou crianças?',
    'resposta','Nossas velas são feitas com óleos essenciais puros e ceras vegetais sem aditivos sintéticos. Em ambientes com pets ou crianças pequenas, recomendamos ventilação adequada e manter a vela fora do alcance. Óleos como eucalipto e menta exigem atenção especial com gatos — prefira usar com o ambiente bem arejado.'
  )),
  ('home','faq','perguntas',5, jsonb_build_object(
    'pergunta','Qual a diferença entre as velas de 200g e as de 300g?',
    'resposta','As velas de 200g têm duração aproximada de 45 horas e são ideais para ambientes menores ou uso diário. As de 300g duram cerca de 55 horas e entregam maior presença aromática — indicadas para salas maiores ou para quem quer que o aroma se prolongue por mais tempo.'
  )),
  ('home','faq','perguntas',6, jsonb_build_object(
    'pergunta','Posso usar a vela em ambientes pequenos, como banheiros?',
    'resposta','Sim. Em espaços menores, o aroma se concentra com rapidez. Recomendamos sessões mais curtas para evitar saturação sensorial. Velas com perfil mais suave, como Campos ou Ícaro, funcionam especialmente bem nesses ambientes.'
  )),
  ('home','faq','perguntas',7, jsonb_build_object(
    'pergunta','Como armazenar a vela quando não estiver em uso?',
    'resposta','Guarde em local fresco, seco e afastado da luz solar direta. Evite superfícies que absorvam calor, como peitoris de janela em dias quentes.'
  ));

-- ─── SOBRE ────────────────────────────────────────────────────────────
INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_text) VALUES
  ('sobre','hero','titulo','rich_text','a loiê sala aromática é esse gesto poético, mas também é um ateliê real — feito de tempo, matéria, escolhas e presença'),
  ('sobre','historia','eyebrow','text','história'),
  ('sobre','historia','corpo','rich_text', E'a loiê nasceu em 2015, a partir de pequenos experimentos realizados pelo artista e fundador andré magalhães liza. desde o início, o gesto de acender uma vela esteve ligado ao desejo de qualificar o tempo — dentro de casa, no cotidiano, no silêncio entre as tarefas.\n\no ateliê tomou forma com a ocupação de uma casa antiga de família, no interior de são paulo. reativar esse espaço foi também um exercício de memória: recuperar valores, ritmos e afetos que atravessam gerações. a casa moldou a loiê tanto quanto a loiê passou a habitar a casa.\n\nao longo de sua trajetória, a marca foi construída em diferentes etapas e parcerias, sempre guiada pela atenção às matérias-primas, ao fazer manual e à experiência sensível do aroma. trabalhamos com ceras vegetais, óleos essenciais e processos cuidadosos, respeitando o tempo de cada criação.\n\nhoje a loiê sala aromática segue como um ateliê autoral dedicado à criação de atmosferas — objetos que convidam à presença, ao cuidado e a uma relação mais consciente com o espaço e consigo mesmo. acreditamos que habitar o agora, com atenção e delicadeza, também é uma forma de transformar o mundo.'),
  ('sobre','historia','assinatura_1','text','por andré liza'),
  ('sobre','historia','assinatura_2','text','loiê sala aromática'),
  ('sobre','manifesto','eyebrow','text','manifesto'),
  ('sobre','manifesto','corpo','rich_text', E'acendemos uma vela como quem abre uma porta. uma porta pra dentro. pra memória. pra beleza que mora no silêncio.\n\na loiê nasceu de uma casa antiga, de um ritual secreto, de um saber que se aprende com as mãos e os sentidos. cada aroma é uma narrativa, cada frasco é um convite a ficar mais tempo com o que importa.\n\n*somos fogo, mas somos calma. somos essência, mas somos presença. somos brasileiros, feitos à mão, com técnica e alma.*\n\nnão vendemos velas. criamos atmosferas.'),
  ('sobre','cta_final','chamada','text','CONHEÇA NOSSOS PRODUTOS'),
  ('sobre','cta_final','botao','text','CONHECER COLEÇÕES');

INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_image_url) VALUES
  ('sobre','hero','imagem_mobile','image','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/about/andre%20e%20brisa.jpg'),
  ('sobre','hero','imagem_desktop','image','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/about/banner%20hero.jpg'),
  ('sobre','historia','imagem_1','image','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/lembrancas/banner%20hero%20lembrancas.jpg'),
  ('sobre','historia','imagem_2','image','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/about/conceitual%204.jpg'),
  ('sobre','historia','imagem_3','image','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/about/conceitual%202.jpg'),
  ('sobre','imagem_full_bleed','imagem','image','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/about/andreloie-15PB.jpg');

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields) VALUES
  ('sobre','filosofia','pilares',0, jsonb_build_object(
    'label','origem','titulo','Feito à Mão',
    'texto','Cada vela começa no gesto. Na escolha da composição da cera, na medida do aroma, na hora certa de derramar. Não há pressa no que queremos que dure.'
  )),
  ('sobre','filosofia','pilares',1, jsonb_build_object(
    'label','matéria','titulo','Só o Essencial',
    'texto','Ceras vegetais de coco, arroz e palma. Composições aromáticas puras. Pavios de algodão. Sem compostos que o nariz detecta como superficiais.'
  )),
  ('sobre','filosofia','pilares',2, jsonb_build_object(
    'label','propósito','titulo','Atmosfera como linguagem',
    'texto','Não é decoração. É sobre presença. Uma vela não enfeita o espaço — ela o define. O aroma diz o que o ambiente é.'
  ));

-- ─── PRODUTOS (listagem geral) ────────────────────────────────────────
INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_text, value_image_url) VALUES
  ('produtos','hero','eyebrow','text','produtos',NULL),
  ('produtos','hero','titulo','text','todos os aromas',NULL),
  ('produtos','hero','subtitulo','text','o catálogo inteiro, em um só lugar. navegue, refine e encontre o aroma que habita o seu espaço.',NULL),
  ('produtos','hero','imagem_fundo','image',NULL,'https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/banner/banners%20(6).webp');

-- ─── LEMBRANÇAS ───────────────────────────────────────────────────────
INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_text, value_image_url) VALUES
  ('lembrancas','hero','titulo','text','Lembranças sob Curadoria',NULL),
  ('lembrancas','hero','subtitulo','text','memória e sofisticação: há gestos que permanecem',NULL),
  ('lembrancas','hero','imagem_fundo','image',NULL,'https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/lembrancas/andreloie-96.jpg'),
  ('lembrancas','storytelling','corpo','rich_text','as lembranças da loiê nascem com...',NULL),
  ('lembrancas','formulario','titulo','text','solicitar proposta',NULL),
  ('lembrancas','formulario','subtitulo','text','conte-nos sobre o seu projeto',NULL),
  ('lembrancas','formulario','botao','text','SOLICITAR PROPOSTA',NULL),
  ('lembrancas','formulario','texto_sucesso','text','mensagem enviada. entraremos em contato em breve.',NULL),
  ('lembrancas','formulario','texto_erro','text','algo deu errado. tente novamente ou entre em contato pelo whatsapp.',NULL);

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields) VALUES
  ('lembrancas','galeria_intercalada','blocos',0, jsonb_build_object(
    'imagem_url','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/lembrancas/andreloie-81.webp',
    'frase','Uma vela que leva o nome deles. Que traduz o dia em que disseram sim',
    'posicao','esquerda','tema','cream'
  )),
  ('lembrancas','galeria_intercalada','blocos',1, jsonb_build_object(
    'imagem_url','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/lembrancas/andreloie-82.webp',
    'frase','Para quem não some depois da festa',
    'posicao','direita','tema','charcoal'
  )),
  ('lembrancas','galeria_intercalada','blocos',2, jsonb_build_object(
    'imagem_url','https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/lembrancas/andreloie-86.webp',
    'frase','Discreto no gesto. Marcante na lembrança. Sem excesso. Com intenção',
    'posicao','esquerda','tema','cream'
  ));

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields) VALUES
  ('lembrancas','conversao','cards',0, jsonb_build_object(
    'numeral','01','titulo','CASAMENTOS & CERIMÔNIAS',
    'descricao','velas personalizadas com nomes, data e aroma escolhido. embalagens exclusivas. mínimo de 30 unidades.'
  )),
  ('lembrancas','conversao','cards',1, jsonb_build_object(
    'numeral','02','titulo','MADRINHAS & PADRINHOS',
    'descricao','presentes que criam memória afetiva. kits com 1 ou 2 velas, mensagem manuscrita opcional e caixa loiê exclusiva.'
  )),
  ('lembrancas','conversao','cards',2, jsonb_build_object(
    'numeral','03','titulo','PRESENTES CORPORATIVOS',
    'descricao','para clientes, parceiros e equipes. identidade visual da sua marca integrada à nossa estética. projetos a partir de 50 unidades.'
  ));

-- ─── PRODUCT DETAIL (globais) ─────────────────────────────────────────
INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_text) VALUES
  ('product_detail','dropdowns','label_descricao_sensorial','text','DESCRIÇÃO SENSORIAL'),
  ('product_detail','dropdowns','label_uso_sugerido','text','USO SUGERIDO'),
  ('product_detail','dropdowns','label_composicao','text','COMPOSIÇÃO & DESEMPENHO'),
  ('product_detail','dropdowns','label_ritual','text','RITUAL DE USO'),
  ('product_detail','relacionados','eyebrow','text','recomendados'),
  ('product_detail','relacionados','titulo','text','Você também pode gostar'),
  ('product_detail','ctas','adicionar_carrinho','text','adicionar ao carrinho'),
  ('product_detail','ctas','comprar_agora','text','comprar agora'),
  ('product_detail','ctas','em_breve','text','em breve'),
  ('product_detail','ctas','esgotado','text','esgotado');

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields) VALUES
  ('product_detail','benefits','itens',0,'{"texto":"Frete grátis acima de R$ 299","icone":"truck"}'::jsonb),
  ('product_detail','benefits','itens',1,'{"texto":"Trocas em até 7 dias","icone":"refresh-cw"}'::jsonb),
  ('product_detail','benefits','itens',2,'{"texto":"Embalagem sustentável","icone":"leaf"}'::jsonb),
  ('product_detail','benefits','itens',3,'{"texto":"Feita em pequenos lotes","icone":"package"}'::jsonb);

-- ─── COLLECTION DETAIL (globais) ──────────────────────────────────────
INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_text) VALUES
  ('collection_detail','nav','cta_back','text','todas as coleções'),
  ('collection_detail','outras_colecoes','eyebrow','text','explorar'),
  ('collection_detail','outras_colecoes','titulo','text','Outras Coleções');

-- ─── FOOTER ───────────────────────────────────────────────────────────
INSERT INTO public.site_content (page_key, section_key, block_key, content_type, value_text, value_url) VALUES
  ('footer','brand','tagline','rich_text','a loiê é uma marca brasileira de velas aromáticas feita com óleos essenciais e estética autoral.',NULL),
  ('footer','colecao','heading','text','Coleção',NULL),
  ('footer','sobre','heading','text','Sobre',NULL),
  ('footer','contato','heading','text','Contato',NULL),
  ('footer','contato','email','text','loie.aromatica@gmail.com',NULL),
  ('footer','contato','telefone','text','(11) 99649-7672',NULL),
  ('footer','contato','endereco_1','text','Rua Cel. João Leme, 688',NULL),
  ('footer','contato','endereco_2','text','Bragança Paulista, SP 12900-161',NULL),
  ('footer','bottom_bar','link_politicas_url','url',NULL,'/policies'),
  ('footer','brand_signature','texto','text','somos brasileiros, feitos à mão, com técnica e com alma',NULL);

INSERT INTO public.site_content_list_items (page_key, section_key, list_key, item_index, fields) VALUES
  ('footer','colecao','links',0,'{"rotulo":"Todos os produtos","url":"/produtos"}'::jsonb),
  ('footer','colecao','links',1,'{"rotulo":"Cotidianas","url":"/colecoes/cotidianas"}'::jsonb),
  ('footer','colecao','links',2,'{"rotulo":"Sala","url":"/colecoes/sala-ou-estar"}'::jsonb),
  ('footer','colecao','links',3,'{"rotulo":"Refúgio","url":"/colecoes/refugio"}'::jsonb),
  ('footer','colecao','links',4,'{"rotulo":"Botânicas & Florais","url":"/colecoes/botanicas-e-florais"}'::jsonb),
  ('footer','sobre','links',0,'{"rotulo":"Nossa História","url":"/sobre"}'::jsonb),
  ('footer','sobre','links',1,'{"rotulo":"Colaborações","url":"/collabs"}'::jsonb),
  ('footer','sobre','links',2,'{"rotulo":"Contato","url":"/contact"}'::jsonb),
  ('footer','sobre','links',3,'{"rotulo":"Políticas","url":"/policies"}'::jsonb),
  ('footer','contato','redes_sociais',0,'{"nome":"Instagram","url":"https://www.instagram.com/loie_____/"}'::jsonb),
  ('footer','contato','redes_sociais',1,'{"nome":"Facebook","url":"https://www.facebook.com/loievelas"}'::jsonb);
