// Source of truth for the JioMart Commerce thread prototype (mirrors Commerce V1/mockups/jiomart-full-thread-mockup.html).
// Rendered inside an isolated iframe so its styles cannot leak into the shell or other verticals.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import spinLoaderData from "../../jobs/design-prototype/microlearning/creator/spin-loader.json";

const _spinJson = JSON.stringify(spinLoaderData);

export const JIOMART_THREAD_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>JBIQ Commerce — JioMart full thread (JDS mockup)</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<style>
/* ── JDS / A2UI tokens ── */
:root{
  --primary-20:#f6f3ff; --primary-30:#ede7ff; --primary-40:#e4dbff;
  --primary-50:#6d17ce; --primary-60:#310064; --primary-70:#13002d;
  --secondary-50:#00ad8b;
  --sparkle-20:#ecf7ff; --sparkle-50:#0078ad; --sparkle-60:#004566;
  --error:#fa2f40; --warning:#f06d0f; --success:#25ab21;
  --surface:#ffffff; --surface-minimal:#f5f5f5; --surface-ghost:#eeeeef;
  --surface-ghost-icon:#ede7ff; --surface-moderate:#e3e3e4;
  --text-high:#0c0d10; --text-low:rgba(12,13,16,0.65); --text-disabled:rgba(12,13,16,0.38);
  --stroke-subtle:rgba(12,13,16,0.12); --stroke-minimal:rgba(12,13,16,0.08);
  --success-bg:#e6f7e6;
  --font:'JioType',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{font-family:var(--font);color:var(--text-high);background:var(--surface-minimal);-webkit-font-smoothing:antialiased}
svg{display:block}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}

.phone{width:100%;height:100dvh;background:var(--surface);overflow:hidden;position:relative;display:flex;flex-direction:column}

