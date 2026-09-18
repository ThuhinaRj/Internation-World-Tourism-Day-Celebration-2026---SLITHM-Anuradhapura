(function () {
    "use strict";

    // ---------- GIFT OPEN ----------
    var opened = false;
    function openGift() {
        if (opened) return;
        opened = true;
        var box = document.getElementById('giftBox');
        box.classList.add('opening');

        setTimeout(function () {
            box.classList.remove('opening');
            box.classList.add('opened');
            spawnBurst();
        }, 500);

        setTimeout(function () {
            document.getElementById('gift-hint').style.opacity = 0;
            document.getElementById('scroll-cue').classList.add('show');
        }, 1000);
    }

    var giftBtn = document.getElementById('giftBtn');
    giftBtn.addEventListener('click', openGift);
    // iOS Safari sometimes swallows the synthetic click on animated elements
    giftBtn.addEventListener('touchend', function (e) { e.preventDefault(); openGift(); }, { passive: false });
    document.getElementById('gift-section').addEventListener('click', openGift);

    function spawnBurst() {
        var section = document.getElementById('gift-section');
        var symbols = ['✨', '🌐', '💫', '⭐'];
        for (var i = 0; i < 14; i++) {
            (function () {
                var p = document.createElement('div');
                p.className = 'burst';
                p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                var angle = Math.random() * Math.PI * 2;
                var dist = 80 + Math.random() * 120;
                p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
                p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
                p.style.left = '50%';
                p.style.top = '38%';
                section.appendChild(p);
                requestAnimationFrame(function () { p.classList.add('go'); });
                setTimeout(function () { p.remove(); }, 900);
            })();
        }
    }

    // ---------- SPLIT TEXT INTO WORDS FOR STAGGERED POP ----------
    Array.prototype.forEach.call(document.querySelectorAll('.reveal .big'), function (el) {
        var parts = el.innerHTML.split(/(<br\s*\/?>)/i);
        el.innerHTML = parts.map(function (part) {
            if (/<br/i.test(part)) return part;
            return part.split(' ').map(function (w) {
                return w.trim() ? '<span class="word">' + w + '</span>' : '';
            }).join(' ');
        }).join('');
    });

    function staggerWords(section) {
        Array.prototype.forEach.call(section.querySelectorAll('.word'), function (w, i) {
            w.style.transitionDelay = (i * 140) + 'ms';
        });
    }

    // ---------- THEMED PARTICLES ----------
    var particleSymbols = {
        tech: ['🌐', '✨', '🛰️'],
        travel: ['✈️', '🧭', '📸']
    };
    var activeLoops = {};

    function spawnParticle(layer, type) {
        var symbols = particleSymbols[type];
        var p = document.createElement('div');
        p.className = 'party-particle';
        p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
        p.style.setProperty('--spin', (Math.random() * 360) + 'deg');
        p.style.animationDuration = (Math.random() * 3 + 4) + 's';
        layer.appendChild(p);
        setTimeout(function () { p.remove(); }, 7500);
    }

    function startParticles(sectionId, layerId, type) {
        if (activeLoops[sectionId]) return;
        var layer = document.getElementById(layerId);
        if (!layer) return;
        activeLoops[sectionId] = setInterval(function () { spawnParticle(layer, type); }, 320);
    }
    function stopParticles(sectionId) {
        if (activeLoops[sectionId]) {
            clearInterval(activeLoops[sectionId]);
            delete activeLoops[sectionId];
        }
    }

    // ---------- STAGED ENTRANCE ----------
    // The page doesn't scroll — everything sits on screen at once — so the
    // reveal order is scripted directly instead of driven by scroll
    // position: 1) the topic, 2) the two caption lines, 3) the date/venue
    // boxes, 4) the bottom text (closing message + footer).
    function revealSection(id) {
        var section = document.getElementById(id);
        if (!section) return;
        if (!section.classList.contains('visible')) staggerWords(section);
        section.classList.add('visible');
        if (id === 'final-section') startTyping();
        var type = section.dataset.particles;
        if (type) startParticles(id, 'layer-' + id.split('-')[0], type);
    }

    function runEntranceSequence() {
        // Stage 1 (t=1800ms): the background sits alone for a beat, then
        // the topic — title-section's quote — fades/pops in; its own
        // caption ("World Tourism Day Celebration 2026") is held back by
        // its CSS transition-delay.
        // details-section is triggered at the same moment so its caption
        // ("Let the festivities unfold") lands in step with the title's
        // caption — that's stage 2 — while its date/venue boxes are held
        // back much further by their own CSS delay to become a clearly
        // separate stage 3.
        setTimeout(function () {
            revealSection('title-section');
            revealSection('details-section');
        }, 1800);

        // Stage 4 (t=7000ms): the bottom text — closing message — becomes
        // visible, with a longer gap after the boxes have landed.
        setTimeout(function () {
            revealSection('final-section');
        }, 7000);
        // Stage 5 (t=10200ms): the footer logo/caption trails further
        // behind the closing text.
        setTimeout(function () {
            revealSection('brand-footer');
        }, 10200);
    }

    if (document.readyState === 'complete') {
        runEntranceSequence();
    } else {
        window.addEventListener('load', runEntranceSequence);
    }

    // ---------- TYPEWRITER ----------
    var typed = false;
    var message = "Honors you with an invitation to join us in celebrating World Tourism Day!";
    function startTyping() {
        if (typed) return;
        typed = true;
        var el = document.getElementById('typed-text');
        var chars = Array.from(message); // keeps emoji intact
        var i = 0;
        var cursor = document.createElement('span');
        cursor.className = 'cursor';
        (function type() {
            if (i < chars.length) {
                el.textContent = chars.slice(0, i + 1).join('');
                el.appendChild(cursor);
                i++;
                setTimeout(type, 26);
            } else {
                document.getElementById('btnGroup').classList.add('show');
            }
        })();
    }

    // ---------- RSVP ----------
    var thanks = document.getElementById('thanks');
    var confettiTimer = null;

    document.getElementById('yesBtn').addEventListener('click', function () {
        document.getElementById('btnGroup').classList.remove('show');
        thanks.innerHTML = "Wonderful! ✈️ See you there!<span class='sub'>28th September &mdash; 10:00 AM onwards<br>School Premises, SLITHM Anuradhapura 🌍</span>";
        thanks.classList.add('show');
        if (confettiTimer) return;
        confettiTimer = setInterval(createConfetti, 80);
        setTimeout(function () { clearInterval(confettiTimer); confettiTimer = null; }, 6000);
    });

    // playful dodge, kept fully on-screen and touch-friendly
    var noBtn = document.getElementById('noBtn');
    var dodges = 0;
    function moveButton(e) {
        if (e) e.preventDefault();
        dodges++;
        if (dodges > 4) {
            noBtn.textContent = "Okay, fine 😄";
            noBtn.style.position = 'static';
            return;
        }
        var w = noBtn.offsetWidth, h = noBtn.offsetHeight;
        var x = Math.random() * Math.max(10, window.innerWidth - w - 20) + 10;
        var y = Math.random() * Math.max(10, window.innerHeight - h - 20) + 10;
        noBtn.style.position = 'fixed';
        noBtn.style.left = x + 'px';
        noBtn.style.top = y + 'px';
        noBtn.style.margin = '0';
    }
    noBtn.addEventListener('mouseover', moveButton);
    noBtn.addEventListener('click', moveButton);
    noBtn.addEventListener('touchstart', moveButton, { passive: false });

    var confettiEmojis = ['✈️', '🌐', '🎊', '⭐'];
    function createConfetti() {
        var piece = document.createElement('div');
        piece.className = 'confetti';
        piece.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.animationDuration = (Math.random() * 2 + 3) + 's';
        document.body.appendChild(piece);
        setTimeout(function () { piece.remove(); }, 5000);
    }
})();
