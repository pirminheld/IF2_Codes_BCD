/* DOM tests run without a browser. jsdom is a test dependency only. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require(process.argv[2]||'./tmp/domtest/node_modules/jsdom');
const M=require('./model.js');
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{runScripts:'outside-only',url:'file:///IF2_Codes_BCD/index.html'});
const w=dom.window,d=w.document;
w.eval(fs.readFileSync('model.js','utf8'));w.eval(fs.readFileSync('app.js','utf8'));
const el=id=>d.getElementById(id),text=id=>el(id).textContent,click=id=>el(id).click();
const bits=id=>[...el(id).querySelectorAll('.bit')].map(b=>b.textContent).join('');
const jump=i=>el('hamming-stages').children[i].click();
const input=(id,value)=>{el(id).value=value;el(id).dispatchEvent(new w.Event('input'));};
click('hamming-example');
assert.equal(bits('hamming-walk-bits'),'\u2013\u20130\u2013110');
for(let i=1;i<=3;i++){
  click('hamming-next');assert.equal(el('hamming-walk-bits').querySelectorAll('.selected').length,4);
  assert.ok(text('hamming-walk-calculation').includes('gerade'));
}
assert.equal(bits('hamming-walk-bits'),'1100110');
click('hamming-next');assert.equal(bits('hamming-walk-bits'),'1100010');
click('hamming-next');assert.equal(el('hamming-walk-syndrome').querySelectorAll('span')[2].textContent,'1');
assert.equal(el('hamming-walk-syndrome').querySelectorAll('span')[0].textContent,'?');
click('hamming-next');click('hamming-next');click('hamming-next');
assert.ok(text('hamming-walk-calculation').includes('101'));
assert.ok(text('hamming-walk-calculation').includes('= 5'));
assert.ok(text('hamming-walk-result').includes('Gruppe 2 enth\u00e4lt nicht Position 5'));
click('hamming-next');assert.equal(bits('hamming-walk-bits'),'1100110');
assert.ok(text('hamming-walk-calculation').includes('0110'));
assert.equal(el('hamming-next').disabled,true);
click('hamming-start');assert.equal(el('hamming-prev').disabled,true);
let cases=0;
for(let n=0;n<16;n++){
  input('hamming-data',M.bits(n));click('hamming-encode');
  jump(8);assert.ok(text('hamming-walk-calculation').includes('= 0'));
  for(let i=0;i<7;i++){
    click('hamming-reset');jump(4);
    el('hamming-walk-bits').querySelectorAll('button')[i].click();
    jump(8);assert.ok(text('hamming-walk-calculation').endsWith('= '+(i+1)));
    jump(9);assert.equal(bits('hamming-walk-bits'),M.encode(M.bits(n)));cases++;
  }
}
click('hamming-reset');jump(4);
el('hamming-walk-bits').querySelectorAll('button')[0].click();
el('hamming-walk-bits').querySelectorAll('button')[1].click();jump(9);
assert.ok(text('hamming-walk-result').includes('keine verl\u00e4ssliche Korrektur'));
input('hamming-data','01x1');click('hamming-encode');assert.ok(text('hamming-input-info').includes('genau vier Bits'));
input('gray-position','7');click('gray-step');assert.ok(text('gray-binary-value').includes('15.'));
assert.ok(text('gray-code-value').includes('8.'));
for(let i=0;i<3;i++)click('gray-step');assert.equal(el('gray-step').disabled,true);
el('gray-order').value='low';el('gray-order').dispatchEvent(new w.Event('change'));
click('gray-step');assert.ok(text('gray-binary-value').includes('6.'));
for(let n=0;n<16;n++){
  input('gray-position',String(n));assert.equal(el('gray-conversion').querySelectorAll('.formula').length,0);
  for(let i=0;i<8;i++)click('gray-convert-next');
  assert.equal(el('gray-conversion').querySelectorAll('.formula').length,8);
  assert.ok(text('gray-conversion').includes('Gray-Wort: '+M.bits(M.gray(n))));
  assert.ok(text('gray-conversion').includes('Dual '+M.bits(n)+' = Position '+n));
  assert.equal(el('gray-convert-next').disabled,true);
}
input('gray-position','15');click('gray-step');assert.ok(text('gray-code-value').includes('0.'));
click('gray-convert-reset');assert.equal(el('gray-conversion').querySelectorAll('.formula').length,0);
click('add-all');assert.ok(text('add-result').includes('147'));
click('sub-all');assert.ok(text('sub-result').includes('44'));
click('presentation');assert.equal(d.body.classList.contains('presentation'),true);
for(const a of d.querySelectorAll('nav a')){
  w.location.hash=a.hash;w.dispatchEvent(new w.Event('hashchange'));
  assert.equal(d.querySelectorAll('.panel:not([hidden])').length,1);
}
assert.equal(d.querySelectorAll('footer')[0].textContent.includes('Kollegenskript'),false);
const ids=[...d.querySelectorAll('[id]')].map(x=>x.id);assert.equal(ids.length,new Set(ids).size);
console.log('DOM checks passed: ten Hamming steps, '+cases+' single-bit corrections, two Gray switching orders, 16 conversions, controls and BCD regression.');
