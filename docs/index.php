<?php
require 'data.php';
$current_tab = isset($_GET['tab']) ? $_GET['tab'] : 'top';

$activeEndpoint = null;
foreach ($endpoints as $ep) {
    if ($ep['id'] === $current_tab) {
        $activeEndpoint = $ep;
        break;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krisna WA Gateway - Dokumentasi API</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
    </style>
</head>
<body class="bg-slate-900 text-slate-300 font-sans antialiased overflow-x-hidden">
<div class="flex flex-col md:flex-row max-w-[1600px] mx-auto min-h-screen relative w-full">
    <?php include 'sidebar.php'; ?>

    <main class="flex-1 p-5 md:p-8 lg:p-12 w-full min-w-0 overflow-x-hidden relative">
        <header class="mb-10 md:mb-12 border-b border-slate-800/80 pb-6 md:pb-8 mt-2 md:mt-0">
          <h1 class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-3 md:mb-4 tracking-tight">Krisna WA Gateway API</h1>
          <p class="text-slate-400 text-sm md:text-lg">Referensi Lengkap Integrasi Gateway Enterprise</p>
        </header>

        <?php if ($current_tab === 'top'): ?>
          <div class="bg-blue-900/10 border border-blue-800/40 rounded-2xl p-5 md:p-8 mb-8 shadow-xl shadow-black/20 overflow-hidden">
             <h3 class="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">🌍 Base URL</h3>
             <div class="relative group">
                 <div class="overflow-x-auto bg-black/60 p-4 md:p-5 rounded-xl border border-slate-800 shadow-inner">
                     <code id="code-baseurl" class="text-amber-400 font-mono text-sm md:text-lg whitespace-nowrap">https://api.krisnadev.my.id</code>
                 </div>
                 <button onclick="copyToClipboard('code-baseurl')" class="absolute top-1/2 -translate-y-1/2 right-3 bg-slate-700 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
             </div>
          </div>
          
          <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 md:p-8 shadow-xl shadow-black/20 overflow-hidden">
             <h3 class="text-slate-200 font-bold mb-3 flex items-center gap-2 text-lg">🔐 Autentikasi (Headers)</h3>
             <p class="text-slate-400 mb-5 text-sm md:text-base">Selalu sertakan kredensial di header HTTP (bukan di URL parameter).</p>
             <div class="overflow-x-auto rounded-xl border border-slate-700/60 shadow-inner w-full">
                <table class="w-full text-left text-sm whitespace-nowrap">
                  <thead class="bg-slate-800 text-slate-300">
                    <tr><th class="px-5 py-3 font-semibold">Header</th><th class="px-5 py-3 font-semibold">Status</th><th class="px-5 py-3 font-semibold">Deskripsi</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-700/50">
                    <tr class="hover:bg-slate-800/50 transition-colors">
                      <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-master-key</code></td>
                      <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Wajib (Admin)</span></td>
                      <td class="px-5 py-4 text-slate-400">Untuk akses endpoint master.</td>
                    </tr>
                    <tr class="hover:bg-slate-800/50 transition-colors">
                      <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">x-api-key</code></td>
                      <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Wajib (Klien)</span></td>
                      <td class="px-5 py-4 text-slate-400">Token klien yang didapat dari Generate.</td>
                    </tr>
                    <tr class="hover:bg-slate-800/50 transition-colors">
                      <td class="px-5 py-4"><code class="text-amber-300 bg-black/50 px-2 py-1 rounded">sender_id</code></td>
                      <td class="px-5 py-4"><span class="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Opsional</span></td>
                      <td class="px-5 py-4 text-slate-400">Pilih nomor pengirim spesifik. Kosong = Rotator.</td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>

        <?php elseif ($current_tab === 'websocket'): ?>
            <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10">
              <div class="p-5 md:p-8">
                <h3 class="text-2xl font-bold text-slate-200 mb-6 pb-3 border-b border-slate-800">⚡ WebSockets</h3>
                <p class="text-slate-400 mb-4 text-sm md:text-base">API ini menyediakan WebSocket untuk memantau status sesi perangkat (Koneksi WA) secara *real-time*.</p>
                <div class="overflow-x-auto bg-black/50 p-5 rounded-xl border border-slate-700/50 shadow-inner mb-6 relative group">
                   <div class="flex flex-wrap items-center gap-2 mb-3">
                       <span class="bg-blue-600/30 text-blue-400 px-2 py-1 rounded text-xs font-bold tracking-wider">SOCKET.IO</span>
                       <code class="text-sm text-slate-300">https://api.krisnadev.my.id</code>
                   </div>
                   <p class="text-xs text-slate-400 mb-3 border-t border-slate-700/50 pt-3">Contoh Implementasi Klien (HTML/JavaScript):</p>
                   <pre id="code-ws" class="font-mono text-xs md:text-sm text-slate-300 overflow-x-auto whitespace-pre"><code>&lt;!-- Load library Socket.IO Client --&gt;
&lt;script src="https://cdn.socket.io/4.7.5/socket.io.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
  // Inisialisasi koneksi Socket.IO
  const socket = io("https://api.krisnadev.my.id", {
    transports: ["websocket", "polling"]
  });

  // Mendengarkan event 'device_status'
  socket.on("device_status", (data) => {
    console.log("Nomor:", data.device, "| Status:", data.status);
    
    if (data.status === "WAITING_PAIRING") {
       console.log("Masukkan kode pairing ini di WhatsApp Anda:", data.code);
    }
    else if (data.status === "CONNECTED") {
       console.log("WhatsApp berhasil terhubung dan siap digunakan!");
    }
  });
&lt;/script&gt;</code></pre>
                   <button onclick="copyToClipboard('code-ws')" class="absolute top-3 right-3 bg-slate-700 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                </div>
              </div>
            </div>

        <?php elseif ($activeEndpoint): ?>
            <?php
            $ep = $activeEndpoint;
            $badgeColorClass = $ep['method'] == 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                               ($ep['method'] == 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20');
            $authBadge = $ep['badge'] == 'master' ? '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Requires x-master-key</span>' : '<span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">Requires x-api-key</span>';
            ?>
            <div class="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden mb-10 shadow-xl shadow-black/10 w-full max-w-full">
              <div class="px-4 md:px-8 py-4 border-b border-slate-700/50 bg-slate-800/80 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 w-full">
                 <div class="flex items-center gap-3 min-w-0">
                    <span class="px-3 py-1 rounded-md text-xs font-bold border <?= $badgeColorClass ?> shrink-0"><?= $ep['method'] ?></span>
                    <code class="text-slate-200 font-mono text-sm md:text-lg font-bold truncate"><?= $ep['path'] ?></code>
                 </div>
                 <span class="text-slate-400 text-xs md:text-sm md:ml-auto md:text-right leading-snug"><?= $ep['summary'] ?></span>
              </div>
              
              <div class="p-4 md:p-8 w-full max-w-full overflow-hidden">
                 <div class="mb-6 flex flex-wrap gap-2"><?= $authBadge ?></div>
                 
                 <?php if(!empty($ep['params'])): ?>
                     <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Parameters</h5>
                     <div class="overflow-x-auto rounded-xl border border-slate-700/50 shadow-inner mb-8 w-full max-w-full">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                           <thead class="bg-slate-800/80 text-slate-400">
                             <tr><th class="px-4 py-3 font-semibold">Field</th><th class="px-4 py-3 font-semibold">Type</th><th class="px-4 py-3 font-semibold">Status</th><th class="px-4 py-3 font-semibold">Deskripsi</th></tr>
                           </thead>
                           <tbody class="divide-y divide-slate-700/50">
                             <?php foreach($ep['params'] as $p): 
                                 $statBadge = strtolower($p['status']) == 'wajib' ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">wajib</span>' : '<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">opsional</span>';
                             ?>
                             <tr class="hover:bg-slate-800/50 transition-colors">
                                <td class="px-4 py-3"><code class="text-amber-300 font-mono text-xs md:text-sm"><?= $p['field'] ?></code></td>
                                <td class="px-4 py-3 text-slate-300 text-xs md:text-sm"><?= $p['type'] ?></td>
                                <td class="px-4 py-3"><?= $statBadge ?></td>
                                <td class="px-4 py-3 text-slate-400 text-xs md:text-sm break-words whitespace-normal min-w-[200px]"><?= stripslashes($p['desc']) ?></td>
                             </tr>
                             <?php endforeach; ?>
                           </tbody>
                        </table>
                     </div>
                 <?php endif; ?>

                 <?php if($ep['reqBody']): ?>
                     <h5 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Contoh Request Body</h5>
                     <div class="relative group overflow-x-auto bg-black/50 p-4 md:p-5 rounded-xl border border-slate-700/50 mb-8 shadow-inner w-full">
                       <pre id="code-req-<?= $ep['id'] ?>" class="font-mono text-xs md:text-sm text-indigo-300 whitespace-pre"><?= htmlspecialchars(stripslashes($ep['reqBody'])) ?></pre>
                       <button onclick="copyToClipboard('code-req-<?= $ep['id'] ?>')" class="absolute top-2 right-2 bg-slate-700 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                     </div>
                 <?php endif; ?>

                 <h5 class="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Contoh Response</h5>
                 <div class="flex flex-col lg:flex-row gap-6 w-full">
                    <div class="flex-1 w-full min-w-0">
                       <div class="text-emerald-400 font-bold mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-emerald-500"></div><small>Berhasil (200 / 201)</small></div>
                       <div class="relative group overflow-x-auto bg-emerald-950/20 p-4 md:p-5 rounded-xl border border-emerald-900/50 h-full shadow-inner">
                         <pre id="code-res-suc-<?= $ep['id'] ?>" class="font-mono text-xs md:text-sm text-emerald-200/90 whitespace-pre"><?= htmlspecialchars(stripslashes($ep['resSuccess'])) ?></pre>
                         <button onclick="copyToClipboard('code-res-suc-<?= $ep['id'] ?>')" class="absolute top-2 right-2 bg-emerald-800 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                       </div>
                    </div>
                    <div class="flex-1 w-full min-w-0 mt-4 lg:mt-0">
                       <div class="text-rose-400 font-bold mb-3 flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-500"></div><small>Gagal (4xx / 5xx)</small></div>
                       <div class="relative group overflow-x-auto bg-rose-950/20 p-4 md:p-5 rounded-xl border border-rose-900/50 h-full shadow-inner">
                         <pre id="code-res-err-<?= $ep['id'] ?>" class="font-mono text-xs md:text-sm text-rose-200/90 whitespace-pre"><?= htmlspecialchars(stripslashes($ep['resError'])) ?></pre>
                         <button onclick="copyToClipboard('code-res-err-<?= $ep['id'] ?>')" class="absolute top-2 right-2 bg-rose-800 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
        <?php else: ?>
            <div class="text-center text-rose-400 mt-20">Endpoint tidak ditemukan.</div>
        <?php endif; ?>
        
        <footer class="mt-12 pt-6 border-t border-slate-800/80 text-center text-slate-500 text-sm">
            &copy; <?= date('Y') ?> Krisna WA Gateway. Documented with PHP & Tailwind CSS.
        </footer>
    </main>
</div>

<script>
// Mobile Hamburger Logic
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleMobileMenu() {
    sidebar.classList.toggle('hidden');
    sidebarOverlay.classList.toggle('hidden');
}

mobileMenuBtn.addEventListener('click', toggleMobileMenu);
sidebarOverlay.addEventListener('click', toggleMobileMenu);

// Copy Function + SweetAlert2
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
            title: 'Berhasil disalin!',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500,
            background: '#1e293b',
            color: '#f8fafc',
            iconColor: '#34d399',
            customClass: {
                popup: 'border border-slate-700 shadow-xl'
            }
        });
    });
}
</script>
</body>
</html>
