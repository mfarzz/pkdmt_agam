<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the landing page.
     */
    public function index(Request $request): Response
    {
        // Get total bencana
        $totalBencana = \App\Models\Disaster::count();

        // Get total tim DMT (approved)
        $totalTim = \App\Models\DmtData::where('status_pendaftaran', 'approved')->count();

        return Inertia::render('landing', [
            'totalBencana' => $totalBencana,
            'totalTim' => $totalTim,
        ]);
    }
}

