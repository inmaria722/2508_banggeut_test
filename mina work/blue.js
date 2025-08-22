// 배경 네모 -> 동그랗게
document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('.blue-box-1 .bg-blue');
  if (!el) return;

  // GSAP가 있으면 GSAP로
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // 시작은 네모
    gsap.set(el, {
      borderTopLeftRadius: '0 0',
      borderTopRightRadius: '0 0',
      borderBottomLeftRadius: '0 0',
      borderBottomRightRadius: '0 0',
    });

    gsap.to(el, {
      // 위쪽만 둥글게
      borderTopLeftRadius: '1273.5px 842px',
      borderTopRightRadius: '1273.5px 842px',
      ease: 'none',
      scrollTrigger: {
        trigger: '.blue-box-1',
        start: 'top 95%',   // 더 빨리 시작
        end: '+=250',       // 짧게 끝나서 빨리 완성
        scrub: true,
        // markers: true,   // 디버그용(원하면 주석 해제)
        onEnter: () => (el.style.willChange = 'border-radius'),
        onEnterBack: () => (el.style.willChange = 'border-radius'),
        onLeave: () => (el.style.willChange = ''),
        onLeaveBack: () => (el.style.willChange = ''),
      }
    });

  } else {
    // GSAP이 없으면 순수 JS로(간단 트리거)
    const trigger = 100; // 더 빨리 시작하려면 수치 줄이기
    window.addEventListener('scroll', () => {
      if (window.scrollY > trigger) {
        el.style.borderTopLeftRadius = '1273.5px 842px';
        el.style.borderTopRightRadius = '1273.5px 842px';
      } else {
        el.style.borderTopLeftRadius = '0 0';
        el.style.borderTopRightRadius = '0 0';
      }
    }, { passive: true });
  }
});




// 페이드인
window.addEventListener('DOMContentLoaded', function () {
        gsap.registerPlugin(ScrollTrigger);

        //공동 속성
        $('[data-fade="up"]').each(function(i,e){
          const delay = $(e).data('delay') || 0;

            gsap.from(e,{
                opacity:0,
                y:60,
                duration:.8,
                delay: delay,
                scrollTrigger:{
                    trigger:e,
                    start:'top 90%',
                    toggleActions:'play none none reverse',
                }
            })
        })
      });



// section-4 앱 인터랙션
window.addEventListener('DOMContentLoaded', function () {
  gsap.registerPlugin(ScrollTrigger);

  const num  = (el,k,d)=>{ const v=Number($(el).data(k)); return Number.isFinite(v)?v:d; };
  const bool = (el,k,d=false)=>{ const v=$(el).data(k); return v===undefined?d:String(v).toLowerCase()==='true'; };

  // 모션 최소화 접근성
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('[data-anim-stagger] [data-anim-item]').each((_,e)=>{ e.style.opacity=1; e.style.transform='none'; });
    return;
  }

  // 컨테이너별 초기화
  $('[data-anim-stagger]').each(function(_, group){
    // 왼쪽→오 기준 정렬 방식: x(기본) or dom
    const order = ($(group).data('order') || 'x').toLowerCase();

    let items = Array.from(group.querySelectorAll('[data-anim-item]'));
    if (!items.length) return;

    if (order === 'x') {
      // 실제 화면상 x좌표로 정렬 (왼쪽부터)
      items.sort((a,b)=> a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    }
    // 옵션
    const dist      = num(group,'dist',60);       // 시작 x 오프셋(px)
    const dur       = num(group,'dur',0.8);       // 한 아이템의 기본 지속시간
    const each      = num(group,'each',0.12);     // 아이템 간 간격
    const delay     = num(group,'delay',0);       // 전체 지연
    const once      = bool(group,'once',false);   // 역재생 방지
    const start     = $(group).data('start') || 'top 85%';
    const scrub     = bool(group,'scrub',false);  // 스크럽 연동 여부

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay,
      scrollTrigger: {
        trigger: group,
        start,
        toggleActions: once ? 'play none none none' : 'play none none reverse',
        scrub: scrub ? 0.3 : false,
      }
    });

    // 왼쪽부터 순차: x:-dist, opacity:0, scale:0.8 → x:0, opacity:1, scale:1
    items.forEach((el, i) => {
      tl.fromTo(el,
        { opacity: 0, x: -dist, scale: 0.8 },
        { opacity: 1, x: 0,     scale: 1, duration: dur },
        i * each
      );
    });
  });
});