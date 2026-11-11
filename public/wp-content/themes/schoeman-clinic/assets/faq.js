/* Accordions: the FAQs page (#tsc-faq) plus any [data-accordion] block.
   One answer is open at a time, and each block opens on its first question. */
(function () {
	function setState(btn, open) {
		var panel = btn.nextElementSibling;
		var vline = btn.querySelector('span[style*="scaleY"]');
		btn.setAttribute("aria-expanded", open ? "true" : "false");
		if (panel) panel.style.gridTemplateRows = open ? "1fr" : "0fr";
		if (vline) vline.style.transform = open ? "scaleY(0)" : "scaleY(1)";
	}

	function bind(root) {
		var btns = root.querySelectorAll("button[aria-expanded]");
		if (!btns.length) return;

		Array.prototype.forEach.call(btns, function (btn) {
			btn.addEventListener("click", function () {
				var open = btn.getAttribute("aria-expanded") !== "true";
				Array.prototype.forEach.call(btns, function (other) {
					setState(other, other === btn && open);
				});
			});
		});

		var expanded = root.querySelector('button[aria-expanded="true"]');
		Array.prototype.forEach.call(btns, function (btn, index) {
			setState(btn, expanded ? btn === expanded : index === 0);
		});
	}

	var roots = document.querySelectorAll("#tsc-faq,[data-accordion]");
	Array.prototype.forEach.call(roots, bind);
})();

/* The chapter bar stays pinned for the length of the page, so the chapter
   currently under it is marked. Without this the bar reads as two stray links
   rather than a position in the document. */
(function () {
	var bar = document.querySelector(".tsc-chapters");
	if (!bar) return;

	var track = bar.querySelector(".tsc-chapters__grid");
	var links = Array.prototype.slice.call(bar.querySelectorAll(".tsc-chapters__link"));
	var sections = links.map(function (link) {
		return document.querySelector(link.getAttribute("href"));
	});

	if (!track || !links.length || sections.indexOf(null) !== -1) return;

	/* An anchor jump parks a heading a little below the bar rather than flush
	   against it — see scroll-margin-top on .tsc-faq-section — so the line that
	   decides which chapter is current has to sit below the bar by more than that
	   air. Level with the bar, tapping a chapter would mark the one above it. */
	var LINE_DROP = 32;

	/* How much of the row dissolves at an edge with more chapters beyond it. */
	var FADE = "2.5rem";
	/* Enough of the neighbouring chapter left showing to say it is there. */
	var PEEK = 24;

	function overflow() {
		return track.scrollWidth - track.clientWidth;
	}

	/* The bar is pinned for the length of the page and on a phone it can hold
	   more chapters than fit, so an edge is softened only where there is one to
	   reach. A row with room to spare is left alone. */
	function fades() {
		var over = overflow();
		var left = track.scrollLeft;
		track.style.setProperty("--tsc-chapters-fade-l", left > 2 ? FADE : "0px");
		track.style.setProperty("--tsc-chapters-fade-r", over > 2 && left < over - 2 ? FADE : "0px");
	}

	/* Bring the chapter being read into the strip, so the mark is somewhere the
	   reader can see rather than off the end of a bar they have no reason to
	   think scrolls. */
	function follow(link) {
		if (overflow() <= 2) return;

		var strip = track.getBoundingClientRect();
		var cell = link.getBoundingClientRect();
		var to = null;

		if (cell.left < strip.left + PEEK) to = track.scrollLeft + (cell.left - strip.left) - PEEK;
		else if (cell.right > strip.right - PEEK) to = track.scrollLeft + (cell.right - strip.right) + PEEK;
		if (to === null) return;

		track.scrollTo({
			left: Math.max(0, to),
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
		});
	}

	var marked = -2;

	function mark() {
		/* A chapter is current while it sits under the bar. Past the last one
		   nothing is marked, by which point the bar has scrolled away anyway. */
		var line = bar.getBoundingClientRect().bottom + LINE_DROP;
		var current = -1;

		sections.forEach(function (section, index) {
			var box = section.getBoundingClientRect();
			if (box.top <= line && box.bottom > line) current = index;
		});

		/* Only touched when it changes, so scrolling never writes to the DOM
		   on every event. */
		if (current === marked) return;
		marked = current;

		links.forEach(function (link, index) {
			if (index === current) link.setAttribute("aria-current", "location");
			else link.removeAttribute("aria-current");
		});

		if (current > -1) follow(links[current]);
	}

	window.addEventListener("scroll", mark, { passive: true });
	window.addEventListener("resize", function () {
		mark();
		fades();
	});
	track.addEventListener("scroll", fades, { passive: true });
	mark();
	fades();
})();
