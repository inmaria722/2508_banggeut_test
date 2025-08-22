window.addEventListener('DOMContentLoaded', function () {
  if (!window.gsap || !window.ScrollTrigger || !window.jQuery) {
    console.error('GSAP/ScrollTrigger/jQuery가 로드됐는지 확인하세요.');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // 유틸
  const num  = (el,k,d)=>{ const v=Number($(el).data(k)); return Number.isFinite(v)?v:d; };
  const bool = (el,k,d=false)=>{ const v=$(el).data(k); return v===undefined?d:String(v).toLowerCase()==='true'; };

  // 접근성: 모션 최소화
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------
   * 1) 페이드 업 (기존)
   * ----------------------------- */
  $('[data-fade="up"]').each(function(i, e){
    const delay = Number($(e).data('delay')) || 0;

    if (reduce) { e.style.opacity=1; e.style.transform='none'; return; }

    gsap.from(e, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      delay,
      overwrite: 'auto',
      scrollTrigger: {
        trigger: e,
        start: 'top 90%',
        toggleActions: 'play none none reverse', // 다시 내려오면 재생
      }
    });
  });

  /* -----------------------------
   * 2) 둥둥(float)
   * ----------------------------- */
  $('[data-anim="float"]').each(function(_, el){
    if (reduce) { el.style.transform='none'; return; }

    const amp    = num(el,'amp',100);
    const speed  = num(el,'speed',2);
    const rot    = num(el,'rot', 2);
    const axis   = (($(el).data('axis')||'y')+'').toLowerCase(); // 'y' or 'x'
    const delay  = num(el,'delay', Math.random()*speed);
    const breath = num(el,'breath',0);
    const start  = $(el).data('start') || 'top 95%';

    const prop = axis === 'x' ? 'x' : 'y';

    // 기준점 보정 (대칭 왕복)
    gsap.set(el, { [prop]: `-=${amp/2}`, transformOrigin: '50% 50%' });

    // 반복 타임라인 - 처음엔 멈춘 상태로
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'sine.inOut' },
      delay,
    });

    tl.to(el, {
      [prop]: `+=${amp}`,    // -amp/2 ↔ +amp/2
      rotation: rot,
      duration: speed,
      yoyo: true,
      repeat: -1,
      overwrite: 'auto',
      immediateRender: false,
    });

    if (breath > 0) {
      tl.to(el, {
        scale: 1 + breath,
        duration: speed,
        yoyo: true,
        repeat: -1,
        overwrite: 'auto',
        immediateRender: false,
      }, 0);
    }

    // 보일 때만 실행/일시정지 (퍼포먼스 + 충돌 감소)
    ScrollTrigger.create({
      trigger: el,
      start,
      onEnter:      () => tl.play(),
      onLeave:      () => tl.pause(),
      onEnterBack:  () => tl.resume(),
      onLeaveBack:  () => tl.pause(),
    });
  });
});

// 이미지 등 로딩 후 위치 재계산 (트리거가 안맞는 문제 방지)
window.addEventListener('load', () => {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});