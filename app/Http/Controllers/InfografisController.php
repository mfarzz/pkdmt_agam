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
        $infografisLink = InfografisLink::first();
        $perPage = $request->get('per_page', 12);
        $page = $request->get('page', 1);

        // Get all infografis and sort naturally in PHP
        $allInfografis = Infografis::get()->map(function ($item) {
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

        // Get all infografis and sort naturally in PHP
        $allInfografis = Infografis::get()->map(function ($item) {
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
     * Store or update infografis folder link and scan for PNG files.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gdrive_url' => ['required', 'url', 'max:500'],
        ]);

        $infografisLink = InfografisLink::updateOrCreate(
            ['id' => 1], // Only one link allowed
            ['gdrive_url' => $validated['gdrive_url']]
        );

        // Scan Google Drive folder and list all PNG files
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
        $infografisLink = InfografisLink::first();
        
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
            $infografisLink = InfografisLink::first();
            
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
     * Scan Google Drive folder and list all PNG/image files.
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

        // Get all image files (PNG, JPG, JPEG) in the folder
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
     * Get all image files (PNG, JPG, JPEG) in a folder.
     */
    private function getImagesInFolder(string $folderId, string $apiKey): array
    {
        $url = "https://www.googleapis.com/drive/v3/files";
        // Query for PNG, JPG, JPEG files
        $query = "'{$folderId}' in parents and (mimeType='image/png' or mimeType='image/jpeg' or mimeType='image/jpg') and trashed=false";

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

                // Generate direct image URL using uc?export=view format
                // This format works for public files and can be embedded
                $imageUrl = "https://drive.google.com/uc?export=view&id={$fileId}";

                // For thumbnail, try to use thumbnailLink from API first
                // If not available, use the same format as imageUrl
                $thumbnailUrl = $imageUrl;
                if (isset($file['thumbnailLink']) && !empty($file['thumbnailLink'])) {
                    // Use thumbnailLink directly - it's already a valid URL
                    $thumbnailUrl = $file['thumbnailLink'];
                }

                $result[] = [
                    'id' => $fileId,
                    'name' => $file['name'],
                    'url' => $imageUrl,
                    'thumbnail_url' => $thumbnailUrl,
                    'size' => isset($file['size']) ? (int)$file['size'] : null,
                    'mime_type' => $file['mimeType'] ?? 'image/png',
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
     * Display preview page for infografis image (centered, opens in new tab).
     */
    public function preview($id)
    {
        $infografis = Infografis::findOrFail($id);
        
        // Use proxy URL to avoid CORS issues
        $imageUrl = route('infografis.image', ['id' => $infografis->id]);
        
        return response()->view('infografis-preview', [
            'imageUrl' => $imageUrl,
            'fileName' => $infografis->file_name,
            'fileId' => $infografis->file_id,
            'id' => $infografis->id,
        ]);
    }

    /**
     * Proxy image from Google Drive to avoid CORS issues.
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
        $imageUrl = $infografis->file_url ?: "https://drive.google.com/uc?export=view&id=" . $infografis->file_id;
        
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
                
                // Check if response is HTML (redirect page) instead of image
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
                    \Log::error('Google Drive returned HTML instead of image for ID: ' . $id);
                    abort(404, 'Gambar tidak dapat diakses. Pastikan file Google Drive dapat diakses publik.');
                }
                
                // Default content type
                if (!$contentType || strpos($contentType, 'image/') !== 0) {
                    $contentType = 'image/png';
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
        abort(404, 'Gambar tidak dapat dimuat');
    }

    /**
     * Download infografis image.
     */
    public function download($id)
    {
        try {
            $infografis = Infografis::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(404, 'Infografis tidak ditemukan');
        }
        
        // Use the stored file_url if available, otherwise construct from file_id
        $imageUrl = $infografis->file_url ?: "https://drive.google.com/uc?export=download&id=" . $infografis->file_id;
        
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
                
                // Check if response is HTML (redirect page) instead of image
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
                
                // Default content type
                if (!$contentType || strpos($contentType, 'image/') !== 0) {
                    $contentType = $infografis->mime_type ?: 'image/png';
                }
                
                // Get file extension from filename or content type
                $extension = pathinfo($infografis->file_name, PATHINFO_EXTENSION);
                if (!$extension) {
                    $extension = $contentType === 'image/jpeg' || $contentType === 'image/jpg' ? 'jpg' : 'png';
                }
                
                $downloadName = pathinfo($infografis->file_name, PATHINFO_FILENAME) . '.' . $extension;
                
                return response($response->body(), 200)
                    ->header('Content-Type', $contentType)
                    ->header('Content-Disposition', 'attachment; filename="' . $downloadName . '"')
                    ->header('Cache-Control', 'public, max-age=3600');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to download image for infografis ID ' . $id . ': ' . $e->getMessage());
        }
        
        // If all fails, return 404
        abort(404, 'Gambar tidak dapat diunduh');
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
