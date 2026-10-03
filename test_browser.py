from pathlib import Path
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'tmp'
OUT.mkdir(exist_ok=True)

def run():
    errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(channel='chrome',headless=True)
        context=browser.new_context(viewport={'width':1440,'height':1100})
        page=context.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto((ROOT/'index.html').as_uri())
        assert page.locator('#parity').is_visible()
        page.locator('#parity-single').click()
        assert 'Paritätsfehler erkannt.' in page.locator('#parity-status').inner_text()
        page.locator('#parity-double').click()
        assert 'kein Paritätsfehler erkannt' in page.locator('#parity-status').inner_text()
        assert 'unentdeckt' in page.locator('#parity-errors').inner_text()
        page.locator('[data-quiz=parity][data-correct=true]').click()
        assert page.locator('#quiz-parity').inner_text().startswith('Richtig.')

        page.locator('nav a[data-panel=hamming]').click()
        page.locator('#hamming-example').click()
        for _ in range(9):page.locator('#hamming-next').click()
        assert '1100110' in page.locator('#hamming-walk-calculation').inner_text()
        page.locator('#hamming-experiment summary').click()
        assert '1 0 1' in page.locator('#hamming-syndrome').inner_text()
        page.locator('#hamming-groups button').first.click()
        assert page.locator('#hamming-bits .selected').count()==4
        page.locator('#hamming-correct').click()
        assert '1100110' in page.locator('#hamming-correction').inner_text()
        page.locator('#hamming-reset').click()
        page.locator('#hamming-bits button').nth(0).click()
        page.locator('#hamming-bits button').nth(1).click()
        page.locator('#hamming-correct').click()
        assert 'keine sichere Korrektur' in page.locator('#hamming-correction').inner_text()
        page.locator('#hamming-data').fill('01x1')
        page.locator('#hamming-encode').click()
        assert 'genau vier Bits' in page.locator('#hamming-input-info').inner_text()
        page.locator('#hamming-data').fill('0110');page.locator('#hamming-encode').click()

        page.locator('nav a[data-panel=gray]').click()
        page.locator('#gray-step').click()
        assert '15' in page.locator('#gray-binary-value').inner_text()
        assert '8.' in page.locator('#gray-code-value').inner_text()
        for _ in range(3):page.locator('#gray-step').click()
        assert page.locator('#gray-step').is_disabled()
        page.locator('#gray-position').fill('15');page.locator('#gray-position').dispatch_event('input')
        page.locator('#gray-step').click()
        assert '0.' in page.locator('#gray-code-value').inner_text()

        page.locator('nav a[data-panel=addition]').click()
        assert not page.locator('#add-result').inner_text()
        page.locator('#add-next').click()
        assert page.locator('#add-steps .step').count()==1
        page.locator('#add-next').click()
        assert '147' in page.locator('#add-result').inner_text()
        page.locator('#add-example').click();page.locator('#add-all').click()
        assert 'Übertrag aus dem Vierbit-Addierer' in page.locator('#add-steps').inner_text()
        assert '17' in page.locator('#add-result').inner_text()
        page.locator('#add-a').fill('100')
        assert '0 bis 99' in page.locator('#add-inputs').inner_text()
        page.locator('#add-a').fill('78');page.locator('#add-b').fill('69')

        page.locator('nav a[data-panel=subtraction]').click()
        page.locator('#sub-all').click()
        assert '44' in page.locator('#sub-result').inner_text()
        page.locator('#sub-example').click();page.locator('#sub-all').click()
        assert '-2' in page.locator('#sub-result').inner_text()
        page.locator('#sub-b').fill('0');page.locator('#sub-all').click()
        assert '9 − 0 = 9' in page.locator('#sub-result').inner_text()
        page.locator('#sub-a').fill('28');page.locator('#sub-b').fill('28');page.locator('#sub-all').click()
        assert '28 − 28 = 0' in page.locator('#sub-result').inner_text()
        page.locator('#sub-a').fill('72');page.locator('#sub-b').fill('28')

        layouts=[]
        for width in [390,900,1440]:
            page.set_viewport_size({'width':width,'height':1100})
            for panel in ['parity','hamming','gray','addition','subtraction']:
                page.locator(f'nav a[data-panel={panel}]').click()
                if panel=='addition':page.locator('#add-all').click()
                if panel=='subtraction':page.locator('#sub-all').click()
                if panel=='gray':page.locator('#gray-reset').click()
                page.evaluate('scrollTo(0,0)')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),(width,panel,'horizontal overflow')
                page.screenshot(path=str(OUT/f'{panel}-{width}.png'),full_page=True)
                layouts.append([width,panel,'ok'])
        page.locator('#presentation').click()
        assert page.locator('body').evaluate("el=>el.classList.contains('presentation')")
        for panel in ['parity','hamming','gray','addition','subtraction']:
            page.locator(f'nav a[data-panel={panel}]').click()
            page.evaluate('scrollTo(0,0)')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),('presentation',panel)
            page.screenshot(path=str(OUT/f'{panel}-beamer.png'),full_page=True)
        page.locator('footer a[href="impressum.html"]').click()
        assert 'Pirmin Held' in page.locator('body').inner_text()
        page.locator('a[href="index.html"]').click()
        assert page.locator('#parity').is_visible()
        context.set_offline(True)
        page.reload()
        page.locator('#parity-double').click()
        assert 'kein Paritätsfehler erkannt' in page.locator('#parity-status').inner_text()
        assert not errors,errors
        (OUT/'browser-report.json').write_text(json.dumps({'errors':errors,'layouts':layouts,'offline':True,'interactions':'passed'},indent=2),encoding='utf-8')
        browser.close()
    print('Browser checks passed: all five modules, edge cases, 3 widths, beamer, legal page, file:// and offline.')

if __name__=='__main__':run()