/* header — absolute overlay with gradient fade, Jobs chat style */
.hdr{position:absolute;top:0;left:0;right:0;z-index:10;pointer-events:none;height:68px}
.hdr__bg{position:absolute;inset:0;
  background:linear-gradient(180deg,#fff 0%,#fff 73%,rgba(255,255,255,.6) 86%,rgba(255,255,255,0) 100%)}
.hdr__row{position:relative;pointer-events:auto;display:flex;align-items:center;gap:12px;padding:14px 16px 0}
.hdr__icon{width:40px;height:40px;border-radius:9999px;display:flex;align-items:center;justify-content:center;
  background:var(--surface-minimal);color:var(--text-high);transition:transform .2s cubic-bezier(.2,0,0,1);flex-shrink:0}
.hdr__icon:hover{transform:scale(1.05)}.hdr__icon:active{transform:scale(.95)}
.hdr__title{flex:1;font-size:18px;font-weight:700}
.hdr__right{display:flex;align-items:center;gap:8px}

/* scroll — 24px between chat elements */
.scroll{flex:1;overflow-y:auto;padding:68px 16px 20px;background:var(--surface);scrollbar-width:none;
  display:flex;flex-direction:column;gap:24px}
.scroll::-webkit-scrollbar{display:none}
.scroll>*{flex-shrink:0}

/* message primitives — Jobs style */
.user{align-self:flex-end;max-width:80%;background:#f5f5f5;color:#404040;
  border-radius:18px 18px 4px 18px;padding:10px 14px;font-size:15px;font-weight:500;line-height:1.45}
.user.mono{font-family:ui-monospace,Menlo,monospace;font-size:13px;word-break:break-all}
.asst{align-self:flex-start;max-width:92%;font-size:15px;font-weight:500;line-height:1.55;color:var(--text-high)}
.asst .em{color:var(--text-low)}
.feedback{display:flex;align-items:center;gap:18px;margin-top:10px;color:var(--text-disabled)}
.feedback button{display:flex;transition:color .15s,transform .15s}
.feedback button:hover{color:var(--primary-50);transform:scale(1.1)}

/* lottie loaders */
.lottie-loader{width:48px;height:48px}
.search-loader-row{display:flex;align-items:center;gap:10px}
.search-loader-row .lottie-loader{width:36px;height:36px;flex-shrink:0}
.search-loader-text{font-size:15px;font-weight:500;color:var(--text-high)}

/* widget */
.widget{align-self:stretch;background:var(--surface);border:1px solid var(--stroke-minimal);border-radius:16px;overflow:hidden}
.widget__title{display:flex;align-items:center;gap:8px;padding:14px 16px;font-size:16px;font-weight:700;
  border-bottom:1px solid var(--stroke-minimal)}

/* count badge — secondary (light purple bg) */
.count-badge{background:var(--primary-30);color:var(--primary-50);font-size:13px;font-weight:700;
  border-radius:9999px;padding:5px 13px;line-height:1}

/* search swim lane */
.search-cat{align-self:stretch;display:flex;flex-direction:column;gap:2px}
/* product heading same size as chat input (16px) */
.cat-label{font-size:16px;font-weight:700;padding-top:2px}
.pcards{display:flex;gap:12px;overflow-x:auto;padding:12px 0 4px;scrollbar-width:none}
.pcards::-webkit-scrollbar{display:none}
.pcard{min-width:150px;max-width:150px;background:var(--surface);border:1px solid var(--stroke-subtle);
  border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.pcard__imgwrap{position:relative;height:108px;background:var(--surface);display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--stroke-minimal)}
.pcard__off{position:absolute;top:8px;left:8px;background:var(--success);color:#fff;font-size:10px;font-weight:700;padding:3px 7px;border-radius:6px}
.pcard__body{padding:10px;display:flex;flex-direction:column;gap:6px;flex:1}
.pcard__name{font-size:13px;font-weight:500;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:35px}
.pcard__price{display:flex;align-items:baseline;gap:6px}
.pcard__price b{font-size:15px;font-weight:700}
.pcard__price s{font-size:12px;color:var(--text-low)}
/* ADD button — secondary style (light purple bg, dark purple text) */
.pcard__add{margin-top:auto;height:36px;border-radius:9999px;background:var(--primary-30);color:var(--primary-60);
  font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:4px;
  transition:transform .2s cubic-bezier(.2,0,0,1)}
.pcard__add:hover{transform:scale(1.02)}.pcard__add:active{transform:scale(.97)}
.pcard__add:disabled{opacity:.45;pointer-events:none}
.pcard__oos{font-size:11px;font-weight:700;color:var(--error);text-align:center;margin-top:2px}
.pcard .stepper{margin-top:auto;align-self:stretch;justify-content:space-between}

/* chips — shown once after both swim lanes */
.search-chips{display:flex;gap:10px;padding:2px 0}
.chip{height:36px;padding:0 16px;border-radius:9999px;background:var(--primary-30);color:var(--primary-60);
  font-size:13px;font-weight:700;display:inline-flex;align-items:center;transition:transform .2s cubic-bezier(.2,0,0,1)}
.chip:hover{transform:scale(1.02)}.chip:active{transform:scale(.97)}

/* stepper — gray container bg restored, only + button changed to white */
.stepper{display:inline-flex;align-items:center;background:var(--surface-minimal);border-radius:9999px;padding:4px}
.stepper__btn{width:30px;height:30px;border-radius:9999px;display:flex;align-items:center;justify-content:center;
  transition:transform .2s cubic-bezier(.2,0,0,1),opacity .15s;flex-shrink:0}
.stepper__btn:hover{transform:scale(1.06)}.stepper__btn:active{transform:scale(.92)}
.stepper__btn.minus{background:var(--surface);color:var(--text-high)}
/* + button: white bg, purple icon only */
.stepper__btn.plus{background:var(--surface);color:var(--primary-50)}
.stepper__btn:disabled{opacity:.4;pointer-events:none}
.stepper__count{min-width:30px;text-align:center;font-size:14px;font-weight:700}

/* cart items — delete LEFT, stepper RIGHT */
.items{padding:4px 16px}
.item{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--stroke-minimal)}
.item:last-child{border-bottom:none}
.item__img{width:56px;height:56px;border-radius:12px;overflow:hidden;flex-shrink:0;background:var(--surface);border:1px solid var(--stroke-minimal);display:flex;align-items:center;justify-content:center}
.item__body{flex:1;min-width:0}
.item__top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.item__name{font-size:14px;font-weight:700;line-height:1.35}
.item__sub{font-size:12px;font-weight:500;color:var(--text-low);margin-top:2px}
.item__price{font-size:15px;font-weight:700;white-space:nowrap;flex-shrink:0}
/* controls: delete immediately left of stepper, both grouped right */
.item__controls{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:10px}
.item__remove{width:30px;height:30px;border-radius:9999px;display:flex;align-items:center;justify-content:center;
  color:var(--text-disabled);transition:transform .2s cubic-bezier(.2,0,0,1),color .15s,background .15s}
.item__remove:hover{transform:scale(1.06);color:var(--error);background:#fde8ea}

/* totals */
.totals{background:var(--surface);padding:16px;border-top:1px solid var(--stroke-minimal)}
.totals__row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px}
.totals__label{font-size:14px;font-weight:500;color:var(--text-low)}
.totals__val{font-size:14px;font-weight:700}
.totals__val.free{color:var(--success)}
.totals__divider{height:1px;background:var(--stroke-subtle);margin:12px 0}
.grand{display:flex;align-items:center;justify-content:space-between}
.grand__label{font-size:16px;font-weight:700}
.grand__sub{font-size:12px;font-weight:500;color:var(--text-low);margin-top:2px}
.grand__val{font-size:18px;font-weight:700;color:var(--primary-50)}
.savings{display:flex;align-items:center;gap:8px;background:var(--success-bg);border-radius:9999px;padding:10px 14px;margin-top:14px}
.savings__ic{color:var(--success);display:flex;flex-shrink:0}
.savings__txt{font-size:13px;font-weight:700;color:var(--success)}

/* COD */
.cod{display:flex;align-items:center;gap:10px;padding:14px 16px;border-top:1px solid var(--stroke-minimal);font-size:15px;font-weight:700}

/* actions */
.actions{padding:16px}
.btn{width:100%;height:48px;border-radius:9999px;font-size:14px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;
  transition:transform .2s cubic-bezier(.2,0,0,1);gap:8px}
.btn:hover{transform:scale(1.02)}.btn:active{transform:scale(.97)}
.btn--primary{background:var(--primary-50);color:#fff}
/* secondary — light purple bg, dark purple text */
.btn--secondary{background:var(--primary-30);color:var(--primary-60)}
.btn--outline{background:var(--surface);color:var(--primary-50);border:1px solid var(--primary-50)}

/* delivering-to */
.deliver{padding:14px 16px;border-bottom:1px solid var(--stroke-minimal)}
.deliver__cap{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--text-low)}
.deliver__name{font-size:15px;font-weight:700;margin-top:3px;display:flex;align-items:center;gap:8px}
.deliver__addr{font-size:13px;font-weight:500;color:var(--text-low);line-height:1.4;margin-top:3px}
.tag{font-size:10px;font-weight:700;letter-spacing:.4px;border-radius:9999px;padding:3px 8px;background:var(--primary-20);color:var(--primary-50)}
.tag--default{background:var(--success-bg);color:var(--success)}
.tag--test{background:var(--sparkle-20);color:var(--sparkle-50)}

/* address rows */
.addr-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--stroke-minimal)}
.addr-row:last-child{border-bottom:none}
.addr-row__body{flex:1;min-width:0}
.addr-row__name{font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.addr-row__addr{font-size:12px;font-weight:500;color:var(--text-low);line-height:1.4;margin-top:3px}
.addr-row__chev{color:var(--text-disabled);flex-shrink:0}
.addr-add{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;margin:12px 16px 16px;padding:9px 16px;
  border-radius:9999px;background:var(--surface-ghost);color:var(--text-high);font-size:13px;font-weight:700;
  transition:transform .2s cubic-bezier(.2,0,0,1)}
.addr-add:hover{transform:scale(1.02)}.addr-add:active{transform:scale(.97)}

/* forms */
.form{padding:16px;display:flex;flex-direction:column;gap:14px}
.loc-btn{height:48px;border-radius:9999px;border:1px solid var(--primary-50);color:var(--primary-50);background:var(--surface);
  display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:700;transition:transform .2s cubic-bezier(.2,0,0,1)}
.loc-btn:hover{transform:scale(1.01)}.loc-btn:active{transform:scale(.99)}
.loc-help{font-size:12px;font-weight:500;color:var(--text-low);line-height:1.45;text-align:center}
.loc-captured{display:flex;align-items:center;gap:8px;background:var(--success-bg);color:var(--success);border-radius:12px;padding:12px 14px;font-size:14px;font-weight:700}
.field{display:flex;flex-direction:column;gap:6px}
.field label{font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text-low)}
.field input{height:46px;background:var(--surface-minimal);border:1px solid var(--stroke-subtle);border-radius:12px;padding:0 14px;
  font-size:14px;font-weight:500;font-family:inherit;color:var(--text-high);outline:none;width:100%}
