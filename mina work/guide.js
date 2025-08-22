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