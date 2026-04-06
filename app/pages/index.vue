<script setup lang="ts">
useSeoMeta({
  title: "Agent Company of the Internet",
  description: "Building the infrastructure for autonomous agents on the internet"
})

const { gsap, ScrollTrigger, ScrollSmoother } = useGsap();
let smoother: ScrollSmoother | null = null;

onMounted(() => {
  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: 1.5,
    effects: true,
    normalizeScroll: true
  });

  ScrollTrigger.refresh();

  // ── Noise canvas animation ──
  const canvas = document.getElementById('noise-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  canvas.width = 100;
  canvas.height = 100;

  function drawNoise() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 5; // very subtle opacity - 18 before
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawNoise);
  }
  drawNoise();

  // ── Box expand on scroll ──
  const box = document.getElementById('hero-box');
  const heroSection = document.getElementById('hero-section');

  gsap.fromTo(box,
    {
      width: '50px',
      height: '50px',
      borderRadius: '4px',
    },
    {
      width: 'calc(100vw - 40px)',
      height: 'calc(100vh - 40px)',
      borderRadius: '8px',
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
        pin: true,
      }
    }
  );

  // ── Act section fade in from bottom ──
  gsap.fromTo('#act-section',
    {
      opacity: 0,
      y: 60,
    },
    {
      opacity: 1,
      y: 40,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#act-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    }
  );

  // ── CTA section fade in ──
  gsap.fromTo('#cta-section',
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#cta-section',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    }
  );
})

onUnmounted(() => {
  smoother?.kill();
  ScrollTrigger.getAll().forEach(t => t.kill());
})
</script>

<template>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <main class="flex flex-col justify-center items-start bg-[#EDEDED]">
        <!-- ── HERO ── -->
        <section
          id="hero-section"
          class="relative w-screen h-screen flex flex-col gap-y-2 justify-center items-center overflow-hidden"
        >
          <!-- Expanding box -->
          <div
            id="hero-box"
            class="absolute z-10 bg-[#121212]"
            style="
              width: 50px;
              height: 50px;
              border-radius: 4px;
              mix-blend-mode: difference;
              overflow: hidden;
              pointer-events: none;
            "
          >
            <!-- Animated noise canvas -->
            <canvas
              id="noise-canvas"
              class="absolute border inset-0 w-full h-full mix-blend-difference"
              style="opacity: 0.6; mix-blend-mode: screen;"
            />
          </div>

          <!-- Hero text — sits behind box, inverts via blend mode -->
          <div class="relative z-0 flex flex-col gap-y-2 items-center text-center px-6">
            <div class="flex justify-center items-center z-0">
              <LightLogo />
            </div>
            <span class="font-display text-4xl font-semibold text-white">
              The Agent Company of the Internet
            </span>
            <span class="font-sans text-xl font-medium text-white">
              Infrastructure for autonomous agents on the internet.
            </span>
          </div>
        </section>

        <!-- ── ACT SECTION ── -->
        <section
          id="act-section"
          class="w-screen h-auto px-2 py-2 flex flex-col mt-[100vh] sm:mt-[50%] md:mt-[75%] lg:mt-[100vh]"
          style="opacity: 0;"
        >
          <div class="flex justify-between px-10 items-start">
            <div class="h-auto flex flex-col gap-y-1 justify-start items-start">
              <span class="font-display font-semibold text-2xl">Act</span>
              <span class="font-sans font-normal text-md max-w-75 leading-5">
                Create and manage agents that are authorized to act on your behalf.
              </span>
              <a href="/auth/login" class="flex no-underline justify-center items-center px-2 py-1 w-auto h-auto bg-[#121212] rounded-xs">
                <span class="font-sans text-sm text-[#EDEDED]">Start acting</span>
              </a>
            </div>
            <div class="border flex justify-center items-center w-150 h-100 rounded-sm bg-[#FFFFFF] border-[#D9D9D9]" />
          </div>
        </section>

        <!-- ── CTA SECTION ── -->
        <section
          id="cta-section"
          class="w-screen mt-20 pt-10 pb-10 px-12 flex justify-center items-center"
          style="opacity: 0;"
        >
          <div class="flex flex-col bg-[#FFFFFF] border border-[#D9D9D9] gap-y-5 h-75 w-full rounded-lg justify-center items-center">
            <span class="font-display text-2xl font-semibold text-[#121212] text-center">
              You should start using and building for agents on the internet.
            </span>
            <button class="flex items-center justify-center px-4 py-2 rounded-xs bg-[#121212]">
              <span class="font-sans text-xl font-normal text-[#EDEDED]">
                Start using and building
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>