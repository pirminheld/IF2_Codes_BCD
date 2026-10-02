const assert=require('node:assert/strict'),fs=require('node:fs'),M=require('./model.js');let checks=0;
const ok=(a,b)=>{assert.deepEqual(a,b);checks++;};
ok(M.encode('0110'),'1100110');ok(M.encode('0101'),'0100101');
for(let n=0;n<16;n++){
 const data=M.bits(n),word=M.encode(data);ok(M.check(word).position,0);
 for(let i=0;i<7;i++){
  const bad=word.slice(0,i)+(word[i]==='0'?'1':'0')+word.slice(i+1),r=M.check(bad);
  ok(r.position,i+1);ok(r.corrected,word);ok(r.data,data);
 }
 const next=(n+1)%16,diff=M.gray(n)^M.gray(next);ok((diff&(diff-1))===0,true);
 const t=M.transition(n,4);ok(t.binary,M.bits(next));ok(t.gray,M.bits(M.gray(next)));
}
for(const [w,p,d] of [['1101100',2,'0100'],['1100010',5,'0110'],['0011101',5,'1001']]){ok(M.check(w).position,p);ok(M.check(w).data,d);}
for(let a=0;a<100;a++)for(let b=0;b<100;b++){
 const r=M.add(a,b);ok(Number(r.digits.join('')),a+b);ok(r.code.map(w=>parseInt(w,2)).every(n=>n<=9),true);
 const s=M.subtract(a,b);ok(s.result,a-b);ok(s.magnitude,Math.abs(a-b));
 ok(s.zero?s.addition.result:s.negative?-(100-s.remaining):s.remaining,a-b);
}
ok(M.transition(7,1).binary,'1111');ok(M.transition(7,1).gray,'1100');
ok(M.add(9,8).steps[0].correction,6);ok(M.add(9,8).steps[0].digit,7);
for(const name of ['index.html','style.css','app.js','model.js','FTS_logo.png','impressum.html','QR_Code.png'])ok(fs.existsSync(name),true);
ok(fs.readFileSync('QR_Code.png').subarray(0,8).toString('hex'),'89504e470d0a1a0a');
console.log(`${checks} Fach- und Dateiprüfungen bestanden.`);
