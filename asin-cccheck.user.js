// ==UserScript==
// @name         ASIN CCCHECK
// @namespace    https://github.com/Gev1996/asin-cccheck
// @version      0.9
// @description  Amazon ASIN CCChecker (Camel Camel Camel)
// @match        *://*/*
// @updateURL    https://github.com/Gev1996/asin-cccheck/raw/refs/heads/main/asin-cccheck.user.js
// @downloadURL  https://github.com/Gev1996/asin-cccheck/raw/refs/heads/main/asin-cccheck.user.js
// @grant        none
// ==/UserScript==

(function () {
    console.log('Skript gestartet.');

    // Prüfen, ob die Seite eine Amazon-Seite ist
    if (!window.location.hostname.includes('amazon.')) {
        console.log('Keine Amazon-Seite. Skript wird nicht ausgeführt.');
        return;
    }

    console.log('Amazon-Seite erkannt. Skript wird ausgeführt.');

    // Funktion: Prüfen, ob es sich um eine Suchseite handelt
    function isSearchPage() {
        return window.location.href.includes('/s?k=');
    }

    // Funktion: ASIN extrahieren
    function extractASIN() {
        const urlMatch = window.location.href.match(/\/dp\/([A-Z0-9]{10})/);
        if (urlMatch) {
            console.log('ASIN gefunden: ' + urlMatch[1]);
            return urlMatch[1];
        }
        console.log('ASIN nicht gefunden.');
        return null;
    }

    // Funktion: Preis von CamelCamelCamel extrahieren
    function extractPriceFromCamel() {
        const priceElement = document.querySelector('.bgp'); // Selektor für den Preis
        if (priceElement) {
            const priceText = priceElement.textContent.trim();
            console.log('Preis gefunden: ' + priceText);
            return priceText;
        }
        console.log('Preis nicht gefunden.');
        return null;
    }

    // Funktion: Chart und Preis einfügen
    function addCamelChartAndPrice(asin) {
        const targetDiv = document.querySelector('div.a-section.a-spacing-small.aok-align-center');

        if (targetDiv) {
            console.log('Ziel-Div gefunden.');

            // Chart-URL erstellen
            const chartUrl = `https://charts.camelcamelcamel.com/de/${asin}/amazon.png?force=1&zero=0&w=800&h=400&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=de`;

            // Wrapper-Div für den Chart erstellen
            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.marginTop = '20px';

            // Chart-Bild hinzufügen
            const chartImg = document.createElement('img');
            chartImg.src = chartUrl;
            chartImg.alt = 'CamelCamelCamel Preisdiagramm';
            chartImg.style.width = '100%';
            chartImg.style.maxWidth = '800px';
            chartImg.style.border = '1px solid #ddd';
            chartImg.style.borderRadius = '5px';
            chartImg.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            wrapperDiv.appendChild(chartImg);

            // Preis über dem Chart anzeigen (falls verfügbar)
            const price = extractPriceFromCamel();
            if (price) {
                const priceDiv = document.createElement('div');
                priceDiv.textContent = `Preis: ${price}`;
                priceDiv.style.color = 'green';
                priceDiv.style.fontSize = '20px';
                priceDiv.style.fontWeight = 'bold';
                priceDiv.style.textAlign = 'center';
                priceDiv.style.marginBottom = '10px';
                wrapperDiv.insertBefore(priceDiv, chartImg);
                console.log('Preis wurde über dem Chart hinzugefügt.');
            } else {
                console.log('Preis konnte nicht extrahiert werden.');
            }

            // Wrapper-Div dem Ziel-Div hinzufügen
            targetDiv.appendChild(wrapperDiv);
            console.log('Chart wurde hinzugefügt.');
        } else {
            console.log('Ziel-Div für den Chart nicht gefunden.');
        }
    }

    // Prüfen, ob es sich um eine Suchseite handelt
    if (isSearchPage()) {
        console.log('Suchseite erkannt. Skript wird nicht ausgeführt.');
        return;
    }

    // ASIN abrufen
    const asin = extractASIN();
    if (!asin) {
        console.log('ASIN NICHT ERKANNT. Skript beendet.');
        return;
    }

    // Chart und Preis einfügen
    addCamelChartAndPrice(asin);
})();
