/* ==========================================================================
   Motion layer — scroll reveals, 3D tilt, pointer parallax
   Native APIs only; honours prefers-reduced-motion and touch devices.
   ========================================================================== */
(function () {
    'use strict';

    var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    var reduce = reduceQuery.matches;
    var canHover = hoverQuery.matches;

    var revealObserver = null;
    var tiltBound = new WeakSet();
    var parallaxItems = [];

    function markVisible(el) {
        el.classList.add('is-visible');
    }

    /* ----------------------------------------------------------------------
       Scroll reveals
       ---------------------------------------------------------------------- */

    function applyDelay(el) {
        var delay = el.getAttribute('data-reveal-delay');
        if (delay !== null && delay !== '') {
            el.style.setProperty('--reveal-delay', delay + 's');
        }
    }

    function initReveal(root) {
        var scope = root || document;
        var items = scope.querySelectorAll('[data-reveal]:not(.is-visible)');

        if (reduce || !('IntersectionObserver' in window)) {
            items.forEach(markVisible);
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        markVisible(entry.target);
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        }

        items.forEach(function (el) {
            applyDelay(el);
            revealObserver.observe(el);
        });
    }

    function staggerGroups(root) {
        var scope = root || document;
        scope.querySelectorAll('[data-reveal-group]').forEach(function (group) {
            var children = group.querySelectorAll(':scope > [data-reveal]');
            children.forEach(function (child, index) {
                if (child.hasAttribute('data-reveal-delay')) return;
                child.style.setProperty('--reveal-delay', (index * 0.07).toFixed(2) + 's');
            });
        });
    }

    /* ----------------------------------------------------------------------
       Pointer-driven 3D tilt
       ---------------------------------------------------------------------- */

    function bindTilt(el) {
        if (!canHover || reduce || tiltBound.has(el)) return;
        tiltBound.add(el);

        var max = parseFloat(el.getAttribute('data-tilt-max')) || 6;
        var rect = null;
        var frame = null;
        var rotateX = 0;
        var rotateY = 0;

        function paint() {
            frame = null;
            el.style.setProperty('--rx', rotateX.toFixed(2) + 'deg');
            el.style.setProperty('--ry', rotateY.toFixed(2) + 'deg');
        }

        function enter() {
            rect = el.getBoundingClientRect();
            el.classList.add('is-tilting');
        }

        function move(event) {
            if (!rect) rect = el.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            var px = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
            var py = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

            rotateY = (px - 0.5) * 2 * max;
            rotateX = (0.5 - py) * 2 * max * 0.8;

            el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
            el.style.setProperty('--lift', '-4px');

            if (!frame) frame = requestAnimationFrame(paint);
        }

        function leave() {
            el.classList.remove('is-tilting');
            if (frame) {
                cancelAnimationFrame(frame);
                frame = null;
            }
            rotateX = 0;
            rotateY = 0;
            el.style.setProperty('--rx', '0deg');
            el.style.setProperty('--ry', '0deg');
            el.style.setProperty('--lift', '0px');
            rect = null;
        }

        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointermove', move, { passive: true });
        el.addEventListener('pointerleave', leave);
        el.addEventListener('pointercancel', leave);
    }

    function initTilt(root) {
        (root || document).querySelectorAll('[data-tilt]').forEach(bindTilt);
    }

    /* ----------------------------------------------------------------------
       Scroll parallax for decorative layers
       ---------------------------------------------------------------------- */

    function paintParallax() {
        var viewport = window.innerHeight || 0;
        parallaxItems.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.bottom < -200 || rect.top > viewport + 200) return;
            var speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
            var offset = (rect.top + rect.height / 2 - viewport / 2) * -speed;
            el.style.setProperty('--py', offset.toFixed(1));
        });
    }

    function initParallax() {
        if (reduce) return;
        parallaxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
        if (!parallaxItems.length) return;

        var ticking = false;

        function request() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                ticking = false;
                paintParallax();
            });
        }

        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        paintParallax();
    }

    /* ----------------------------------------------------------------------
       Hero pointer depth (layers respond at different rates)
       ---------------------------------------------------------------------- */

    function initHeroPointer() {
        var hero = document.getElementById('home');
        if (!hero || !canHover || reduce) return;

        var frame = null;
        var x = 0;
        var y = 0;

        function paint() {
            frame = null;
            hero.style.setProperty('--mxh', x.toFixed(3));
            hero.style.setProperty('--myh', y.toFixed(3));
        }

        function schedule() {
            if (!frame) frame = requestAnimationFrame(paint);
        }

        hero.addEventListener('pointermove', function (event) {
            var rect = hero.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            schedule();
        }, { passive: true });

        hero.addEventListener('pointerleave', function () {
            x = 0;
            y = 0;
            schedule();
        });
    }

    /* ----------------------------------------------------------------------
       Public refresh hook for dynamically injected content
       ---------------------------------------------------------------------- */

    window.motionRefresh = function (root) {
        var scope = root || document;
        staggerGroups(scope);
        initReveal(scope);
        initTilt(scope);
    };

    function start() {
        if (reduce) {
            document.querySelectorAll('[data-reveal]').forEach(markVisible);
            return;
        }
        staggerGroups(document);
        initReveal(document);
        initTilt(document);
        initParallax();
        initHeroPointer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
