# IF2 · Codes und BCD-Rechnen

Interaktive Begleitung zur 90-Minuten-Stunde in FTFWT2F, Woche 4.

Online: https://pirminheld.github.io/IF2_Codes_BCD/

Offline: `index.html` per Doppelklick öffnen. Keine Installation, externen Bibliotheken, Fonts oder Netzverbindung nötig. Die Beameransicht vergrößert die Darstellung. Fünf Bereiche sind über direkte Anker erreichbar: `#parity`, `#hamming`, `#gray`, `#addition`, `#subtraction`.

## Bereiche

- Parität: Senderdaten verändern, Prüfbit berechnen, empfangene Bits umkehren und unerkannt bleibende Doppelfehler beobachten.
- Hamming-(7,4): Prüfgruppen markieren, Syndrom bilden und einen Einzelbitfehler korrigieren. Positionen 1 bis 7 werden wie auf dem Arbeitsblatt von links nach rechts nummeriert. Mehrbitfehler zeigen die Grenze der Korrektur.
- Reflektierter Vierbit-Gray-Code: zeitversetzte Dual-Bitwechsel mit dem einschrittigen Gray-Übergang vergleichen; Codefolge und Umwandlung aufdecken.
- BCD-Addition: Zahlen 0 bis 99; Rohsumme, Korrekturaddition und Dezimalübertrag von rechts nach links aufdecken. Auch Rohsummen ab 16 lösen die Korrektur aus.
- BCD-Subtraktion: Zweistellen-Komplementverfahren, positive und negative Ergebnisse sowie Sonderfall Subtrahend 00. Das Minuszeichen wird separat dargestellt, der Betrag in BCD.

## Quellen und Dateien

Themen und ausgewählte Beispiele nach dem Kollegenskript `Skript Schaltkreisfamilien reduziert(1)`, PDF-Seiten 4–23. Texte und Visualisierungen für diese Seite neu erstellt; keine eingescannten Buchseiten veröffentlicht.

`FTS_logo.png` und `impressum.html` unverändert aus dem vorhandenen Projekt `IF2_Zaehler` übernommen. `QR_Code.png` zeigt auf die oben genannte Online-Adresse.

Die Fachlogik steht in `model.js`, Bedienung in `app.js`, Gestaltung in `style.css`. Klassische Skripte gewährleisten den Betrieb mit `file://`. Tests: `node test.cjs` für Fachlogik und `python test_browser.py` für Chrome-Bedienung, Offlinebetrieb und responsive Layouts. Prüfbilder liegen im ignorierten Ordner `tmp/`.

GitHub Pages veröffentlicht den Hauptzweig `main` aus dem Repository-Stammverzeichnis.
