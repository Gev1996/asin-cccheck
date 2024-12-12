// ==UserScript==
// @name         ASIN CCCHECK Debug
// @namespace    https://my-userscripts.com/
// @version      0.7
// @description  Amazon ASIN CCChecker (Camel Camel Camel)
// @match        *.amazon.*/*
// @updateURL    https://github.com/Gev1996/asin-cccheck/raw/refs/heads/main/asin-cccheck.user.js
// @downloadURL  https://github.com/Gev1996/asin-cccheck/raw/refs/heads/main/asin-cccheck.user.js
// @grant        none
// ==/UserScript==

(function () {
    console.log('Skript gestartet.');

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

    // Funktion: Preis über dem Chart anzeigen
    function addPriceAboveChart(price) {
        const chartElement = document.getElementById('summary_chart');
        if (chartElement) {
            // Preis-Div erstellen
            const priceDiv = document.createElement('div');
            priceDiv.textContent = `Preis: ${price}`;
            priceDiv.style.color = 'green';
            priceDiv.style.fontSize = '20px';
            priceDiv.style.fontWeight = 'bold';
            priceDiv.style.textAlign = 'center';
            priceDiv.style.marginBottom = '10px';

            // Preis-Div vor dem Chart einfügen
            chartElement.parentElement.insertBefore(priceDiv, chartElement);
            console.log('Preis wurde über dem Chart hinzugefügt.');
        } else {
            console.log('Chart-Element nicht gefunden.');
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

    // Buttons definieren und Container erstellen
    const buttons = [
        {
            url: `https://de.camelcamelcamel.com/product/${asin}`,
            text: 'CCC',
            backgroundColor: '#4A9E9C',
            color: 'white'
        },
        {
            text: 'ASIN Kopieren',
            backgroundColor: '#000000',
            color: 'white',
            id: 'asin-copy-button'
        }
    ];

    const container = document.createElement('div');
    container.style = `
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        background: #ccc;
        padding: 15px 0;
        border-top: 2px solid #999;
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    container.innerHTML = buttons
        .map((button) => {
            if (button.url) {
                return `<a target="_blank" href="${button.url}" style="
                    background-color: ${button.backgroundColor};
                    color: ${button.color};
                    font-weight: bold;
                    text-align: center;
                    padding: 10px 20px;
                    margin: 0 10px;
                    border-radius: 5px;
                    display: inline-block;">
                    ${button.text}
                    </a>`;
            } else {
                return `<button id="${button.id}" style="
                    background-color: ${button.backgroundColor};
                    color: ${button.color};
                    font-weight: bold;
                    text-align: center;
                    padding: 10px 20px;
                    margin: 0 10px;
                    border-radius: 5px;
                    cursor: pointer;">
                    ${button.text}
                    </button>`;
            }
        })
        .join('');
    document.body.appendChild(container);
    console.log('Container mit Buttons wurde hinzugefügt.');

    // ASIN-Kopieren-Button konfigurieren
    const asinCopyButton = document.getElementById('asin-copy-button');
    if (asinCopyButton) {
        asinCopyButton.addEventListener('click', function () {
            navigator.clipboard
                .writeText(asin)
                .then(() => {
                    console.log('ASIN wurde kopiert!');
                })
                .catch((err) => {
                    console.log('Fehler beim Kopieren der ASIN: ' + err);
                });
        });
        console.log('ASIN-Kopieren-Button wurde konfiguriert.');
    } else {
        console.log('ASIN-Kopieren-Button wurde NICHT gefunden!');
    }

    // Preistabelle hinzufügen
    const targetDiv = document.querySelector('div.a-section.a-spacing-small.aok-align-center');
    if (targetDiv) {
        console.log('Ziel-Div gefunden.');

        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.innerHTML = `
            .blurred-border {
                position: relative;
                display: inline-block;
                width: 100%;
                margin-top: 20px;
            }
            .blurred-border::before {
                content: '';
                position: absolute;
                top: -5px; left: -5px;
                right: -5px; bottom: -5px;
                border: 5px solid teal;
                filter: blur(5px);
                z-index: -1;
            }
            .blurred-border img {
                display: block;
                width: 100%;
                height: auto;
            }
        `;
        document.head.appendChild(styleElement);
        console.log('Stil hinzugefügt.');

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'blurred-border';

        const chartImg = document.createElement('img');
        chartImg.id = 'summary_chart';
        chartImg.alt = 'Amazon Preisdiagramm';
        const chartUrl = `https://charts.camelcamelcamel.com/de/${asin}/amazon.png?force=1&zero=0&w=800&h=400&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=de`;
        chartImg.src = chartUrl;

        wrapperDiv.appendChild(chartImg);
        targetDiv.appendChild(wrapperDiv);
        console.log('Preisdiagramm wurde hinzugefügt.');

        // Preis extrahieren und über dem Chart anzeigen
        const price = extractPriceFromCamel();
        if (price) {
            addPriceAboveChart(price);
        }
    } else {
        console.log('Ziel-Element zum Einfügen des Preisdiagramms wurde NICHT gefunden.');
    }
})();
