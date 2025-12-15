<?php

namespace App\Http\Controllers;

use App\Models\ReportDate;
use App\Models\ReportLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class RekapController extends Controller
{
    /**
     * Display the rekap page.
     */
    public function index(Request $request): Response
    {
        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
        
        // Get report links for active disaster
        $reportLinks = $activeDisaster 
            ? ReportLink::where('disaster_id', $activeDisaster->id)->orderBy('title')->get() 
            : collect([]);

        return Inertia::render('rekap', [
            'reportLinks' => $reportLinks,
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
        ]);
    }

    /**
     * Get all report dates for a month.
     */
    public function getMonthReports(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2000', 'max:3000'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $year = $validated['year'];
        $month = $validated['month'];
        $isAuthenticated = $request->user() !== null;

        // Get start and end date of the month
        $startDate = "$year-$month-01";
        $endDate = date('Y-m-t', strtotime($startDate)); // Last day of month

        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
        if (!$activeDisaster) {
            return response()->json([
                'success' => true,
                'year' => $year,
                'month' => $month,
                'reports' => [],
            ]);
        }

        // Get report links based on access and active disaster
        $reportLinkIds = ReportLink::where('disaster_id', $activeDisaster->id)
            ->where(function ($query) use ($isAuthenticated) {
            $query->where('is_public', true);
            if ($isAuthenticated) {
                $query->orWhere('is_public', false);
            }
        })->pluck('id');

        // Query all dates in this month for accessible links
        $reportDates = ReportDate::whereBetween('date', [$startDate, $endDate])
            ->whereIn('report_link_id', $reportLinkIds)
            ->with('reportLink')
            ->get()
            ->map(function ($reportDate) {
                return [
                    'date' => $reportDate->date->format('Y-m-d'),
                    'link_id' => $reportDate->report_link_id,
                    'link_title' => $reportDate->reportLink->title ?? '',
                    'is_public' => $reportDate->reportLink->is_public ?? true,
                    'folder_link' => $reportDate->folder_link,
                ];
            });

        // Organize by date and link_id
        $result = [];
        foreach ($reportDates as $reportDate) {
            $date = $reportDate['date'];
            $linkId = $reportDate['link_id'];
            if (!isset($result[$date])) {
                $result[$date] = [];
            }
            $result[$date][$linkId] = [
                'title' => $reportDate['link_title'],
                'folder_link' => $reportDate['folder_link'],
                'is_public' => $reportDate['is_public'],
            ];
        }

        return response()->json([
            'success' => true,
            'year' => $year,
            'month' => $month,
            'reports' => $result,
        ]);
    }

    /**
     * Auto-scan all report links (public endpoint).
     */
    public function autoScanAll(Request $request): JsonResponse
    {
        try {
            // Only scan active disaster links for public endpoint
            $links = ReportLink::whereHas('disaster', function($q) {
                $q->where('is_active', true);
            })->get();
            
            $scannedCount = 0;
            $errors = [];
            
            foreach ($links as $link) {
                try {
                    $this->scanAndSaveReportDates($link->id, $link->gdrive_url);
                    $scannedCount++;
                } catch (\Exception $e) {
                    $errorMsg = "Gagal scan '{$link->title}': " . $e->getMessage();
                    \Log::error($errorMsg);
                    $errors[] = $errorMsg;
                }
            }
            
            $message = "Berhasil scan {$scannedCount} report link.";
            if (count($errors) > 0) {
                $message .= " " . count($errors) . " report link gagal.";
            }
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'scanned' => $scannedCount,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            \Log::error('Auto-scan report links failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan auto-scan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get report files for a specific date and link.
     */
    public function getReportFiles(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'link_id' => ['required', 'integer'],
        ]);

        $date = $validated['date'];
        $linkId = $validated['link_id'];
        $isAuthenticated = $request->user() !== null;

        // Check if link exists and user has access
        $link = ReportLink::find($linkId);
        if (!$link) {
            return response()->json([
                'success' => false,
                'message' => 'Link report tidak ditemukan.',
            ], 404);
        }

        // Check access: if not public, user must be authenticated
        if (!$link->is_public && !$isAuthenticated) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Login diperlukan untuk melihat laporan ini.',
            ], 403);
        }

        // Query database for this date and link
        $reportDate = ReportDate::where('report_link_id', $linkId)
            ->where('date', $date)
            ->first();

        if ($reportDate) {
            return response()->json([
                'success' => true,
                'date' => $date,
                'link_id' => $linkId,
                'link_title' => $link->title,
                'folder_link' => $reportDate->folder_link,
            ]);
        }

        // No folder found for this date
        return response()->json([
            'success' => false,
            'date' => $date,
            'link_id' => $linkId,
            'folder_link' => null,
            'message' => 'Tidak ada folder untuk tanggal ini.',
        ]);
    }

    /**
     * Scan PDF folder and save all date folders to database.
     */
    private function scanAndSaveReportDates(int $reportLinkId, string $gdriveUrl): void
    {
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

        // Extract folder ID from URL
        $mainFolderId = $this->extractFolderId($gdriveUrl);
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
     * Parse date from folder name (e.g., "7 Des 2025", "7 Desember 2025").
     */
    private function parseDateFromFolderName(string $folderName): ?string
    {
        // Indonesian month names
        $months = [
            'januari' => '01', 'jan' => '01',
            'februari' => '02', 'feb' => '02',
            'maret' => '03', 'mar' => '03',
            'april' => '04', 'apr' => '04',
            'mei' => '05', 'may' => '05',
            'juni' => '06', 'jun' => '06',
            'juli' => '07', 'jul' => '07',
            'agustus' => '08', 'agu' => '08', 'aug' => '08',
            'september' => '09', 'sep' => '09',
            'oktober' => '10', 'okt' => '10', 'oct' => '10',
            'november' => '11', 'nov' => '11',
            'desember' => '12', 'des' => '12', 'dec' => '12',
        ];

        // Normalize folder name: remove extra spaces, convert to lowercase
        $normalized = strtolower(trim($folderName));
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        // Pattern: day month year (e.g., "7 des 2025", "7 desember 2025")
        if (preg_match('/^(\d+)\s+([a-z]+)\s+(\d{4})$/', $normalized, $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $monthName = $matches[2];
            $year = $matches[3];

            if (isset($months[$monthName])) {
                $month = $months[$monthName];
                $date = "$year-$month-$day";
                
                // Validate date
                if (checkdate((int)$month, (int)$day, (int)$year)) {
                    return $date;
                }
            }
        }

        return null;
    }

}

