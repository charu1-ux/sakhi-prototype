export const JBIQ_CSS = `
@font-face{font-family:'JioType';font-weight:400;src:url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeVarW05-Regular.woff2') format('woff2')}
@font-face{font-family:'JioType';font-weight:500;src:url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeW05-Medium.woff2') format('woff2')}
@font-face{font-family:'JioType';font-weight:700;src:url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeW05-Bold.woff2') format('woff2')}
@font-face{font-family:'JioType';font-weight:900;src:url('https://raw.githubusercontent.com/sunit1986/JioBharatIQ_Server/main/assets/fonts/woff2/JioTypeW05-Black.woff2') format('woff2')}

:root{
  --jh-surface:#fff;--jh-surface-ghost:#eeeeef;--jh-surface-ghost-icon:#e7e9ff;--jh-surface-bold:#3900ad;
  --jh-surface-subtle:#eeeeef;--jh-surface-minimal:#f8f8f9;
  --jh-text-high:#0c0d10;--jh-text-medium:#191b1e;--jh-text-low:rgba(25,27,30,.65);
  --jh-icon-medium:#170054;--jh-stroke-subtle:rgba(36,38,43,.12);
  --jh-primary-50:#3535f3;--jh-primary-20:#e8e8fc;--jh-sparkle-50:#1eccb0;
  --jh-error:#fa2f40;--jh-success:#25ab21;--jh-grey-100:#141414;--jh-grey-60:#b5b5b5;--jh-grey-20:#f5f5f5;
  --jh-shape-pill:999px;--jh-shape-4xl:24px;--jh-shape-l:16px;--jh-shape-m:12px;--jh-shape-s:8px;--jh-shape-xs:4px;
  --jh-font:'JioType',sans-serif;
}

@keyframes jh-fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
.jh-anim-1{animation:jh-fadeDown .4s ease both;animation-delay:0s}
.jh-anim-2{animation:jh-fadeDown .4s ease both;animation-delay:.1s}
.jh-anim-3{animation:jh-fadeDown .4s ease both;animation-delay:.15s}
.jh-anim-4{animation:jh-fadeDown .4s ease both;animation-delay:.2s}
.jh-anim-5{animation:jh-fadeDown .4s ease both;animation-delay:.25s}

.jh-body-scroll{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:120px}
.jh-body-scroll::-webkit-scrollbar{display:none}

.jh-section-title{
  font-size:20px;font-weight:900;line-height:1;letter-spacing:0;
  padding:16px 18px 12px;color:var(--jh-text-high);font-family:var(--jh-font);
}

/* ASSISTANTS */
.jh-assistants-row{display:flex;gap:16px;padding:0 18px;overflow-x:auto}
.jh-assistants-row::-webkit-scrollbar{display:none}
.jh-assistant-item{display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0;cursor:pointer;text-decoration:none;color:inherit}
.jh-assistant-avatar-wrap{width:74px;height:74px;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:50%}
.jh-assistant-ring{position:absolute;inset:0;border-radius:50%;border:2.5px solid var(--jh-primary-50);z-index:2;pointer-events:none}
.jh-assistant-ring.jh-grey{border-color:var(--jh-grey-60)}
.jh-assistant-item.jh-inactive{opacity:.8}
.jh-assistant-item.jh-highlighted .jh-assistant-ring{border-width:3px}
.jh-assistant-img{width:60px;height:60px;border-radius:50%;object-fit:cover;object-position:center;position:relative;z-index:1}
.jh-assistant-img-inner{width:60px;height:60px;border-radius:50%;overflow:hidden;position:relative;z-index:1;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--jh-surface,#fff)}
.jh-assistant-img-inner .jh-assistant-img-scaled{transform:scale(1.26);transform-origin:center center}
.jh-assistant-label{font-size:14px;font-weight:500;color:var(--jh-text-medium);opacity:.8;text-align:center;white-space:nowrap;font-family:var(--jh-font)}

/* TOOLS */
.jh-tools-section{display:flex;flex-direction:column;gap:8px}
.jh-section-title-row{display:flex;align-items:baseline;gap:8px;padding:16px 18px 12px}
.jh-section-title-row .jh-section-title{padding:0}
.jh-tools-coming-soon{font-size:11px;font-weight:500;color:var(--jh-primary-50);text-transform:lowercase;letter-spacing:.02em;opacity:.9;font-family:var(--jh-font)}
.jh-tools-row{display:flex;gap:8px;padding:0 18px;overflow-x:auto;flex-wrap:nowrap}
.jh-tools-row::-webkit-scrollbar{display:none}
.jh-tool-chip{
  flex-shrink:0;display:flex;align-items:center;gap:6px;
  padding:8px 14px;border-radius:var(--jh-shape-pill);
  background:var(--jh-surface);border:1px solid var(--jh-stroke-subtle);
  font-family:var(--jh-font);font-size:14px;font-weight:500;color:var(--jh-text-medium);
  cursor:pointer;white-space:nowrap;opacity:.8;transition:all .15s;
  position:relative;text-decoration:none;
}
.jh-tool-chip:active{background:var(--jh-primary-20);border-color:var(--jh-primary-50)}

/* UPDATE CARDS */
.jh-updates-section{display:flex;flex-direction:column;gap:10px;padding:0 16px}
.jh-ucard{
  background:var(--jh-surface-subtle);border-radius:var(--jh-shape-l);
  padding:16px;display:flex;flex-direction:column;gap:6px;
}
.jh-ucard-title{font-size:16px;font-weight:700;line-height:1.1;color:var(--jh-text-high);font-family:var(--jh-font)}
.jh-ucard-row{display:flex;gap:10px;align-items:flex-start}
.jh-ucard-text{flex:1;display:flex;flex-direction:column;gap:4px;justify-content:center;min-height:54px}
.jh-ucard-text .jh-main{font-size:14px;font-weight:500;line-height:1.3;color:var(--jh-text-high);font-family:var(--jh-font)}
.jh-ucard-text .jh-sub{font-size:10px;font-weight:400;line-height:1.3;color:var(--jh-text-low);font-family:var(--jh-font)}
.jh-ucard-img{width:54px;height:54px;border-radius:var(--jh-shape-xs);overflow:hidden;flex-shrink:0}
.jh-ucard-img img{width:100%;height:100%;object-fit:cover}
.jh-ucard-action{
  display:flex;align-items:center;justify-content:space-between;
  background:var(--jh-surface-minimal);border-radius:var(--jh-shape-4xl);
  padding:4px 8px 4px 14px;
}
.jh-ucard-action span{font-size:12px;font-weight:500;color:var(--jh-text-high);font-family:var(--jh-font)}
.jh-ucard-action-btn{
  width:32px;height:32px;border-radius:50%;border:none;
  background:var(--jh-primary-50);display:flex;align-items:center;justify-content:center;cursor:pointer;
}
.jh-ucard-action-btn svg{width:16px;height:16px;color:#fff}

/* CRICKET */
.jh-cricket{background:var(--jh-surface-subtle);border-radius:var(--jh-shape-l);padding:16px;display:flex;flex-direction:column;gap:8px;align-items:center}
.jh-cricket-scores{display:flex;align-items:center;justify-content:space-between;width:100%}
.jh-cricket-team{display:flex;align-items:center;gap:7px;flex:1}
.jh-cricket-team.jh-right{flex-direction:row-reverse;text-align:right;justify-content:flex-start}
.jh-cricket-flag{width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0}
.jh-cricket-flag img{width:100%;height:100%;object-fit:contain}
.jh-cricket-info{display:flex;flex-direction:column;gap:2px}
.jh-cricket-name{font-size:16px;font-weight:500;line-height:1.1;font-family:var(--jh-font)}
.jh-cricket-score{font-size:16px;font-weight:700;line-height:1.1;font-family:var(--jh-font)}
.jh-cricket-overs{font-size:14px;font-weight:400;line-height:1.2;color:rgba(12,13,16,.46);font-family:var(--jh-font)}
.jh-cricket-vs{width:30px;height:30px;border-radius:50%;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--jh-text-medium);background:var(--jh-surface-minimal);font-family:var(--jh-font)}
.jh-cricket-divider{width:100%;height:1px;background:#e0e1e2}
.jh-cricket-live{display:flex;align-items:center;gap:4px;background:#fa2f40;border-radius:2px;padding:0 7px}
.jh-cricket-live-dot{width:6px;height:6px;border-radius:50%;background:#fff}
.jh-cricket-live span{font-size:10px;font-weight:500;color:#fff;line-height:1.3;font-family:var(--jh-font)}
.jh-cricket-bottom{display:flex;gap:8px;align-items:center;justify-content:center}
.jh-cricket-status{font-size:12px;font-weight:400;color:rgba(12,13,16,.66);font-family:var(--jh-font)}

/* NEWS */
.jh-news-item{display:flex;gap:10px;align-items:flex-start}
.jh-news-item .jh-text-col{flex:1;display:flex;flex-direction:column;gap:4px;min-height:54px;justify-content:center}
.jh-news-item .jh-title{font-size:14px;font-weight:500;line-height:1.3;color:var(--jh-text-high);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-family:var(--jh-font)}
.jh-news-item .jh-source{font-size:10px;font-weight:400;color:var(--jh-text-low);font-family:var(--jh-font)}
.jh-news-item .jh-thumb{width:52px;height:52px;border-radius:var(--jh-shape-s);overflow:hidden;flex-shrink:0}
.jh-news-item .jh-thumb img{width:100%;height:100%;object-fit:cover}

/* SONGS */
.jh-song-item{display:flex;gap:10px;align-items:center}
.jh-song-item .jh-art{width:52px;height:52px;border-radius:var(--jh-shape-s);overflow:hidden;flex-shrink:0}
.jh-song-item .jh-art img{width:100%;height:100%;object-fit:cover}
.jh-song-item .jh-meta{flex:1;display:flex;flex-direction:column;gap:2px;justify-content:center}
.jh-song-item .jh-meta .jh-name{font-size:14px;font-weight:500;line-height:1.3;color:var(--jh-text-high);font-family:var(--jh-font)}
.jh-song-item .jh-meta .jh-artist{font-size:12px;font-weight:400;line-height:1.3;color:var(--jh-text-low);font-family:var(--jh-font)}
.jh-song-play{width:20px;height:20px;opacity:.8;flex-shrink:0}

/* WEEKEND */
.jh-day-pills{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto}
.jh-day-pill{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;flex-shrink:0;font-family:var(--jh-font)}
.jh-day-pill.jh-off{background:var(--jh-surface-subtle);color:#535862}
.jh-day-pill.jh-holiday{background:var(--jh-success);color:#fff}
.jh-day-pill.jh-current{background:#fbe6de;color:#953400}
.jh-weekend-body{display:flex;gap:10px;align-items:center}
.jh-weekend-img{width:106px;height:106px;border-radius:var(--jh-shape-m);overflow:hidden;flex-shrink:0}
.jh-weekend-img img{width:100%;height:100%;object-fit:cover}
.jh-weekend-text{flex:1;display:flex;flex-direction:column;gap:10px}
.jh-weekend-text .jh-bold{font-size:14px;font-weight:700;line-height:1.3;color:var(--jh-text-high);font-family:var(--jh-font)}
.jh-weekend-text .jh-desc{font-size:10px;font-weight:400;line-height:1.3;color:var(--jh-text-high);font-family:var(--jh-font)}
.jh-dest-chips{display:flex;gap:4px;flex-wrap:wrap}
.jh-dest-chip{background:#00ad8b;color:#fff;font-size:10px;font-weight:500;padding:4px 12px;border-radius:var(--jh-shape-pill);white-space:nowrap;font-family:var(--jh-font)}

/* WEATHER */
.jh-weather-top{display:flex;gap:10px;align-items:flex-start;position:relative}
.jh-weather-city{display:flex;align-items:center;gap:4px}
.jh-weather-city-name{font-size:16px;font-weight:700;line-height:1.1;font-family:var(--jh-font)}
.jh-weather-city svg{width:16px;height:16px;opacity:.8}
.jh-weather-icon{width:103px;height:103px;position:absolute;top:-8px;right:0;border-radius:var(--jh-shape-s)}
.jh-weather-icon img{width:100%;height:100%;object-fit:cover}
.jh-weather-temp{display:flex;align-items:flex-start}
.jh-weather-deg{font-size:36px;font-weight:900;line-height:1;letter-spacing:0;font-family:var(--jh-font)}
.jh-weather-c{font-size:18px;font-weight:400;line-height:1.3;margin-top:2px;font-family:var(--jh-font)}
.jh-weather-desc{font-size:12px;font-weight:400;color:var(--jh-text-low);font-family:var(--jh-font)}
.jh-weather-stats{display:flex;gap:12px;margin-top:4px}
.jh-weather-stat{flex:1;display:flex;flex-direction:column;gap:0}
.jh-weather-stat .jh-label{font-size:12px;font-weight:400;color:var(--jh-text-low);font-family:var(--jh-font)}
.jh-weather-stat .jh-val{font-size:16px;font-weight:700;line-height:1.3;color:var(--jh-text-high);font-family:var(--jh-font)}
`;
