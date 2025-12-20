<?php

namespace App\Http\Controllers;

use App\Models\ReportDate;
use App\Models\ReportLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class ReportLinkController extends Controller
{
    /**
     * Display the report links management page.
     */
    public function index(Request $request): Response
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        
        $links = ReportLink::where('disaster_id', $disasterId)
            ->orderBy('title')
            ->get()
            ->map(function ($link) {
            $totalDates = ReportDate::where('report_link_id', $link->id)->count();
            
            return [
                'id' => $link->id,
                'title' => $link->title,
                'is_public' => $link->is_public,
                'gdrive_url' => $link->gdrive_url,
                'created_at' => $link->created_at,
                'updated_at' => $link->updated_at,
                'total_dates' => $totalDates,
            ];
        });

        return Inertia::render('admin/kelola-report', [
            'links' => $links,
            'success' => $request->session()->get('success'),
        ]);
    }

    /**
     * Store a new report link.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'is_public' => ['boolean'],
            'gdrive_url' => ['required', 'url', 'max:500'],
        ]);

        $link = ReportLink::create([
            'title' => $validated['title'],
            'is_public' => $validated['is_public'] ?? true,
            'gdrive_url' => $validated['gdrive_url'],
            'disaster_id' => $request->session()->get('admin_active_disaster_id'),
        ]);

        // Auto-scan the PDF folder immediately
        try {
            $this->scanAndSaveReportDates($link->id, $validated['gdrive_url']);
            return redirect()->route('kelola-report')->with('success', 'Link report berhasil ditambahkan dan di-scan.');
        } catch (\Exception $e) {
            \Log::error('Failed to scan report dates: ' . $e->getMessage());
            return redirect()->route('kelola-report')->with('success', 'Link berhasil ditambahkan, namun terjadi kesalahan saat scan: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing report link.
     */
    public function update(Request $request, ReportLink $reportLink): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'is_public' => ['boolean'],
            'gdrive_url' => ['required', 'url', 'max:500'],
        ]);

        $reportLink->update([
            'title' => $validated['title'],
            'is_public' => $validated['is_public'] ?? true,
            'gdrive_url' => $validated['gdrive_url'],
        ]);

        // Refresh model to ensure we have the latest data
        $reportLink->refresh();

        // Re-scan the PDF folder if URL changed
        try {
            // Pass link ID only, method will get latest URL from database
            $this->scanAndSaveReportDates($reportLink->id, $validated['gdrive_url']);
            return redirect()->route('kelola-report')->with('success', 'Link report berhasil diperbarui dan di-scan ulang.');
        } catch (\Exception $e) {
            \Log::error('Failed to scan report dates: ' . $e->getMessage());
            return redirect()->route('kelola-report')->with('success', 'Link berhasil diperbarui, namun terjadi kesalahan saat scan: ' . $e->getMessage());
        }
    }

    /**
     * Delete a report link.
     */
    public function destroy(ReportLink $reportLink): RedirectResponse
    {
        // Delete all dates associated with this link
        ReportDate::where('report_link_id', $reportLink->id)->delete();

        $reportLink->delete();

        return redirect()->route('kelola-report')->with('success', 'Link report berhasil dihapus.');
    }

    /**
     * Get folder contents from Google Drive.
     */
    public function getFolderContents(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'folder_id' => ['required', 'string'],
            'folder_name' => ['nullable', 'string'],
        ]);

        $folderId = $validated['folder_id'];
        $folderName = $validated['folder_name'] ?? '';

        try {
            // Extract folder ID from URL if it's a full URL
            if (preg_match('/\/folders\/([a-zA-Z0-9_-]+)/', $folderId, $matches)) {
                $folderId = $matches[1];
            }

            // Google Drive API v3 endpoint
            // Note: This requires the folder to be publicly accessible or using API key
            $apiKey = config('services.google.drive_api_key');
            
            if (!$apiKey) {
                return response()->json([
                    'success' => false,
                    'message' => 'Google Drive API key belum dikonfigurasi. Tambahkan GOOGLE_DRIVE_API_KEY di file .env',
                ], 400);
            }

            $url = "https://www.googleapis.com/drive/v3/files";

            // Handle SSL certificate issue in Windows development
            $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');
            
            $query = "'{$folderId}' in parents and trashed=false";
            
            // Add referer header to avoid "referer <empty> are blocked" error
            $response = Http::withOptions([
                'verify' => $verifySSL,
                'headers' => [
                    'Referer' => request()->getSchemeAndHttpHost(),
                ],
            ])->get($url, [
                'q' => $query,
                'fields' => 'files(id,name,mimeType,webViewLink,modifiedTime)',
                'orderBy' => 'name',
                'key' => $apiKey,
            ]);

            if ($response->successful()) {
                $files = $response->json('files', []);
                
                // Filter and organize files
                $folders = [];
                $filesList = [];

                foreach ($files as $file) {
                    $item = [
                        'id' => $file['id'],
                        'name' => $file['name'],
                        'type' => strpos($file['mimeType'], 'application/vnd.google-apps.folder') !== false ? 'folder' : 'file',
                        'mimeType' => $file['mimeType'],
                        'link' => $file['webViewLink'] ?? "https://drive.google.com/drive/folders/{$file['id']}",
                        'modifiedTime' => $file['modifiedTime'] ?? null,
                    ];

                    if ($item['type'] === 'folder') {
                        $folders[] = $item;
                    } else {
                        $filesList[] = $item;
                    }
                }

                return response()->json([
                    'success' => true,
                    'folder_id' => $folderId,
                    'folder_name' => $folderName,
                    'folders' => $folders,
                    'files' => $filesList,
                ]);
            }

            // Get error details
            $errorResponse = $response->json();
            $errorMessage = 'Gagal mengambil data dari Google Drive.';
            $helpMessage = '';
            
            if (isset($errorResponse['error'])) {
                $error = $errorResponse['error'];
                if (isset($error['message'])) {
                    $errorMessage = $error['message'];
                    
                    // Check for referer restriction error
                    if (stripos($errorMessage, 'referer') !== false || stripos($errorMessage, 'blocked') !== false) {
                        $helpMessage = ' SOLUSI: Buka Google Cloud Console → APIs & Services → Credentials → Edit API Key → Hapus "HTTP referrers" restrictions atau pilih "IP addresses" restrictions. Request dari server tidak memiliki referer, jadi referer restrictions akan memblokir request.';
                    } elseif (stripos($errorMessage, 'permission') !== false || stripos($errorMessage, 'forbidden') !== false) {
                        $helpMessage = ' Pastikan folder di-share dengan "Anyone with the link" dan API key memiliki akses ke Google Drive API.';
                    }
                } elseif (is_string($error)) {
                    $errorMessage = $error;
                }
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage . $helpMessage,
                'error' => $errorResponse,
                'status' => $response->status(),
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Scan PDF folder and save all date folders to database.
     */
    private function scanAndSaveReportDates(int $reportLinkId, string $gdriveUrl): void
    {
        // Always get the latest link from database to ensure we use the most recent URL
        $link = ReportLink::find($reportLinkId);
        if (!$link) {
            throw new \Exception('Report link tidak ditemukan.');
        }

        // Delete existing dates for this link
        ReportDate::where('report_link_id', $reportLinkId)->delete();

        $apiKey = config('services.google.drive_api_key');
        if (!$apiKey) {
            throw new \Exception('Google Drive API key belum dikonfigurasi.');
        }

        // Always use the link from database, not the parameter
        $mainFolderId = $this->extractFolderId($link->gdrive_url);
        if (!$mainFolderId) {
            throw new \Exception('Format link Google Drive tidak valid.');
        }

        // Find PDF subfolder
        $pdfSubfolderId = $this->findFolderByName($mainFolderId, 'PDF', $apiKey);
        if (!$pdfSubfolderId) {
            // No PDF folder found, nothing to save
            return;
        }

        // Get all folders in PDF subfolder
        $dateFolders = $this->getAllDateFolders($pdfSubfolderId, $apiKey);

        // Parse and save each date folder
        foreach ($dateFolders as $folder) {
            $date = $this->parseDateFromFolderName($folder['name']);
            if ($date) {
                ReportDate::updateOrCreate(
                    [
                        'report_link_id' => $reportLinkId,
                        'date' => $date,
                    ],
                    [
                        'folder_link' => $folder['link'],
                    ]
                );
            }
        }
    }

    /**
     * Extract folder ID from Google Drive URL.
     */
    private function extractFolderId(string $url): ?string
    {
        if (preg_match('/\/folders\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Find folder by name in parent folder.
     */
    private function findFolderByName(string $parentId, string $folderName, string $apiKey): ?string
    {
        $url = "https://www.googleapis.com/drive/v3/files";
        $query = "'{$parentId}' in parents and name='{$folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false";

        $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

        $response = Http::withOptions([
            'verify' => $verifySSL,
            'headers' => [
                'Referer' => request()->getSchemeAndHttpHost(),
            ],
        ])->get($url, [
            'q' => $query,
            'fields' => 'files(id,name)',
            'key' => $apiKey,
        ]);

        if ($response->successful()) {
            $files = $response->json('files', []);
            if (!empty($files)) {
                return $files[0]['id'];
            }
        }

        return null;
    }

    /**
     * Get all date folders in PDF subfolder.
     */
    private function getAllDateFolders(string $parentId, string $apiKey): array
    {
        $url = "https://www.googleapis.com/drive/v3/files";
        $query = "'{$parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false";

        $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

        $response = Http::withOptions([
            'verify' => $verifySSL,
            'headers' => [
                'Referer' => request()->getSchemeAndHttpHost(),
            ],
        ])->get($url, [
            'q' => $query,
            'fields' => 'files(id,name,webViewLink)',
            'orderBy' => 'name',
            'key' => $apiKey,
        ]);

        if ($response->successful()) {
            $folders = $response->json('files', []);
            $result = [];
            foreach ($folders as $folder) {
                $result[] = [
                    'id' => $folder['id'],
                    'name' => $folder['name'],
                    'link' => $folder['webViewLink'] ?? "https://drive.google.com/drive/folders/{$folder['id']}",
                ];
            }
            return $result;
        }

        return [];
    }

    /**
     * Parse date from folder name (e.g., "2025-12-07", "2025-12-7").
     * Format: YYYY-MM-DD
     */
    private function parseDateFromFolderName(string $folderName): ?string
    {
        // Normalize folder name: remove extra spaces, trim
        $normalized = trim($folderName);

        // Pattern: YYYY-MM-DD (e.g., "2025-12-07", "2025-12-7")
        // Accepts both 2-digit and 1-digit day/month
        if (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', $normalized, $matches)) {
            $year = (int)$matches[1];
            $month = (int)$matches[2];
            $day = (int)$matches[3];

            // Validate date
            if (checkdate($month, $day, $year)) {
                // Format as YYYY-MM-DD with leading zeros
                $month = str_pad($month, 2, '0', STR_PAD_LEFT);
                $day = str_pad($day, 2, '0', STR_PAD_LEFT);
                return "$year-$month-$day";
            }
        }

        return null;
    }
}
