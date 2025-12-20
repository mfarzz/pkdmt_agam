<?php

namespace App\Http\Controllers;

use App\Models\NotulensiDate;
use App\Models\NotulensiLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class NotulensiController extends Controller
{
    /**
     * Display the notulensi management page (admin only).
     */
    public function index(Request $request): Response
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        
        $links = NotulensiLink::where('disaster_id', $disasterId)
            ->orderBy('title')
            ->get()
            ->map(function ($link) {
            $sheetId = $this->extractSheetId($link->gdrive_url);
            $totalDates = 0;
            $totalTabs = 0;
            
            if ($sheetId) {
                $totalDates = NotulensiDate::where('sheet_id', $sheetId)->count();
                
                // Get total tabs from sheet info
                try {
                    $apiKey = config('services.google.drive_api_key');
                    if ($apiKey) {
                        $sheetInfo = $this->getSheetInfo($sheetId, $apiKey);
                        $totalTabs = count($sheetInfo['sheets']);
                    }
                } catch (\Exception $e) {
                    // Ignore errors, just set to 0
                }
            }
            
            return [
                'id' => $link->id,
                'title' => $link->title,
                'gdrive_url' => $link->gdrive_url,
                'created_at' => $link->created_at,
                'updated_at' => $link->updated_at,
                'total_tabs' => $totalTabs,
                'total_dates' => $totalDates,
            ];
        });

        return Inertia::render('admin/kelola-notulensi', [
            'links' => $links,
            'success' => $request->session()->get('success'),
        ]);
    }

    /**
     * Store a new notulensi link.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'gdrive_url' => ['required', 'url', 'max:500'],
        ]);

        $link = NotulensiLink::create([
            'title' => $validated['title'],
            'gdrive_url' => $validated['gdrive_url'],
            'disaster_id' => $request->session()->get('admin_active_disaster_id'),
        ]);

        // Auto-scan the sheet immediately
        try {
            $this->scanAndSaveNotulensiDates($link->id);
            return redirect()->route('kelola-notulensi')->with('success', 'Link notulensi berhasil ditambahkan dan di-scan.');
        } catch (\Exception $e) {
            \Log::error('Failed to scan sheet: ' . $e->getMessage());
            return redirect()->route('kelola-notulensi')->with('success', 'Link berhasil ditambahkan, namun terjadi kesalahan saat scan: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing notulensi link.
     */
    public function update(Request $request, NotulensiLink $notulensiLink): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'gdrive_url' => ['required', 'url', 'max:500'],
        ]);

        $notulensiLink->update([
            'title' => $validated['title'],
            'gdrive_url' => $validated['gdrive_url'],
        ]);

        // Refresh model to ensure we have the latest data
        $notulensiLink->refresh();

        // Re-scan the sheet if URL changed
        try {
            $this->scanAndSaveNotulensiDates($notulensiLink->id);
            return redirect()->route('kelola-notulensi')->with('success', 'Link notulensi berhasil diperbarui dan di-scan ulang.');
        } catch (\Exception $e) {
            \Log::error('Failed to scan sheet: ' . $e->getMessage());
            return redirect()->route('kelola-notulensi')->with('success', 'Link berhasil diperbarui, namun terjadi kesalahan saat scan: ' . $e->getMessage());
        }
    }

    /**
     * Delete a notulensi link.
     */
    public function destroy(NotulensiLink $notulensiLink): RedirectResponse
    {
        // Delete all dates associated with this link's sheets
        $sheetId = $this->extractSheetId($notulensiLink->gdrive_url);
        if ($sheetId) {
            NotulensiDate::where('sheet_id', $sheetId)->delete();
        }

        $notulensiLink->delete();

        return redirect()->route('kelola-notulensi')->with('success', 'Link notulensi berhasil dihapus.');
    }

    /**
     * Auto-scan all sheets (API endpoint).
     */
    public function autoScanAll(Request $request): JsonResponse
    {
        try {
            $links = NotulensiLink::whereHas('disaster', function($q) {
                $q->where('is_active', true);
            })->get();
            
            $scannedCount = 0;
            $errors = [];
            
            foreach ($links as $link) {
                try {
                    // Pass link ID only, method will get latest URL from database
                    $this->scanAndSaveNotulensiDates($link->id);
                    $scannedCount++;
                } catch (\Exception $e) {
                    $errorMsg = "Gagal scan sheet '{$link->title}': " . $e->getMessage();
                    \Log::error($errorMsg);
                    $errors[] = $errorMsg;
                }
            }
            
            $message = "Berhasil scan {$scannedCount} sheet.";
            if (count($errors) > 0) {
                $message .= " " . count($errors) . " sheet gagal.";
            }
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'scanned' => $scannedCount,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            \Log::error('Auto-scan all failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan auto-scan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the notulensi calendar page.
     */
    public function calendar(Request $request): Response
    {
        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
        
        // Get all notulensi links for active disaster
        $links = $activeDisaster
            ? NotulensiLink::where('disaster_id', $activeDisaster->id)->orderBy('title')->get()
            : collect([]);

        return Inertia::render('notulensi', [
            'notulensiLinks' => $links,
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
        ]);
    }

    /**
     * Get all notulensi dates for a month.
     */
    public function getMonthNotulensi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2000', 'max:3000'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $year = $validated['year'];
        $month = $validated['month'];

        // Get start and end date of the month
        $startDate = "$year-$month-01";
        $endDate = date('Y-m-t', strtotime($startDate)); // Last day of month

        // Check if user is authenticated
        $isAuthenticated = $request->user() !== null;

        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
        if (!$activeDisaster) {
            return response()->json([
                'success' => true,
                'year' => $year,
                'month' => $month,
                'notulensi' => [],
            ]);
        }

        // Get all notulensi links to map sheet_id to title
        $links = NotulensiLink::where('disaster_id', $activeDisaster->id)
            ->get()
            ->keyBy(function ($link) {
            return $this->extractSheetId($link->gdrive_url);
        });

        // Query all dates in this month
        $notulensiDates = NotulensiDate::whereHas('notulensiLink', function($q) use ($activeDisaster) {
                $q->where('disaster_id', $activeDisaster->id);
            })
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->map(function ($notulensiDate) use ($isAuthenticated, $links) {
                $sheetLink = $notulensiDate->sheet_link;
                
                // If user is not authenticated, convert edit link to view-only (preview) link
                if (!$isAuthenticated) {
                    // Convert from: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid={TAB_ID}
                    // To: https://docs.google.com/spreadsheets/d/{SHEET_ID}/preview#gid={TAB_ID}
                    $sheetLink = str_replace('/edit#', '/preview#', $sheetLink);
                }
                
                // Get link title from sheet_id
                $link = $links->get($notulensiDate->sheet_id);
                $linkTitle = $link ? $link->title : null;
                
                return [
                    'date' => $notulensiDate->date->format('Y-m-d'),
                    'sheet_id' => $notulensiDate->sheet_id,
                    'sheet_link' => $sheetLink,
                    'tab_name' => $notulensiDate->tab_name,
                    'link_title' => $linkTitle,
                ];
            });

        // Organize by date - now supports multiple notulensi per date
        $result = [];
        foreach ($notulensiDates as $notulensiDate) {
            $date = $notulensiDate['date'];
            if (!isset($result[$date])) {
                $result[$date] = [];
            }
            $result[$date][] = [
                'sheet_id' => $notulensiDate['sheet_id'],
                'sheet_link' => $notulensiDate['sheet_link'],
                'tab_name' => $notulensiDate['tab_name'],
                'link_title' => $notulensiDate['link_title'],
            ];
        }

        return response()->json([
            'success' => true,
            'year' => $year,
            'month' => $month,
            'notulensi' => $result,
        ]);
    }

    /**
     * Scan Google Sheet and save all date tabs to database.
     */
    private function scanAndSaveNotulensiDates(int $linkId): void
    {
        // Always get the latest link from database to ensure we use the most recent URL
        $link = NotulensiLink::find($linkId);
        if (!$link) {
            throw new \Exception('Notulensi link tidak ditemukan.');
        }

        // Extract sheet ID from the latest link in database
        $latestSheetId = $this->extractSheetId($link->gdrive_url);
        if (!$latestSheetId) {
            throw new \Exception('Format link Google Sheets tidak valid.');
        }

        // Delete existing dates for this sheet only (use latest sheet ID)
        NotulensiDate::where('sheet_id', $latestSheetId)->delete();

        $apiKey = config('services.google.drive_api_key');
        if (!$apiKey) {
            throw new \Exception('Google Drive API key belum dikonfigurasi.');
        }

        // Get sheet metadata using Google Sheets API v4 (use latest sheet ID)
        $sheetInfo = $this->getSheetInfo($latestSheetId, $apiKey);
        $sheets = $sheetInfo['sheets'];

        // Parse and save each tab
        foreach ($sheets as $sheet) {
            $date = $this->parseDateFromTabName($sheet['title']);
            if ($date) {
                $sheetLink = "https://docs.google.com/spreadsheets/d/{$latestSheetId}/edit#gid={$sheet['sheetId']}";
                
                NotulensiDate::updateOrCreate(
                    [
                        'date' => $date,
                        'sheet_id' => $latestSheetId,
                    ],
                    [
                        'notulensi_link_id' => $linkId,
                        'tab_name' => $sheet['title'],
                        'tab_id' => $sheet['sheetId'],
                        'sheet_link' => $sheetLink,
                    ]
                );
            }
        }
    }

    /**
     * Extract Sheet ID from Google Sheets URL.
     */
    private function extractSheetId(string $url): ?string
    {
        // Format: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
        if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Get sheet info including title and tabs.
     */
    private function getSheetInfo(string $sheetId, string $apiKey): array
    {
        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$sheetId}";

        $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

        $response = Http::withOptions([
            'verify' => $verifySSL,
            'headers' => [
                'Referer' => request()->getSchemeAndHttpHost(),
            ],
        ])->get($url, [
            'fields' => 'properties.title,sheets.properties',
            'key' => $apiKey,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $sheets = [];
            
            if (isset($data['sheets'])) {
                foreach ($data['sheets'] as $sheet) {
                    if (isset($sheet['properties'])) {
                        $props = $sheet['properties'];
                        $sheets[] = [
                            'sheetId' => $props['sheetId'],
                            'title' => $props['title'],
                        ];
                    }
                }
            }
            
            return [
                'title' => $data['properties']['title'] ?? '',
                'sheets' => $sheets,
            ];
        }

        throw new \Exception('Gagal mengambil data dari Google Sheets API: ' . ($response->json()['error']['message'] ?? 'Unknown error'));
    }

    /**
     * Parse date from tab name (e.g., "2025-12-07", "2025-12-7").
     * Format: YYYY-MM-DD
     */
    private function parseDateFromTabName(string $tabName): ?string
    {
        // Normalize tab name: remove extra spaces, trim
        $normalized = trim($tabName);

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
