import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raja Mantri Chor Sipahi — Play online",
  description: "A private, four-player online version of the classic Indian guessing game.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" }
    ],
    apple: "/icon.png"
  }

};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="dark">
        {children}
        <Script id="prism-analytics" strategy="afterInteractive">
          {`
            (function(){
              var id='pa_5eef70cd98b2492184e7', url='https://prismanalytics.sudhirdevops1.workers.dev/api/track';
              var sid=sessionStorage.getItem('pa_sid')||crypto.randomUUID();
              sessionStorage.setItem('pa_sid',sid);
              function t(e,d){
                var q=new URLSearchParams(location.search);
                navigator.sendBeacon(url,JSON.stringify({
                  site_id:id,
                  pathname:location.pathname,
                  referrer:document.referrer,
                  screen_size:screen.width+'x'+screen.height,
                  session_id:sid,
                  event_name:e||'pageview',
                  event_data:d,
                  utm_source:q.get('utm_source'),
                  utm_medium:q.get('utm_medium'),
                  utm_campaign:q.get('utm_campaign')
                }));
              }
              window.prism=t;
              t();
              var p=location.pathname;
              setInterval(function(){
                if(p!=location.pathname){
                  p=location.pathname;
                  t();
                }
              },500);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}


