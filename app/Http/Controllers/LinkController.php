<?php

namespace App\Http\Controllers;

use App\Models\SiteLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LinkController extends Controller
{
    /**
     * Display the links management page.
     */
    public function index(Request $request): Response
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $links = SiteLink::where('disaster_id', $disasterId)->orderBy('name')->get();

        return Inertia::render('admin/kelola-link', [
            'links' => $links,
            'success' => $request->session()->get('success'),
        ]);
    }

    /**
     * Store a new link.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable'],
        ]);

        $validated['is_active'] = $request->has('is_active');
        $validated['disaster_id'] = $request->session()->get('admin_active_disaster_id');

        SiteLink::create($validated);

        return redirect()->route('kelola-link')->with('success', 'Link berhasil ditambahkan.');
    }

    /**
     * Update an existing link.
     */
    public function update(Request $request, SiteLink $link): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable'],
        ]);

        $validated['is_active'] = $request->has('is_active');

        $link->update($validated);

        return redirect()->route('kelola-link')->with('success', 'Link berhasil diperbarui.');
    }

    /**
     * Delete a link.
     */
    public function destroy(SiteLink $link): RedirectResponse
    {
        $link->delete();

        return redirect()->route('kelola-link')->with('success', 'Link berhasil dihapus.');
    }
}
