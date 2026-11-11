/* The Schoeman Clinic - shared front-end behaviour.
   Extracted verbatim from the inline <script> blocks that were
   duplicated across all 11 pages. Each block is a self-contained
   IIFE with null-guards, so it no-ops on pages lacking its markup. */

/* ---- scroll-snap slider arrows ---- */
(function () {
	function init() {
		Array.prototype.slice.call(document.querySelectorAll('[data-slider]')).forEach(function (slider) {
			var viewport = slider.querySelector('[data-slider-viewport]');
			if (!viewport) return;
			var prev = slider.querySelector('[data-slider-prev]');
			var next = slider.querySelector('[data-slider-next]');
			var progress = slider.querySelector('[data-slider-progress]');

			function step() {
				var card = viewport.firstElementChild;
				if (!card) return viewport.clientWidth;
				var gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
				return card.getBoundingClientRect().width + gap;
			}

			function sync() {
				if (viewport.scrollTop) {
					viewport.scrollTop = 0;
				}

				var end = viewport.scrollWidth - viewport.clientWidth - 2;
				var atStart = viewport.scrollLeft <= 2;
				var atEnd = viewport.scrollLeft >= end;
				if (prev) prev.disabled = atStart;
				if (next) next.disabled = atEnd;
				// Only whether an edge dissolves is decided here. How far it
				// dissolves is the stylesheet's business, since it depends on how
				// much track sits beyond a snapped card at the current width.
				viewport.style.setProperty('--tsc-fade-l', atStart ? '0px' : 'var(--tsc-fade-in)');
				viewport.style.setProperty('--tsc-fade-r', end <= 0 || atEnd ? '0px' : 'var(--tsc-fade-out)');
				if (progress) {
					// Thumb width mirrors the visible share of the track, and it
					// travels one thumb-length per screenful scrolled.
					var share = Math.min(1, viewport.clientWidth / viewport.scrollWidth);
					progress.style.width = share * 100 + '%';
					progress.style.transform =
						'translateX(' + (viewport.scrollLeft / viewport.clientWidth) * 100 + '%)';
				}
			}

			function ease() {
				return window.matchMedia('(prefers-reduced-motion: reduce)').matches
					? 'auto'
					: 'smooth';
			}

			if (prev) prev.addEventListener('click', function () {
				viewport.scrollBy({ left: -step(), behavior: ease() });
			});
			if (next) next.addEventListener('click', function () {
				viewport.scrollBy({ left: step(), behavior: ease() });
			});
			viewport.addEventListener('scroll', sync, { passive: true });
			viewport.addEventListener('wheel', function (event) {
				if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
					return;
				}

				event.preventDefault();
				window.scrollBy(0, event.deltaY);
			}, { passive: false });
			window.addEventListener('resize', sync);
			sync();
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

/* ---- search overlay ---- */
(function () {
		var overlay = document.getElementById('tsc-search');
		if (!overlay) return;
		var input = overlay.querySelector('.tsc-search__input');
		var closeBtn = document.getElementById('tsc-search-close');
		var form = document.getElementById('tsc-search-form');
		var list = document.getElementById('tsc-search-suggest');
		var catalog = (window.schoemanSearch && window.schoemanSearch.catalog) || [];
		var active = -1;
		var matches = [];

		function openSearch() {
			overlay.classList.add('is-open');
			overlay.setAttribute('aria-hidden', 'false');
			document.body.classList.add('tsc-search-lock');
			setTimeout(function () {
				if (input) {
					input.focus();
					if (input.value.trim()) renderSuggest(input.value);
				}
			}, 120);
		}
		function closeSearch() {
			overlay.classList.remove('is-open');
			overlay.setAttribute('aria-hidden', 'true');
			document.body.classList.remove('tsc-search-lock');
			clearSuggest();
		}

		function clearSuggest() {
			matches = [];
			active = -1;
			if (!list) return;
			list.innerHTML = '';
			list.hidden = true;
			if (input) {
				input.setAttribute('aria-expanded', 'false');
				input.removeAttribute('aria-activedescendant');
			}
		}

		function scoreItem(item, query) {
			var q = query.toLowerCase();
			var title = (item.title || '').toLowerCase();
			var text = item.text || '';
			var score = 0;

			if (title === q) score += 100;
			else if (title.indexOf(q) === 0) score += 60;
			else if (title.indexOf(q) !== -1) score += 40;

			var words = q.split(/\s+/).filter(function (w) { return w.length > 1; });
			words.forEach(function (word) {
				if (title.indexOf(word) !== -1) score += 12;
				if (text.indexOf(word) !== -1) score += 4;
			});

			if (!words.length && text.indexOf(q) !== -1) score += 4;
			if (item.kind === 'Service') score += 2;
			return score;
		}

		function renderSuggest(raw) {
			if (!list || !catalog.length) return;
			var query = (raw || '').trim();
			if (query.length < 1) {
				clearSuggest();
				return;
			}

			matches = catalog
				.map(function (item) {
					return { item: item, score: scoreItem(item, query) };
				})
				.filter(function (row) { return row.score > 0; })
				.sort(function (a, b) { return b.score - a.score; })
				.slice(0, 6)
				.map(function (row) { return row.item; });

			active = -1;
			if (!matches.length) {
				clearSuggest();
				return;
			}

			list.innerHTML = matches.map(function (item, index) {
				return (
					'<li class="tsc-search__option" role="option" id="tsc-search-opt-' + index + '" data-index="' + index + '">' +
						'<span class="tsc-search__option-kind">' + escapeHtml(item.kind) + '</span>' +
						'<span class="tsc-search__option-title">' + highlight(item.title, query) + '</span>' +
					'</li>'
				);
			}).join('');
			list.hidden = false;
			if (input) input.setAttribute('aria-expanded', 'true');
		}

		function escapeHtml(value) {
			return String(value)
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		}

		function highlight(title, query) {
			var safe = escapeHtml(title);
			var words = query.trim().split(/\s+/).filter(function (w) { return w.length > 0; });
			words.forEach(function (word) {
				var pattern = new RegExp('(' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
				safe = safe.replace(pattern, '<mark>$1</mark>');
			});
			return safe;
		}

		function setActive(next) {
			if (!list || !matches.length) return;
			var options = list.querySelectorAll('.tsc-search__option');
			if (active >= 0 && options[active]) options[active].classList.remove('is-active');
			active = next;
			if (active < 0) {
				if (input) input.removeAttribute('aria-activedescendant');
				return;
			}
			if (active >= options.length) active = options.length - 1;
			options[active].classList.add('is-active');
			if (input) input.setAttribute('aria-activedescendant', options[active].id);
			options[active].scrollIntoView({ block: 'nearest' });
		}

		function goTo(index) {
			var item = matches[index];
			if (!item || !item.url) return;
			window.location.href = item.url;
		}

		document.querySelectorAll('button[aria-label="Search"]').forEach(function (btn) {
			if (btn.closest('#tsc-search')) return;
			btn.addEventListener('click', function (e) {
				e.preventDefault();
				openSearch();
			});
		});

		if (closeBtn) closeBtn.addEventListener('click', closeSearch);
		var backdrop = document.getElementById('tsc-search-backdrop');
		if (backdrop) backdrop.addEventListener('click', closeSearch);

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
				if (!list || list.hidden) closeSearch();
				else clearSuggest();
			}
		});

		if (input) {
			var suggestTimer;
			input.addEventListener('input', function () {
				clearTimeout(suggestTimer);
				suggestTimer = setTimeout(function () {
					renderSuggest(input.value);
				}, 80);
			});

			input.addEventListener('keydown', function (e) {
				if (!matches.length) return;
				if (e.key === 'ArrowDown') {
					e.preventDefault();
					setActive(active + 1 >= matches.length ? 0 : active + 1);
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					setActive(active <= 0 ? matches.length - 1 : active - 1);
				} else if (e.key === 'Enter' && active >= 0) {
					e.preventDefault();
					goTo(active);
				}
			});
		}

		if (list) {
			list.addEventListener('mousedown', function (e) {
				var option = e.target.closest('.tsc-search__option');
				if (!option) return;
				e.preventDefault();
				goTo(parseInt(option.getAttribute('data-index'), 10));
			});
		}

		if (form) {
			form.addEventListener('submit', function (e) {
				var query = input ? input.value.trim() : '';
				// The static build has nowhere to send a query, so the overlay stays
				// inert there; under WordPress the form carries an action.
				if (!query || !form.getAttribute('action')) {
					e.preventDefault();
					if (input) input.focus();
				}
			});
		}
	})();

/* ---- side panel ---- */
(function () {
		var overlay = document.getElementById('tsc-menu');
		if (!overlay) return;
		var closeBtn = document.getElementById('tsc-menu-close');
		var backdrop = document.getElementById('tsc-menu-backdrop');
		var toggles = overlay.querySelectorAll('.tsc-menu__toggle');
		var opener = null;
		function collapseGroups() {
			toggles.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
		}
		function openMenu(btn) {
			opener = btn || null;
			overlay.classList.add('is-open');
			overlay.setAttribute('aria-hidden', 'false');
			document.body.classList.add('tsc-search-lock');
			if (closeBtn) closeBtn.focus();
		}
		function closeMenu() {
			overlay.classList.remove('is-open');
			overlay.setAttribute('aria-hidden', 'true');
			document.body.classList.remove('tsc-search-lock');
			if (opener) { opener.focus(); opener = null; }
			// After the panel has slid out, so the rows do not visibly fold up.
			setTimeout(collapseGroups, 650);
		}
		document.querySelectorAll('button[aria-label="Menu"]').forEach(function (btn) {
			if (btn.closest('#tsc-menu')) return;
			btn.addEventListener('click', function (e) { e.preventDefault(); openMenu(btn); });
		});
		/* One group at a time: the panel is a single narrow column, and two
		   open groups push the rest of the nav off the bottom of a phone. */
		toggles.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var open = btn.getAttribute('aria-expanded') === 'true';
				collapseGroups();
				btn.setAttribute('aria-expanded', open ? 'false' : 'true');
			});
		});
		/* Same-page links (the homepage anchors) would otherwise leave the
		   panel covering the section they just jumped to. */
		overlay.querySelectorAll('.tsc-menu__nav a').forEach(function (link) {
			link.addEventListener('click', function () { closeMenu(); });
		});
		if (closeBtn) closeBtn.addEventListener('click', closeMenu);
		if (backdrop) backdrop.addEventListener('click', closeMenu);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
		});
	})();

