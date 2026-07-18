const fs = require('fs');
let code = fs.readFileSync('generate-docs.js', 'utf8');

// The param definition to inject with proper newline and comma logic
const sendAtParam = `,
              { field: "send_at", type: "String", status: "opsional", desc: "Jadwal pengiriman pesan. Format: YYYY-MM-DD HH:mm (contoh: 2026-12-31 15:30)." }
          ]`;

const patterns = [
    '/kirim-pesan',
    '/kirim-massal',
    '/kirim-media',
    '/kirim-grup',
    '/kirim-polling',
    '/kirim-lokasi',
    '/kirim-vcard'
];

for (const pattern of patterns) {
    const routeIndex = code.indexOf(`path: "${pattern}"`);
    if (routeIndex !== -1) {
        const paramsIndex = code.indexOf('params: [', routeIndex);
        const endParamsIndex = code.indexOf('],', paramsIndex);
        
        const currentParams = code.substring(paramsIndex, endParamsIndex);
        if (!currentParams.includes('send_at')) {
            // Replace the closing bracket \n          ] with the new param and bracket
            // But we can just replace ']' from the endParamsIndex
            
            // To be exact, find the last } before ],
            const lastBracket = code.lastIndexOf('}', endParamsIndex);
            
            code = code.substring(0, lastBracket + 1) + sendAtParam + ',' + code.substring(endParamsIndex + 2);
        }
    }
}

fs.writeFileSync('generate-docs.js', code);
console.log('generate-docs.js patched successfully for send_at');
