# Permissões e acesso

O sistema utiliza três papéis congelados. Eles foram escolhidos para separar experiência, cuidado e operação sem proliferar níveis de acesso.

## Membro

Pode participar na jornada, consumir conteúdos, consultar agenda e galeria, registar a leitura, fazer check-in quando inscrito numa EBD, confirmar eventos, enviar pedidos de oração, consultar Conexões e atualizar a própria experiência. Não acede a dados de outras pessoas ou operações administrativas.

## Pastor

Pode consultar indicadores, frequência, evolução do Plano Bíblico, pedidos de oração e sinais objetivos de atenção pastoral. O Pastor **olha, interpreta e cuida**. A área pastoral não expõe editoriais, gestão de álbum, EBD, agenda ou moderação operacional.

## Administrador

Pode gerir membros, Plano Bíblico, Pão Diário, Palavra da Igreja, calendário, eventos, avisos, EBD, Revista EBD, QR Code, galeria, Conexões e relatórios. O Administrador opera o sistema, mas não vê a atenção pastoral exclusiva do Pastor.

## Regras não negociáveis

| Regra | Aplicação |
| --- | --- |
| Autorização no backend | Todo procedimento sensível usa autenticação e validação por `churchId`. |
| Privacidade de oração | Somente autor e perfis autorizados conforme visibilidade. |
| Atenção pastoral privada | Acesso exclusivo do papel Pastor. |
| Dados de outra igreja | Sempre bloqueados por ausência de membership válida. |
| Galeria | Membros consultam, partilham e descarregam quando permitido; apenas Administrador publica. |
