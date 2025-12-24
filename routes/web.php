<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Landing Page
Route::get('/', [App\Http\Controllers\LandingPageController::class, 'index'])->name('landing');

Route::get('/rekap', [App\Http\Controllers\RekapController::class, 'index'])->name('rekap');
Route::get('/rekap/files', [App\Http\Controllers\RekapController::class, 'getReportFiles'])->name('rekap.files');
Route::get('/rekap/month', [App\Http\Controllers\RekapController::class, 'getMonthReports'])->name('rekap.month');
Route::post('/rekap/auto-scan', [App\Http\Controllers\RekapController::class, 'autoScanAll'])->name('rekap.auto-scan');

// Public route for downloading report files
Route::get('/report-dates/{id}/download', [App\Http\Controllers\RekapController::class, 'downloadReportFile'])->name('report-dates.download');

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
    // Routes accessible by both Admin and Superadmin
    Route::middleware(['role:admin,superadmin'])->group(function () {
        Route::get('dashboard', [App\Http\Controllers\UserController::class, 'index'])->name('dashboard');

        // Separate report management pages
        Route::get('kelola-report-mingguan', [App\Http\Controllers\RekapController::class, 'indexMingguan'])->name('kelola-report-mingguan');
        Route::get('kelola-report-dmt', [App\Http\Controllers\RekapController::class, 'indexDMT'])->name('kelola-report-dmt');
        Route::get('kelola-report-heoc', [App\Http\Controllers\RekapController::class, 'indexHEOC'])->name('kelola-report-heoc');

        Route::post('report-weeks/upload', [App\Http\Controllers\RekapController::class, 'uploadWeeklyReport'])->name('report-weeks.upload');
        Route::delete('report-weeks/{reportWeek}', [App\Http\Controllers\RekapController::class, 'deleteWeeklyReport'])->name('report-weeks.delete');

        // Daily report management
        Route::post('report-dates/upload', [App\Http\Controllers\RekapController::class, 'uploadDailyReport'])->name('report-dates.upload');
        Route::delete('report-dates/{id}', [App\Http\Controllers\RekapController::class, 'deleteDailyReport'])->name('report-dates.delete');
        Route::post('report-dates/bulk-insert', [App\Http\Controllers\RekapController::class, 'bulkInsertFromGDrive'])->name('report-dates.bulk-insert');

        Route::get('kelola-laporan-excel', [App\Http\Controllers\LaporanExcelController::class, 'index'])->name('kelola-laporan-excel');
        Route::post('laporan-excel', [App\Http\Controllers\LaporanExcelController::class, 'store'])->name('laporan-excel.store');
        Route::delete('laporan-excel/{laporanExcelFile}', [App\Http\Controllers\LaporanExcelController::class, 'destroy'])->name('laporan-excel.destroy');

        Route::get('panduan', [App\Http\Controllers\PanduanController::class, 'index'])->name('panduan');

        // Notifications
        Route::get('notifications/count', [App\Http\Controllers\NotificationController::class, 'count'])->name('notifications.count');
        Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    });

    // Routes accessible ONLY by Superadmin
    Route::middleware(['role:superadmin'])->group(function () {
        Route::get('manajemen-user', [App\Http\Controllers\UserController::class, 'manage'])->name('manajemen-user');
        Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update');
        Route::put('users/{user}/password', [App\Http\Controllers\UserController::class, 'updatePassword'])->name('users.update-password');

        Route::get('kelola-notulensi', [App\Http\Controllers\NotulensiController::class, 'index'])->name('kelola-notulensi');
        Route::post('notulensi-links', [App\Http\Controllers\NotulensiController::class, 'store'])->name('notulensi-links.store');
        Route::put('notulensi-links/{notulensiLink}', [App\Http\Controllers\NotulensiController::class, 'update'])->name('notulensi-links.update');
        Route::delete('notulensi-links/{notulensiLink}', [App\Http\Controllers\NotulensiController::class, 'destroy'])->name('notulensi-links.destroy');
        Route::post('notulensi/images', [App\Http\Controllers\NotulensiController::class, 'uploadImages'])->name('notulensi.images.upload');
        Route::delete('notulensi/images/{notulensiImage}', [App\Http\Controllers\NotulensiController::class, 'deleteImage'])->name('notulensi.images.delete');

        Route::get('kelola-infografis', [App\Http\Controllers\InfografisController::class, 'index'])->name('kelola-infografis');
        Route::post('infografis-links', [App\Http\Controllers\InfografisController::class, 'store'])->name('infografis-links.store');
        Route::delete('infografis-links/{infografisLink}', [App\Http\Controllers\InfografisController::class, 'destroy'])->name('infografis-links.destroy');
        Route::post('infografis/scan', [App\Http\Controllers\InfografisController::class, 'scan'])->name('infografis.scan');

        Route::get('kelola-pendaftaran/export', [App\Http\Controllers\DmtPendaftaranController::class, 'export'])->name('kelola-pendaftaran.export');
        Route::get('kelola-pendaftaran', [App\Http\Controllers\DmtPendaftaranController::class, 'index'])->name('kelola-pendaftaran');
        Route::get('kelola-pendaftaran/{dmtData}', [App\Http\Controllers\DmtPendaftaranController::class, 'show'])->name('kelola-pendaftaran.show');
        Route::put('kelola-pendaftaran/{dmtData}/status', [App\Http\Controllers\DmtPendaftaranController::class, 'updateStatus'])->name('kelola-pendaftaran.update-status');
        Route::delete('kelola-pendaftaran/{dmtData}', [App\Http\Controllers\DmtPendaftaranController::class, 'destroy'])->name('kelola-pendaftaran.destroy');
        Route::post('kelola-pendaftaran/sync', [App\Http\Controllers\DmtPendaftaranController::class, 'sync'])->name('kelola-pendaftaran.sync');

        Route::get('kelola-bencana', [App\Http\Controllers\DisasterController::class, 'index'])->name('kelola-bencana');
        Route::post('disasters', [App\Http\Controllers\DisasterController::class, 'store'])->name('disasters.store');
        Route::put('disasters/{disaster}', [App\Http\Controllers\DisasterController::class, 'update'])->name('disasters.update');
        Route::delete('disasters/{disaster}', [App\Http\Controllers\DisasterController::class, 'destroy'])->name('disasters.destroy');
        Route::post('disasters/switch', [App\Http\Controllers\DisasterController::class, 'switch'])->name('disasters.switch');
    });
});

// Public route for downloading excel file
Route::get('/laporan-excel/download', [App\Http\Controllers\LaporanExcelController::class, 'download'])->name('laporan-excel.download');

require __DIR__.'/settings.php';
