<?php

namespace App\Http\Controllers;

use App\Models\Disaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;

class DisasterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/kelola-bencana', [
            'disasters' => Disaster::orderBy('is_active', 'desc')->orderBy('created_at', 'desc')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        // Ensure is_active is explicitly set (default to false if not provided)
        // Inertia.js sends data as JSON, so we need to check the request data directly
        $validated['is_active'] = isset($request->all()['is_active']) ? (bool)$request->input('is_active') : false;

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        
        // Ensure slug is unique by appending counter if needed
        $originalSlug = $validated['slug'];
        $count = 1;
        while (Disaster::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count++;
        }

        // If setting as active, deactivate others
        if ($validated['is_active'] ?? false) {
            Disaster::where('is_active', true)->update([
                'is_active' => false,
                'ended_at' => now(),
            ]);
            // Set started_at when activating
            $validated['started_at'] = now();
        } else {
            // If creating as inactive, set ended_at to now (or null if never started)
            $validated['ended_at'] = null;
        }

        $disaster = Disaster::create($validated);

        // If this disaster is set as active, update session
        if ($disaster->is_active) {
            $request->session()->put('admin_active_disaster_id', $disaster->id);
            $request->session()->put('admin_active_disaster_name', $disaster->name);
        }

        return redirect()->back()->with('success', 'Bencana berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Disaster $disaster): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => ['nullable', 'boolean'],
        ]);
        
        // Ensure is_active is explicitly set (default to false if not provided)
        // Inertia.js sends data as JSON, so we need to check the request data directly
        $validated['is_active'] = isset($request->all()['is_active']) ? (bool)$request->input('is_active') : false;

        // Only update slug if name changed, or keep original? 
        // Usually we might not want to change slug on edit to preserve URLs, 
        // unless explicitly requested. For simple CRUD, let's keep slug stable or update it?
        // Let's update it for now to match name, but ideally we should have a slug field if we want control.
        // Given user complaint "nothing happened", simplification is key.
        // Let's NOT update slug automatically on edit to avoid breaking links, unless we add a UI for it.
        // But the user didn't implement slug UI.
        
        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
         // Handle uniqueness on update
        $originalSlug = $validated['slug'];
        $count = 1;
        while (Disaster::where('slug', $validated['slug'])->where('id', '!=', $disaster->id)->exists()) {
             $validated['slug'] = $originalSlug . '-' . $count++;
        }

        // Track previous state
        $wasActive = $disaster->is_active;
        $isBecomingActive = $validated['is_active'] ?? false;
        $isBecomingInactive = !$isBecomingActive && $wasActive;

        // If setting as active, deactivate others
        if ($isBecomingActive) {
            Disaster::where('id', '!=', $disaster->id)->where('is_active', true)->update([
                'is_active' => false,
                'ended_at' => now(),
            ]);
            // Set started_at when activating (only if not already set)
            if (!$disaster->started_at) {
                $validated['started_at'] = now();
            }
            $validated['ended_at'] = null;
            // Update session to use this disaster as active
            $request->session()->put('admin_active_disaster_id', $disaster->id);
            $request->session()->put('admin_active_disaster_name', $disaster->name);
        } elseif ($isBecomingInactive) {
            // If becoming inactive, set ended_at
            $validated['ended_at'] = now();
        }

        $disaster->update($validated);

        return redirect()->back()->with('success', 'Data bencana berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Disaster $disaster): RedirectResponse
    {
        // Prevent deleting the last active disaster or one with data if we want to be strict
        // For now, let's allow it but maybe checking if it's the active one for session
        
        $disaster->delete();

        return redirect()->back()->with('success', 'Bencana berhasil dihapus.');
    }

    /**
     * Switch the admin's active disaster session.
     */
    public function switch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'disaster_id' => 'required|exists:disasters,id',
        ]);

        $request->session()->put('admin_active_disaster_id', $validated['disaster_id']);
        
        // Also update session name for UI feedback if needed
        $disaster = Disaster::find($validated['disaster_id']);
        $request->session()->put('admin_active_disaster_name', $disaster->name);

        return redirect()->back()->with('success', "Berahli ke bencana: {$disaster->name}");
    }
}
