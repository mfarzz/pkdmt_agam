<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PanduanController extends Controller
{
    /**
     * Display the guide page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('admin/panduan');
    }
}

