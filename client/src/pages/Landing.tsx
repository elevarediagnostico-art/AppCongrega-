import { startLogin } from "@/const";

const CSS = `
:root{
  --ink:#1C1512;
  --ink-70: rgba(28,21,18,.72);
  --wine:#6B2737;
  --gold:#B98A3E;
  --gold-soft:#DCC48F;
  --paper:#F6F1E7;
  --paper-2:#EEE6D4;
  --paper-3:#E4D9C2;
  --muted:#726A5B;
  --line: rgba(28,21,18,.14);
  --line-soft: rgba(28,21,18,.08);
  --radius: 18px;
  --maxw: 1120px;
}
html{scroll-behavior:smooth;}
.cg *{box-sizing:border-box;}
.cg{
  background:var(--paper);
  color:var(--ink);
  font-family:'Inter',sans-serif;
  font-size:16px;
  line-height:1.6;
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
}
.cg h1,.cg h2,.cg h3,.cg .display{
  font-family:'Fraunces',serif;
  font-weight:500;
  line-height:1.15;
  letter-spacing:-0.01em;
  margin:0;
}
.cg p{margin:0;}
.cg a{color:inherit;text-decoration:none;}
.cg img,.cg svg{display:block;max-width:100%;}
.cg .wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px;}
.cg .eyebrow{
  font-family:'Inter',sans-serif;
  font-size:12.5px;
  font-weight:600;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--wine);
}
.cg .muted{color:var(--muted);}
.cg .btn{
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:13px 26px;
  border-radius:999px;
  font-family:'Inter',sans-serif;
  font-weight:600;
  font-size:15px;
  cursor:pointer;
  border:1px solid transparent;
  transition:transform .15s ease, background .2s ease, border-color .2s ease;
}
.cg .btn:hover{transform:translateY(-1px);}
.cg .btn-primary{background:var(--ink);color:var(--paper);}
.cg .btn-primary:hover{background:#2b211c;}
.cg .btn-ghost{background:transparent;color:var(--ink);border-color:var(--line);}
.cg .btn-ghost:hover{border-color:var(--ink);}
.cg section{padding:88px 0;}
.cg section.tight{padding:60px 0;}
.cg .divider{height:1px;background:var(--line);border:0;margin:0;}

.cg header{
  position:sticky;top:0;z-index:50;
  background:rgba(246,241,231,.88);
  backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line-soft);
}
.cg .nav{display:flex;align-items:center;justify-content:space-between;padding:16px 0;}
.cg .brand{display:flex;align-items:center;gap:10px;}
.cg .brand span{font-family:'Fraunces',serif;font-size:19px;letter-spacing:.14em;font-weight:500;}
.cg .nav-links{display:flex;align-items:center;gap:32px;font-size:14.5px;font-weight:500;}
.cg .nav-links a{color:var(--ink-70);transition:color .15s ease;}
.cg .nav-links a:hover{color:var(--ink);}
.cg .nav-actions{display:flex;align-items:center;gap:14px;}
.cg .nav-toggle{display:none;background:none;border:0;cursor:pointer;padding:6px;}
.cg .nav-toggle span{display:block;width:22px;height:2px;background:var(--ink);margin:5px 0;}

.cg .hero{padding:72px 0 36px;}
.cg .hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center;}
.cg .verse-tag{
  display:inline-flex;align-items:center;gap:10px;padding:8px 16px 8px 8px;border-radius:999px;
  background:var(--paper-2);border:1px solid var(--line-soft);font-size:13px;color:var(--ink-70);margin-bottom:26px;
}
.cg .verse-tag b{background:var(--ink);color:var(--paper);border-radius:999px;padding:4px 10px;font-weight:600;font-size:12px;}
.cg .hero h1{font-size:50px;max-width:600px;}
.cg .hero .lede{font-size:17.5px;color:var(--ink-70);max-width:500px;margin-top:22px;}
.cg .hero-ctas{display:flex;gap:14px;margin-top:32px;flex-wrap:wrap;}

.cg .phone{background:var(--ink);border-radius:36px;padding:14px;box-shadow:0 40px 70px -30px rgba(28,21,18,.45);max-width:320px;margin-left:auto;}
.cg .phone-screen{background:var(--paper);border-radius:24px;padding:22px 18px 26px;display:flex;flex-direction:column;gap:14px;}
.cg .ps-top{display:flex;justify-content:space-between;align-items:center;}
.cg .ps-greet{font-family:'Fraunces',serif;font-size:16px;}
.cg .ps-date{font-size:11px;color:var(--muted);}
.cg .card{background:#fff;border-radius:16px;padding:16px;border:1px solid var(--line-soft);}
.cg .card-reading{background:var(--ink);color:var(--paper);}
.cg .ring-row{display:flex;align-items:center;gap:14px;}
.cg .ring{width:50px;height:50px;border-radius:50%;background:conic-gradient(var(--gold) 0 13%, rgba(246,241,231,.18) 0 100%);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cg .ring i{width:38px;height:38px;border-radius:50%;background:var(--ink);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:10.5px;font-weight:600;color:var(--paper);}
.cg .card-reading .lbl{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-soft);}
.cg .card-reading .val{font-family:'Fraunces',serif;font-size:15px;margin-top:2px;}
.cg .mini-row{display:flex;justify-content:space-between;align-items:center;}
.cg .mini-row .lbl{font-size:12.5px;color:var(--muted);}
.cg .mini-row .val{font-size:13px;font-weight:600;}
.cg .dot-gold{width:7px;height:7px;border-radius:50%;background:var(--gold);display:inline-block;}
.cg .navbar-fake{display:flex;justify-content:space-around;padding-top:4px;}
.cg .navbar-fake i{width:6px;height:6px;border-radius:50%;background:var(--line);}
.cg .navbar-fake i.on{background:var(--wine);}

.cg .icon-cord{width:34px;height:34px;}

.cg .verse-section{background:var(--ink);color:var(--paper);padding:96px 0;}
.cg .verse-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:64px;align-items:start;}
.cg .verse-quote{font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:28px;line-height:1.35;color:var(--paper);}
.cg .verse-ref{margin-top:18px;font-size:13.5px;letter-spacing:.06em;color:var(--gold-soft);font-weight:600;}
.cg .verse-copy p{color:rgba(246,241,231,.78);font-size:16.5px;margin-bottom:16px;}
.cg .verse-copy strong{color:var(--paper);}

.cg .problem-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;margin-top:40px;}
.cg .problem-cell{background:var(--paper-2);padding:24px 20px;font-size:14.5px;color:var(--ink-70);min-height:108px;display:flex;align-items:flex-end;}
.cg .problem-note{margin-top:22px;font-size:14.5px;color:var(--ink-70);}

.cg .idea-line{
  display:flex;flex-wrap:wrap;justify-content:center;gap:10px 8px;margin-top:34px;
  font-family:'Fraunces',serif;font-size:22px;
}
.cg .idea-line span{color:var(--ink);}
.cg .idea-line span.sep{color:var(--gold);font-family:'Inter',sans-serif;font-size:18px;}

.cg .pillars-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:44px;}
.cg .pillar-card{background:var(--paper-2);border:1px solid var(--line-soft);border-radius:var(--radius);padding:26px 22px;display:flex;flex-direction:column;gap:12px;}
.cg .pillar-card h3{font-size:19px;}
.cg .pillar-card p.desc{font-size:14px;color:var(--ink-70);}
.cg .pillar-card ul{margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.cg .pillar-card li{list-style:none;font-size:13px;color:var(--ink-70);display:flex;gap:8px;}
.cg .pillar-card li::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--wine);margin-top:7px;flex-shrink:0;}

.cg .simple-section{display:grid;grid-template-columns:1fr;gap:20px;max-width:720px;}
.cg .simple-section h2{font-size:30px;}
.cg .simple-section p.lede{font-size:16px;color:var(--ink-70);}
.cg .chip-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.cg .chip{font-size:12.5px;padding:6px 12px;border-radius:999px;background:#fff;border:1px solid var(--line-soft);color:var(--ink-70);}

.cg .two-col{display:grid;grid-template-columns:.95fr 1.05fr;gap:56px;align-items:center;}
.cg .stat-row{display:flex;gap:26px;flex-wrap:wrap;}
.cg .stat b{font-family:'Fraunces',serif;font-size:32px;display:block;}
.cg .stat span{font-size:12.5px;color:var(--muted);}
.cg .visual-box{background:var(--paper-2);border:1px solid var(--line-soft);border-radius:var(--radius);padding:30px;}

.cg .price-note{max-width:560px;margin:14px auto 0;text-align:center;color:var(--ink-70);}
.cg .price-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:44px;}
.cg .price-card{border:1px solid var(--line);border-radius:var(--radius);padding:28px 22px;background:#fff;display:flex;flex-direction:column;gap:6px;position:relative;}
.cg .price-card.highlight{border-color:var(--ink);box-shadow:0 20px 40px -24px rgba(28,21,18,.35);}
.cg .price-card .tag-best{position:absolute;top:-12px;left:22px;background:var(--ink);color:var(--paper);font-size:11px;padding:4px 10px;border-radius:999px;letter-spacing:.04em;}
.cg .price-card .plan{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.cg .price-card .members{font-family:'Fraunces',serif;font-size:18px;margin-top:6px;}
.cg .price-card .price{font-family:'Fraunces',serif;font-size:30px;margin-top:12px;}
.cg .price-card .price small{font-family:'Inter',sans-serif;font-size:13px;color:var(--muted);font-weight:500;}
.cg .price-explain{max-width:560px;margin:30px auto 0;text-align:center;font-size:14px;color:var(--ink-70);}
.cg .price-explain strong{color:var(--ink);}
.cg .price-cta{text-align:center;margin-top:30px;}

.cg .faq-list{max-width:760px;margin:40px auto 0;display:flex;flex-direction:column;}
.cg details{border-bottom:1px solid var(--line);padding:20px 0;}
.cg summary{cursor:pointer;font-family:'Fraunces',serif;font-size:17px;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:20px;}
.cg summary::-webkit-details-marker{display:none;}
.cg summary::after{content:"+";font-family:'Inter',sans-serif;font-size:20px;color:var(--muted);flex-shrink:0;}
.cg details[open] summary::after{content:"–";}
.cg details p{margin-top:12px;color:var(--ink-70);font-size:14.5px;max-width:640px;}

.cg .cta-final{background:var(--ink);color:var(--paper);border-radius:28px;padding:76px 40px;text-align:center;}
.cg .cta-final h2{font-size:34px;color:var(--paper);}
.cg .cta-final .lede{color:rgba(246,241,231,.72);margin-top:14px;}
.cg .cta-final .btn-primary{background:var(--gold);color:var(--ink);margin:30px auto 0;}
.cg .cta-final .btn-primary:hover{background:var(--gold-soft);}
.cg .cta-final .tagline{margin-top:20px;font-size:13px;color:rgba(246,241,231,.5);letter-spacing:.04em;}

.cg footer{padding:52px 0 40px;border-top:1px solid var(--line-soft);}
.cg .footer-grid{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;}
.cg .footer-links{display:flex;gap:24px;font-size:13.5px;color:var(--muted);}

.cg section .wrap > .eyebrow{display:block;margin-bottom:14px;}
.cg section h2.section-title{font-size:32px;max-width:600px;}

@media (max-width: 880px){
  .cg .nav-links,.cg .nav-actions .btn-ghost{display:none;}
  .cg .nav-toggle{display:block;}
  .cg .hero-grid{grid-template-columns:1fr;gap:44px;}
  .cg .phone{margin:0 auto;}
  .cg .hero h1{font-size:34px;}
  .cg .verse-grid{grid-template-columns:1fr;gap:30px;}
  .cg .verse-quote{font-size:22px;}
  .cg .problem-grid{grid-template-columns:1fr 1fr;}
  .cg .pillars-grid{grid-template-columns:1fr 1fr;}
  .cg .two-col{grid-template-columns:1fr;gap:32px;}
  .cg .price-grid{grid-template-columns:1fr 1fr;}
  .cg section{padding:56px 0;}
  .cg .idea-line{font-size:18px;}
}
@media (max-width: 560px){
  .cg .price-grid{grid-template-columns:1fr;}
  .cg .problem-grid{grid-template-columns:1fr;}
  .cg .pillars-grid{grid-template-columns:1fr;}
}
`;

