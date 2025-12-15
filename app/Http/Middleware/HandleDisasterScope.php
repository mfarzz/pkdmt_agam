<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Disaster;
use Inertia\Inertia;

class HandleDisasterScope
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only valid for authenticated users (admins) or specific routes
        if ($request->user()) {
            $sessionKey = 'admin_active_disaster_id';
            
            // Check if session has disaster_id
            if (!$request->session()->has($sessionKey)) {
                // If not, pick the default one (or the first available)
                $defaultDisaster = Disaster::where('slug', 'bencana-default')->first() ?? Disaster::first();
                
                if ($defaultDisaster) {
                    $request->session()->put($sessionKey, $defaultDisaster->id);
                    $request->session()->put('admin_active_disaster_name', $defaultDisaster->name);
                }
            }

            // Share current disaster info with Inertia (Frontend)
            if ($request->session()->has($sessionKey)) {
                $currentId = $request->session()->get($sessionKey);
                $currentDisaster = Disaster::find($currentId);
                
                // If the selected disaster was deleted, reset session
                if (!$currentDisaster) {
                     $request->session()->forget($sessionKey);
                     $request->session()->forget('admin_active_disaster_name');
                     // Try to re-set on next request or just continue
                } else {
                    Inertia::share([
                        'auth.activeDisaster' => [
                            'id' => $currentDisaster->id,
                            'name' => $currentDisaster->name,
                        ],
                        'disasters_list' => fn () => Disaster::select('id', 'name', 'is_active')->get()
                    ]);
                }
            }
        }

        return $next($request);
    }
}