.field input::placeholder{color:var(--text-disabled)}
.field input:focus{background:var(--surface);border-color:var(--surface-moderate)}
.field-row{display:flex;gap:10px}.field-row .field{flex:1}

/* delivery-updated confirmation */
.confirm-banner{display:flex;align-items:center;gap:10px;padding:14px 16px;background:var(--success-bg);border-bottom:1px solid var(--stroke-minimal)}
.confirm-banner__ic{color:var(--success);display:flex}
.confirm-banner__txt{font-size:14px;font-weight:700;color:var(--success)}

/* order success */
.success{padding:24px 16px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px}
.success__ring{width:64px;height:64px;border-radius:9999px;background:var(--success-bg);color:var(--success);display:flex;align-items:center;justify-content:center;margin-bottom:6px}
.success__title{font-size:20px;font-weight:900;letter-spacing:-.02em}
.success__sub{font-size:14px;font-weight:500;color:var(--text-low);line-height:1.5}
.success__meta{align-self:stretch;background:var(--surface);border:1px solid var(--stroke-minimal);border-radius:12px;padding:14px 16px;margin-top:14px;display:flex;flex-direction:column;gap:10px}
.success__metarow{display:flex;align-items:center;justify-content:space-between;font-size:13px}
.success__metarow span:first-child{color:var(--text-low);font-weight:500}
.success__metarow span:last-child{font-weight:700}

