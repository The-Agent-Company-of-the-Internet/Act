import { defineNuxtPlugin } from "#app";
import { gsap } from "gsap";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
  
  return {
    provide: {
      gsap,
      ScrollTrigger,
      ScrollSmoother
    }
  }
  
})