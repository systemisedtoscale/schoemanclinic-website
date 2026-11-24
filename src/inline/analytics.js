
	(function (window, document) {
		'use strict';

		var measurementId = "G-T3BD51P8Z2";
		var legacyMeasurementId = "G-1XD1QZMYBM";
		var tagManagerId = "GTM-5M9W4C66";
		var facebookPixelId = "1707214880354311";
		var enabled = true;
		var isLeadConfirmation = false;
		var loaded = false;
		var facebookLoaded = false;
		var trackingReady = false;
		var analyticsGranted = false;

		window.dataLayer = window.dataLayer || [];
		window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
		window.gtag('consent', 'default', {
			analytics_storage: 'denied',
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			wait_for_update: 2000
		});

		function sendEvent(name, parameters, destinations) {
			if (!trackingReady || !analyticsGranted) return;

			(destinations || [measurementId]).forEach(function (destination) {
				var payload = Object.assign({}, parameters || {}, { send_to: destination });
				window.gtag('event', name, payload);
			});
		}

		function recordLeadConfirmation() {
			if (!isLeadConfirmation || !analyticsGranted) return;

			// The published legacy container listens for this data-layer event.
			window.dataLayer.push({ event: 'form_submit' });
			sendEvent('contact_form_submission', { method: 'website_enquiry' }, [measurementId]);
			sendEvent('generate_lead', { method: 'website_enquiry' }, [measurementId]);
		}

		function handleTagManagerReady() {
			trackingReady = true;
			recordLeadConfirmation();
		}

		window.schoemanLoadAnalytics = function () {
			if (loaded || !enabled) return;
			loaded = true;

			window.gtag('js', new Date());
			window.gtag('config', measurementId);

			var script = document.createElement('script');
			script.async = true;
			script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(tagManagerId);
			script.addEventListener('load', handleTagManagerReady, { once: true });
			document.head.appendChild(script);
		};

		function schoemanLoadFacebookPixel() {
			if (facebookLoaded || !enabled || !facebookPixelId) return;
			facebookLoaded = true;

			if (!window.fbq) {
				window.fbq = function () {
					window.fbq.callMethod
						? window.fbq.callMethod.apply(window.fbq, arguments)
						: window.fbq.queue.push(arguments);
				};
				window.fbq.push = window.fbq;
				window.fbq.loaded = true;
				window.fbq.version = '2.0';
				window.fbq.queue = [];
				window._fbq = window.fbq;

				var script = document.createElement('script');
				script.async = true;
				script.src = 'https://connect.facebook.net/en_US/fbevents.js';
				document.head.appendChild(script);
			}

			window.fbq('init', facebookPixelId);
			window.fbq('track', 'PageView');
			if (isLeadConfirmation) {
				window.fbq('track', 'Lead');
			}
		}

		function clearGoogleCookies() {
			document.cookie.split(';').forEach(function (part) {
				var name = part.split('=')[0].trim();
				if (
					name !== '_ga' &&
					name.indexOf('_ga_') !== 0 &&
					name.indexOf('_gcl_') !== 0
				) return;
				document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
				document.cookie = name + '=; Max-Age=0; path=/; domain=.' + window.location.hostname + '; SameSite=Lax';
			});
		}

		function applyCookieYesConsent() {
			var consent = typeof window.getCkyConsent === 'function'
				? window.getCkyConsent()
				: null;
			var categories = consent && consent.categories ? consent.categories : {};
			analyticsGranted = Boolean(
				consent &&
				consent.isUserActionCompleted &&
				categories.analytics
			);
			var advertisingGranted = Boolean(
				consent &&
				consent.isUserActionCompleted &&
				(categories.advertisement || categories.marketing)
			);

			window.gtag('consent', 'update', {
				analytics_storage: analyticsGranted ? 'granted' : 'denied',
				ad_storage: advertisingGranted ? 'granted' : 'denied',
				ad_user_data: advertisingGranted ? 'granted' : 'denied',
				ad_personalization: advertisingGranted ? 'granted' : 'denied'
			});

			if (analyticsGranted) {
				window.schoemanLoadAnalytics();
			} else if (loaded) {
				clearGoogleCookies();
			}

			if (advertisingGranted) {
				schoemanLoadFacebookPixel();
			}
		}

		document.addEventListener('click', function (event) {
			var link = event.target.closest && event.target.closest('a[href]');
			if (!link || !analyticsGranted || !trackingReady) return;

			var href = link.getAttribute('href') || '';
			if (href.indexOf('mailto:') === 0) {
				// GTM sends the same event to the legacy stream.
				sendEvent('email_button_click', { link_url: link.href }, [measurementId]);
				return;
			}

			if (href.indexOf('tel:') === 0) {
				// GTM sends the same event to the legacy stream.
				sendEvent('click_to_call', { link_url: link.href }, [measurementId]);
				return;
			}

			var url;
			try {
				url = new URL(link.href, window.location.href);
			} catch (error) {
				return;
			}

			var isCurrentBookingLink =
				url.origin === window.location.origin &&
				(/^\/book\/?$/.test(url.pathname) || /^\/appointments\/?$/.test(url.pathname));
			var isLegacyBookingLink = url.href.indexOf('https://questionnaire.semble.io/') === 0;

			if (isCurrentBookingLink) {
				sendEvent(
					'book_now_button_click',
					{ link_url: url.href },
					[measurementId, legacyMeasurementId]
				);
			} else if (isLegacyBookingLink) {
				// The legacy GTM trigger covers its own stream.
				sendEvent('book_now_button_click', { link_url: url.href }, [measurementId]);
			}
		});

		document.addEventListener('cookieyes_consent_update', applyCookieYesConsent);
		window.addEventListener('load', applyCookieYesConsent, { once: true });
	})(window, document);
	