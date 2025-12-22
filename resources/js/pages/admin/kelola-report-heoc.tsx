import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ReportFile, ReportGroup } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DailyReportUpload from '@/components/DailyReportUpload';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Report HEOC',
        href: '/admin/kelola-report-heoc',
    },
];

interface KelolaReportHEOCProps {
    reports?: ReportGroup[];
    success?: string;
}

export default function KelolaReportHEOC({ reports = [], success }: KelolaReportHEOCProps) {
    const [isDailyUploadOpen, setIsDailyUploadOpen] = useState(false);
    const [deleteReport, setDeleteReport] = useState<ReportFile | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ReportGroup | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const handleDelete = () => {
        if (!deleteReport) return;

        router.delete(`/report-dates/${deleteReport.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeleteReport(null);
                // If we were in detail view, update the selected group
                if (selectedGroup) {
                    const updatedFiles = selectedGroup.files.filter((f: ReportFile) => f.id !== deleteReport.id);
                    if (updatedFiles.length === 0) {
                        setIsDetailOpen(false);
                        setSelectedGroup(null);
                    } else {
                        setSelectedGroup({ ...selectedGroup, files: updatedFiles });
                    }
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Report HEOC" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Report HEOC (EMT CC)</h1>
                        <p className="text-muted-foreground mt-2">
                            Upload report harian HEOC secara manual.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsDailyUploadOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Report Harian
                        </Button>
                    </div>
                </div>

                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm font-medium text-green-700">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Report HEOC</CardTitle>
                                <CardDescription>
                                    Report harian HEOC yang sudah diupload.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reports.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Belum ada report HEOC.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 font-semibold text-sm">Tanggal</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-sm">Jumlah File</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-sm">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.map((group) => (
                                                    <tr key={group.date} className="border-b hover:bg-muted/50">
                                                        <td className="py-3 px-4 text-sm">
                                                            {group.date}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm">
                                                            {group.files.length} File
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedGroup(group);
                                                                        setIsDetailOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Detail
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Cara Menggunakan</CardTitle>
                                <CardDescription>
                                    Panduan upload report harian HEOC
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm">📤 Upload Manual</h4>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>Klik "Upload Report Harian"</li>
                                        <li>Pilih tanggal dan upload file PDF (max 2MB)</li>
                                        <li>Satu tanggal bisa memiliki banyak file</li>
                                    </ul>
                                </div>
                                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                                    <p className="font-medium mb-1 text-xs">💡 Tips:</p>
                                    <p className="text-[10px] leading-relaxed">
                                        Gunakan upload manual untuk report harian yang baru. Pastikan file dalam format PDF.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Detail Report HEOC - {selectedGroup?.date}</DialogTitle>
                            <CardDescription>
                                Daftar file report untuk tanggal ini.
                            </CardDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="space-y-3">
                                {selectedGroup?.files.map((file: ReportFile) => (
                                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{file.file_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {file.file_path && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(file.file_path!, '_blank')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setDeleteReport(file);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Daily Report Upload Dialog */}
                <DailyReportUpload
                    isDmt={false}
                    open={isDailyUploadOpen}
                    onOpenChange={setIsDailyUploadOpen}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus File Report?</DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                Apakah Anda yakin ingin menghapus file "{deleteReport?.file_name}"? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