/* ---- preloader ---- */
(function () {
		var pre = document.getElementById('tsc-preloader');
		var root = document.documentElement;
		if (!pre) { root.classList.remove('tsc-preloading'); return; }
		var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		function finish() { root.classList.remove('tsc-preloading'); pre.classList.add('is-done'); }
		if (reduce) { finish(); return; }
		setTimeout(finish, 4050);
	})();

/* ---- video lightbox ---- */
(function () {
		var overlay = document.getElementById('tsc-video');
		if (!overlay) return;
		var video = document.getElementById('tsc-video-el');
		var closeBtn = document.getElementById('tsc-video-close');
		var backdrop = document.getElementById('tsc-video-backdrop');
		var source = document.getElementById('tsc-video-source');
		var defaultSrc = source ? source.getAttribute('src') : '';
		var defaultType = source ? source.getAttribute('type') : 'video/mp4';
		var defaultSd = video ? video.getAttribute('data-src-sd') : '';
		var defaultPoster = video ? video.getAttribute('poster') : '';
		var loaded = false;

		/* A self-hosted file has no adaptive bitrate, so a visitor on a phone
		   or a throttled connection would otherwise pull the 2.9Mbps 1080p
		   master and stall. Pick the 720p cut for them instead. Deciding here
		   rather than on page load also catches a rotation, and costs nothing
		   because preload="none" means nothing has been fetched yet. */
		function wantsSmallerFile() {
			if (window.innerWidth && window.innerWidth < 900) return true;
			var link = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
			if (!link) return false;
			if (link.saveData) return true;
			return /^(slow-2g|2g|3g)$/.test(link.effectiveType || '');
		}

		function openVideo(trigger) {
			overlay.classList.add('is-open');
			overlay.setAttribute('aria-hidden', 'false');
			document.body.classList.add('tsc-search-lock');
			if (!video) return;

			/* A section may supply its own film. Without one, retain the
			   site-wide clinic film and its smaller mobile encode. */
			var triggerSrc = trigger ? trigger.getAttribute('data-video-src') : '';
			var marker = trigger && !triggerSrc ? document.querySelector('[data-approach-video]') : null;
			var customSrc = triggerSrc || (marker ? marker.getAttribute('data-approach-video') : '');
			var sd = customSrc ? '' : defaultSd;
			var requestedSrc = (sd && wantsSmallerFile()) ? sd : (customSrc || defaultSrc);
			var requestedType = trigger && trigger.getAttribute('data-video-type');
			if (!requestedType) requestedType = /\.webm(?:$|\?)/i.test(requestedSrc) ? 'video/webm' : defaultType;
			var requestedPoster = trigger && trigger.getAttribute('data-video-poster');

			if (video) video.setAttribute('poster', requestedPoster || defaultPoster);

			/* Rewriting a <source> takes effect on load(), and load() is also
			   what moves the element off preload="none". */
			if (source && requestedType) source.setAttribute('type', requestedType);
			if (source && requestedSrc && source.getAttribute('src') !== requestedSrc) {
				source.setAttribute('src', requestedSrc);
				video.load();
				loaded = true;
			} else if (!loaded) {
				video.load();
				loaded = true;
			}

			try { video.currentTime = 0; } catch (e) {}
			var p = video.play();
			if (p && p.catch) p.catch(function () {});
		}
		function closeVideo() {
			overlay.classList.remove('is-open');
			overlay.setAttribute('aria-hidden', 'true');
			document.body.classList.remove('tsc-search-lock');
			if (video) { video.pause(); }
		}
		document.querySelectorAll('.tsc-play, [data-video-src]').forEach(function (btn) {
			btn.addEventListener('click', function (e) { e.preventDefault(); openVideo(btn); });
		});
		if (closeBtn) closeBtn.addEventListener('click', closeVideo);
		if (backdrop) backdrop.addEventListener('click', closeVideo);
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeVideo();
		});
	})();

