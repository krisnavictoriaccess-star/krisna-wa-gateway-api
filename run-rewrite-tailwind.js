const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('generate-docs.js', 'utf8');
const splitMarker = '];';
const splitIndex = code.indexOf(splitMarker);
if (splitIndex === -1) {
    console.error("Could not find ];");
    process.exit(1);
}

const keepCode = code.substring(0, splitIndex + splitMarker.length);

const tailwindCode = `

// --- MOBILE NAVBAR GENERATION ---
let mobileNavHtml = \\\`<nav class="md:hidden sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 overflow-x-auto whitespace-nowrap px-4 py-3 flex gap-3 shadow-lg shadow-black/20 snap-x">
  <a href="#top" class="snap-start px-4 py-2 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">Base URL & Auth</a>\\\`;

let addedCategories = new Set();
endpoints.forEach(ep => {
    if (ep.category && !addedCategories.has(ep.category)) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        mobileNavHtml += \\\`\\n  <a href="#\${catId}" class="snap-start px-4 py-2 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">\${ep.category}</a>\\\`;
        addedCategories.add(ep.category);
    }
});
mobileNavHtml += \\\`\\n  <a href="#websocket" class="snap-start px-4 py-2 rounded-full bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">WebSockets</a>\\n</nav>\\\`;


// --- DESKTOP SIDEBAR GENERATION ---
let desktopSidebarHtml = \\\`<aside class="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 overflow-y-auto border-r border-slate-800 py-8 px-4 lg:px-6 bg-slate-900/50">
  <h2 class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6 px-2">Navigasi API</h2>
  <a href="#top" class="block px-2 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">🌍 Base URL & Auth</a>
\\\`;

let currentCategory = "";
endpoints.forEach(ep => {
    if (ep.category && ep.category !== currentCategory) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        desktopSidebarHtml += \\\`\\n  <div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">\${ep.category}</div>\\\`;
        currentCategory = ep.category;
    }
    
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');
    let badgeColorClass = ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          (ep.method === 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-rose-500/10 text-rose-400 border-rose-500/20');
                          
    desktopSidebarHtml += \\\`
  <a href="#\${epId}" class="block px-2 py-1.5 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2">
    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold border \${badgeColorClass} w-10 text-center">\${ep.method}</span>
    <span class="truncate">\${ep.path}</span>
  </a>\\\`;
});

desktopSidebarHtml += \\\`
  <div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Events</div>
  <a href="#websocket" class="block px-2 py-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">⚡ WebSockets</a>
</aside>\\\`;


// --- MAIN HTML BOILERPLATE ---
let html = \\\`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krisna WA Gateway - Dokumentasi API Komprehensif</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
    </style>
</head>
<body class="bg-slate-900 text-slate-300 font-sans antialiased selection:bg-blue-500/30">

\${mobileNavHtml}

<div class="flex max-w-[1600px] mx-auto">
  \${desktopSidebarHtml}

  <main class="flex-1 p-5 md:p-8 lg:p-12 min-w-0">
    <header class="mb-10 md:mb-16 border-b border-slate-800/80 pb-8">
      <h1 class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-4 tracking-tight">Krisna WA Gateway API</h1>
      <p class="text-slate-400 text-base md:text-lg">Referensi Lengkap Integrasi Gateway Enterprise</p>
    </header>

    <section id="top" class="mb-16 scroll-mt-24 md:scroll-mt-8">
      <div class="bg-blue-900/10 border border-blue-800/40 rounded-2xl p-5 md:p-8 mb-8 shadow-xl shadow-black/20">
         <h3 class="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">🌍 Base URL</h3>
         <code class="block overflow-x-auto whitespace-nowrap bg-black/60 p-4 md:p-5 rounded-xl text-amber-400 font-mono text-sm md:text-lg border border-slate-800 shadow-inner">https://api.krisnamarket.my.id</code>
      </div>
      
      <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 md:p-8 shadow-xl shadow-black/20">
         <h3 class="text-slate-200 font-bold mb-3 flex items-center gap-2 text-lg">🔐 Autentikasi (Headers)</h3>
         <p class="text-slate-400 mb-5 text-sm md:text-base">Selalu sertakan kredensial di header HTTP (bukan di URL parameter).</p>
         <div class="overflow-x-auto rounded-xl border border-slate-700/60 shadow-inner">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-800 text-slate-300">
                <tr><th class="px-5 py-3 font-semibold">Header</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 font-semibold">Deskripsi</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-master-key</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Wajib (Admin)</span></td>
                  <td class="px-5 py-4 text-slate-400">Untuk akses endpoint master (manajemen klien).</td>
                </tr>
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-api-key</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Wajib (Klien)</span></td>
                  <td class="px-5 py-4 text-slate-400">Token klien yang didapatkan dari proses Generate.</td>
                </tr>
                <tr class="hover:bg-slate-800/50 transition-colors">
                  <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">sender_id</code></td>
                  <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Opsional</span></td>
                  <td class="px-5 py-4 text-slate-400">Digunakan pada fitur Messaging untuk memilih nomor pengirim spesifik. Kosongkan untuk mode Rotator.</td>
                </tr>
              </tbody>
            </table>
         </div>
      </div>
    </section>\\\`;


// --- API ENDPOINTS LOOP ---
endpoints.forEach(ep => {
    if (ep.category) {
        let catId = ep.category.replace(/[^a-zA-Z0-9]/g, '');
        html += \\\`\\n    <h3 id="\${catId}" class="text-2xl font-bold text-slate-200 mt-20 mb-8 pb-3 border-b border-slate-800 scroll-mt-24 md:scroll-mt-8">\${ep.category}</h3>\\n\\\`;
    }

    const badgeColorClass = ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                           (ep.method === 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                           'bg-rose-500/10 text-rose-400 border-rose-500/20');
                           
    const authBadge = ep.badge === 'master' ? 
      '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Requires x-master-key</span>' : 
      '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Requires x-api-key</span>';
      
    let epId = (ep.method + '-' + ep.path).replace(/[^a-zA-Z0-9]/g, '');

    html += \\\`
    <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10 scroll-mt-24 md:scroll-mt-8 group hover:border-slate-600/60 transition-colors" id="\${epId}">
      <!-- Card Header -->
      <div class="px-5 md:px-8 py-4 border-b border-slate-700/50 bg-slate-800/80 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
         <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-md text-xs font-bold border \${badgeColorClass}">\${ep.method}</span>
            <code class="text-slate-200 font-mono text-[15px] md:text-lg font-bold">\${ep.path}</code>
         </div>
         <span class="text-slate-400 text-sm md:ml-auto md:text-right leading-snug">\${ep.summary}</span>
      </div>
      
      <!-- Card Body -->
      <div class="p-5 md:p-8">
         <div class="mb-8 flex flex-wrap gap-2">\${authBadge}</div>
\\\`;

    // Params table
    if (ep.params && ep.params.length > 0) {
        html += \\\`
         <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Parameters</h5>
         <div class="overflow-x-auto rounded-xl border border-slate-700/50 shadow-inner mb-8">
            <table class="w-full text-left text-sm whitespace-nowrap">
               <thead class="bg-slate-800/80 text-slate-400">
                 <tr>
                   <th class="px-5 py-3 font-semibold">Field</th>
                   <th class="px-5 py-3 font-semibold">Type</th>
                   <th class="px-5 py-3 font-semibold">Status</th>
                   <th class="px-5 py-3 font-semibold">Deskripsi</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-700/50">\\\`;
               
        ep.params.forEach(p => {
            const statBadge = p.status.toLowerCase() === 'wajib' ? 
              '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">wajib</span>' : 
              '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">opsional</span>';
            html += \\\`
                 <tr class="hover:bg-slate-800/50 transition-colors">
                    <td class="px-5 py-3"><code class="text-amber-300 font-mono">\${p.field}</code></td>
                    <td class="px-5 py-3 text-slate-300">\${p.type}</td>
                    <td class="px-5 py-3">\${statBadge}</td>
                    <td class="px-5 py-3 text-slate-400">\${p.desc}</td>
                 </tr>\\\`;
        });
        html += \\\`
               </tbody>
            </table>
         </div>\\\`;
    }

    // Req body
    if (ep.reqBody) {
        html += \\\`
         <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Contoh Request Body (JSON)</h5>
         <div class="overflow-x-auto bg-black/50 p-5 rounded-xl border border-slate-700/50 mb-8 shadow-inner">
           <pre class="font-mono text-sm text-indigo-300">\${ep.reqBody}</pre>
         </div>\\\`;
    }

    // Responses
    html += \\\`
         <h5 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Contoh Response</h5>
         <div class="flex flex-col lg:flex-row gap-8">
            <div class="flex-1">
               <div class="text-emerald-400 font-bold mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-emerald-500"></div><small>Berhasil (200 / 201)</small></div>
               <div class="overflow-x-auto bg-emerald-950/20 p-5 rounded-xl border border-emerald-900/50 h-full shadow-inner">
                 <pre class="font-mono text-sm text-emerald-200/90">\${ep.resSuccess}</pre>
               </div>
            </div>
            <div class="flex-1">
               <div class="text-rose-400 font-bold mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-500"></div><small>Gagal (4xx / 5xx)</small></div>
               <div class="overflow-x-auto bg-rose-950/20 p-5 rounded-xl border border-rose-900/50 h-full shadow-inner">
                 <pre class="font-mono text-sm text-rose-200/90">\${ep.resError}</pre>
               </div>
            </div>
         </div>
      </div>
    </div>\\\`;
});

// Write WebSockets section at the bottom
html += \\\`
    <h3 id="websocket" class="text-2xl font-bold text-slate-200 mt-20 mb-8 pb-3 border-b border-slate-800 scroll-mt-24 md:scroll-mt-8">WebSockets</h3>
    <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10">
      <div class="p-5 md:p-8">
        <p class="text-slate-400 mb-4">API ini menyediakan WebSocket untuk memantau status sesi perangkat (Koneksi WA) secara *real-time*.</p>
        <div class="overflow-x-auto bg-black/50 p-5 rounded-xl border border-slate-700/50 shadow-inner mb-6">
           <pre class="font-mono text-sm text-blue-300">ws://api.krisnamarket.my.id</pre>
        </div>
        
        <h5 class="text-slate-300 font-bold mb-3 uppercase tracking-wider text-sm">Event: device_status</h5>
        <p class="text-slate-400 text-sm mb-4">Klien dapat mendengarkan (*listen*) event <code>device_status</code>. Berikut adalah contoh payload (*response*) yang akan diterima sesuai dengan kondisi perangkat Anda:</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div>
              <div class="text-amber-400 font-bold mb-2 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-amber-500"></div><small>Menunggu Scan QR (WAITING_QR)</small></div>
              <div class="overflow-x-auto bg-amber-950/20 p-4 rounded-xl border border-amber-900/50 shadow-inner">
                <pre class="font-mono text-xs text-amber-200/90">{
  "device": "628123456789",
  "status": "WAITING_QR",
  "qr": "data:image/png;base64,iVBORw0KGgo..."
}</pre>
              </div>
           </div>
           <div>
              <div class="text-emerald-400 font-bold mb-2 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-emerald-500"></div><small>Berhasil Terhubung (CONNECTED)</small></div>
              <div class="overflow-x-auto bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/50 shadow-inner">
                <pre class="font-mono text-xs text-emerald-200/90">{
  "device": "628123456789",
  "status": "CONNECTED"
}</pre>
              </div>
           </div>
           <div>
              <div class="text-rose-400 font-bold mb-2 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-500"></div><small>Terputus (DISCONNECTED)</small></div>
              <div class="overflow-x-auto bg-rose-950/20 p-4 rounded-xl border border-rose-900/50 shadow-inner">
                <pre class="font-mono text-xs text-rose-200/90">{
  "device": "628123456789",
  "status": "DISCONNECTED"
}</pre>
              </div>
           </div>
           <div>
              <div class="text-blue-400 font-bold mb-2 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-blue-500"></div><small>Menunggu Pairing (WAITING_PAIRING)</small></div>
              <div class="overflow-x-auto bg-blue-950/20 p-4 rounded-xl border border-blue-900/50 shadow-inner">
                <pre class="font-mono text-xs text-blue-200/90">{
  "device": "628123456789",
  "status": "WAITING_PAIRING",
  "code": "AB12CD34"
}</pre>
              </div>
           </div>
        </div>
      </div>
    </div>
  </main>
</div>
</body>
</html>\\\`;

fs.writeFileSync(path.join(__dirname, 'docs', 'index.html'), html);
console.log('Successfully generated complete docs/index.html with Tailwind CSS');
`;

fs.writeFileSync('generate-docs.js', keepCode + tailwindCode.replace(/\\\`/g, '`'));
console.log("Successfully rewrote generate-docs.js logic for Tailwind CSS.");
