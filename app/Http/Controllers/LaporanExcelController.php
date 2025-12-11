<?php

namespace App\Http\Controllers;

use App\Models\LaporanExcelFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class LaporanExcelController extends Controller
{
    /**
     * Display the laporan excel management page.
     */
    public function index(Request $request): InertiaResponse
    {
        $excelFile = LaporanExcelFile::where('is_active', true)->first();

        return Inertia::render('admin/kelola-laporan-excel', [
            'excelFile' => $excelFile,
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ]);
    }

    /**
     * Store or update laporan excel file.
     */
    public function store(Request $request): RedirectResponse
    {
        // Try to get file from allFiles() first (sometimes hasFile() doesn't work with Inertia)
        $allFiles = $request->allFiles();
        $file = null;
        
        if (!empty($allFiles) && isset($allFiles['excel_file'])) {
            $file = $allFiles['excel_file'];
        } elseif ($request->hasFile('excel_file')) {
            $file = $request->file('excel_file');
        }
        
        if (!$file) {
            $fileSizeMB = $request->header('Content-Length') ? number_format($request->header('Content-Length') / 1024 / 1024, 2) : 'tidak diketahui';
            $errorMsg = 'File tidak ditemukan. Pastikan file tidak melebihi ' . ini_get('upload_max_filesize') . ' dan ukuran POST tidak melebihi ' . ini_get('post_max_size') . '. Ukuran file saat ini: ' . $fileSizeMB . ' MB.';
            $errorMsg .= ' Untuk mengatasi masalah ini, ubah file php.ini di: ' . php_ini_loaded_file() . ' dan set upload_max_filesize = 10M serta post_max_size = 12M, lalu restart server.';
            return redirect()->route('kelola-laporan-excel')->with('error', $errorMsg);
        }
        
        // Check if file is valid
        if (!$file->isValid()) {
            $errorMsg = 'File upload gagal: ' . $file->getErrorMessage();
            
            // Add helpful message if file exceeds upload limit
            if ($file->getError() == UPLOAD_ERR_INI_SIZE || $file->getError() == UPLOAD_ERR_FORM_SIZE) {
                $errorMsg .= ' Untuk mengatasi masalah ini, ubah file php.ini di: ' . php_ini_loaded_file();
                $errorMsg .= ' dan set upload_max_filesize = 10M serta post_max_size = 12M, lalu restart server PHP.';
            }
            
            return redirect()->route('kelola-laporan-excel')->with('error', $errorMsg);
        }
        
        try {
            // Manual validation for .xlsm files
            // Sometimes .xlsm files are detected as .xlsx mime type, so we validate by extension
            $extension = strtolower($file->getClientOriginalExtension());
            
            if ($extension !== 'xlsm') {
                throw new \Illuminate\Validation\ValidationException(
                    validator([], []),
                    ['excel_file' => ['File harus berformat .xlsm (Excel Macro-Enabled Workbook).']]
                );
            }
            
            // Check file size (max 10MB = 10240 KB)
            $fileSizeKB = $file->getSize() / 1024;
            if ($fileSizeKB > 10240) {
                throw new \Illuminate\Validation\ValidationException(
                    validator([], []),
                    ['excel_file' => ['Ukuran file tidak boleh melebihi 10MB.']]
                );
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        }

        try {
            // Deactivate all existing files
            LaporanExcelFile::where('is_active', true)->update(['is_active' => false]);

            // Get mime type with fallback
            try {
                $mimeType = $file->getMimeType();
            } catch (\Exception $e) {
                $mimeType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
            }
            
            $fileName = 'laporan_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Ensure directory exists
            Storage::disk('public')->makeDirectory('laporan-excel');
            
            // Store file using Storage facade
            $filePath = Storage::disk('public')->putFileAs('laporan-excel', $file, $fileName);

            if (!$filePath || !Storage::disk('public')->exists($filePath)) {
                throw new \Exception('Gagal menyimpan file ke storage.');
            }

            // Create database record
            $excelFile = LaporanExcelFile::create([
                'file_name' => $fileName,
                'file_path' => $filePath,
                'original_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $mimeType,
                'is_active' => true,
            ]);

            return redirect()->route('kelola-laporan-excel')->with('success', 'File Excel berhasil diunggah.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Failed to upload excel file: ' . $e->getMessage());
            return redirect()->route('kelola-laporan-excel')->with('error', 'Gagal mengunggah file: ' . $e->getMessage());
        }
    }

    /**
     * Download the active laporan excel file.
     */
    public function download(): StreamedResponse
    {
        $excelFile = LaporanExcelFile::where('is_active', true)->first();

        if (!$excelFile) {
            abort(404, 'File Excel tidak ditemukan.');
        }

        // Use Storage facade to get the correct path
        if (!Storage::disk('public')->exists($excelFile->file_path)) {
            abort(404, 'File Excel tidak ditemukan di server.');
        }

        return Storage::disk('public')->download($excelFile->file_path, $excelFile->original_name, [
            'Content-Type' => $excelFile->mime_type,
        ]);
    }

    /**
     * Delete laporan excel file.
     */
    public function destroy(Request $request, LaporanExcelFile $laporanExcelFile): RedirectResponse
    {
        try {
            // Delete file from storage
            if (Storage::disk('public')->exists($laporanExcelFile->file_path)) {
                Storage::disk('public')->delete($laporanExcelFile->file_path);
            }

            // Delete database record
            $laporanExcelFile->delete();

            return redirect()->route('kelola-laporan-excel')->with('success', 'File Excel berhasil dihapus.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete excel file: ' . $e->getMessage());
            return redirect()->route('kelola-laporan-excel')->with('error', 'Gagal menghapus file: ' . $e->getMessage());
        }
    }
}
