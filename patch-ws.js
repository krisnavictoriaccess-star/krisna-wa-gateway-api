const fs = require('fs');

let code = fs.readFileSync('run-rewrite-tailwind.js', 'utf8');

const anchor = `<pre class="font-mono text-sm text-blue-300">ws://api.krisnamarket.my.id</pre>
        </div>`;

const newWsCode = `<pre class="font-mono text-sm text-blue-300">ws://api.krisnamarket.my.id</pre>
        </div>
        
        <h5 class="text-slate-300 font-bold mt-8 mb-3 uppercase tracking-wider text-sm">Event: device_status</h5>
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
        </div>`;

if(code.includes(anchor)) {
    code = code.replace(anchor, newWsCode);
    code = code.replace('API ini menyediakan WebSocket untuk *real-time updates* seperti status pengiriman pesan atau event device.', 'API ini menyediakan WebSocket untuk memantau status sesi perangkat (Koneksi WA) secara *real-time*.');
    fs.writeFileSync('run-rewrite-tailwind.js', code);
    console.log("Successfully patched WebSockets");
} else {
    console.log("Could not find anchor.");
}
