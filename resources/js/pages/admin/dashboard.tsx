import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Form } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { UserPlus, Users, Mail, Lock, User, Edit } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface DashboardProps {
    users?: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
    };
    success?: string;
}

export default function Dashboard({ users, success }: DashboardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Success Message */}
                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                {/* Header dengan tombol Create User */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Manajemen User
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola pengguna sistem BECARES
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Buat User Baru
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Buat User Baru</DialogTitle>
                                <DialogDescription>
                                    Masukkan informasi user baru untuk membuat akun di sistem BECARES.
                                </DialogDescription>
                            </DialogHeader>
                            <Form
                                method="post"
                                action="/users"
                                onSuccess={() => {
                                    setIsDialogOpen(false);
                                }}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    Nama Lengkap
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        placeholder="Masukkan nama lengkap"
                                                        className="pl-10"
                                                    />
                                                </div>
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        required
                                                        placeholder="nama@example.com"
                                                        className="pl-10"
                                                    />
                                                </div>
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password">
                                                    Password
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        required
                                                        placeholder="Masukkan password"
                                                        className="pl-10"
                                                    />
                                                </div>
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    Konfirmasi Password
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        type="password"
                                                        required
                                                        placeholder="Konfirmasi password"
                                                        className="pl-10"
                                                    />
                                                </div>
                                                <InputError message={errors.password_confirmation} />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsDialogOpen(false)}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <Spinner />
                                                        Membuat...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                        Buat User
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit User Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                    Ubah informasi user: {selectedUser?.name}
                                </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                                <Form
                                    method="put"
                                    action={`/users/${selectedUser.id}`}
                                    onSuccess={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedUser(null);
                                    }}
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_name">
                                                        Nama Lengkap
                                                    </Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="edit_name"
                                                            name="name"
                                                            type="text"
                                                            required
                                                            autoFocus
                                                            defaultValue={selectedUser.name}
                                                            placeholder="Masukkan nama lengkap"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    <InputError message={errors.name} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_email">
                                                        Email
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="edit_email"
                                                            name="email"
                                                            type="email"
                                                            required
                                                            defaultValue={selectedUser.email}
                                                            placeholder="nama@example.com"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    <InputError message={errors.email} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_password">
                                                        Password Baru (Opsional)
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="edit_password"
                                                            name="password"
                                                            type="password"
                                                            placeholder="Kosongkan jika tidak ingin mengubah password"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    <InputError message={errors.password} />
                                                    <p className="text-xs text-muted-foreground">
                                                        Biarkan kosong jika tidak ingin mengubah password
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_password_confirmation">
                                                        Konfirmasi Password Baru
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="edit_password_confirmation"
                                                            name="password_confirmation"
                                                            type="password"
                                                            placeholder="Konfirmasi password baru"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    <InputError message={errors.password_confirmation} />
                    </div>
                </div>

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditDialogOpen(false);
                                                        setSelectedUser(null);
                                                    }}
                                                >
                                                    Batal
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Spinner />
                                                            Mengubah...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Simpan Perubahan
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                {/* List Users Table */}
                {users && users.data && users.data.length > 0 ? (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Tanggal Dibuat
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.data.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                {(users.current_page - 1) * users.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground">
                                                        {user.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsEditDialogOpen(true);
                                                    }}
                                                    className="h-8"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground">
                                Belum ada user. Buat user baru untuk memulai.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
