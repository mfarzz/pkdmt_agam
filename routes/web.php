<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    // Get active disaster
    $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
    
    $excelFile = null;

    if ($activeDisaster) {
        // Ambil file Excel aktif untuk pengisian laporan
        $excelFile = \App\Models\LaporanExcelFile::where('disaster_id', $activeDisaster->id)
            ->where('is_active', true)
            ->first();
    }

    return Inertia::render('bencana', [
        'excelFile' => $excelFile,
        'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
    ]);
})->name('home');

Route::get('/rekap', [App\Http\Controllers\RekapController::class, 'index'])->name('rekap');
Route::get('/rekap/files', [App\Http\Controllers\RekapController::class, 'getReportFiles'])->name('rekap.files');
Route::get('/rekap/month', [App\Http\Controllers\RekapController::class, 'getMonthReports'])->name('rekap.month');
Route::post('/rekap/auto-scan', [App\Http\Controllers\RekapController::class, 'autoScanAll'])->name('rekap.auto-scan');

Route::get('/notulensi', [App\Http\Controllers\NotulensiController::class, 'calendar'])->name('notulensi');
Route::get('/notulensi/month', [App\Http\Controllers\NotulensiController::class, 'getMonthNotulensi'])->name('notulensi.month');
Route::post('/notulensi/auto-scan', [App\Http\Controllers\NotulensiController::class, 'autoScanAll'])->name('notulensi.auto-scan');

Route::get('/panduan-emt', function () {
    return Inertia::render('panduan-emt');
})->name('panduan-emt');

Route::get('/infografis', [App\Http\Controllers\InfografisController::class, 'public'])->name('infografis');
Route::get('/infografis/{id}/preview', [App\Http\Controllers\InfografisController::class, 'preview'])->name('infografis.preview');
Route::get('/infografis/{id}/image', [App\Http\Controllers\InfografisController::class, 'image'])->name('infografis.image');
Route::get('/infografis/{id}/download', [App\Http\Controllers\InfografisController::class, 'download'])->name('infografis.download');
Route::post('/infografis/auto-scan', [App\Http\Controllers\InfografisController::class, 'autoScan'])->name('infografis.auto-scan');

Route::get('/informasi', [App\Http\Controllers\InformasiController::class, 'public'])->name('informasi');

// DMT Registration
Route::get('/pendaftaran-dmt', [App\Http\Controllers\DmtRegistrationController::class, 'create'])->name('pendaftaran-dmt.create');
Route::post('/pendaftaran-dmt', [App\Http\Controllers\DmtRegistrationController::class, 'store'])->name('pendaftaran-dmt.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\UserController::class, 'index'])->name('dashboard');
    Route::get('manajemen-user', [App\Http\Controllers\UserController::class, 'manage'])->name('manajemen-user');
    Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::put('users/{user}/password', [App\Http\Controllers\UserController::class, 'updatePassword'])->name('users.update-password');

    Route::get('kelola-report', [App\Http\Controllers\ReportLinkController::class, 'index'])->name('kelola-report');
    Route::post('report-links', [App\Http\Controllers\ReportLinkController::class, 'store'])->name('report-links.store');
    Route::put('report-links/{reportLink}', [App\Http\Controllers\ReportLinkController::class, 'update'])->name('report-links.update');
    Route::delete('report-links/{reportLink}', [App\Http\Controllers\ReportLinkController::class, 'destroy'])->name('report-links.destroy');
    Route::get('report-links/folder-contents', [App\Http\Controllers\ReportLinkController::class, 'getFolderContents'])->name('report-links.folder-contents');

    Route::get('kelola-notulensi', [App\Http\Controllers\NotulensiController::class, 'index'])->name('kelola-notulensi');
    Route::post('notulensi-links', [App\Http\Controllers\NotulensiController::class, 'store'])->name('notulensi-links.store');
    Route::put('notulensi-links/{notulensiLink}', [App\Http\Controllers\NotulensiController::class, 'update'])->name('notulensi-links.update');
    Route::delete('notulensi-links/{notulensiLink}', [App\Http\Controllers\NotulensiController::class, 'destroy'])->name('notulensi-links.destroy');

    Route::get('kelola-infografis', [App\Http\Controllers\InfografisController::class, 'index'])->name('kelola-infografis');
    Route::post('infografis-links', [App\Http\Controllers\InfografisController::class, 'store'])->name('infografis-links.store');
    Route::delete('infografis-links/{infografisLink}', [App\Http\Controllers\InfografisController::class, 'destroy'])->name('infografis-links.destroy');
    Route::post('infografis/scan', [App\Http\Controllers\InfografisController::class, 'scan'])->name('infografis.scan');


    Route::get('kelola-pendaftaran', [App\Http\Controllers\DmtPendaftaranController::class, 'index'])->name('kelola-pendaftaran');
    Route::get('kelola-pendaftaran/{dmtData}', [App\Http\Controllers\DmtPendaftaranController::class, 'show'])->name('kelola-pendaftaran.show');
    Route::put('kelola-pendaftaran/{dmtData}/status', [App\Http\Controllers\DmtPendaftaranController::class, 'updateStatus'])->name('kelola-pendaftaran.update-status');
    Route::delete('kelola-pendaftaran/{dmtData}', [App\Http\Controllers\DmtPendaftaranController::class, 'destroy'])->name('kelola-pendaftaran.destroy');

    Route::get('kelola-laporan-excel', [App\Http\Controllers\LaporanExcelController::class, 'index'])->name('kelola-laporan-excel');
    Route::post('laporan-excel', [App\Http\Controllers\LaporanExcelController::class, 'store'])->name('laporan-excel.store');
    Route::delete('laporan-excel/{laporanExcelFile}', [App\Http\Controllers\LaporanExcelController::class, 'destroy'])->name('laporan-excel.destroy');

    Route::get('kelola-bencana', [App\Http\Controllers\DisasterController::class, 'index'])->name('kelola-bencana');
    Route::post('disasters', [App\Http\Controllers\DisasterController::class, 'store'])->name('disasters.store');
    Route::put('disasters/{disaster}', [App\Http\Controllers\DisasterController::class, 'update'])->name('disasters.update');
    Route::delete('disasters/{disaster}', [App\Http\Controllers\DisasterController::class, 'destroy'])->name('disasters.destroy');
    Route::post('disasters/switch', [App\Http\Controllers\DisasterController::class, 'switch'])->name('disasters.switch');

    Route::get('panduan', [App\Http\Controllers\PanduanController::class, 'index'])->name('panduan');

    // Notifications
    Route::get('notifications/count', [App\Http\Controllers\NotificationController::class, 'count'])->name('notifications.count');
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

// Public route for downloading excel file
Route::get('/laporan-excel/download', [App\Http\Controllers\LaporanExcelController::class, 'download'])->name('laporan-excel.download');

require __DIR__.'/settings.php';
