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

    const amp    = num(el,'amp',12);
    const speed  = num(el,'speed',2.2);
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






// 콕콕 찌르는 효과
window.addEventListener('DOMContentLoaded', function () {
  gsap.registerPlugin(ScrollTrigger);

  const num  = (el,k,d)=>{ const v=Number($(el).data(k)); return Number.isFinite(v)?v:d; };
  const bool = (el,k,d=false)=>{ const v=$(el).data(k); return v===undefined?d:String(v).toLowerCase()==='true'; };

  // 콕콕 찌르기: <div data-anim="poke" data-dir="ltr|rtl|ttb|btt" data-dist="14" data-speed="0.28" ...>
  $('[data-anim="poke"]').each(function(_, el){
    const dir    = String($(el).data('dir')||'ltr').toLowerCase(); // ltr:→, rtl:←, ttb:↓, btt:↑
    const axis   = (dir==='ltr'||dir==='rtl') ? 'x' : 'y';
    const sign   = (dir==='rtl'||dir==='btt') ? -1 : 1;

    const dist   = num(el,'dist',14);     // 한 번 찌를 때 이동(px)
    const speed  = num(el,'speed',0.28);  // 전진 시간(초)
    const back   = num(el,'back',0.18);   // 복귀 시간(초)
    const over   = num(el,'over',0.25);   // 되튕김 비율(0.25면 dist의 25%)
    const squish = num(el,'squish',0.06); // 전진할 때 살짝 납작(축 스퀴시)
    const times  = Math.max(1, num(el,'times',3)); // 1사이클에 몇 번 찌를지
    const gap    = num(el,'gap',0.6);     // 사이클 간 대기(초)
    const loop   = bool(el,'loop',true);  // 무한 반복
    const start  = $(el).data('start') || 'top 90%';
    const once   = bool(el,'once',false); // true면 한 번만

    // 팁 근처에 물결을 넣고 싶으면 자식에 data-poke="ripple" 추가
    const ripple = el.querySelector('[data-poke="ripple"]');

    // 기준점: 찌르는 방향의 반대쪽(약간 “밀어내는” 감)
    const origin = axis==='x'
      ? (sign>0 ? '0% 50%' : '100% 50%') // →는 왼쪽, ←는 오른쪽
      : (sign>0 ? '50% 0%' : '50% 100%'); // ↓는 위쪽, ↑는 아래쪽
    gsap.set(el, { transformOrigin: origin });

    if (ripple) {
      gsap.set(ripple, { opacity:0, scale:0.6, transformOrigin: '50% 50%', pointerEvents:'none' });
    }

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out' },
      repeat: loop ? -1 : 0,
      repeatDelay: loop ? gap : 0,
    });

    // 한 번 “찌르기” 시퀀스
    const doOnePoke = () => {
      // 1) 전진 + 살짝 납작
      tl.to(el, {
        [axis]: `+=${sign*dist}`,
        ...(axis==='x' ? {scaleX: 1 - squish} : {scaleY: 1 - squish}),
        duration: speed,
        ease: 'power4.out'
      });

      // 물결 이펙트(있을 때만)
      if (ripple) {
        tl.to(ripple, {
          opacity: 0.35, scale: 1.4, duration: speed*0.9, ease: 'power1.out'
        }, '<');
        tl.to(ripple, {
          opacity: 0, scale: 1.8, duration: back*1.2, ease: 'power1.in'
        }, '>');
      }

      // 2) 빠른 복귀 + 되튕김(반대 방향으로 약간)
      tl.to(el, {
        [axis]: `-=${sign*(dist + dist*over)}`,
        scaleX: 1, scaleY: 1,
        duration: back,
        ease: 'power2.in'
      });

      // 3) 미세 정착
      tl.to(el, {
        [axis]: `+=${sign*dist*over}`,
        duration: back*0.8,
        ease: 'power1.out'
      });
    };

    for (let i=0;i<times;i++) doOnePoke();

    // 뷰포트 진입/이탈에 맞춰 재생 제어
    ScrollTrigger.create({
      trigger: el,
      start,
      toggleActions: once ? 'play none none none' : 'play pause resume pause',
      onEnter:     () => tl.play(0),
      onLeave:     () => tl.pause(),
      onEnterBack: () => tl.play(0),
      onLeaveBack: () => tl.pause(),
    });
  });
});
