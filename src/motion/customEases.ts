import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(CustomEase, ScrollTrigger, Observer);

// Create the non-negotiable easing curves specified in §6
export const EASE_CAMERA = CustomEase.create('easeCamera', 'M0,0 C0.65,0 0.35,1 1,1');
export const EASE_UI = CustomEase.create('easeUI', 'M0,0 C0.16,1 0.3,1 1,1');
export const EASE_SNAP = CustomEase.create('easeSnap', 'M0,0 C0.25,1 0.4,1 1,1');

export { gsap, ScrollTrigger, Observer, CustomEase };
