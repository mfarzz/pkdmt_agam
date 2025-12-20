<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DmtData;
use App\Models\Disaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        // Get active disaster from session (admin's selected disaster)
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $activeDisaster = $disasterId ? Disaster::find($disasterId) : Disaster::where('is_active', true)->first();
        
        // Calculate aggregate data for visualizations (only from active teams)
        // Exclude rejected registrations from statistics
        $baseQuery = DmtData::where(function($q) {
            $q->where('status_pendaftaran', '!=', 'rejected')
              ->orWhereNull('status_pendaftaran');
        });
        
        // Filter by active disaster
        if ($activeDisaster) {
            $baseQuery->where('disaster_id', $activeDisaster->id);
        } else {
            $baseQuery->whereRaw('1 = 0');
        }

        // Get all approved teams and filter by calculated status
        $allTeams = (clone $baseQuery)->get();
        $activeTeams = $allTeams->filter(function($team) {
            return $team->calculateStatusFromDates() === 'Aktif';
        });

        // Calculate aggregate data for visualizations (only from active teams)
        $aggregateData = (object) [
            'total_rawat_jalan' => $activeTeams->sum('kapasitas_rawat_jalan') ?? 0,
            'total_rawat_inap' => $activeTeams->sum('kapasitas_rawat_inap') ?? 0,
            'total_operasi_mayor' => $activeTeams->sum('kapasitas_operasi_bedah_mayor') ?? 0,
            'total_operasi_minor' => $activeTeams->sum('kapasitas_operasi_bedah_minor') ?? 0,
            'total_dokter_umum' => $activeTeams->sum('jumlah_dokter_umum') ?? 0,
            'total_perawat' => $activeTeams->sum('jumlah_perawat') ?? 0,
            'total_bidan' => $activeTeams->sum('jumlah_bidan') ?? 0,
            'total_apoteker' => $activeTeams->sum('jumlah_apoteker') ?? 0,
            'total_psikolog' => $activeTeams->sum('jumlah_psikolog') ?? 0,
            'total_staf_logistik' => $activeTeams->sum('jumlah_staf_logistik') ?? 0,
            'total_staf_administrasi' => $activeTeams->sum('jumlah_staf_administrasi') ?? 0,
            'total_petugas_keamanan' => $activeTeams->sum('jumlah_petugas_keamanan') ?? 0,
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

        // Calculate jenis layanan frequency from active teams
        $jenisLayananCount = [];
        $timDenganLainnya = [];
        
        foreach ($activeTeams as $team) {
            if (empty($team->jenis_layanan_tersedia)) {
                continue;
            }
            // Parse jenis layanan (stored as comma-separated string)
            $layananList = array_map('trim', explode(',', $team->jenis_layanan_tersedia));
            $hasLainnya = false;
            
            foreach ($layananList as $layanan) {
                if (empty($layanan)) {
                    continue;
                }
                // Remove "Lainnya: " prefix if exists
                $cleanLayanan = preg_replace('/^Lainnya:\s*/i', '', $layanan);
                $cleanLayanan = trim($cleanLayanan);
                
                if (!empty($cleanLayanan)) {
                    // Check if layanan is in standard list
                    if (in_array($cleanLayanan, $standardLayanan)) {
                        if (!isset($jenisLayananCount[$cleanLayanan])) {
                            $jenisLayananCount[$cleanLayanan] = 0;
                        }
                        $jenisLayananCount[$cleanLayanan]++;
                    } else {
                        // Mark this team as having "Lainnya" layanan
                        $hasLainnya = true;
                    }
                }
            }
            
            // Count team if it has non-standard layanan
            if ($hasLainnya) {
                $timDenganLainnya[$team->id] = true;
            }
        }
        
        $lainnyaCount = count($timDenganLainnya);

        // Convert to array
        $jenisLayananData = [];
        foreach ($jenisLayananCount as $name => $count) {
            $jenisLayananData[] = ['name' => $name, 'count' => $count];
        }
        
        // Add "Lainnya" if there are any non-standard layanan
        if ($lainnyaCount > 0) {
            $jenisLayananData[] = ['name' => 'Lainnya', 'count' => $lainnyaCount];
        }
        
        // Sort by count descending
        usort($jenisLayananData, function($a, $b) {
            return $b['count'] - $a['count'];
        });

        // Calculate statistics
        $statistics = [
            'total_tim' => $allTeams->count(),
            'total_aktif' => $activeTeams->count(),
            'total_selesai' => $allTeams->filter(function($team) {
                return $team->calculateStatusFromDates() === 'Selesai';
            })->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'success' => $request->session()->get('success'),
            'statistics' => $statistics,
            'aggregateData' => [
                'kapasitas' => [
                    'rawat_jalan' => (int)($aggregateData->total_rawat_jalan ?? 0),
                    'rawat_inap' => (int)($aggregateData->total_rawat_inap ?? 0),
                    'operasi_mayor' => (int)($aggregateData->total_operasi_mayor ?? 0),
                    'operasi_minor' => (int)($aggregateData->total_operasi_minor ?? 0),
                ],
                'tenaga_medis' => [
                    'dokter_umum' => (int)($aggregateData->total_dokter_umum ?? 0),
                    'perawat' => (int)($aggregateData->total_perawat ?? 0),
                    'bidan' => (int)($aggregateData->total_bidan ?? 0),
                    'apoteker' => (int)($aggregateData->total_apoteker ?? 0),
                    'psikolog' => (int)($aggregateData->total_psikolog ?? 0),
                    'staf_logistik' => (int)($aggregateData->total_staf_logistik ?? 0),
                    'staf_administrasi' => (int)($aggregateData->total_staf_administrasi ?? 0),
                    'petugas_keamanan' => (int)($aggregateData->total_petugas_keamanan ?? 0),
                ],
            ],
            'jenisLayananData' => $jenisLayananData,
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('manajemen-user')->with('success', 'User berhasil dibuat.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        // Update password hanya jika diisi
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        $message = !empty($validated['password']) 
            ? 'User dan password berhasil diupdate.' 
            : 'User berhasil diupdate.';

        return redirect()->route('manajemen-user')->with('success', $message);
    }

    /**
     * Update the password of the specified user.
     */
    public function updatePassword(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('manajemen-user')->with('success', 'Password user berhasil diupdate.');
    }

    /**
     * Display a listing of users for management.
     */
    public function manage(Request $request): Response
    {
        $users = User::latest()->paginate(10);

        return Inertia::render('admin/manajemen-user', [
            'users' => $users,
            'success' => $request->session()->get('success'),
        ]);
    }
}

