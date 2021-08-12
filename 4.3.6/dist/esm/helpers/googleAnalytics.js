const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;
function isExpired(date) {
    const now = new Date().getTime();
    return now - date > MS_7_DAYS;
}
function imagePing(url, trackingInfo) {
    const queryString = Object.keys(trackingInfo)
        .map((id, index) => `${index ? '&' : ''}${id}=${trackingInfo[id]}`)
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
    const applicationKeyForStorage = `TOAST UI chart for ${hostname}: Statistics`;
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
                dh: 'chart',
                el: 'chart',
                ec: 'use',
            });
        }
    }, 1000);
}
