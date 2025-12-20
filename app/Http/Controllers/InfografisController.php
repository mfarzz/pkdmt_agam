<?php

namespace App\Http\Controllers;

use App\Models\Infografis;
use App\Models\InfografisLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class InfografisController extends Controller
{
    /**
     * Display admin page for managing infografis folder link.
     */
    public function index(Request $request): Response
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $infografisLink = InfografisLink::where('disaster_id', $disasterId)->first();

        $perPage = $request->get('per_page', 12);
        $page = $request->get('page', 1);

        // Get all infografis for this link
        $query = $infografisLink ? Infografis::where('infografis_link_id', $infografisLink->id) : Infografis::whereRaw('1 = 0');

        $allInfografis = $query->get()->map(function ($item) {
            // Ensure URL format is correct for embedding
            $item->file_url = $this->ensureCorrectImageUrl($item->file_id, $item->file_url);
            $item->thumbnail_url = $item->thumbnail_url ? $this->ensureCorrectImageUrl($item->file_id, $item->thumbnail_url) : $item->file_url;
            return $item;
        });

        // Natural sort by filename
        $sortedInfografis = $allInfografis->sortBy(function ($item) {
            return $item->file_name;
        }, SORT_NATURAL | SORT_FLAG_CASE)->values();

        // Manual pagination
        $total = $sortedInfografis->count();
        $offset = ($page - 1) * $perPage;
        $items = $sortedInfografis->slice($offset, $perPage)->values();

        $infografis = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('admin/kelola-infografis', [
            'infografisLink' => $infografisLink,
            'infografis' => $infografis,
        ]);
    }

    /**
     * Display public page showing infografis cards.
     */
    public function public(Request $request): Response
    {
        $perPage = $request->get('per_page', 12);
        $page = $request->get('page', 1);

        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();

        $query = Infografis::whereRaw('1 = 0');

        if ($activeDisaster) {
            $query = Infografis::whereHas('infografisLink', function($q) use ($activeDisaster) {
                $q->where('disaster_id', $activeDisaster->id);
            });
        }

        // Get all infografis and sort naturally in PHP
        $allInfografis = $query->get()->map(function ($item) {
            // Ensure URL format is correct for embedding
            $item->file_url = $this->ensureCorrectImageUrl($item->file_id, $item->file_url);
            $item->thumbnail_url = $item->thumbnail_url ? $this->ensureCorrectImageUrl($item->file_id, $item->thumbnail_url) : $item->file_url;
            return $item;
        });

        // Natural sort by filename
        $sortedInfografis = $allInfografis->sortBy(function ($item) {
            return $item->file_name;
        }, SORT_NATURAL | SORT_FLAG_CASE)->values();

        // Manual pagination
        $total = $sortedInfografis->count();
        $offset = ($page - 1) * $perPage;
        $items = $sortedInfografis->slice($offset, $perPage)->values();

        $infografis = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('infografis', [
            'infografis' => $infografis,
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
        ]);
    }

    /**
     * Delete infografis link and all associated data.
     */
    public function destroy(InfografisLink $infografisLink): RedirectResponse
    {
        // Delete all infografis
        Infografis::truncate();

        // Delete the link
        $infografisLink->delete();

        return redirect()->route('kelola-infografis')->with('success', 'Link infografis dan semua data terkait berhasil dihapus.');
    }

    /**
     * Store or update infografis folder link and scan for files.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gdrive_url' => ['required', 'url', 'max:500'],
        ]);

        $disasterId = $request->session()->get('admin_active_disaster_id');

        $infografisLink = InfografisLink::updateOrCreate(
            ['disaster_id' => $disasterId],
            ['gdrive_url' => $validated['gdrive_url']]
        );

        // Scan Google Drive folder and list all files
        try {
            $this->scanFolderForImages($validated['gdrive_url'], $infografisLink->id);
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to scan folder for images: ' . $e->getMessage());
            return redirect()->route('kelola-infografis')->with('success', 'Link berhasil disimpan, namun terjadi kesalahan saat scan folder: ' . $e->getMessage());
        }

        return redirect()->route('kelola-infografis')->with('success', 'Link Google Drive folder berhasil disimpan dan infografis telah di-scan.');
    }

    /**
     * Scan folder and refresh infografis list.
     */
    public function scan(Request $request): RedirectResponse
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $infografisLink = InfografisLink::where('disaster_id', $disasterId)->first();

        if (!$infografisLink) {
            return redirect()->route('kelola-infografis')->with('error', 'Link Google Drive folder belum diatur.');
        }

        try {
            $this->scanFolderForImages($infografisLink->gdrive_url, $infografisLink->id);
            return redirect()->route('kelola-infografis')->with('success', 'Infografis berhasil di-scan ulang.');
        } catch (\Exception $e) {
            \Log::error('Failed to scan folder for images: ' . $e->getMessage());
            return redirect()->route('kelola-infografis')->with('error', 'Gagal scan folder: ' . $e->getMessage());
        }
    }

    /**
     * Auto-scan infografis folder (public endpoint).
     */
    public function autoScan(Request $request): JsonResponse
    {
        try {
            // Get active disaster
            $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
            if (!$activeDisaster) {
                 return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada bencana aktif.',
                ], 404);
            }

            $infografisLink = InfografisLink::where('disaster_id', $activeDisaster->id)->first();

            if (!$infografisLink) {
                return response()->json([
                    'success' => false,
                    'message' => 'Link Google Drive folder belum diatur.',
                ], 400);
            }

            $this->scanFolderForImages($infografisLink->gdrive_url, $infografisLink->id);

            return response()->json([
                'success' => true,
                'message' => 'Infografis berhasil di-scan ulang.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Auto-scan infografis failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal scan folder: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Scan Google Drive folder and list all files (images, PDF, etc.).
     */
    private function scanFolderForImages(string $folderUrl, int $linkId): void
    {
        $apiKey = config('services.google.drive_api_key');
        if (!$apiKey) {
            throw new \Exception('Google Drive API key belum dikonfigurasi.');
        }

        // Extract folder ID from URL
        $folderId = $this->extractFolderId($folderUrl);
        if (!$folderId) {
            throw new \Exception('Format link Google Drive folder tidak valid.');
        }

        // Get all files (images, PDF, etc.) in the folder
        // Data sudah diurutkan secara natural di getImagesInFolder
        $images = $this->getImagesInFolder($folderId, $apiKey);

        // Pastikan data sudah terurut secara natural sebelum disimpan
        // (getImagesInFolder sudah melakukan natural sort, tapi kita pastikan lagi)
        usort($images, function($a, $b) {
            return strnatcasecmp($a['name'], $b['name']);
        });

        // Save or update images dalam urutan yang sudah diurutkan
        foreach ($images as $imageData) {
            Infografis::updateOrCreate(
                ['file_id' => $imageData['id']],
                [
                    'infografis_link_id' => $linkId,
                    'file_name' => $imageData['name'],
                    'file_url' => $imageData['url'],
                    'thumbnail_url' => $imageData['thumbnail_url'] ?? null,
                    'file_size' => $imageData['size'] ?? null,
                    'mime_type' => $imageData['mime_type'] ?? 'image/png',
                ]
            );
        }

        // Remove images that no longer exist in the folder
        $existingFileIds = array_column($images, 'id');
        Infografis::whereNotIn('file_id', $existingFileIds)->delete();
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
     * Get all files (images, PDF, etc.) in a folder.
     */
    private function getImagesInFolder(string $folderId, string $apiKey): array
    {
        $url = "https://www.googleapis.com/drive/v3/files";
        // Query for image files (PNG, JPG, JPEG, GIF, WEBP) and PDF files
        $query = "'{$folderId}' in parents and (mimeType='image/png' or mimeType='image/jpeg' or mimeType='image/jpg' or mimeType='image/gif' or mimeType='image/webp' or mimeType='application/pdf') and trashed=false";

        $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

        $response = Http::withOptions([
            'verify' => $verifySSL,
            'headers' => [
                'Referer' => request()->getSchemeAndHttpHost(),
            ],
        ])->get($url, [
            'q' => $query,
            'fields' => 'files(id,name,webViewLink,webContentLink,size,mimeType,thumbnailLink)',
            'orderBy' => 'name',
            'key' => $apiKey,
        ]);

        if ($response->successful()) {
            $files = $response->json('files', []);
            $result = [];
            foreach ($files as $file) {
                $fileId = $file['id'];
                $mimeType = $file['mimeType'] ?? 'image/png';

                // Generate URL based on file type
                // For PDF, use preview format; for images, use view format
                if ($mimeType === 'application/pdf') {
                    $fileUrl = "https://drive.google.com/file/d/{$fileId}/preview";
                } else {
                    // Generate direct image URL using uc?export=view format
                    // This format works for public files and can be embedded
                    $fileUrl = "https://drive.google.com/uc?export=view&id={$fileId}";
                }

                // For thumbnail, try to use thumbnailLink from API first
                // If not available, use the same format as fileUrl
                $thumbnailUrl = $fileUrl;
                if (isset($file['thumbnailLink']) && !empty($file['thumbnailLink'])) {
                    // Use thumbnailLink directly - it's already a valid URL
                    $thumbnailUrl = $file['thumbnailLink'];
                }

                $result[] = [
                    'id' => $fileId,
                    'name' => $file['name'],
                    'url' => $fileUrl,
                    'thumbnail_url' => $thumbnailUrl,
                    'size' => isset($file['size']) ? (int)$file['size'] : null,
                    'mime_type' => $mimeType,
                ];
            }

            // Sort by natural order (numerical order for numbers in filename)
            usort($result, function($a, $b) {
                return strnatcasecmp($a['name'], $b['name']);
            });

            return $result;
        }

        throw new \Exception('Gagal mengambil data dari Google Drive API: ' . ($response->json()['error']['message'] ?? 'Unknown error'));
    }

    /**
     * Display preview page for infografis file (centered, opens in new tab).
     */
    public function preview($id)
    {
        $infografis = Infografis::findOrFail($id);

        $isPdf = $infografis->mime_type === 'application/pdf';

        // For PDF, use Google Drive preview URL directly (always use direct link)
        // For images, use proxy URL to avoid CORS issues
        if ($isPdf) {
            // Always use direct Google Drive preview link for PDF
            $previewUrl = "https://drive.google.com/file/d/{$infografis->file_id}/preview";
        } else {
            $previewUrl = route('infografis.image', ['id' => $infografis->id]);
        }

        return response()->view('infografis-preview', [
            'previewUrl' => $previewUrl,
            'fileName' => $infografis->file_name,
            'fileId' => $infografis->file_id,
            'id' => $infografis->id,
            'isPdf' => $isPdf,
            'mimeType' => $infografis->mime_type,
        ]);
    }

    /**
     * Proxy file from Google Drive to avoid CORS issues.
     */
    public function image($id)
    {
        try {
            $infografis = Infografis::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Infografis not found: ' . $id);
            abort(404, 'Infografis tidak ditemukan');
        }

        // Use the stored file_url if available, otherwise construct from file_id
        $isPdf = $infografis->mime_type === 'application/pdf';
        if ($infografis->file_url) {
            $imageUrl = $infografis->file_url;
        } else {
            $imageUrl = $isPdf
                ? "https://drive.google.com/file/d/{$infografis->file_id}/preview"
                : "https://drive.google.com/uc?export=view&id=" . $infografis->file_id;
        }

        try {
            $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

            $response = Http::withOptions([
                'verify' => $verifySSL,
                'headers' => [
                    'Referer' => request()->getSchemeAndHttpHost(),
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ],
                'allow_redirects' => true,
            ])->timeout(15)->get($imageUrl);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type');

                // Check if response is HTML (redirect page) instead of file
                if ($contentType && strpos($contentType, 'text/html') !== false) {
                    // Try alternative URL format
                    $altUrl = "https://drive.google.com/uc?export=download&id=" . $infografis->file_id;
                    $response = Http::withOptions([
                        'verify' => $verifySSL,
                        'headers' => [
                            'Referer' => request()->getSchemeAndHttpHost(),
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        ],
                        'allow_redirects' => true,
                    ])->timeout(15)->get($altUrl);

                    $contentType = $response->header('Content-Type');
                }

                // If still HTML, return error
                if ($contentType && strpos($contentType, 'text/html') !== false) {
                    \Log::error('Google Drive returned HTML instead of file for ID: ' . $id);
                    abort(404, 'File tidak dapat diakses. Pastikan file Google Drive dapat diakses publik.');
                }

                // Default content type based on mime_type
                if (!$contentType || (strpos($contentType, 'image/') !== 0 && strpos($contentType, 'application/pdf') !== 0)) {
                    $contentType = $infografis->mime_type ?: 'image/png';
                }

                return response($response->body(), 200)
                    ->header('Content-Type', $contentType)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET')
                    ->header('Cache-Control', 'public, max-age=3600');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to proxy image for infografis ID ' . $id . ': ' . $e->getMessage());
        }

        // If all fails, return 404
        abort(404, 'File tidak dapat dimuat');
    }

    /**
     * Download infografis file.
     */
    public function download($id)
    {
        try {
            $infografis = Infografis::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(404, 'Infografis tidak ditemukan');
        }

        // Use the stored file_url if available, otherwise construct from file_id
        $isPdf = $infografis->mime_type === 'application/pdf';
        if ($infografis->file_url) {
            $imageUrl = $infografis->file_url;
        } else {
            $imageUrl = "https://drive.google.com/uc?export=download&id=" . $infografis->file_id;
        }

        try {
            $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

            $response = Http::withOptions([
                'verify' => $verifySSL,
                'headers' => [
                    'Referer' => request()->getSchemeAndHttpHost(),
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ],
                'allow_redirects' => true,
            ])->timeout(15)->get($imageUrl);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type');

                // Check if response is HTML (redirect page) instead of file
                if ($contentType && strpos($contentType, 'text/html') !== false) {
                    // Try alternative URL format for download
                    $altUrl = "https://drive.google.com/uc?export=download&id=" . $infografis->file_id;
                    $response = Http::withOptions([
                        'verify' => $verifySSL,
                        'headers' => [
                            'Referer' => request()->getSchemeAndHttpHost(),
                            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        ],
                        'allow_redirects' => true,
                    ])->timeout(15)->get($altUrl);

                    $contentType = $response->header('Content-Type');
                }

                // Default content type based on mime_type
                if (!$contentType || (strpos($contentType, 'image/') !== 0 && strpos($contentType, 'application/pdf') !== 0)) {
                    $contentType = $infografis->mime_type ?: 'image/png';
                }

                // Get file extension from filename or content type
                $extension = pathinfo($infografis->file_name, PATHINFO_EXTENSION);
                if (!$extension) {
                    if ($contentType === 'application/pdf') {
                        $extension = 'pdf';
                    } elseif ($contentType === 'image/jpeg' || $contentType === 'image/jpg') {
                        $extension = 'jpg';
                    } else {
                        $extension = 'png';
                    }
                }

                $downloadName = pathinfo($infografis->file_name, PATHINFO_FILENAME) . '.' . $extension;

                return response($response->body(), 200)
                    ->header('Content-Type', $contentType)
                    ->header('Content-Disposition', 'attachment; filename="' . $downloadName . '"')
                    ->header('Cache-Control', 'public, max-age=3600');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to download file for infografis ID ' . $id . ': ' . $e->getMessage());
        }

        // If all fails, return 404
        abort(404, 'File tidak dapat diunduh');
    }

    /**
     * Ensure image URL is in the correct format for embedding.
     */
    private function ensureCorrectImageUrl(string $fileId, string $currentUrl): string
    {
        // If URL already uses the correct format, return as is
        if (strpos($currentUrl, 'drive.google.com/uc?export=view') !== false) {
            return $currentUrl;
        }

        // If URL is a thumbnailLink from Google, use it directly
        if (strpos($currentUrl, 'lh3.googleusercontent.com') !== false || strpos($currentUrl, 'googleusercontent.com') !== false) {
            return $currentUrl;
        }

        // Otherwise, convert to uc?export=view format
        return "https://drive.google.com/uc?export=view&id={$fileId}";
    }
}
