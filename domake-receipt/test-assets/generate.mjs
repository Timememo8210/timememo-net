import fs from 'node:fs/promises';
import path from 'node:path';
// Optional fixture regeneration: install sharp in a separate development environment.
import sharp from 'sharp';
const dir=path.dirname(new URL(import.meta.url).pathname);
const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const text=(x,y,s,size=28,weight=400,fill='#162c38')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}">${esc(s)}</text>`;
const line=(y,w=840,x=80)=>`<line x1="${x}" y1="${y}" x2="${x+w}" y2="${y}" stroke="#c7d1d6" stroke-width="2"/>`;
const wrap=(w,h,body,defs='')=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs><rect width="100%" height="100%" fill="#fffdf8"/>${body}</svg>`;

const clearBody=[
`<rect width="1000" height="160" fill="#143b43"/>`,
text(70,75,'CEDAR HOME SERVICES',39,700,'#ffffff'),text(70,122,'SERVICE RECEIPT',23,400,'#d7eeea'),
text(80,218,'Company: Cedar Home Services',29,700),
text(80,267,'Receipt number: CHS-260901-07'),
text(80,313,'Issue date: 2026-09-02'),
text(80,370,'Technician: Omar Hassan',29,700),
text(80,418,'Customer: Lina Patel'),line(448),
text(80,500,'Service date: 2026-09-01'),
text(80,548,'Service address: Villa 18, Example Lane, Dubai'),
text(80,607,'Work: Replace kitchen faucet',30,700),
text(80,654,'Work type: Replacement'),text(80,702,'Status: Completed'),line(732),
text(80,785,'Kitchen faucet and installation'),text(735,785,'AED 400.00',26,700),
text(80,832,'VAT'),text(735,832,'AED 20.00',26),line(862),
text(80,919,'Total: AED 420.00',35,700),
text(80,970,'Payment status: Paid'),
text(80,1070,'FICTIONAL TEST DATA - NOT A VALID RECEIPT',21,700,'#687a83')
].join('');

const individualBody=[
text(45,66,'SAMIR ALI',39,700),text(45,110,'Independent property repair',25),
text(45,161,'RECEIPT # SA-260828-02',26,700),line(183,560,45),
text(45,232,'Contractor: Samir Ali',27,700),
text(45,280,'Customer: Noura Mansour',25),
text(45,345,'Service date: 2026-08-28',26),
text(45,395,'Service address:',26,700),
text(45,435,'Villa 7, Palm Court, Dubai',25),
line(465,560,45),
text(45,520,'Work:',27,700),text(45,564,'Repair bedroom door lock',27),
text(45,614,'Work type: Repair',25),
text(45,664,'Status: Completed',25),line(696,560,45),
text(45,749,'Labour and replacement latch',24),
text(45,810,'Total: AED 260.00',34,700),
text(45,865,'Payment status: Paid',25),
text(45,972,'FICTIONAL TEST DATA',20,700,'#687a83'),
text(45,1006,'NOT A VALID RECEIPT',20,400,'#687a83')
].join('');

const partialBody=[
text(75,85,'BLUE PALM ELECTRICAL',39,700),
text(75,138,'SERVICE RECEIPT - PARTIAL COPY',27,700),line(175),
text(75,237,'Company: Blue Palm Electrical',29,700),
text(75,294,'Receipt number: BPE-096',28),
text(75,360,'Customer: Farah Rahman',28),
text(75,430,'Service address: Apt 24, Cedar Court, Dubai',28),
text(75,512,'Work: Repair living room light switch',29,700),
text(75,572,'Work type: Repair',28),
text(75,635,'Status: Completed',28),
line(680),
`<path d="M0 724 L45 742 L85 722 L130 744 L176 725 L224 742 L270 723 L322 745 L365 725 L410 742 L460 724 L510 744 L562 722 L610 746 L660 726 L709 742 L754 724 L800 745 L853 724 L900 743 L955 724 L1000 741 L1000 880 L0 880Z" fill="#e3e3df"/>`,
text(75,811,'FICTIONAL TEST DATA - NOT A VALID RECEIPT',21,700,'#687a83')
].join('');

const unrelatedBody=[
text(50,72,'SAND & SPOON RESTAURANT',29,700),
text(50,118,'RESTAURANT RECEIPT',25,700),
text(50,169,'42 Marina Promenade, Dubai',23),
line(198,550,50),
text(50,251,'Receipt number: SSP-4082',25),
text(50,295,'Date: 2026-09-03',25),text(50,339,'Table: 12   Guests: 2',25),
line(372,550,50),
text(50,428,'Grilled fish',25),text(442,428,'AED 72.00',24),
text(50,478,'Garden salad',25),text(442,478,'AED 28.00',24),
text(50,528,'Mint tea x 2',25),text(442,528,'AED 24.00',24),
line(562,550,50),text(50,621,'Total: AED 124.00',32,700),
text(50,676,'Payment status: Paid',25),text(50,724,'Thank you for dining with us.',24),
text(50,848,'FICTIONAL TEST DATA',20,700,'#687a83'),text(50,880,'NOT A VALID RECEIPT',20,400,'#687a83')
].join('');

const entries=[
['01-clear-company',wrap(1000,1120,clearBody)],
['02-clear-individual',wrap(650,1060,individualBody)],
['03-partial-missing-fields',wrap(1000,880,partialBody)],
['04-unreadable-blur',wrap(1000,1120,`<g filter="url(#unreadable)" opacity="0.42">${clearBody}</g>`,`<filter id="unreadable" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>`)],
['05-unrelated-restaurant',wrap(650,930,unrelatedBody)]
];
for(const [name,svg] of entries){
 await fs.writeFile(path.join(dir,name+'.svg'),svg);
 await sharp(Buffer.from(svg)).png().toFile(path.join(dir,name+'.png'));
}
console.log('Created five original SVG documents and corresponding PNG test inputs.');