/* dock */
.dock{display:flex;align-items:center;gap:6px;padding:10px 16px 14px;background:var(--surface);border-top:1px solid var(--stroke-minimal);flex-shrink:0}
.dock__add{width:48px;height:48px;border-radius:9999px;background:var(--primary-30);color:var(--primary-50);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s cubic-bezier(.2,0,0,1)}
.dock__add:hover{transform:scale(1.04)}.dock__add:active{transform:scale(.95)}
.dock__pill{flex:1;min-height:48px;display:flex;align-items:center;background:var(--surface-minimal);border-radius:9999px;padding:0 18px;font-size:16px;color:var(--text-low)}
.dock__speak{height:48px;border-radius:9999px;background:var(--primary-50);color:#fff;display:inline-flex;align-items:center;gap:7px;padding:0 18px;flex-shrink:0;font-size:16px;font-weight:600;transition:transform .2s cubic-bezier(.2,0,0,1)}
.dock__speak:hover{transform:scale(1.03)}.dock__speak:active{transform:scale(.97)}
.wave{display:flex;align-items:center;gap:2px;height:16px}
.wave span{width:3px;border-radius:2px;background:#fff}
.wave span:nth-child(1){height:7px}.wave span:nth-child(2){height:13px}.wave span:nth-child(3){height:16px}.wave span:nth-child(4){height:9px}

/* toast */
.toast{position:absolute;left:16px;right:16px;bottom:90px;background:var(--primary-60);color:#fff;border-radius:12px;padding:12px 16px;
  display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;font-weight:500;opacity:0;transform:translateY(8px);
  transition:opacity .25s,transform .25s;pointer-events:none;z-index:9}
.toast.show{opacity:1;transform:translateY(0);pointer-events:auto}
.toast button{font-weight:700;text-decoration:underline}
</style>
</head>
<body>
<div class="phone">

  <!-- HEADER — gradient overlay, Jobs chat style -->
  <header class="hdr">
    <div class="hdr__bg"></div>
    <div class="hdr__row">
      <button class="hdr__icon" aria-label="Back" onclick="(window.top||window).location.href='/'"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
      <h1 class="hdr__title">Purchasing groceries</h1>
      <div class="hdr__right">
        <button class="hdr__icon" aria-label="Chats"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
        <button class="hdr__icon" aria-label="New chat"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>
      </div>
    </div>
  </header>

  <!-- CHAT THREAD -->
  <main class="scroll" id="scroll">

    <!-- 1: user prompt -->
    <div class="user">Buy apples and ghee</div>

    <!-- searching: lottie left + text right, hidden after swim lanes reveal -->
    <div id="searchLoader" class="search-loader-row">
      <div id="searchLottie" class="lottie-loader"></div>
      <span class="search-loader-text">Searching for apples and ghee on JioMart.</span>
    </div>

    <!-- swim lanes + chips: hidden until loader completes -->
    <div id="swimLanes" style="display:none;flex-direction:column;gap:12px">

    <!-- SEARCH — APPLES swim lane -->
    <div class="search-cat">
      <div class="cat-label">Apples</div>
      <div class="pcards">
        <div class="pcard">
          <div class="pcard__imgwrap" style="opacity:.55"><svg width="50" height="50" viewBox="0 0 48 48"><circle cx="24" cy="28" r="14" fill="#b1232f"/><rect x="22" y="9" width="3" height="9" rx="1.5" fill="#7a4a1a"/><path d="M25 13 q6 -4 10 0 q-5 3 -10 0Z" fill="#2e9e4f"/></svg></div>
          <div class="pcard__body">
            <div class="pcard__name">Apple Shimla Economy 1 kg</div>
            <div class="pcard__price"><b>&#8377;220</b></div>
            <button class="pcard__add" disabled>+ ADD</button>
            <div class="pcard__oos">Out of stock</div>
          </div>
        </div>
        <div class="pcard">
          <div class="pcard__imgwrap"><svg width="50" height="50" viewBox="0 0 48 48"><circle cx="18" cy="29" r="11" fill="#e0432c"/><circle cx="30" cy="29" r="11" fill="#e85a35"/><rect x="23" y="11" width="3" height="9" rx="1.5" fill="#7a4a1a"/><path d="M26 15 q6 -4 10 0 q-5 3 -10 0Z" fill="#2e9e4f"/></svg></div>
          <div class="pcard__body">
            <div class="pcard__name">Apple Royal Gala 4 pcs (500&ndash;700 g)</div>
            <div class="pcard__price"><b>&#8377;220</b></div>
            <div class="stepper">
              <button class="stepper__btn minus" aria-label="Decrease"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              <span class="stepper__count">1</span>
              <button class="stepper__btn plus" aria-label="Increase"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            </div>
          </div>
        </div>
        <div class="pcard">
          <div class="pcard__imgwrap"><svg width="50" height="50" viewBox="0 0 48 48"><circle cx="24" cy="28" r="14" fill="#cf3b2e"/><rect x="22" y="9" width="3" height="9" rx="1.5" fill="#7a4a1a"/><path d="M25 13 q6 -4 10 0 q-5 3 -10 0Z" fill="#2e9e4f"/></svg></div>
          <div class="pcard__body">
            <div class="pcard__name">Washington Apple 1 kg</div>
            <div class="pcard__price"><b>&#8377;260</b></div>
            <button class="pcard__add">+ ADD</button>
          </div>
        </div>
      </div>
    </div>

    <!-- SEARCH — GHEE swim lane -->
    <div class="search-cat">
      <div class="cat-label">Ghee</div>
      <div class="pcards">
        <div class="pcard">
          <div class="pcard__imgwrap" style="opacity:.55"><span class="pcard__off">5% OFF</span><svg width="40" height="50" viewBox="0 0 40 50"><rect x="7" y="6" width="26" height="40" rx="3" fill="#f0c419"/><rect x="7" y="20" width="26" height="14" fill="#fff"/><text x="20" y="30" font-size="7" font-weight="700" fill="#b8860b" text-anchor="middle">AMUL</text></svg></div>
          <div class="pcard__body">
            <div class="pcard__name">Amul Pure Ghee 1 L (Tetra Pak)</div>
            <div class="pcard__price"><b>&#8377;627</b><s>&#8377;660</s></div>
            <button class="pcard__add" disabled>+ ADD</button>
            <div class="pcard__oos">Out of stock</div>
          </div>
        </div>
        <div class="pcard">
          <div class="pcard__imgwrap"><span class="pcard__off">17% OFF</span><svg width="40" height="50" viewBox="0 0 40 50"><rect x="7" y="6" width="26" height="40" rx="3" fill="#e9d8a6"/><rect x="7" y="20" width="26" height="14" fill="#fff"/><text x="20" y="30" font-size="6" font-weight="700" fill="#8a6d1a" text-anchor="middle">GHEE</text></svg></div>
          <div class="pcard__body">
            <div class="pcard__name">Milkfood Rich Desi Ghee 900 ml</div>
            <div class="pcard__price"><b>&#8377;559</b><s>&#8377;670</s></div>
            <div class="stepper">
              <button class="stepper__btn minus" aria-label="Decrease"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              <span class="stepper__count">1</span>
              <button class="stepper__btn plus" aria-label="Increase"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            </div>
          </div>
        </div>
        <div class="pcard">
          <div class="pcard__imgwrap"><span class="pcard__off">8% OFF</span><svg width="40" height="50" viewBox="0 0 40 50"><rect x="7" y="6" width="26" height="40" rx="3" fill="#d9e8f5"/><rect x="7" y="20" width="26" height="14" fill="#fff"/><text x="20" y="30" font-size="5.5" font-weight="700" fill="#2a5d8a" text-anchor="middle">MOTHER</text></svg></div>
          <div class="pcard__body">
            <div class="pcard__name">Mother Dairy Cow Ghee 1 L</div>
            <div class="pcard__price"><b>&#8377;615</b><s>&#8377;670</s></div>
            <button class="pcard__add">+ ADD</button>
          </div>
        </div>
      </div>
    </div>

    <!-- chips appear ONCE after both swim lanes -->
    <div class="search-chips">
      <button class="chip">View cart</button>
      <button class="chip">Search more</button>
    </div>

    </div><!-- end #swimLanes -->

    <!-- 3 -->
    <div class="asst">Want me to add any of these to your cart?</div>
    <!-- 4 -->
    <div class="user">Add the Royal Gala apples and the Milkfood ghee, then show my cart</div>
    <!-- 5 -->
    <div class="asst">Added both to your JioMart cart. Here it is.</div>

    <!-- CART — count badge secondary, delete LEFT, stepper RIGHT -->
    <div class="widget">
      <div class="widget__title">Your Cart<span class="count-badge" id="countBadge" style="margin-left:auto">2 items</span></div>
      <div class="items">
        <div class="item" data-item="apple">
          <div class="item__img"><svg width="40" height="40" viewBox="0 0 48 48"><circle cx="18" cy="29" r="11" fill="#e0432c"/><circle cx="30" cy="29" r="11" fill="#e85a35"/><rect x="23" y="11" width="3" height="9" rx="1.5" fill="#7a4a1a"/><path d="M26 15 q6 -4 10 0 q-5 3 -10 0Z" fill="#2e9e4f"/></svg></div>
          <div class="item__body">
            <div class="item__top">
              <div><div class="item__name">Apple Royal Gala 4 pcs</div><div class="item__sub">500&ndash;700 g &middot; <span id="appleQtyLabel">Qty 1</span></div></div>
              <div class="item__price" id="applePrice">&#8377;220</div>
            </div>
            <!-- delete LEFT, stepper RIGHT -->
            <div class="item__controls">
              <button class="item__remove" id="appleRemove" aria-label="Remove"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              <div class="stepper">
                <button class="stepper__btn minus" id="appleMinus" aria-label="Decrease"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                <span class="stepper__count" id="appleCount">1</span>
                <button class="stepper__btn plus" id="applePlus" aria-label="Increase"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              </div>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="item__img"><svg width="38" height="46" viewBox="0 0 40 50"><rect x="7" y="6" width="26" height="40" rx="3" fill="#e9d8a6"/><rect x="7" y="20" width="26" height="14" fill="#fff"/><text x="20" y="30" font-size="6" font-weight="700" fill="#8a6d1a" text-anchor="middle">GHEE</text></svg></div>
          <div class="item__body">
            <div class="item__top"><div><div class="item__name">Milkfood Rich Desi Ghee 900 ml</div><div class="item__sub">900 ml &middot; Qty 1</div></div><div class="item__price">&#8377;559</div></div>
            <!-- delete LEFT, stepper RIGHT -->
            <div class="item__controls">
              <button class="item__remove" aria-label="Remove"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              <div class="stepper">
                <button class="stepper__btn minus" aria-label="Decrease"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                <span class="stepper__count">1</span>
                <button class="stepper__btn plus" aria-label="Increase"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="totals">
        <div class="totals__row"><span class="totals__label">Bag total <span id="bagCount">(2 items)</span></span><span class="totals__val" id="bagTotal">&#8377;779</span></div>
        <div class="totals__row"><span class="totals__label">Delivery</span><span class="totals__val free">FREE</span></div>
        <div class="totals__divider"></div>
        <div class="grand"><div><div class="grand__label">Total</div><div class="grand__sub" id="grandCount">2 items</div></div><div class="grand__val" id="grandTotal">&#8377;779</div></div>
        <div class="savings"><span class="savings__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><span class="savings__txt" id="savingsTxt">You saved &#8377;111 on this order (MRP &#8377;890)</span></div>
      </div>
      <div class="actions"><button class="btn btn--primary">Checkout</button></div>
    </div>

    <!-- 6 -->
    <div class="user">Which address is this being shipped to?</div>
    <!-- 7 -->
    <div class="asst">
      It&rsquo;s going to the address currently set as your JioMart delivery location <span class="em">(37 Cunningham Rd, Bengaluru &mdash; Home)</span>. Want me to keep it, or switch to a different saved address?
      <div class="feedback">
        <button aria-label="Good"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
        <button aria-label="Bad"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
        <button aria-label="Copy"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        <button aria-label="Read aloud"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>
      </div>
    </div>

    <!-- 8 -->
    <div class="user">Switch it &mdash; show my saved addresses</div>
    <!-- 9 -->
    <div class="asst">Here are your saved JioMart addresses. Tap one to make it the delivery address.</div>

    <!-- SAVED ADDRESSES -->
    <div class="widget">
      <div class="widget__title">Saved addresses</div>
      <div class="addr-row">
        <div class="addr-row__body"><div class="addr-row__name">GOKUL KUMAR <span class="tag">HOME</span></div><div class="addr-row__addr">37, Cunningham Rd, near Fortis Hospital, Vasanth Nagar, Bengaluru, Karnataka &middot; 560001</div></div>
        <span class="addr-row__chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      </div>
      <div class="addr-row">
        <div class="addr-row__body"><div class="addr-row__name">GOKUL KUMAR <span class="tag">HOME</span> <span class="tag tag--default">DEFAULT</span></div><div class="addr-row__addr">188, 2nd floor, Sector 27, Gurugram, Haryana &middot; 122009</div></div>
        <span class="addr-row__chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      </div>
      <div class="addr-row">
        <div class="addr-row__body"><div class="addr-row__name">GOKUL KUMAR <span class="tag tag--test">TEST</span></div><div class="addr-row__addr">F932J78, Harris Ganj, Mirpur, Kanpur, Uttar Pradesh &middot; 208004</div></div>
        <span class="addr-row__chev"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      </div>
      <button class="addr-add"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add new address</button>
    </div>

    <!-- 10 -->
    <div class="user">Use my Kanpur address</div>
    <!-- 11 -->
    <div class="asst">Done &mdash; I&rsquo;ve switched your delivery address to Kanpur.</div>

    <!-- DELIVERY UPDATED -->
    <div class="widget">
      <div class="confirm-banner">
        <span class="confirm-banner__ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
        <span class="confirm-banner__txt">Delivery address updated</span>
      </div>
      <div class="addr-row">
        <div class="addr-row__body"><div class="addr-row__name">GOKUL KUMAR <span class="tag tag--test">TEST</span></div><div class="addr-row__addr">F932J78, Harris Ganj, Mirpur, Kanpur, Uttar Pradesh &middot; 208004</div></div>
      </div>
    </div>

    <!-- 12 -->
    <div class="user">Actually, add a new address instead</div>
    <!-- 13 -->
    <div class="asst">Sure &mdash; share your location and I&rsquo;ll capture the delivery address.</div>

    <!-- NEW ADDRESS -->
    <div class="widget">
      <div class="widget__title">New delivery address</div>
      <div class="form">
        <button class="loc-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Use my current location</button>
        <p class="loc-help">We use your location to give you accurate delivery ETAs and stock.</p>
      </div>
    </div>

    <!-- 14 -->
    <div class="user">Use my current location</div>
    <!-- 15 -->
    <div class="asst">Got your location. Add a few details and I&rsquo;ll save it.</div>

    <!-- CAPTURED-LOCATION FORM -->
    <div class="widget">
      <div class="widget__title">New delivery address</div>
      <div class="form">
        <button class="loc-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Update location</button>
        <div class="loc-captured"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Location captured (&plusmn;19 m)</div>
        <div class="field"><label>Name</label><input placeholder="Recipient name" /></div>
        <div class="field"><label>Phone</label><input placeholder="10-digit mobile" inputmode="numeric" /></div>
        <div class="field"><label>House / Flat / Building</label><input placeholder="e.g. 801, Sai Ganga" /></div>
        <div class="field"><label>Area</label><input placeholder="e.g. Sector 5" /></div>
        <div class="field"><label>Landmark</label><input placeholder="Nearby landmark" /></div>
        <div class="field-row">
          <div class="field"><label>Pincode</label><input placeholder="6 digits" inputmode="numeric" /></div>
          <div class="field"><label>City</label><input placeholder="City" /></div>
        </div>
        <div class="field"><label>State</label><input placeholder="State" /></div>
        <button class="btn btn--primary" style="margin-top:4px">Save &amp; use this address</button>
      </div>
    </div>

    <!-- 16 -->
    <div class="user">Saved it &mdash; take me to checkout</div>
    <!-- 17 -->
    <div class="asst">Saved and set as your delivery address. Opening your JioMart checkout.</div>

    <!-- CONFIRM ORDER -->
    <div class="widget">
      <div class="widget__title">Confirm your order</div>
      <div class="deliver">
        <div class="deliver__cap">Delivering to</div>
        <div class="deliver__name">GOKUL KUMAR <span class="tag">HOME</span></div>
        <div class="deliver__addr">801, Sai Ganga, Sector 5, Indiranagar, Bengaluru, Karnataka 560038</div>
      </div>
      <div class="items">
        <div class="item" style="border-bottom:1px solid var(--stroke-minimal)">
          <div class="item__img"><svg width="40" height="40" viewBox="0 0 48 48"><circle cx="18" cy="29" r="11" fill="#e0432c"/><circle cx="30" cy="29" r="11" fill="#e85a35"/><rect x="23" y="11" width="3" height="9" rx="1.5" fill="#7a4a1a"/><path d="M26 15 q6 -4 10 0 q-5 3 -10 0Z" fill="#2e9e4f"/></svg></div>
          <div class="item__body"><div class="item__top"><div><div class="item__name">Apple Royal Gala 4 pcs</div><div class="item__sub">500&ndash;700 g &middot; Qty 1</div></div><div class="item__price">&#8377;220</div></div></div>
        </div>
        <div class="item">
          <div class="item__img"><svg width="38" height="46" viewBox="0 0 40 50"><rect x="7" y="6" width="26" height="40" rx="3" fill="#e9d8a6"/><rect x="7" y="20" width="26" height="14" fill="#fff"/><text x="20" y="30" font-size="6" font-weight="700" fill="#8a6d1a" text-anchor="middle">GHEE</text></svg></div>
          <div class="item__body"><div class="item__top"><div><div class="item__name">Milkfood Rich Desi Ghee 900 ml</div><div class="item__sub">900 ml &middot; Qty 1</div></div><div class="item__price">&#8377;559</div></div></div>
        </div>
      </div>
      <div class="totals">
        <div class="totals__row"><span class="totals__label">Bag total (2 items)</span><span class="totals__val">&#8377;779</span></div>
        <div class="totals__row"><span class="totals__label">Delivery</span><span class="totals__val free">FREE</span></div>
        <div class="totals__divider"></div>
        <div class="grand"><div><div class="grand__label">Total</div><div class="grand__sub">2 items</div></div><div class="grand__val">&#8377;779</div></div>
        <div class="savings"><span class="savings__ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><span class="savings__txt">You saved &#8377;111 on this order (MRP &#8377;890)</span></div>
      </div>
      <div class="cod"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>Cash on Delivery</div>
      <div class="actions"><button class="btn btn--primary">Place Order</button></div>
    </div>

    <!-- 18 -->
    <div class="user mono">Place my JioMart order. checkout_snapshot=c54adb81368442ad7b73779b</div>
    <!-- placing order loader (lottie) -->
    <div id="placeLoader" class="lottie-loader"></div>

    <!-- ORDER PLACED -->
    <div class="widget">
      <div class="success">
        <div class="success__ring"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div class="success__title">Order placed!</div>
        <div class="success__sub">Your JioMart order is confirmed and on its way.</div>
        <div class="success__meta">
          <div class="success__metarow"><span>Order ID</span><span>#JM-48213907</span></div>
          <div class="success__metarow"><span>Arriving by</span><span>Tomorrow, 6&ndash;8 PM</span></div>
          <div class="success__metarow"><span>Paying</span><span>&#8377;779 &middot; Cash on Delivery</span></div>
        </div>
      </div>
      <!-- Track order — secondary button -->
      <div class="actions"><button class="btn btn--secondary">Track order</button></div>
    </div>

  </main>

  <div class="toast" id="toast"><span id="toastMsg">Removed Apple Royal Gala</span><button id="toastUndo">Undo</button></div>

  <!-- DOCK -->
  <footer class="dock">
    <button class="dock__add" aria-label="Add"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
    <div class="dock__pill">Ask me anything</div>
    <button class="dock__speak" aria-label="Speak"><span class="wave"><span></span><span></span><span></span><span></span></span>Speak</button>
  </footer>

</div>

<script>
const SPIN_DATA = ${_spinJson};

/* Init Lottie loaders */
lottie.loadAnimation({ container: document.getElementById('searchLottie'), animationData: SPIN_DATA, renderer: 'svg', loop: true, autoplay: true });
lottie.loadAnimation({ container: document.getElementById('placeLoader'),  animationData: SPIN_DATA, renderer: 'svg', loop: true, autoplay: true });

/* After 1.6s hide searching loader and reveal swim lanes */
setTimeout(() => {
  const loader = document.getElementById('searchLoader');
  const lanes  = document.getElementById('swimLanes');
  if(loader) loader.style.display = 'none';
  if(lanes)  lanes.style.display  = 'flex';
}, 1600);

const $ = (id) => document.getElementById(id);
const UNIT = 220, MRP_UNIT = 220, OTHERS = 559, OTHERS_MRP = 670, OTHER_LINES = 1;
let qty = 1, removed = false;
const appleEl = document.querySelector('[data-item="apple"]');
const fmt = (n) => "₹" + n.toLocaleString("en-IN");
function render(){
  const line = removed ? 0 : UNIT * qty;
  const lineMrp = removed ? 0 : MRP_UNIT * qty;
  const total = line + OTHERS, mrp = lineMrp + OTHERS_MRP, saved = mrp - total;
  $("applePrice").textContent = fmt(line);
  $("appleCount").textContent = qty;
  $("appleQtyLabel").textContent = "Qty " + qty;
  $("appleMinus").disabled = qty <= 1;
  $("bagTotal").textContent = fmt(total);
  $("grandTotal").textContent = fmt(total);
  const c = (removed ? 0 : 1) + OTHER_LINES;
  $("countBadge").textContent = c + (c === 1 ? " item" : " items");
  $("bagCount").textContent = "(" + c + (c === 1 ? " item)" : " items)");
  $("grandCount").textContent = c + (c === 1 ? " item" : " items");
  $("savingsTxt").innerHTML = "You saved " + fmt(saved) + " on this order (MRP " + fmt(mrp) + ")";
}
$("applePlus").addEventListener("click", () => { if(removed) return; qty++; render(); });
$("appleMinus").addEventListener("click", () => { if(removed||qty<=1) return; qty--; render(); });
$("appleRemove").addEventListener("click", () => { removed = true; appleEl.style.display = "none"; render(); showToast(); });
function showToast(){ const t=$("toast"); t.classList.add("show"); clearTimeout(window.__tt); window.__tt=setTimeout(()=>t.classList.remove("show"),4000); }
$("toastUndo").addEventListener("click", () => { removed=false; appleEl.style.display="flex"; render(); $("toast").classList.remove("show"); });
render();
</script>
</body>
</html>

`;