function CordIcon({ size = 34 }: { size?: number }) {
  return (
    <svg className="icon-cord" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g transform="rotate(0 32 32)"><rect x="27" y="4" width="10" height="56" rx="5" fill="#1C1512" /></g>
      <g transform="rotate(120 32 32)"><rect x="27" y="4" width="10" height="56" rx="5" fill="#6B2737" /></g>
      <g transform="rotate(240 32 32)"><rect x="27" y="4" width="10" height="56" rx="5" fill="#B98A3E" /></g>
    </svg>
  );
}

export default function Landing() {
  const enter = () => startLogin();

  return (
    <div className="cg" data-testid="landing-page">
      <style>{CSS}</style>

      <header>
        <div className="wrap nav">
          <div className="brand">
            <CordIcon />
            <span>CONGREGA</span>
          </div>
          <nav className="nav-links">
            <a href="#por-que">Por que Congrega</a>
            <a href="#recursos">Recursos</a>
            <a href="#precos">Preços</a>
            <a href="#faq">Perguntas</a>
          </nav>
          <div className="nav-actions">
            <button type="button" className="btn btn-ghost" onClick={enter} data-testid="nav-login-button">Entrar</button>
            <button type="button" className="btn btn-primary" onClick={enter} data-testid="nav-cta-button">Experimentar gratuitamente</button>
          </div>
          <button className="nav-toggle" aria-label="Abrir menu" onClick={enter}><span></span><span></span><span></span></button>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="verse-tag"><b>Hebreus 10:25</b> não abandonando a nossa congregação</div>
            <h1>Sua igreja não acontece apenas no domingo.</h1>
            <p className="lede">Avisos, Palavra, agenda, EBD, oração, eventos e participação reunidos em um único ambiente, para a igreja continuar conectada durante toda a semana.</p>
            <div className="hero-ctas">
              <button type="button" className="btn btn-primary" onClick={enter} data-testid="hero-cta-button">Experimentar gratuitamente</button>
              <a className="btn btn-ghost" href="#recursos">Conhecer o Congrega</a>
            </div>
          </div>
          <div className="phone">
            <div className="phone-screen">
              <div className="ps-top">
                <div>
                  <div className="ps-greet">Bom dia, Ana</div>
                  <div className="ps-date">Quinta, 16 de agosto</div>
                </div>
                <CordIcon size={26} />
              </div>
              <div className="card card-reading">
                <div className="ring-row">
                  <div className="ring"><i>13%</i></div>
                  <div>
                    <div className="lbl">Leitura de hoje</div>
                    <div className="val">Josué 1–3 · dia 47 de 365</div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="mini-row"><span className="lbl">Próximo</span><span className="val">EBD · domingo · 09h</span></div>
              </div>
              <div className="card">
                <div className="mini-row"><span className="lbl"><span className="dot-gold"></span>&nbsp; Aviso da igreja</span></div>
                <p style={{ fontSize: "13px", color: "var(--ink-70)", marginTop: "8px" }}>Encontro de famílias remarcado para sábado, 19h.</p>
              </div>
              <div className="card">
                <div className="mini-row"><span className="lbl">Sua participação</span><span className="val">12 de 14 presenças</span></div>
              </div>
              <div className="navbar-fake"><i className="on"></i><i></i><i></i><i></i></div>
            </div>
          </div>
        </div>
      </section>

      <section className="verse-section" id="por-que">
        <div className="wrap verse-grid">
          <div>
            <p className="verse-quote">“Não abandonando a nossa congregação, como é costume de alguns, antes exortando-nos uns aos outros.”</p>
            <p className="verse-ref">HEBREUS 10:25</p>
          </div>
          <div className="verse-copy">
            <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>Por que o nome Congrega</p>
            <p>Congregar é continuar perto, semana após semana. É a palavra que a igreja brasileira já usa todo domingo, e é o convite que este aplicativo carrega no próprio nome.</p>
            <p>O Congrega não substitui o culto, a liderança ou a comunhão entre as pessoas. Ele é o ambiente onde a leitura da Palavra, a participação e o cuidado continuam de segunda a sábado.</p>
            <p><strong>Uma igreja. Uma comunidade que não deixa de se reunir.</strong></p>
          </div>
        </div>
      </section>

      <section className="tight">
        <div className="wrap">
          <p className="eyebrow">O problema</p>
          <h2 className="section-title">Hoje, a comunicação da igreja está espalhada.</h2>
          <div className="problem-grid">
            <div className="problem-cell">Avisos que se perdem na rolagem do WhatsApp.</div>
            <div className="problem-cell">Agenda em cartazes que ninguém revisita durante a semana.</div>
            <div className="problem-cell">Materiais espalhados entre pastas e links soltos.</div>
            <div className="problem-cell">Liderança sem uma visão simples da participação.</div>
          </div>
          <p className="problem-note">O WhatsApp continua sendo útil. O Congrega não foi criado para substituí-lo, e sim para organizar a vida oficial da igreja em um ambiente próprio.</p>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="eyebrow">A ideia</p>
          <h2 className="section-title" style={{ margin: "0 auto" }}>Uma jornada. Não um conjunto de ferramentas.</h2>
          <div className="idea-line">
            <span>Ler.</span><span>Participar.</span><span>Se informar.</span><span>Estar presente.</span><span>Caminhar junto.</span>
          </div>
          <p className="muted" style={{ maxWidth: "460px", margin: "30px auto 0" }}>Pequenas ações do dia a dia ajudam a manter a comunidade próxima.</p>
        </div>
      </section>

      <hr className="divider wrap" />

      <div id="recursos">
        <section>
          <div className="wrap">
            <p className="eyebrow">O que a igreja encontra no Congrega</p>
            <h2 className="section-title">Quatro pilares, um só ambiente.</h2>
            <div className="pillars-grid">
              <div className="pillar-card">
                <h3>Palavra</h3>
                <p className="desc">Leitura bíblica, plano da igreja e conteúdos autorizados.</p>
                <ul>
                  <li>Plano de leitura e progresso pessoal</li>
                  <li>Pão Diário e Palavra da Igreja</li>
                </ul>
              </div>
              <div className="pillar-card">
                <h3>Participação</h3>
                <p className="desc">Agenda, EBD e eventos, com check-in por QR Code.</p>
                <ul>
                  <li>Turmas, matrícula e histórico de frequência</li>
                  <li>Confirmação de presença quando necessário</li>
                </ul>
              </div>
              <div className="pillar-card">
                <h3>Comunidade</h3>
                <p className="desc">Avisos oficiais e os momentos da igreja em fotos.</p>
                <ul>
                  <li>Avisos e conteúdos programados</li>
                  <li>Álbuns de fotos, com curtidas e sem comentários</li>
                </ul>
              </div>
              <div className="pillar-card">
                <h3>Cuidado</h3>
                <p className="desc">Pedidos de oração e sinais de participação para a liderança.</p>
                <ul>
                  <li>Privacidade configurável em cada pedido</li>
                  <li>Sem diagnóstico automático, sem IA</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="simple-section">
              <p className="eyebrow">Membro</p>
              <h2>Tudo o que a pessoa precisa saber, em um só lugar.</h2>
              <p className="lede">Palavra do dia, agenda da semana, avisos, EBD, pedidos de oração e seu próprio histórico de participação. O perfil ainda guarda vínculos familiares com outros membros da igreja e a história de fé de cada pessoa.</p>
              <div className="chip-row">
                <span className="chip">Palavra do dia</span>
                <span className="chip">Agenda</span>
                <span className="chip">Avisos</span>
                <span className="chip">EBD</span>
                <span className="chip">Pedidos de oração</span>
                <span className="chip">Meu histórico</span>
                <span className="chip">Vínculos familiares</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap two-col">
            <div className="simple-section">
              <p className="eyebrow">Pastor</p>
              <h2>O pastor não precisa ficar procurando informação.</h2>
              <p className="lede">Leituras, frequência na EBD, pedidos de oração autorizados e sinais objetivos de participação. O sistema organiza a informação. A leitura e o cuidado continuam sendo do pastor.</p>
            </div>
            <div className="visual-box">
              <div className="stat-row">
                <div className="stat"><b>214</b><span>pessoas</span></div>
                <div className="stat"><b>168</b><span>na leitura bíblica</span></div>
                <div className="stat"><b>68%</b><span>frequência</span></div>
                <div className="stat"><b>8</b><span>sinais de baixa participação</span></div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap two-col">
            <div className="simple-section">
              <p className="eyebrow">Administrador</p>
              <h2>A igreja alimenta o próprio ambiente.</h2>
              <p className="lede">Membros, convites, eventos, avisos, EBD, galeria e conteúdos ficam sob responsabilidade do administrador. <strong>Administrador cuida da operação. Pastor acompanha a visão e o cuidado. Membro participa.</strong></p>
            </div>
            <div className="visual-box">
              <div className="chip-row">
                <span className="chip">Membros</span><span className="chip">Eventos</span><span className="chip">EBD</span>
                <span className="chip">Conteúdos</span><span className="chip">Relatórios</span><span className="chip">Convites</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="simple-section">
              <p className="eyebrow">Privacidade e segurança</p>
              <h2>Dados para cuidar de pessoas, não para vigiar pessoas.</h2>
              <p className="lede">Cada igreja tem seu próprio ambiente. Uma igreja não acessa dados de outra. As permissões seguem o perfil de cada pessoa (membro, pastor ou administrador), e os pedidos de oração mantêm a privacidade que o membro escolher.</p>
            </div>
          </div>
        </section>
      </div>

      <section id="precos">
        <div className="wrap">
          <p className="eyebrow" style={{ textAlign: "center" }}>Preços</p>
          <h2 className="section-title" style={{ textAlign: "center", margin: "0 auto" }}>Uma única assinatura para toda a igreja.</h2>
          <p className="price-note">Todos os planos têm os mesmos recursos. A diferença está apenas na quantidade de membros cadastrados.</p>
          <div className="price-grid">
            <div className="price-card">
              <span className="plan">Congrega gratuito</span>
              <span className="members">Até 50 membros</span>
              <span className="price">R$ 0<small>/mês</small></span>
            </div>
            <div className="price-card">
              <span className="plan">Congrega 150</span>
              <span className="members">Até 150 membros</span>
              <span className="price">R$ 97<small>/mês</small></span>
            </div>
            <div className="price-card highlight">
              <span className="tag-best">Mais escolhida</span>
              <span className="plan">Congrega 300</span>
              <span className="members">Até 300 membros</span>
              <span className="price">R$ 137<small>/mês</small></span>
            </div>
            <div className="price-card">
              <span className="plan">Congrega 500</span>
              <span className="members">+500 membros</span>
              <span className="price">R$ 177<small>/mês</small></span>
            </div>
          </div>
          <p className="price-explain">O valor é definido pelo número de membros cadastrados, não pelo número de pessoas que utilizam cada recurso. <strong>A cobrança é por igreja, não por pessoa.</strong> Igrejas com até 50 membros podem usar o Congrega gratuitamente, com os mesmos recursos da plataforma.</p>
          <div className="price-cta">
            <button type="button" className="btn btn-primary" onClick={enter} data-testid="pricing-cta-button">Experimentar gratuitamente</button>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <p className="eyebrow" style={{ textAlign: "center" }}>Perguntas frequentes</p>
          <h2 className="section-title" style={{ textAlign: "center", margin: "0 auto" }}>O que igrejas costumam perguntar</h2>
          <div className="faq-list">
            <details><summary>É um aplicativo financeiro para igrejas?</summary><p>Não. O foco é comunidade, participação e cuidado, não controle financeiro.</p></details>
            <details><summary>Preciso abandonar o WhatsApp?</summary><p>Não. O WhatsApp continua sendo usado normalmente. O Congrega organiza a vida oficial da igreja.</p></details>
            <details><summary>A Bíblia fica dentro do aplicativo?</summary><p>O aplicativo mostra o plano de leitura e o progresso de cada membro nele.</p></details>
            <details><summary>Posso publicar conteúdos do meu pastor?</summary><p>Sim. O administrador pode publicar e programar conteúdos autorizados pela igreja.</p></details>
            <details><summary>Como funciona o check-in de presença?</summary><p>Por QR Code. O membro escaneia o código da atividade e a presença é registrada.</p></details>
            <details><summary>O pastor precisa administrar tudo?</summary><p>Não. O administrador cuida da operação. O pastor acompanha as informações pastorais.</p></details>
            <details><summary>Igrejas pequenas têm os mesmos recursos?</summary><p>Sim. Todos os planos têm os mesmos recursos. O preço muda apenas conforme o número de membros.</p></details>
            <details><summary>Outras igrejas conseguem ver os dados da minha igreja?</summary><p>Não. Cada igreja tem seu próprio ambiente, com dados isolados.</p></details>
            <details><summary>Existe cobrança por membro?</summary><p>Não. A cobrança é por igreja, conforme a faixa de membros cadastrados.</p></details>
            <details><summary>O sistema usa inteligência artificial para interpretar o cuidado pastoral?</summary><p>Não. O sistema apresenta informações objetivas. O cuidado pastoral continua sendo humano.</p></details>
          </div>
        </div>
      </section>

      <section id="cta">
        <div className="wrap">
          <div className="cta-final">
            <h2>Sua igreja já vive durante a semana.</h2>
            <p className="lede">Agora ela também pode caminhar junta no digital.</p>
            <button type="button" className="btn btn-primary" onClick={enter} data-testid="final-cta-button">Experimentar gratuitamente</button>
            <p className="tagline">Uma igreja. Uma jornada. Uma comunidade.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footer-grid">
          <div className="brand">
            <CordIcon size={26} />
            <span style={{ fontSize: "15px" }}>CONGREGA</span>
          </div>
          <div className="footer-links">
            <a href="#por-que">Por que Congrega</a>
            <a href="#recursos">Recursos</a>
            <a href="#precos">Preços</a>
            <a href="#faq">Perguntas</a>
          </div>
          <span className="muted" style={{ fontSize: "13px" }}>Hebreus 10:25</span>
        </div>
      </footer>
    </div>
  );
}