/* ---- mega menu ---- */
(function(){function init(){var mega=document.getElementById('mega');if(!mega)return;var scrim=document.getElementById('mega-scrim');var triggers=Array.prototype.slice.call(document.querySelectorAll('[data-mega-trigger]'));var panels=Array.prototype.slice.call(mega.querySelectorAll('[data-mega-panel]'));var closeTimer=null,current=null;function showPanel(key){panels.forEach(function(p){p.classList.toggle('is-active',p.getAttribute('data-mega-panel')===key);});triggers.forEach(function(t){t.setAttribute('aria-expanded',String(t.getAttribute('data-mega-trigger')===key));});current=key;}function alignPanel(key){var panel=mega.querySelector('[data-mega-panel="'+key+'"]');var grid=panel&&panel.querySelector('.mega-grid');var trig=document.querySelector('[data-mega-trigger="approach"]');if(!grid||!trig)return;var tRect=trig.getBoundingClientRect();if(tRect.width<=0)return;var gRect=grid.getBoundingClientRect();var off=Math.max(0,Math.round(tRect.left-gRect.left));grid.style.paddingLeft=off+'px';var lead=grid.querySelector('.mega-lead');if(lead)lead.style.maxWidth=Math.max(0,off-24)+'px';}function open(key){if(closeTimer){clearTimeout(closeTimer);closeTimer=null;}showPanel(key);alignPanel(key);mega.classList.add('is-open');if(scrim)scrim.classList.add('is-open');}function close(){mega.classList.remove('is-open');if(scrim)scrim.classList.remove('is-open');triggers.forEach(function(t){t.setAttribute('aria-expanded','false');});current=null;}function scheduleClose(){if(closeTimer)clearTimeout(closeTimer);closeTimer=setTimeout(close,150);}triggers.forEach(function(t){var key=t.getAttribute('data-mega-trigger');t.addEventListener('mouseenter',function(){open(key);});t.addEventListener('focus',function(){open(key);});t.addEventListener('mouseleave',scheduleClose);t.addEventListener('click',function(e){e.preventDefault();if(current===key&&mega.classList.contains('is-open')){close();}else{open(key);}});});mega.addEventListener('mouseenter',function(){if(closeTimer){clearTimeout(closeTimer);closeTimer=null;}});mega.addEventListener('mouseleave',scheduleClose);if(scrim){scrim.addEventListener('mouseenter',close);scrim.addEventListener('click',close);}document.addEventListener('keydown',function(e){if(e.key==='Escape'||e.keyCode===27)close();});document.addEventListener('click',function(e){if(!mega.contains(e.target)&&!(e.target.closest&&e.target.closest('[data-mega-trigger]')))close();});window.addEventListener('resize',function(){if(current&&mega.classList.contains('is-open'))alignPanel(current);});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}})();

