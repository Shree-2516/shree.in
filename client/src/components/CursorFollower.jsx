import { useEffect, useRef } from "react";

function CursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    let rafId = null;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isVisible = false;
    let isHoveringAction = false;

    const interactiveSelector = "a, button, input, textarea, select, label, [role='button'], .btn";

    const updateHoverState = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        isHoveringAction = false;
        return;
      }
      isHoveringAction = Boolean(target.closest(interactiveSelector));
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${isHoveringAction ? 1.2 : 1})`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${isHoveringAction ? 1.28 : 1})`;

      if (!isVisible) {
        isVisible = true;
        dot.classList.add("is-visible");
        ring.classList.add("is-visible");
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      updateHoverState(event);
    };

    const onPointerLeave = () => {
      isVisible = false;
      dot.classList.remove("is-visible");
      ring.classList.remove("is-visible");
    };

    const onPointerEnter = () => {
      dot.classList.add("is-visible");
      ring.classList.add("is-visible");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", updateHoverState, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("pointerenter", onPointerEnter);

    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", updateHoverState);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("pointerenter", onPointerEnter);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-follower cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-follower cursor-dot" aria-hidden="true" />
    </>
  );
}

export default CursorFollower;
