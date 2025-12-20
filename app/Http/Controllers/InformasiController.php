<?php

namespace App\Http\Controllers;

use App\Models\DmtData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class InformasiController extends Controller
{
    /**
     * Display public page showing DMT information.
     */
    public function public(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $statusFilter = $request->get('status', '');
        $sortBy = $request->get('sort_by', 'tanggal_kedatangan');
        $sortOrder = $request->get('sort_order', 'desc');

        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();

        // Get all DMT data for active disaster
        $query = DmtData::query();
        
        if ($activeDisaster) {
            // Filter by disaster_id and approved status
            $query->where('disaster_id', $activeDisaster->id)
                  ->where('status_pendaftaran', 'approved');
        } else {
            $query->whereRaw('1 = 0'); // No data if no active disaster
        }

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_dmt', 'like', "%{$search}%")
                  ->orWhere('nama_ketua_tim', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nomor_hp', 'like', "%{$search}%");
            });
        }

        // Get all results first (before pagination) to calculate status_penugasan
        // We need to calculate status first before we can filter or sort by it
        $allResults = $query->get();
        
        // Calculate status_penugasan for all items
        $allResults->transform(function ($item) {
            $calculatedStatus = $item->calculateStatusFromDates();
            // Ensure status is set (use existing status_penugasan if calculation returns null)
            $item->status_penugasan = $calculatedStatus ?? $item->status_penugasan ?? null;
            return $item;
        });

        // Apply status filter if needed
        if ($statusFilter && $statusFilter !== 'all') {
            $allResults = $allResults->filter(function ($item) use ($statusFilter) {
                $itemStatus = trim($item->status_penugasan ?? '');
                $filterStatus = trim($statusFilter);
                // Case-insensitive comparison
                return strcasecmp($itemStatus, $filterStatus) === 0;
            });
        }

        // Apply sorting after filtering (so we can sort by status_penugasan if needed)
        $allowedSortColumns = ['nama_dmt', 'nama_ketua_tim', 'tanggal_kedatangan', 'email', 'created_at', 'status_penugasan'];
        $sortBy = in_array($sortBy, $allowedSortColumns) ? $sortBy : 'tanggal_kedatangan';
        
        // Sort the collection
        $sortedResults = $allResults->sortBy(function ($item) use ($sortBy) {
            $value = $item->{$sortBy} ?? '';
            // Handle date sorting
            if (in_array($sortBy, ['tanggal_kedatangan', 'created_at']) && $value) {
                if ($value instanceof \Carbon\Carbon) {
                    return $value->timestamp;
                }
                return strtotime($value);
            }
            // Handle string sorting (case insensitive)
            if (is_string($value)) {
                return strtolower($value);
            }
            return $value;
        }, SORT_REGULAR, $sortOrder === 'desc');
        
        // Reset keys after sorting
        $allResults = $sortedResults->values();

        // Manual pagination after filtering
        $total = $allResults->count();
        $offset = ($page - 1) * $perPage;
        $items = $allResults->slice($offset, $perPage)->values();

        // Create paginator manually
        $dmtData = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Calculate statistics for active disaster
        $statsQuery = DmtData::where('status_pendaftaran', 'approved');
        if ($activeDisaster) {
            $statsQuery->where('disaster_id', $activeDisaster->id);
        } else {
            $statsQuery->whereRaw('1 = 0');
        }
        
        $statistics = [
            'total_tim' => $statsQuery->count(),
            'total_aktif' => (clone $statsQuery)
                ->get()
                ->filter(function ($dmt) {
                    return $dmt->calculateStatusFromDates() === 'Aktif';
                })
                ->count(),
            'total_selesai' => (clone $statsQuery)
                ->get()
                ->filter(function ($dmt) {
                    return $dmt->calculateStatusFromDates() === 'Selesai';
                })
                ->count(),
        ];

        // Calculate aggregate data for visualizations
        $allDmtData = $activeDisaster 
            ? DmtData::where('status_pendaftaran', 'approved')
                ->where('disaster_id', $activeDisaster->id)
                ->get()
            : collect([]);
        
        $aggregateData = [
            'kapasitas' => [
                'rawat_jalan' => $allDmtData->sum('kapasitas_rawat_jalan') ?? 0,
                'rawat_inap' => $allDmtData->sum('kapasitas_rawat_inap') ?? 0,
                'operasi_mayor' => $allDmtData->sum('kapasitas_operasi_bedah_mayor') ?? 0,
                'operasi_minor' => $allDmtData->sum('kapasitas_operasi_bedah_minor') ?? 0,
            ],
            'tenaga_medis' => [
                'dokter_umum' => $allDmtData->sum('jumlah_dokter_umum') ?? 0,
                'perawat' => $allDmtData->sum('jumlah_perawat') ?? 0,
                'bidan' => $allDmtData->sum('jumlah_bidan') ?? 0,
                'apoteker' => $allDmtData->sum('jumlah_apoteker') ?? 0,
                'psikolog' => $allDmtData->sum('jumlah_psikolog') ?? 0,
            ],
        ];

        // Define standard layanan options (same as frontend)
        $standardLayanan = [
            'Anestesi General',
            'Perawatan Intensif / ICU',
            'X-ray',
            'USG',
            'CT Scan',
            'Laboratorium',
            'Bank Darah',
            'Rehabilitasi Medik',
            'Ruang Isolasi',
        ];

        // Calculate jenis layanan data
        $jenisLayananData = [];
        $timDenganLainnya = [];
        
        foreach ($allDmtData as $dmt) {
            if ($dmt->jenis_layanan_tersedia) {
                $layanan = explode(', ', $dmt->jenis_layanan_tersedia);
                $hasLainnya = false;
                
                foreach ($layanan as $l) {
                    $l = trim($l);
                    // Remove "Lainnya: " prefix if exists
                    $l = preg_replace('/^Lainnya:\s*/i', '', $l);
                    $l = trim($l);
                    
                    if (!empty($l)) {
                        // Check if layanan is in standard list
                        if (in_array($l, $standardLayanan)) {
                            $jenisLayananData[$l] = ($jenisLayananData[$l] ?? 0) + 1;
                        } else {
                            // Mark this team as having "Lainnya" layanan
                            $hasLainnya = true;
                        }
                    }
                }
                
                // Count team if it has non-standard layanan
                if ($hasLainnya) {
                    $timDenganLainnya[$dmt->id] = true;
                }
            }
        }
        
        $lainnyaCount = count($timDenganLainnya);
        
        // Convert to array
        $jenisLayananData = collect($jenisLayananData)->map(function ($count, $name) {
            return ['name' => $name, 'count' => $count];
        })->values()->toArray();
        
        // Add "Lainnya" if there are any non-standard layanan
        if ($lainnyaCount > 0) {
            $jenisLayananData[] = ['name' => 'Lainnya', 'count' => $lainnyaCount];
        }
        
        // Sort by count descending
        usort($jenisLayananData, function($a, $b) {
            return $b['count'] - $a['count'];
        });

        // Status_penugasan sudah dihitung dan di-filter sebelum pagination
        // Tidak perlu melakukan transform lagi karena sudah dilakukan sebelumnya

        return Inertia::render('informasi', [
            'dmtData' => $dmtData,
            'statistics' => $statistics,
            'aggregateData' => $aggregateData,
            'jenisLayananData' => $jenisLayananData,
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
        ]);
    }
}
