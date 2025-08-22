// 왼쪽에서 오른쪽으로 페이드인
window.addEventListener('DOMContentLoaded', function () {
  gsap.registerPlugin(ScrollTrigger);

  // 왼쪽 → 오른쪽 페이드 인 (data-anim="fade-ltr")
  $('[data-anim="fade-ltr"]').each(function(_, el){
    const $el  = $(el);
    const delay= Number($el.data('delay'))||0;   // 지연
    const dist = Number($el.data('dist')) ||60;  // 시작 x 오프셋(px)
    const dur  = Number($el.data('dur'))  ||0.8; // 지속시간
    const start= $el.data('start') || 'top 85%';
    const once = String($el.data('once')).toLowerCase()==='true';

    gsap.fromTo(el,
      { opacity: 0, x: -dist },
      {
        opacity: 1, x: 0, duration: dur, ease: 'power3.out', delay,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: once ? 'play none none none' : 'play none none reverse' // 다시 내려오면 재생
        }
      }
    );
  });
});





// 페이드 업
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





// 작아졌다가 점점 커지는
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // 선택자: data-anim="scale-scroll"
  document.querySelectorAll('[data-anim="scale-scroll"]').forEach(el => {
    const get = (k, d) => el.getAttribute('data-'+k) ?? d;
    const num = (k, d) => {
      const v = parseFloat(get(k, d));
      return Number.isFinite(v) ? v : d;
    };

    const mode  = String(get('mode','grow')).toLowerCase();
    const from  = num('from', mode==='grow' ? 0.8  : 0.9);
    const to    = num('to',   mode==='grow' ? 1.05 : 0.6);
    const fade  = String(get('fade','true')).toLowerCase() !== 'false';
    const start = get('start','top 85%');
    const end   = get('end','+=300');
    const scrub = num('scrub',0.6);

    gsap.fromTo(el,
      { scale: from, opacity: fade ? 0 : 1 },
      { scale: to,   opacity: fade ? 1 : 1, ease: 'none',
        scrollTrigger: { trigger: el, start, end, scrub, markers: false } // markers: 디버그
      }
    );
  });

  // 이미지/폰트 후 레이아웃 변할 수 있으니 새로고침
  window.addEventListener('load', () => ScrollTrigger.refresh());
});