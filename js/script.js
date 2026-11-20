(function () {

    var header = document.getElementById('header');
    var burger = document.querySelector('.burger');
    var mmenu = document.getElementById('mmenu');
    var mbar = document.getElementById('mbar');
    var hasIO = 'IntersectionObserver' in window;

    // HEADER

    function onScroll() {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // MOBILE MENU

    function setMenu(open) {
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Uždaryti meniu' : 'Meniu');
        mmenu.hidden = !open;
        document.body.classList.toggle('menu-open', open);
        updateBar();
    }

    burger.addEventListener('click', function () {
        setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    mmenu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !mmenu.hidden) {
            setMenu(false);
            burger.focus();
        }
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
        if (e.matches) setMenu(false);
    });

    // REVEAL ON SCROLL

    var items = document.querySelectorAll('.reveal');

    if (hasIO) {
        items.forEach(function (el) {
            var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
                return c.classList.contains('reveal');
            });
            var i = siblings.indexOf(el);
            if (i > 0) el.style.transitionDelay = Math.min(i, 4) * 90 + 'ms';
        });

        var revealIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealIO.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        items.forEach(function (el) { revealIO.observe(el); });
    } else {
        items.forEach(function (el) { el.classList.add('is-in'); });
    }

    // TESTIMONIALS – vertical auto-slide, no controls. Pauses on hover / focus,
    // off-screen and in background tabs; static when reduced motion is preferred.

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-vslider]').forEach(function (slider) {
        var track = slider.querySelector('.rvslider__track');
        var hovered = false;
        var visible = !hasIO;
        var moving = false;

        if (reduceMotion) return;

        function perView() {
            return parseInt(getComputedStyle(slider).getPropertyValue('--per'), 10) || 1;
        }

        function step() {
            if (hovered || !visible || document.hidden || moving) return;
            if (track.children.length <= perView()) return;
            var first = track.firstElementChild;
            var gap = parseFloat(getComputedStyle(track).rowGap) || 0;
            moving = true;
            track.style.transition = 'transform .9s cubic-bezier(.6, 0, .2, 1)';
            track.style.transform = 'translateY(' + -(first.offsetHeight + gap) + 'px)';
        }

        track.addEventListener('transitionend', function (e) {
            if (e.target !== track) return;
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'none';
            moving = false;
        });

        slider.addEventListener('mouseenter', function () { hovered = true; });
        slider.addEventListener('mouseleave', function () { hovered = false; });
        slider.addEventListener('focusin', function () { hovered = true; });
        slider.addEventListener('focusout', function () { hovered = false; });

        if (hasIO) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
            }, { threshold: 0.3 }).observe(slider);
        }

        setInterval(step, 4500);
    });

    // MOBILE CTA BAR – shown after the hero, hidden over the registration block and footer

    var heroInView = true;
    var endInView = new Set();

    function updateBar() {
        if (!mbar) return;
        mbar.classList.toggle('is-visible', !heroInView && endInView.size === 0 && mmenu.hidden);
    }

    if (hasIO && mbar) {
        new IntersectionObserver(function (entries) {
            heroInView = entries[0].isIntersecting;
            updateBar();
        }).observe(document.querySelector('.hero'));

        var endIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) endInView.add(entry.target);
                else endInView.delete(entry.target);
            });
            updateBar();
        });
        [document.getElementById('registracija'), document.querySelector('.footer')].forEach(function (el) {
            if (el) endIO.observe(el);
        });
    }

})();
