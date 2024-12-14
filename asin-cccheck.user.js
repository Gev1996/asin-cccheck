// ==UserScript==
// @name         ASIN CCCHECK
// @namespace    https://github.com/Gev1996/asin-cccheck
// @version      2.2
// @description  Amazon ASIN CCChecker (Camel Camel Camel Price Chart)
// @match        *://*/*
// @updateURL    https://github.com/Gev1996/asin-cccheck/raw/refs/heads/main/asin-cccheck.user.js
// @downloadURL  https://github.com/Gev1996/asin-cccheck/raw/refs/heads/main/asin-cccheck.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// ==/UserScript==

(function () {
    console.log('Skript gestartet.');

    // Version automatisch aus den Metadaten abrufen
    const metaString = GM_info.scriptMetaStr || '';
    const versionMatch = metaString.match(/@version\s+([0-9.]+)/i);
    const SCRIPT_VERSION = versionMatch ? versionMatch[1].trim() : 'Unbekannt';

    const SCRIPT_URL = 'https://github.com/Gev1996/asin-cccheck/raw/refs/heads/main/asin-cccheck.user.js';

    // Funktion: Automatische Updateprüfung
    function checkForUpdates() {
        console.log('Überprüfe auf Updates...');

        GM_xmlhttpRequest({
            method: 'GET',
            url: `${SCRIPT_URL}?_=${new Date().getTime()}`,
            onload: function (response) {
                if (response.status === 200) {
                    const remoteScript = response.responseText;
                    const remoteVersionMatch = remoteScript.match(/@version\s+([0-9.]+)/i);

                    if (remoteVersionMatch) {
                        const remoteVersion = remoteVersionMatch[1].trim();
                        console.log(`Gefundene Remote-Version: ${remoteVersion}`);

                        if (remoteVersion !== SCRIPT_VERSION) {
                            if (confirm(`Neue Version (${remoteVersion}) von ASIN CCCHECK verfügbar. Jetzt aktualisieren?`)) {
                                window.location.href = SCRIPT_URL;
                            }
                        } else {
                            console.log('Das Skript ist aktuell.');
                        }
                    } else {
                        alert('Konnte die Version in der Remote-Datei nicht finden.');
                    }
                } else {
                    alert(`Fehler beim Abrufen der Update-URL: ${response.status}`);
                }
            },
            onerror: function () {
                alert('Fehler beim Update-Check.');
            }
        });
    }

    checkForUpdates();

    // Skriptausführung nur auf Amazon-Seiten
    if (!window.location.hostname.includes('amazon.')) {
        console.log('Keine Amazon-Seite. Skript wird nicht ausgeführt.');
        return;
    }

    console.log('Amazon-Seite erkannt. Skript wird ausgeführt.');

    function extractASIN() {
        const urlMatch = window.location.href.match(/\/dp\/([A-Z0-9]{10})/);
        return urlMatch ? urlMatch[1] : null;
    }

    function fetchCamelPrice(asin, callback) {
        const camelUrl = `https://de.camelcamelcamel.com/product/${asin}`;
        console.log(`Preis wird von CamelCamelCamel geladen: ${camelUrl}`);

        GM_xmlhttpRequest({
            method: 'GET',
            url: camelUrl,
            onload: function (response) {
                if (response.status === 200) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(response.responseText, 'text/html');
                    const priceElement = doc.querySelector('.bgp'); 
                    if (priceElement) {
                        const priceText = priceElement.textContent.trim();
                        console.log(`Preis von CamelCamelCamel gefunden: ${priceText}`);
                        callback(priceText);
                    } else {
                        console.log('Preis von CamelCamelCamel nicht gefunden.');
                        callback(null);
                    }
                } else {
                    console.log(`Fehler beim Abrufen der CamelCamelCamel-Seite: ${response.status}`);
                    callback(null);
                }
            },
            onerror: function () {
                alert('Fehler beim Abrufen der CamelCamelCamel-Seite.');
                callback(null);
            }
        });
    }

    function addCamelChartAndPrice(asin) {
        const targetDiv = document.querySelector('div.a-section.a-spacing-small.aok-align-center');
        if (targetDiv) {
            const chartUrl = `https://charts.camelcamelcamel.com/de/${asin}/amazon.png?force=1&zero=0&w=800&h=400&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=de`;
            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.marginTop = '20px';

            const chartImg = document.createElement('img');
            chartImg.src = chartUrl;
            chartImg.alt = 'CamelCamelCamel Preisdiagramm';
            chartImg.style.width = '100%';
            chartImg.style.maxWidth = '800px';
            chartImg.style.border = '1px solid #ddd';
            chartImg.style.borderRadius = '5px';
            chartImg.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            wrapperDiv.appendChild(chartImg);

            fetchCamelPrice(asin, (price) => {
                if (price) {
                    const priceDiv = document.createElement('div');
                    priceDiv.textContent = `Preis von CamelCamelCamel: ${price}`;
                    priceDiv.style.color = 'green';
                    priceDiv.style.fontSize = '20px';
                    priceDiv.style.fontWeight = 'bold';
                    priceDiv.style.textAlign = 'center';
                    priceDiv.style.marginBottom = '10px';
                    wrapperDiv.insertBefore(priceDiv, chartImg);
                }
                targetDiv.appendChild(wrapperDiv);
            });
        } else {
            alert('Ziel-Div für den Chart nicht gefunden.');
        }
    }

    const asin = extractASIN();
    if (asin) {
        addCamelChartAndPrice(asin);
    } else {
        console.log('ASIN konnte nicht extrahiert werden.');
    }
})();
