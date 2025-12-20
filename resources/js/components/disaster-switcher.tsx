import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Disaster, SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';

export function DisasterSwitcher() {
    // Cast usePage to unknown first, then to SharedData to avoid type conflicts if types aren't perfectly aligned
    const { props } = usePage<any>();
    const { auth, disasters_list } = props as SharedData;

    // Safety check if props are not yet available
    if (!auth?.activeDisaster || !disasters_list) {
        return null;
    }

    const { activeDisaster } = auth;

    const handleSwitch = (disasterId: number) => {
        router.post('/disasters/switch', {
            disaster_id: disasterId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: Show toast or just let the page reload reflect the change
                window.location.reload(); // Force reload to ensure all data is refreshed with new scope
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between ml-auto mr-4 hidden md:flex">
                    <span className="truncate">{activeDisaster.name}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
                <DropdownMenuLabel>Pilih Bencana</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {disasters_list.map((disaster: Disaster) => (
                    <DropdownMenuItem
                        key={disaster.id}
                        onSelect={() => handleSwitch(disaster.id)}
                    >
                        <Check
                            className={`mr-2 h-4 w-4 ${activeDisaster.id === disaster.id ? 'opacity-100' : 'opacity-0'
                                }`}
                        />
                        <span className="truncate">{disaster.name}</span>
                        {disaster.is_active && (
                            <span className="ml-auto text-xs text-green-500 font-bold px-1 rounded border border-green-200 bg-green-50">
                                LIVE
                            </span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
