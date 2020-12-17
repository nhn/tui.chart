type GA_URL = 'https://www.google-analytics.com/collect';
interface TrackingInfo {
  v: number;
  t: 'event';
  tid: 'UA-129983528-2';
  cid: string;
  dp: string;
  dh: 'grid';
  el: 'grid';
  ec: 'use';
}
const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;

function isExpired(date: number) {
  const now = new Date().getTime();

  return now - date > MS_7_DAYS;
}

function imagePing(url: GA_URL, trackingInfo: TrackingInfo) {
  const queryString = Object.keys(trackingInfo)
    .map((id, index) => {
      const idWithType = id as keyof TrackingInfo;

      return `${index ? '&' : ''}${idWithType}=${trackingInfo[idWithType]}`;
    })
    .join('');

  const trackingElement = document.createElement('img');

  trackingElement.src = `${url}?${queryString}`;
  trackingElement.style.display = 'none';
  document.body.appendChild(trackingElement);
  document.body.removeChild(trackingElement);

  return trackingElement;
}

export function sendHostname() {
  const hostname = location.hostname;
  const applicationKeyForStorage = `TOAST UI grid for ${hostname}: Statistics`;
  const date = window.localStorage.getItem(applicationKeyForStorage);

  if (date && !isExpired(Number(date))) {
    return;
  }

  window.localStorage.setItem(applicationKeyForStorage, String(new Date().getTime()));

  setTimeout(() => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      imagePing('https://www.google-analytics.com/collect', {
        v: 1,
        t: 'event',
        tid: 'UA-129983528-2',
        cid: hostname,
        dp: hostname,
        dh: 'grid',
        el: 'grid',
        ec: 'use',
      });
    }
  }, 1000);
}
