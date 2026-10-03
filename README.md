# IF2 · Codes und BCD-Rechnen

Interaktive Begleitung zur 90-Minuten-Stunde in FTFWT2F, Woche 4.

Online: https://pirminheld.github.io/IF2_Codes_BCD/

Offline: `index.html` per Doppelklick öffnen. Keine Installation, externen Bibliotheken, Fonts oder Netzverbindung nötig. Die Beameransicht vergrößert die Darstellung. Fünf Bereiche sind über direkte Anker erreichbar: `#parity`, `#hamming`, `#gray`, `#addition`, `#subtraction`.

## Bereiche

- Parität: Senderdaten verändern, Prüfbit berechnen, empfangene Bits umkehren und unerkannt bleibende Doppelfehler beobachten.
- Hamming-(7,4): zehn einzeln aufdeckbare Schritte vom Einsetzen der Daten über die drei Prüfbits bis zu Empfangsprüfung, Syndrom und Korrektur. Die markierten Prüfgruppen, Einsenzählungen und Gewichte 4/2/1 trennen übertragene Prüfbits p von lokal berechneten Prüfergebnissen s. Ein aufklappbares Experiment erlaubt beliebige Bitfehler. Positionen 1 bis 7 werden wie auf dem Arbeitsblatt von links nach rechts nummeriert.
- Reflektierter Vierbit-Gray-Code: zwei Schaltreihenfolgen und eine schrittweise aufgebaute Vergleichstabelle zeigen falsche Dual-Zwischenwerte. Acht Rechenzeilen erklären Dual → Gray und Gray → Dual mit XOR. Die Darstellung unterscheidet Positionscodierung von Übertragungsfehlerkorrektur.
- BCD-Addition: Zahlen 0 bis 99; Rohsumme, Korrekturaddition und Dezimalübertrag von rechts nach links aufdecken. Auch Rohsummen ab 16 lösen die Korrektur aus.
- BCD-Subtraktion: Zweistellen-Komplementverfahren, positive und negative Ergebnisse sowie Sonderfall Subtrahend 00. Das Minuszeichen wird separat dargestellt, der Betrag in BCD.

## Dateien und Prüfung

`FTS_logo.png` und `impressum.html` unverändert aus dem vorhandenen Projekt `IF2_Zaehler` übernommen. `QR_Code.png` zeigt auf die oben genannte Online-Adresse.

Die Fachlogik steht in `model.js`, Bedienung in `app.js`, Gestaltung in `style.css`. Klassische Skripte gewährleisten den Betrieb mit `file://`. Tests: `node test.cjs` für Fachlogik und `python test_browser.py` für Chrome-Bedienung, Offlinebetrieb und responsive Layouts. Prüfbilder liegen im ignorierten Ordner `tmp/`.

GitHub Pages veröffentlicht den Hauptzweig `main` aus dem Repository-Stammverzeichnis.

DOM-Tests ohne Browser: jsdom als reine Testabhängigkeit installieren, z. B. mit `pnpm --dir tmp/domtest add jsdom`, dann `node test_ui.cjs` aufrufen. Ein anderer jsdom-Pfad kann als erstes Argument übergeben werden. Die Lernseite benötigt jsdom nicht. Diese Tests prüfen alle 112 Einzelbitfehler der 16 Datenwörter, den geführten Ablauf, beide Gray-Schaltreihenfolgen und alle 16 Umwandlungen. Sie ersetzen keine visuelle Browserprüfung.
