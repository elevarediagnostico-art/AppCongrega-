# Identidade visual por igreja

## 1. Recursos reutilizados

A implementação reutiliza a tabela `churches`, a associação `memberships`, o controlo de capacidades por igreja, a consulta `church.mine`, o painel administrativo e o invólucro de páginas de membro. Não foram criadas aplicações, PWA, perfis ou bases de código separados por comunidade.

## 2. Recursos criados

Foram acrescentados à configuração existente da igreja os campos de **cor primária**, **cor secundária**, **imagem de capa** e **mensagem de boas-vindas**. Foi criado um formulário administrativo protegido para atualização dessa identidade e a experiência do membro passou a ler as configurações da sua própria igreja.

## 3. Pontos onde a personalização é aplicada

O nome e o logo aparecem na navegação. As cores definem os destaques de navegação. A capa e a mensagem de boas-vindas são apresentadas no topo da experiência de membro quando configuradas. O painel administrativo oferece pré-visualização simples antes de guardar a configuração.

## 4. Isolamento entre igrejas

As configurações continuam na mesma linha da tabela `churches` e são lidas através da associação ativa do utilizador em `memberships`. A atualização exige a capacidade `manage_church`, verificada dentro do contexto da `churchId` solicitada. Assim, um Administrador só pode alterar e visualizar a identidade da igreja à qual pertence.

## 5. Pontos fora do escopo

Esta etapa não cria um aplicativo por igreja, código duplicado, ícone PWA individual, novos perfis, pagamentos, faturação, comissões, afiliados, CRM, automações comerciais, IA, chat ou integrações externas.
