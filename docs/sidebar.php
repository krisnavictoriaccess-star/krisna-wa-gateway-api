<?php
$current_tab = isset($_GET['tab']) ? $_GET['tab'] : 'top';
?>
<!-- Mobile Hamburger -->
<div class="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
    <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">K</div>
        <div class="font-bold text-slate-200">API Docs</div>
    </div>
    <button id="mobileMenuBtn" class="text-slate-300 focus:outline-none p-2 rounded hover:bg-slate-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
    </button>
</div>

<!-- Sidebar -->
<aside id="sidebar" class="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-800/80 p-5 h-screen overflow-y-auto shrink-0 bg-slate-900 absolute md:sticky top-0 left-0 z-50 transition-all">
  <div class="mb-8 px-2 hidden md:flex items-center gap-3">
    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">K</div>
    <h2 class="text-lg font-bold text-slate-200 tracking-tight">API Docs</h2>
  </div>
  
  <a href="?tab=top" class="block px-3 py-2 mb-4 text-sm rounded-lg transition-colors font-semibold <?= $current_tab == 'top' ? 'bg-indigo-900/30 text-indigo-300 border-l-4 border-indigo-500 pl-1' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50' ?>">🏠 Beranda / Pengantar</a>
  
  <?php
  $current_cat = '';
  foreach ($endpoints as $ep):
      if ($ep['category'] && $ep['category'] !== $current_cat) {
          echo '<div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">'.$ep['category'].'</div>';
          $current_cat = $ep['category'];
      }
      $isActive = ($current_tab === $ep['id']);
      $activeClass = $isActive ? 'bg-indigo-900/30 text-indigo-300 border-l-4 border-indigo-500 pl-1' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50';
      $badgeColor = $ep['method'] == 'GET' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    ($ep['method'] == 'POST' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20');
  ?>
  <a href="?tab=<?= $ep['id'] ?>" class="block w-full text-left px-2 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 <?= $activeClass ?>">
    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold border <?= $badgeColor ?> w-10 text-center shrink-0"><?= $ep['method'] ?></span>
    <span class="truncate"><?= $ep['path'] ?></span>
  </a>
  <?php endforeach; ?>
  
  <div class="mt-8 mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Events</div>
  <a href="?tab=websocket" class="block px-3 py-2 text-sm font-semibold rounded-lg transition-colors <?= $current_tab == 'websocket' ? 'bg-indigo-900/30 text-indigo-300 border-l-4 border-indigo-500 pl-1' : 'text-slate-400 hover:text-white hover:bg-slate-800/50' ?>">⚡ WebSockets</a>
  
  <div class="h-10 shrink-0"></div>
</aside>
<div id="sidebarOverlay" class="hidden fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"></div>