/* ---- testimonial slider ---- */
(function(){function init(){var sec=document.getElementById('in-confidence');if(!sec)return;var quotes=Array.prototype.slice.call(sec.querySelectorAll('blockquote'));var dots=Array.prototype.slice.call(sec.querySelectorAll('button[aria-label^="Testimonial"]'));if(!quotes.length)return;var idx=0,timer=null;function show(i){idx=(i+quotes.length)%quotes.length;quotes.forEach(function(q,n){var on=n===idx;q.style.opacity=on?'1':'0';q.setAttribute('aria-hidden',String(!on));});dots.forEach(function(d,n){var on=n===idx;d.style.width=on?'3rem':'1.25rem';d.style.background=on?'var(--bronze)':'color-mix(in oklab, var(--foreground) 20%, transparent)';});}function start(){stop();timer=setInterval(function(){show(idx+1);},6000);}function stop(){if(timer){clearInterval(timer);timer=null;}}dots.forEach(function(d,n){d.addEventListener('click',function(){show(n);start();});});show(0);start();}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}})();

/* ---- approach column alignment ---- */
(function(){function align(){var grid=document.querySelector('#approach .grid');if(!grid)return;var cols=grid.children;if(cols.length<2)return;var right=cols[1];var img=cols[0].querySelector('img');if(!img)return;right.style.paddingTop='0px';if(window.innerWidth<768)return;var off=Math.max(0,Math.round(img.getBoundingClientRect().top-right.getBoundingClientRect().top));right.style.paddingTop=off+'px';}function schedule(){align();setTimeout(align,150);}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',schedule);}else{schedule();}window.addEventListener('load',schedule);window.addEventListener('resize',align);})();

/* ---- enquiry form ----
 * WordPress forms submit to their server action. A form with no action belongs
 * to the static design build, where the button can only acknowledge in place or
 * open the named confirmation page.
 */
(function () {
	function handle(form) {
		form.addEventListener('submit', function (e) {
			var button = form.querySelector('button[type="submit"],button:not([type])');
			var previous = button && button.textContent;
			var destination = form.getAttribute('data-thank-you');

			/* WordPress forms post to a server-side handler. Leave that native
			   submission alone and preserve the visible label. Disabling the
			   button prevents a duplicate enquiry while SMTP completes. */
			if (form.getAttribute('action')) {
				if (button) {
					button.disabled = true;
				}
				return;
			}

			e.preventDefault();

			if (button) {
				button.textContent = destination ? 'Sending' : 'Received';
				button.disabled = true;
			}

			if (destination) {
				window.location.assign(destination);
				return;
			}

			setTimeout(function () {
				if (button) {
					button.textContent = previous || 'Send';
					button.disabled = false;
				}
				form.reset();
			}, 2200);
		});
	}

	function init() {
		// The home and book pages wrap the form in #enquiry; the contact page
		// carries the id on the form itself.
		var forms = document.querySelectorAll('#enquiry form, form#enquiry');
		Array.prototype.forEach.call(forms, handle);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

/* ---- patient journey ---- */
(function(){function init(){var sec=document.getElementById('journey');if(!sec)return;var imgs=Array.prototype.slice.call(sec.querySelectorAll('[data-journey-img]'));if(imgs.length<2)return;var stages=Array.prototype.slice.call(sec.querySelectorAll('h3')).map(function(h){return h.closest('div[style],div');});
// clickable stage rows: find each roman numeral block
var rows=[];sec.querySelectorAll('div').forEach(function(d){var t=(d.textContent||'').trim();if(/^(I|II|III|IV)$/.test(t) && d.className.indexOf('font-serif')>=0){var row=d.parentElement;if(row&&rows.indexOf(row)<0)rows.push(row);}});
function show(i){imgs.forEach(function(img,n){var on=n===i;img.style.opacity=on?'1':'0';});rows.forEach(function(r){r.style.cursor='pointer';r.style.opacity='1';});}
rows.forEach(function(r,n){r.addEventListener('click',function(){show(n);});r.style.transition='opacity .4s ease';});
show(0);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();

/* ---- enquiry select menus ----
 * Native selects cannot be styled past their border, and the popup they open
 * is drawn by the OS in system chrome that sits badly against the dark form.
 * These build a listbox alongside the real select, which stays in the DOM as
 * the submitted value (and as the fallback when this script never runs).
 */
(function () {
	var CHEVRON = '<svg viewBox="0 0 12 8" fill="none" aria-hidden="true"><path d="M1 1.5 6 6.5l5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	var TICK = '<svg viewBox="0 0 12 10" fill="none" aria-hidden="true"><path d="M1 5.4 4.4 8.8 11 1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

	function enhance(native) {
		if (native.getAttribute('data-luxe-ready')) return;
		native.setAttribute('data-luxe-ready', '1');

		var multi = native.multiple;
		var placeholder = native.getAttribute('data-placeholder') || 'Select';
		var choices = Array.prototype.filter.call(native.options, function (option) {
			return option.value !== '';
		});

		var label = document.querySelector('label[for="' + native.id + '"]');
		if (label && !label.id) label.id = native.id + '-label';

		var wrap = document.createElement('div');
		wrap.className = 'tsc-select' + (multi ? ' tsc-select--multi' : '');

		var value = document.createElement('span');
		value.className = 'tsc-select__value';
		value.id = native.id + '-value';

		var chevron = document.createElement('span');
		chevron.className = 'tsc-select__chevron';
		chevron.innerHTML = CHEVRON;

		var button = document.createElement('button');
		button.type = 'button';
		button.id = native.id + '-button';
		button.className = 'tsc-select__button';
		button.setAttribute('aria-haspopup', 'listbox');
		button.setAttribute('aria-expanded', 'false');
		button.setAttribute('aria-controls', native.id + '-list');
		if (label) button.setAttribute('aria-labelledby', label.id + ' ' + value.id);
		button.appendChild(value);
		button.appendChild(chevron);

		var list = document.createElement('ul');
		list.className = 'tsc-select__panel';
		list.id = native.id + '-list';
		list.setAttribute('role', 'listbox');
		if (label) list.setAttribute('aria-labelledby', label.id);
		if (multi) list.setAttribute('aria-multiselectable', 'true');

		var items = choices.map(function (option, index) {
			var item = document.createElement('li');
			item.className = 'tsc-select__option';
			item.id = native.id + '-opt-' + index;
			item.setAttribute('role', 'option');

			if (multi) {
				var box = document.createElement('span');
				box.className = 'tsc-select__box';
				box.innerHTML = TICK;
				item.appendChild(box);
			}

			var text = document.createElement('span');
			text.className = 'tsc-select__text';
			text.textContent = option.text;
			item.appendChild(text);

			if (!multi) {
				var tick = document.createElement('span');
				tick.className = 'tsc-select__tick';
				tick.innerHTML = TICK;
				item.appendChild(tick);
			}

			// mousedown, not click: the button's blur handler would otherwise
			// close the panel before the click landed.
			item.addEventListener('mousedown', function (event) {
				event.preventDefault();
				choose(index);
			});
			item.addEventListener('mousemove', function () {
				setActive(index);
			});
			list.appendChild(item);
			return item;
		});

		native.parentNode.insertBefore(wrap, native);
		wrap.appendChild(button);
		wrap.appendChild(list);
		wrap.appendChild(native);
		native.classList.add('tsc-select__native');
		native.setAttribute('tabindex', '-1');
		native.setAttribute('aria-hidden', 'true');
		if (label) label.setAttribute('for', button.id);

		var open = false;
		var active = -1;

		function sync() {
			var selected = [];
			items.forEach(function (item, index) {
				var on = choices[index].selected;
				item.setAttribute('aria-selected', String(on));
				if (on) selected.push(choices[index].text);
			});
			wrap.classList.toggle('is-empty', selected.length === 0);
			// The field is half a column wide, so anything past the first
			// choice is summarised rather than truncated mid-word.
			if (!selected.length) {
				value.textContent = placeholder;
			} else if (selected.length === 1) {
				value.textContent = selected[0];
			} else {
				value.textContent = selected[0] + ' + ' + (selected.length - 1) + ' more';
			}
		}

		function setActive(index) {
			active = index;
			items.forEach(function (item, n) {
				item.classList.toggle('is-active', n === index);
			});
			if (index < 0) {
				button.removeAttribute('aria-activedescendant');
				return;
			}
			button.setAttribute('aria-activedescendant', items[index].id);
			if (open) items[index].scrollIntoView({ block: 'nearest' });
		}

		function move(step) {
			var next = active < 0 ? (step > 0 ? 0 : items.length - 1) : active + step;
			setActive(Math.max(0, Math.min(items.length - 1, next)));
		}

		function choose(index) {
			var option = choices[index];
			if (multi) {
				option.selected = !option.selected;
			} else {
				choices.forEach(function (other) {
					other.selected = false;
				});
				option.selected = true;
			}
			native.dispatchEvent(new Event('change', { bubbles: true }));
			sync();
			setActive(index);
			if (!multi) close(true);
		}

		function show() {
			if (open) return;
			open = true;
			// Interest carries seven options, enough to fall off a phone
			// screen when the field sits low in the form.
			var box = button.getBoundingClientRect();
			var needed = Math.min(list.scrollHeight, 336) + 16;
			var below = window.innerHeight - box.bottom;
			wrap.classList.toggle('is-up', below < needed && box.top > below);
			wrap.classList.add('is-open');
			button.setAttribute('aria-expanded', 'true');
			var first = choices.findIndex(function (option) {
				return option.selected;
			});
			setActive(first < 0 ? 0 : first);
		}

		function close(focus) {
			if (!open) return;
			open = false;
			wrap.classList.remove('is-open');
			button.setAttribute('aria-expanded', 'false');
			setActive(-1);
			if (focus) button.focus();
		}

		button.addEventListener('click', function () {
			if (open) close(false);
			else show();
		});

		button.addEventListener('keydown', function (event) {
			var key = event.key;
			if (key === 'ArrowDown' || key === 'ArrowUp') {
				event.preventDefault();
				if (!open) show();
				else move(key === 'ArrowDown' ? 1 : -1);
			} else if (key === 'Home' || key === 'End') {
				if (!open) return;
				event.preventDefault();
				setActive(key === 'Home' ? 0 : items.length - 1);
			} else if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
				event.preventDefault();
				if (!open) show();
				else if (active >= 0) choose(active);
			} else if (key === 'Escape' || key === 'Esc') {
				close(true);
			} else if (key === 'Tab') {
				close(false);
			}
		});

		button.addEventListener('blur', function () {
			close(false);
		});

		document.addEventListener('click', function (event) {
			if (!wrap.contains(event.target)) close(false);
		});

		// The demo form resets itself after submitting, which bypasses change.
		var form = native.form;
		if (form) {
			form.addEventListener('reset', function () {
				setTimeout(sync, 0);
			});
		}

		sync();
	}

	function init() {
		var selects = document.querySelectorAll('select[data-luxe-select]');
		Array.prototype.forEach.call(selects, enhance);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

/* ---- count-up figures ---- */
(function () {
	var DURATION = 1500;
	var STAGGER = 140;

	/* '20+' -> ['20', '+'], '1:1' -> ['1', ':', '1']: digit runs count, the
	   rest of the string is carried through untouched. */
	function parse(text) {
		return text.match(/\d+|\D+/g) || [];
	}

	function render(tokens, progress) {
		var out = '';
		for (var i = 0; i < tokens.length; i++) {
			out += /^\d+$/.test(tokens[i])
				? String(Math.round(parseInt(tokens[i], 10) * progress))
				: tokens[i];
		}
		return out;
	}

	function run(el, delay) {
		var tokens = parse((el.textContent || '').trim());
		var final = tokens.join('');
		var largest = 0;
		for (var i = 0; i < tokens.length; i++) {
			if (/^\d+$/.test(tokens[i])) largest = Math.max(largest, parseInt(tokens[i], 10));
		}
		/* A figure like '1:1' spends most of the run reading '0:0' and then
		   flips: that reads as a fault rather than a count, so leave it. */
		if (largest < 10) return;

		var start = null;
		el.textContent = render(tokens, 0);

		function frame(now) {
			if (start === null) start = now;
			var elapsed = now - start - delay;
			if (elapsed >= 0) {
				var p = Math.min(elapsed / DURATION, 1);
				/* easeOutCubic: away quickly, then settles rather than stops. */
				el.textContent = render(tokens, 1 - Math.pow(1 - p, 3));
				if (p === 1) {
					el.textContent = final;
					return;
				}
			}
			requestAnimationFrame(frame);
		}

		requestAnimationFrame(frame);
	}

	function init() {
		var els = Array.prototype.slice.call(document.querySelectorAll('[data-countup]'));
		if (!els.length) return;

		var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !('IntersectionObserver' in window)) return;

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				observer.unobserve(entry.target);
				run(entry.target, els.indexOf(entry.target) * STAGGER);
			});
		}, { threshold: 0.6 });

		els.forEach(function (el) {
			observer.observe(el);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

/* ---- footer link groups: collapsible on phones ---- */
(function () {
	/* Matches the breakpoint where the footer becomes a row of columns. */
	var PHONE = '(max-width: 47.99rem)';

	var row = document.querySelector('.tsc-foot__top');
	if (!row) return;

	var groups = Array.prototype.slice
		.call(row.querySelectorAll('.tsc-foot__col'))
		.map(function (col, index) {
			var heading = col.firstElementChild;
			var panel = col.querySelector('.tsc-foot__panel');
			if (!heading || !panel) return null;

			var button = document.createElement('button');
			button.type = 'button';
			button.className = heading.className + ' tsc-foot__toggle';
			button.setAttribute('aria-expanded', 'false');

			panel.id = panel.id || 'tsc-foot-group-' + (index + 1);
			button.setAttribute('aria-controls', panel.id);

			var label = document.createElement('span');
			label.textContent = heading.textContent;
			var icon = document.createElement('span');
			icon.className = 'tsc-foot__toggle-icon';
			icon.setAttribute('aria-hidden', 'true');
			button.appendChild(label);
			button.appendChild(icon);

			button.addEventListener('click', function () {
				var open = button.getAttribute('aria-expanded') !== 'true';
				button.setAttribute('aria-expanded', open ? 'true' : 'false');
			});

			return { col: col, heading: heading, panel: panel, button: button };
		})
		.filter(Boolean);

	if (!groups.length) return;

	var collapsed = false;

	function collapse() {
		if (collapsed) return;
		collapsed = true;
		row.classList.add('is-collapsible');
		groups.forEach(function (group) {
			group.heading.hidden = true;
			group.col.insertBefore(group.button, group.heading);
		});
	}

	/* Wide screens get the plain headings back: a button that cannot collapse
	   anything would still be announced as one. */
	function expand() {
		if (!collapsed) return;
		collapsed = false;
		row.classList.remove('is-collapsible');
		groups.forEach(function (group) {
			group.button.setAttribute('aria-expanded', 'false');
			if (group.button.parentNode) group.button.parentNode.removeChild(group.button);
			group.heading.hidden = false;
		});
	}

	var query = window.matchMedia(PHONE);

	function sync() {
		if (query.matches) collapse();
		else expand();
	}

	if (query.addEventListener) query.addEventListener('change', sync);
	else if (query.addListener) query.addListener(sync);

	/* Belt and braces: sync() only acts on a change of state, and a resize is
	   the one event guaranteed to arrive when the query itself does not. */
	window.addEventListener('resize', sync);

	sync();
})();

/* ---- scroll reveals ---- */
(function () {
	/* Every composed block on the page already carries its finished reveal state
	   inline: full opacity, no offset, and an 1100ms transition holding the delay
	   that fixes its place in a group. The export shipped the destination without
	   the journey — no script ever moved them. This returns each block to a start
	   position and lets the scroll release it, so a section arrives in the order
	   it was composed rather than all at once.

	   The start position is set from here rather than from a stylesheet
	   deliberately: if this never runs, the markup still describes a settled page,
	   so a visitor without JavaScript reads it whole. */

	/* Far enough to register as movement, short enough to stay quiet. */
	var OFFSET = 28;
	/* Hold a block until it is properly inside the viewport, so it is still
	   moving as the eye reaches it rather than finishing below the fold. */
	var MARGIN = '0px 0px -12% 0px';

	var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced || !('IntersectionObserver' in window)) return;

	if (!document.body) return;

	/* The reveal wrappers have no class of their own, so they are found by the
	   shape of the inline style the export left behind: full opacity, a settled
	   transform and a transition able to carry both. The settled transform is
	   written two ways across the pages — an explicit zero offset on most, plain
	   none on the policy pages — and either marks the same intent. */
	var blocks = Array.prototype.filter.call(
		document.querySelectorAll('[style*="opacity"][style*="transition"]'),
		function (el) {
			var style = el.getAttribute('style') || '';
			if (!/opacity: ?1/.test(style) || !/transition: ?opacity/.test(style)) return false;
			return /translateY\(0(px)?\)/.test(style) || /transform: ?none/.test(style);
		}
	);
	if (!blocks.length) return;

	function hide(el) {
		el.style.opacity = '0';
		el.style.transform = 'translateY(' + OFFSET + 'px)';
	}

	function show(el) {
		el.style.opacity = '1';
		el.style.transform = 'translateY(0px)';
	}

	/* A block the visitor has already scrolled past — a reload part way down the
	   page — has no entrance left to make, so it is put back without one. */
	function settle(el) {
		var transition = el.style.transition;
		el.style.transition = 'none';
		show(el);
		void el.offsetHeight;
		el.style.transition = transition;
	}

	blocks.forEach(hide);

	function release() {
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				observer.unobserve(entry.target);
				show(entry.target);
			});
		}, { rootMargin: MARGIN, threshold: 0 });

		/* Blocks the observer never sees stay under watch rather than being
		   written off: one sitting in a collapsed answer, behind a specialist
		   filter or on an unopened panel has an empty rectangle and so cannot
		   intersect, and arrives the moment whatever holds it opens. */
		function sweep(el) {
			if (el.getBoundingClientRect().bottom < 0) {
				observer.unobserve(el);
				settle(el);
			} else observer.observe(el);
		}

		blocks.forEach(sweep);

		/* A page reopened part way down is restored to its old position after this
		   runs, which can strand a block above the fold holding an entrance the
		   visitor will only see if they scroll back up. Sweeping again once
		   loading is finished puts those where the visitor expects them. */
		if (document.readyState === 'complete') return;
		window.addEventListener('load', function () {
			blocks.forEach(function (el) {
				if (+el.style.opacity < 1) sweep(el);
			});
		});
	}

	/* The homepage opens behind a curtain: releasing the first screen underneath
	   it would spend the entrance on an audience that cannot see it. Every other
	   page has none, and starts straight away. */
	var root = document.documentElement;
	if (!root.classList.contains('tsc-preloading') || !('MutationObserver' in window)) {
		release();
		return;
	}

	var watch = new MutationObserver(function () {
		if (root.classList.contains('tsc-preloading')) return;
		watch.disconnect();
		release();
	});
	watch.observe(root, { attributes: true, attributeFilter: ['class'] });
})();

/* ---- conditions carousel ---- */
/* A page can hold more than one of these — the hub pages have the conditions
   shelf, a condition page has its symptoms shelf — so each is wired to the
   arrows inside its own section rather than to the first pair on the page. */
(function () {
	var carousels = document.querySelectorAll('[data-conditions-carousel]');

	Array.prototype.forEach.call(carousels, function (carousel) {
		var track = carousel.querySelector('[data-conditions-track]');
		if (!track) return;

		/* A section can hold more than one shelf — the onward section carries
		   services and related conditions — so a shelf takes the arrows from
		   its own group where one is marked, and from the section otherwise. */
		var scope = carousel.closest('[data-conditions-scope]') || carousel.closest('section') || document;
		var previous = scope.querySelector('[data-conditions-prev]');
		var next = scope.querySelector('[data-conditions-next]');
		var progress = scope.querySelector('[data-conditions-progress]');
		if (!previous || !next) return;

		var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function distance() {
			var card = track.firstElementChild;
			if (!card) return track.clientWidth * 0.8;

			/* One card per click, gutter included — a shelf spaced with a flex gap
			   would otherwise fall short of the next snap point by the gap. */
			var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
			var margin = parseFloat(window.getComputedStyle(card).marginRight) || 0;
			return card.getBoundingClientRect().width + gap + margin;
		}

		var controls = previous.parentElement === next.parentElement ? previous.parentElement : null;

		function update() {
			if (track.scrollTop) {
				track.scrollTop = 0;
			}

			var limit = track.scrollWidth - track.clientWidth;

			/* A shelf whose cards all fit needs no arrows at all: two greyed
			   buttons say the row is exhausted, which reads as a fault rather
			   than as a set that happens to be complete. */
			if (controls) controls.style.display = limit <= 2 ? 'none' : '';

			previous.disabled = track.scrollLeft <= 2;
			next.disabled = track.scrollLeft >= limit - 2;

			/* The rail is the same "how much is left" cue the homepage sliders
			   carry: a thumb as wide as the visible share of the shelf, moving
			   one thumb-length per screenful. */
			if (progress) {
				var share = Math.min(1, track.clientWidth / track.scrollWidth);
				progress.style.width = share * 100 + '%';
				progress.style.transform =
					'translateX(' + (track.scrollLeft / track.clientWidth) * 100 + '%)';
			}
		}

		function move(direction) {
			track.scrollBy({
				left: direction * distance(),
				behavior: reduced ? 'auto' : 'smooth'
			});
		}

		previous.addEventListener('click', function () { move(-1); });
		next.addEventListener('click', function () { move(1); });
		track.addEventListener('scroll', update, { passive: true });

		/* A track with overflow-x: auto is a scrollport. The browser then
		   swallows a vertical wheel even when overflow-y is hidden, which is
		   why the symptoms band felt stuck. A mostly-vertical gesture is
		   handed to the page; a sideways one stays on the shelf. */
		track.addEventListener('wheel', function (event) {
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
				return;
			}

			event.preventDefault();
			window.scrollBy(0, event.deltaY);
		}, { passive: false });
		window.addEventListener('resize', update);
		update();
	});
})();

/* ---- testimonial carousel ---- */
(function () {
	var root = document.querySelector('[data-testimonials]');
	if (!root) return;

	var testimonials = Array.prototype.slice.call(root.querySelectorAll('[data-testimonial]'));
	var previous = root.querySelector('[data-testimonial-prev]');
	var next = root.querySelector('[data-testimonial-next]');
	var current = root.querySelector('[data-testimonial-current]');
	var progress = root.querySelector('[data-testimonial-progress]');
	var index = 0;

	if (!testimonials.length || !previous || !next) return;

	function show(nextIndex) {
		index = (nextIndex + testimonials.length) % testimonials.length;

		testimonials.forEach(function (testimonial, testimonialIndex) {
			var active = testimonialIndex === index;
			testimonial.hidden = !active;
			if (!active) {
				testimonial.classList.remove('is-expanded');
				var toggle = testimonial.querySelector('[data-review-toggle]');
				if (toggle) toggle.textContent = toggle.getAttribute('data-more');
			}
		});

		if (current) current.textContent = String(index + 1).padStart(2, '0');
		if (progress) progress.style.width = ((index + 1) / testimonials.length * 100) + '%';
	}

	previous.addEventListener('click', function () { show(index - 1); });
	next.addEventListener('click', function () { show(index + 1); });

	root.addEventListener('click', function (event) {
		var toggle = event.target.closest('[data-review-toggle]');
		if (!toggle) return;

		var testimonial = toggle.closest('[data-testimonial]');
		var expanded = testimonial.classList.toggle('is-expanded');
		toggle.textContent = toggle.getAttribute(expanded ? 'data-less' : 'data-more');
	});

	root.addEventListener('keydown', function (event) {
		if (event.key === 'ArrowLeft') show(index - 1);
		if (event.key === 'ArrowRight') show(index + 1);
	});

	show(0);
})();

/* ---- book page: write to us ---- */
(function () {
	var panel = document.querySelector('[data-book-panel]');
	var toggle = document.querySelector('[data-book-write]');
	if (!panel || !toggle) return;

	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function open(scroll) {
		panel.classList.add('is-open');
		toggle.setAttribute('aria-expanded', 'true');
		if (scroll) {
			setTimeout(function () {
				panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
			}, reduce ? 0 : 120);
		}
	}

	function close() {
		panel.classList.remove('is-open');
		toggle.setAttribute('aria-expanded', 'false');
		if (window.location.hash === '#enquiry') {
			history.replaceState(null, '', window.location.pathname + window.location.search);
		}
		toggle.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
		toggle.focus({ preventScroll: true });
	}

	toggle.addEventListener('click', function () { open(true); });

	var closer = panel.querySelector('[data-book-close]');
	if (closer) closer.addEventListener('click', close);
	panel.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') close();
	});

	// Links from other pages point at /book/#enquiry, and a failed submission
	// comes back with ?enquiry=…; both expect the form to be showing.
	if (window.location.hash === '#enquiry' || /[?&]enquiry=/.test(window.location.search)) {
		open(true);
	}
	window.addEventListener('hashchange', function () {
		if (window.location.hash === '#enquiry') open(true);
	});
})();
