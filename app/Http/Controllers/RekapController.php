<?php

namespace App\Http\Controllers;

use App\Models\ReportDate;
use App\Models\ReportWeek;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        
        // Get weekly reports for active disaster
        $weeklyReports = $activeDisaster
            ? ReportWeek::where('disaster_id', $activeDisaster->id)
                ->orderBy('year', 'desc')
                ->orderBy('week_number', 'desc')
                ->get()
                ->map(function ($week) {
                    return [
                        'id' => $week->id,
                        'week_start_date' => $week->week_start_date->format('Y-m-d'),
                        'week_end_date' => $week->week_end_date->format('Y-m-d'),
                        'week_number' => $week->week_number,
                        'year' => $week->year,
                        'week_period' => $week->week_start_date->locale('id')->isoFormat('D MMM') . ' - ' . $week->week_end_date->locale('id')->isoFormat('D MMM YYYY'),
                        'file_path' => $week->file_path ? Storage::url($week->file_path) : null,
                        'file_name' => $week->file_name,
                        'file_size' => $week->file_size,
                        'description' => $week->description,
                        'is_dmt' => $week->is_dmt,
                    ];
                })
            : collect([]);

        // Get active excel file
        $excelFile = $activeDisaster
            ? \App\Models\LaporanExcelFile::where('disaster_id', $activeDisaster->id)->where('is_active', true)->first()
            : null;

        return Inertia::render('rekap', [
            'weeklyReports' => $weeklyReports,
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
            'excelFile' => $excelFile,
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

        // Query all dates in this month
        $reportDates = ReportDate::whereBetween('date', [$startDate, $endDate])
            ->get()
            ->map(function ($reportDate) {
                return [
                    'id' => $reportDate->id,
                    'date' => $reportDate->date->format('Y-m-d'),
                    'is_dmt' => $reportDate->is_dmt,
                    'file_path' => $reportDate->file_path ? Storage::url($reportDate->file_path) : null,
                    'file_name' => $reportDate->file_name,
                    'file_size' => $reportDate->file_size,
                ];
            });

        // Organize by date and type
        $result = [];
        foreach ($reportDates as $reportDate) {
            $date = $reportDate['date'];
            $typeKey = $reportDate['is_dmt'] ? 'DMT' : 'HEOC';
            
            if (!isset($result[$date])) {
                $result[$date] = [];
            }
            
            if (!isset($result[$date][$typeKey])) {
                $result[$date][$typeKey] = [];
            }
            
            $result[$date][$typeKey][] = [
                'id' => $reportDate['id'],
                'file_path' => $reportDate['file_path'],
                'file_name' => $reportDate['file_name'],
                'file_size' => $reportDate['file_size'],
            ];
        }

        // Get weekly reports for this month
        $weeklyReports = ReportWeek::where('disaster_id', $activeDisaster->id)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('week_start_date', [$startDate, $endDate])
                    ->orWhereBetween('week_end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('week_start_date', '<=', $startDate)
                          ->where('week_end_date', '>=', $endDate);
                    });
            })
            ->get()
            ->map(function ($week) {
                return [
                    'week_start_date' => $week->week_start_date->format('Y-m-d'),
                    'week_end_date' => $week->week_end_date->format('Y-m-d'),
                    'week_number' => $week->week_number,
                    'year' => $week->year,
                    'week_period' => $week->week_start_date->format('d M') . ' - ' . $week->week_end_date->format('d M Y'),
                    'link' => $week->file_path ? Storage::url($week->file_path) : null,
                    'file_name' => $week->file_name,
                    'description' => $week->description,
                    'is_dmt' => $week->is_dmt,
                ];
            });

        // Add weekly reports to result (add to each day in the week)
        foreach ($weeklyReports as $week) {
            $weekStart = new \DateTime($week['week_start_date']);
            $weekEnd = new \DateTime($week['week_end_date']);
            $current = clone $weekStart;
            
            while ($current <= $weekEnd) {
                $dateStr = $current->format('Y-m-d');
                if (!isset($result[$dateStr])) {
                    $result[$dateStr] = [];
                }
                
                $typeKey = '_weekly';
                $result[$dateStr][$typeKey] = $week;
                $current->modify('+1 day');
            }
        }

        return response()->json([
            'success' => true,
            'year' => $year,
            'month' => $month,
            'reports' => $result,
        ]);
    }

    /**
     * Upload daily report (manual upload).
     */
    public function uploadDailyReport(Request $request): \Illuminate\Http\RedirectResponse
    {
        try {
            $request->validate([
                'date' => 'required|date',
                'is_dmt' => 'required|boolean',
                'files' => 'required|array',
                'files.*' => 'required|file|mimes:pdf|max:2048',
            ]);

            $date = $request->date;
            $isDmt = $request->is_dmt;
            $files = $request->file('files');
            
            $typePath = $isDmt ? 'dmt' : 'heoc';
            
            $disasterId = $request->session()->get('admin_active_disaster_id');
            if (!$disasterId) {
                return back()->withErrors(['files' => 'Bencana aktif tidak ditemukan. Silakan pilih bencana di dashboard.']);
            }

            foreach ($files as $file) {
                $fileName = $file->getClientOriginalName();
                $fileSize = $file->getSize();
                $extension = $file->getClientOriginalExtension();
                
                // Generate unique filename
                $uniqueName = 'report-' . $typePath . '-' . uniqid() . '.' . $extension;
                
                // Store in daily folder organized by date and type
                $filePath = $file->storeAs('reports/daily/' . $typePath . '/' . $date, $uniqueName, 'public');
                
                // Save to database
                ReportDate::create([
                    'disaster_id' => $disasterId,
                    'is_dmt' => $isDmt,
                    'date' => $date,
                    'file_path' => $filePath,
                    'file_name' => $fileName,
                    'file_size' => $fileSize,
                    'uploaded_by' => auth()->id(),
                ]);
            }
            
            return back()->with('success', count($files) . ' report berhasil diupload.');
        } catch (\Exception $e) {
            \Log::error('Upload daily report failed: ' . $e->getMessage());
            return back()->withErrors(['files' => 'Gagal upload report: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete daily report.
     */
    public function deleteDailyReport(Request $request, int $id): \Illuminate\Http\RedirectResponse
    {
        try {
            $reportDate = ReportDate::findOrFail($id);
            
            // Delete file from storage
            if ($reportDate->file_path && Storage::disk('public')->exists($reportDate->file_path)) {
                Storage::disk('public')->delete($reportDate->file_path);
            }
            
            // Delete from database
            $reportDate->delete();
            
            return back()->with('success', 'Report berhasil dihapus.');
        } catch (\Exception $e) {
            \Log::error('Delete daily report failed: ' . $e->getMessage());
            return back()->with('error', 'Gagal hapus report: ' . $e->getMessage());
        }
    }

    /**
     * Download report file.
     */
    public function downloadReportFile(int $id)
    {
        try {
            $reportDate = ReportDate::findOrFail($id);
            
            if ($reportDate->file_path && Storage::disk('public')->exists($reportDate->file_path)) {
                return Storage::disk('public')->download($reportDate->file_path, $reportDate->file_name);
            }
            
            abort(404, 'File tidak ditemukan.');
        } catch (\Exception $e) {
            \Log::error('Download report file failed: ' . $e->getMessage());
            abort(500, 'Gagal download file.');
        }
    }

    /**
     * Upload weekly report manually.
     */
    public function uploadWeeklyReport(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'week_start_date' => ['required', 'date'],
            'week_end_date' => ['required', 'date'],
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'], // Max 10MB
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $disasterId = $request->session()->get('admin_active_disaster_id');
        if (!$disasterId) {
            return back()->with('error', 'Bencana aktif tidak ditemukan.');
        }

        $weekStartDate = $request->week_start_date;
        $weekEndDate = $request->week_end_date;
        $isDmt = true; // Default to true or just ignore
        $file = $request->file('file');
        $description = $request->description ?? null;

        try {
            // Calculate week number and year from start date
            $startDate = new \DateTime($weekStartDate);
            $year = (int)$startDate->format('o'); // ISO week-numbering year
            $weekNumber = (int)$startDate->format('W'); // ISO week number

            // Generate unique filename
            $filename = 'report_mingguan_' . $disasterId . '_' . $year . '_W' . str_pad($weekNumber, 2, '0', STR_PAD_LEFT) . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store in public disk
            $path = $file->storeAs('reports/weekly/' . $disasterId . '/' . $year, $filename, 'public');
            
            if ($path) {
                ReportWeek::updateOrCreate(
                    [
                        'week_start_date' => $weekStartDate,
                        'disaster_id' => $disasterId,
                    ],
                    [
                        'week_end_date' => $weekEndDate,
                        'week_number' => $weekNumber,
                        'year' => $year,
                        'file_path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'description' => $description,
                    ]
                );

                return back()->with('success', 'Report mingguan berhasil diupload.');
            } else {
                return back()->with('error', 'Gagal menyimpan file.');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to upload weekly report: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengupload report: ' . $e->getMessage());
        }
    }

    /**
     * Delete a weekly report.
     */
    public function deleteWeeklyReport(Request $request, ReportWeek $reportWeek): \Illuminate\Http\RedirectResponse
    {
        try {
            // Delete file from storage
            if ($reportWeek->file_path && Storage::disk('public')->exists($reportWeek->file_path)) {
                Storage::disk('public')->delete($reportWeek->file_path);
            }
            
            $reportWeek->delete();
            
            return back()->with('success', 'Report mingguan berhasil dihapus.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete weekly report: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus report: ' . $e->getMessage());
        }
    }

    /**
     * Display the weekly reports management page.
     */
    public function indexMingguan(Request $request): Response
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        
        $weeklyReports = ReportWeek::where('disaster_id', $disasterId)
            ->orderBy('year', 'desc')
            ->orderBy('week_number', 'desc')
            ->get()
            ->map(function ($week) {
                return [
                    'id' => $week->id,
                    'week_start_date' => $week->week_start_date->format('Y-m-d'),
                    'week_end_date' => $week->week_end_date->format('Y-m-d'),
                    'week_number' => $week->week_number,
                    'year' => $week->year,
                    'week_period' => $week->week_start_date->locale('id')->isoFormat('D MMM') . ' - ' . $week->week_end_date->locale('id')->isoFormat('D MMM YYYY'),
                    'file_path' => $week->file_path ? Storage::url($week->file_path) : null,
                    'file_name' => $week->file_name,
                    'file_size' => $week->file_size,
                    'description' => $week->description,
                    'source_type' => 'manual',
                ];
            });
        
        return Inertia::render('admin/kelola-report-mingguan', [
            'weeklyReports' => $weeklyReports,
            'success' => $request->session()->get('success'),
        ]);
    }

    /**
     * Display the DMT daily reports management page.
     */
    public function indexDMT(Request $request): Response
    {
        // Get reports for DMT and group by date
        $reports = ReportDate::where('is_dmt', true)
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy(function($report) {
                return $report->date->format('Y-m-d');
            })
            ->map(function ($group, $date) {
                return [
                    'date' => $date,
                    'files' => $group->map(function ($report) {
                        return [
                            'id' => $report->id,
                            'file_name' => $report->file_name,
                            'file_path' => $report->file_path ? Storage::url($report->file_path) : null,
                            'file_size' => $report->file_size,
                        ];
                    }),
                ];
            })
            ->values();
        
        return Inertia::render('admin/kelola-report-dmt', [
            'reports' => $reports,
            'success' => $request->session()->get('success'),
        ]);
    }

    /**
     * Display the HEOC daily reports management page.
     */
    public function indexHEOC(Request $request): Response
    {
        // Get reports for HEOC and group by date
        $reports = ReportDate::where('is_dmt', false)
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy(function($report) {
                return $report->date->format('Y-m-d');
            })
            ->map(function ($group, $date) {
                return [
                    'date' => $date,
                    'files' => $group->map(function ($report) {
                        return [
                            'id' => $report->id,
                            'file_name' => $report->file_name,
                            'file_path' => $report->file_path ? Storage::url($report->file_path) : null,
                            'file_size' => $report->file_size,
                        ];
                    }),
                ];
            })
            ->values();
        
        return Inertia::render('admin/kelola-report-heoc', [
            'reports' => $reports,
            'success' => $request->session()->get('success'),
        ]);
    }
}
