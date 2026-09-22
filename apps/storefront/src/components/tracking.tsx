import Script from "next/script";
import type { TrackingConfig } from "@/lib/commerce";
import { TrackingBridge } from "./tracking-bridge";

const safeId = (v?: string) => (v && /^[A-Za-z0-9_-]{2,40}$/.test(v) ? v : undefined);

/** Injects Meta Pixel / GA4 / GTM / TikTok pixel and bridges kit `pai:track` events to them. */
export function Tracking({ config }: { config: TrackingConfig }) {
  const fb = safeId(config.facebookPixelId);
  const ga = safeId(config.ga4Id);
  const gtm = safeId(config.gtmId);
  const tt = safeId(config.tiktokPixelId);
  if (!fb && !ga && !gtm && !tt) return null;
  return (
    <>
      {gtm ? (
        <Script id="pai-gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
      ) : null}
      {ga ? (
        <>
          <Script id="pai-ga4-src" src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="pai-ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      ) : null}
      {fb ? (
        <Script id="pai-fb" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb}');fbq('track','PageView');`}</Script>
      ) : null}
      {tt ? (
        <Script id="pai-tt" strategy="afterInteractive">{`!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tt}');ttq.page();}(window, document, 'ttq');`}</Script>
      ) : null}
      <TrackingBridge fb={!!fb} ga={!!ga || !!gtm} tt={!!tt} />
    </>
  );
}
