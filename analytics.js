const GA_MEASUREMENT_ID = "G-ZHK57BS5EC";

if (GA_MEASUREMENT_ID !== "G-XXXXXXXXXX") {
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);

  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    GA_MEASUREMENT_ID
  )}`;
  document.head.appendChild(gaScript);
} else {
  console.warn(
    "Google Analytics is not active yet. Replace G-XXXXXXXXXX in analytics.js with your GA4 measurement ID."
  );
}
