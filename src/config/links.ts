/**
 * Links that may change: the patient portal and the booking systems. Change them here only.
 * The portal moves to the clinic's own domain (for example portal.theschoemanclinic.com) later.
 */
export const PORTAL_LOGIN_URL = "https://schoemanclinic.systemizedtoscale.com/login";

/**
 * Where existing patients request a repeat prescription: the clinic's Typeform for now. Point it at the
 * portal (PORTAL_LOGIN_URL) once the portal takes repeat prescription requests.
 */
export const REPEAT_PRESCRIPTION_URL = "https://form.typeform.com/to/Q98AOXB0";
