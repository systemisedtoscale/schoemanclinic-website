/*
 * Copy-link button in the article rail.
 *
 * Everything else in the rail is a plain link and needs no script. The async
 * clipboard needs a secure context and can still be refused, so a failed write
 * falls back to a selection copy, and the confirmation only appears once the
 * link is genuinely on the clipboard.
 */
(function () {
	'use strict';

	var button = document.querySelector('[data-copy-link]');

	if (!button) {
		return;
	}

	var toast = document.querySelector('[data-copy-toast]');
	var timer;

	function legacyCopy(text) {
		var field = document.createElement('textarea');

		field.value = text;
		field.setAttribute('readonly', '');
		field.style.position = 'fixed';
		field.style.top = '0';
		field.style.opacity = '0';

		document.body.appendChild(field);
		field.select();

		var copied = false;

		try {
			copied = document.execCommand('copy');
		} catch (error) {
			copied = false;
		}

		document.body.removeChild(field);

		return copied;
	}

	function confirmCopy() {
		if (!toast) {
			return;
		}

		toast.textContent = button.getAttribute('data-copied') || 'Copied';
		toast.classList.add('is-visible');

		window.clearTimeout(timer);
		timer = window.setTimeout(function () {
			toast.classList.remove('is-visible');
		}, 2400);
	}

	button.addEventListener('click', function () {
		var url = window.location.href;

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(url).then(confirmCopy, function () {
				if (legacyCopy(url)) {
					confirmCopy();
				}
			});
			return;
		}

		if (legacyCopy(url)) {
			confirmCopy();
		}
	});
})();
