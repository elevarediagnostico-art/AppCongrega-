# Igreja Jornada

**Igreja Jornada** é uma aplicação web responsiva e mobile-first para a experiência diária dos membros e a operação segura de igrejas locais. A plataforma reúne jornada bíblica, Pão Diário, Palavra da Igreja, EBD, agenda, galeria, pedidos de oração, acompanhamento pastoral, Conexões e relatórios mensais.

## Princípios do produto

Cada igreja é um espaço lógico independente numa infraestrutura partilhada. Todos os dados de domínio pertencem a uma `churchId`; as operações de backend validam a pertença do utilizador e o respetivo papel antes de consultar ou alterar dados.

| Papel | Objetivo principal |
| --- | --- |
| **Membro** | Participar na jornada e na comunidade. |
| **Pastor** | Observar indicadores objetivos, interpretar e cuidar. |
| **Administrador** | Alimentar conteúdos, operar EBD, gerir agenda, galeria, membros e relatórios. |

## Funcionalidades principais

O membro pode acompanhar o **Plano Bíblico**, registar leituras, ver o **Pão Diário** e a **Palavra da Igreja**, consultar agenda, fazer check-in de EBD, enviar pedidos de oração, ver a sua jornada, conhecer Conexões e consultar a galeria. O Administrador gere os conteúdos e operações; o Pastor acede ao acompanhamento pastoral e aos relatórios, sem ser transformado num operador administrativo.

## Desenvolvimento local

```bash
pnpm install
pnpm drizzle-kit migrate
pnpm dev
```

Em desenvolvimento, a aplicação precisa de uma base MySQL/TiDB e das variáveis apresentadas em `.env.example`. O comando abaixo valida a tipagem e os testes unitários.

```bash
pnpm check
pnpm test
```

## Planos comerciais

| Plano | Faixa de membros | Valor mensal |
| --- | ---: | ---: |
| Nossos planos | Até 100 | R$ 97 |
| Comunidade | Até 500 | R$ 147 |
| Igreja | 500+ | R$ 217 |

> Todos os planos possuem acesso a todos os recursos da plataforma. O valor varia apenas conforme o número de membros cadastrados.

O modelo de planos é informativo e de controlo de faixa. Esta aplicação não processa pagamentos nem guarda meios de pagamento.

## Evolução controlada

Consulte `PROJECT_GUARDRAILS.md` antes de iniciar qualquer novo módulo. O documento estabelece o protocolo de escopo, dados, tabelas afetadas e preservação de funcionalidades existentes.
