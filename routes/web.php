<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    // Ambil link yang namanya mengandung "registrasi" (case-insensitive) dan aktif
    $registrationLink = \App\Models\SiteLink::where('is_active', true)
        ->whereRaw('LOWER(name) LIKE ?', ['%registrasi%'])
        ->first();

    // Ambil file Excel aktif untuk pengisian laporan
    $excelFile = \App\Models\LaporanExcelFile::where('is_active', true)->first();

    return Inertia::render('bencana', [
        'registrationLink' => $registrationLink,
        'excelFile' => $excelFile,
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

Route::get('/informasi', [App\Http\Controllers\DmtController::class, 'public'])->name('informasi');
Route::post('/informasi/auto-scan', [App\Http\Controllers\DmtController::class, 'autoScan'])->name('informasi.auto-scan');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\UserController::class, 'index'])->name('dashboard');
    Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::put('users/{user}/password', [App\Http\Controllers\UserController::class, 'updatePassword'])->name('users.update-password');

    Route::get('kelola-report', [App\Http\Controllers\ReportLinkController::class, 'index'])->name('kelola-report');
    Route::post('report-links', [App\Http\Controllers\ReportLinkController::class, 'store'])->name('report-links.store');
    Route::put('report-links/{reportLink}', [App\Http\Controllers\ReportLinkController::class, 'update'])->name('report-links.update');
    Route::delete('report-links/{reportLink}', [App\Http\Controllers\ReportLinkController::class, 'destroy'])->name('report-links.destroy');
    Route::get('report-links/folder-contents', [App\Http\Controllers\ReportLinkController::class, 'getFolderContents'])->name('report-links.folder-contents');

    Route::get('kelola-link', [App\Http\Controllers\LinkController::class, 'index'])->name('kelola-link');
    Route::post('links', [App\Http\Controllers\LinkController::class, 'store'])->name('links.store');
    Route::put('links/{link}', [App\Http\Controllers\LinkController::class, 'update'])->name('links.update');
    Route::delete('links/{link}', [App\Http\Controllers\LinkController::class, 'destroy'])->name('links.destroy');

    Route::get('kelola-notulensi', [App\Http\Controllers\NotulensiController::class, 'index'])->name('kelola-notulensi');
    Route::post('notulensi-links', [App\Http\Controllers\NotulensiController::class, 'store'])->name('notulensi-links.store');
    Route::put('notulensi-links/{notulensiLink}', [App\Http\Controllers\NotulensiController::class, 'update'])->name('notulensi-links.update');
    Route::delete('notulensi-links/{notulensiLink}', [App\Http\Controllers\NotulensiController::class, 'destroy'])->name('notulensi-links.destroy');

    Route::get('kelola-infografis', [App\Http\Controllers\InfografisController::class, 'index'])->name('kelola-infografis');
    Route::post('infografis-links', [App\Http\Controllers\InfografisController::class, 'store'])->name('infografis-links.store');
    Route::delete('infografis-links/{infografisLink}', [App\Http\Controllers\InfografisController::class, 'destroy'])->name('infografis-links.destroy');
    Route::post('infografis/scan', [App\Http\Controllers\InfografisController::class, 'scan'])->name('infografis.scan');

    Route::get('kelola-dmt', [App\Http\Controllers\DmtController::class, 'index'])->name('kelola-dmt');
    Route::post('dmt-links', [App\Http\Controllers\DmtController::class, 'store'])->name('dmt-links.store');
    Route::delete('dmt-links/{dmtLink}', [App\Http\Controllers\DmtController::class, 'destroy'])->name('dmt-links.destroy');
    Route::post('dmt/scan', [App\Http\Controllers\DmtController::class, 'scan'])->name('dmt.scan');

    Route::get('kelola-laporan-excel', [App\Http\Controllers\LaporanExcelController::class, 'index'])->name('kelola-laporan-excel');
    Route::post('laporan-excel', [App\Http\Controllers\LaporanExcelController::class, 'store'])->name('laporan-excel.store');
    Route::delete('laporan-excel/{laporanExcelFile}', [App\Http\Controllers\LaporanExcelController::class, 'destroy'])->name('laporan-excel.destroy');
});

// Public route for downloading excel file
Route::get('/laporan-excel/download', [App\Http\Controllers\LaporanExcelController::class, 'download'])->name('laporan-excel.download');

require __DIR__.'/settings.php';
