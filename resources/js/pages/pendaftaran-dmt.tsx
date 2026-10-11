import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import TagInput from '@/components/tag-input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Users, Package, Activity, Stethoscope, FileCheck, ChevronLeft, ChevronRight, X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Progress } from '@/components/ui/progress';

interface PendaftaranDmtProps {
    activeDisasterName?: string;
    success?: string;
}

const jenisLayananOptions = [
    'Anestesi General',
    'Perawatan Intensif / ICU',
    'X-ray',
    'USG',
    'CT Scan',
    'Laboratorium',
    'Bank Darah',
    'Rehabilitasi Medik',
    'Ruang Isolasi',
];

export default function PendaftaranDmt({ activeDisasterName, success }: PendaftaranDmtProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        // Data Rincian Tim
        nama_dmt: '',
        nama_ketua_tim: '',
        tanggal_kedatangan: '',
        masa_penugasan_hari: '',
        tanggal_pelayanan_dimulai: '',
        tanggal_pelayanan_diakhiri: '',
        rencana_tanggal_kepulangan: '',

        // Nara Hubung
        nama_nara_hubung: '',
        posisi_jabatan: '',
        email: '',
        nomor_hp: '',

        // Kapasitas Logistik
        logistik_non_medis: '',
        logistik_non_medis_files: [] as File[],
        logistik_medis: '',
        logistik_medis_files: [] as File[],

        // Kapasitas Layanan
        kapasitas_rawat_jalan: '',
        kapasitas_rawat_inap: '',
        kapasitas_operasi_bedah_mayor: '',
        kapasitas_operasi_bedah_minor: '',
        jenis_layanan_tersedia: [] as string[],
        jenis_layanan_lainnya: '',

        // Komposisi Anggota Tim
        jumlah_dokter_umum: '',
        rincian_dokter_spesialis: '',
        jumlah_perawat: '',
        jumlah_bidan: '',
        jumlah_apoteker: '',
        jumlah_psikolog: '',
        jumlah_staf_logistik: '',
        jumlah_staf_administrasi: '',
        jumlah_petugas_keamanan: '',

        // Lampiran Dokumen
        surat_tugas_file: null as File | null,
        scan_str_file: null as File | null,
        daftar_nama_anggota_file: null as File | null,
    });

    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const initialStep = parseInt(urlParams.get('step') || '1', 10);

    const [selectedLayanan, setSelectedLayanan] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(() => {
        // Validate step from URL
        if (initialStep >= 1 && initialStep <= 6) {
            return initialStep;
        }
        return 1;
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [validationError, setValidationError] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(!!success);
    const totalSteps = 6;
    const logistikNonMedisInputRef = useRef<HTMLInputElement>(null);
    const logistikMedisInputRef = useRef<HTMLInputElement>(null);
    const suratTugasInputRef = useRef<HTMLInputElement>(null);
    const scanStrInputRef = useRef<HTMLInputElement>(null);
    const daftarNamaInputRef = useRef<HTMLInputElement>(null);

    const getFieldError = (field: string): string | undefined => {
        return fieldErrors[field] || (errors as Record<string, string>)[field];
    };

    const inputErrorClass = (field: string): string => {
        return getFieldError(field) ? 'border-red-500 focus-visible:ring-red-500' : '';
    };

    const steps = [
        { id: 1, title: 'Data Tim', icon: Users },
        { id: 2, title: 'Nara Hubung', icon: FileText },
        { id: 3, title: 'Logistik', icon: Package },
        { id: 4, title: 'Kapasitas', icon: Activity },
        { id: 5, title: 'Anggota', icon: Stethoscope },
        { id: 6, title: 'Dokumen', icon: FileCheck },
    ];

    // Auto-save functionality
    const { clearSaved } = useAutoSave({
        data: data,
        storageKey: 'dmt_registration_draft',
        debounceMs: 1000,
        onLoad: (savedData) => {
            // Restore saved data (excluding files)
            const fileFields = ['logistik_non_medis_files', 'logistik_medis_files', 'surat_tugas_file', 'scan_str_file', 'daftar_nama_anggota_file'];
            const restoredData: Record<string, unknown> = {};
            let hasDataToRestore = false;

            for (const [key, value] of Object.entries(savedData)) {
                // Skip file fields as they can't be restored from localStorage
                if (fileFields.includes(key)) {
                    continue;
                }

                // Skip empty values
                if (value === '' || value === null || value === undefined) {
                    continue;
                }

                // Handle special cases
                if (key === 'jenis_layanan_tersedia') {
                    if (Array.isArray(value) && value.length > 0) {
                        restoredData[key] = value;
                        setSelectedLayanan(value);
                        hasDataToRestore = true;
                    }
                } else if (Array.isArray(value) && value.length === 0) {
                    // Skip empty arrays
                    continue;
                } else {
                    restoredData[key] = value;
                    hasDataToRestore = true;
                }
            }

            // Restore data to form only if there's actual data
            if (hasDataToRestore) {
                Object.entries(restoredData).forEach(([key, value]) => {
                    // Type-safe restoration
                    const formKey = key as keyof typeof data;
                    if (formKey === 'jenis_layanan_tersedia' && Array.isArray(value)) {
                        setData(formKey, value as string[]);
                    } else if (typeof value === 'string' || typeof value === 'number') {
                        setData(formKey, value as string);
                    }
                });
            }
        },
    });

    // Update URL when step changes
    const updateStepInUrl = (step: number) => {
        const currentUrl = new URL(window.location.href);
        if (step === 1) {
            // Remove step parameter if it's step 1
            currentUrl.searchParams.delete('step');
        } else {
            currentUrl.searchParams.set('step', step.toString());
        }
        // Update URL without reloading the page
        window.history.replaceState({}, '', currentUrl.toString());
    };

    // Update URL and clear validation errors when step changes
    useEffect(() => {
        updateStepInUrl(currentStep);
        // Clear validation errors when step changes
        const timer = setTimeout(() => {
            setFieldErrors({});
            setValidationError('');
        }, 0);
        return () => clearTimeout(timer);
    }, [currentStep]);

    // Automatically clear error for a field once user fills/fixes it
    useEffect(() => {
        setFieldErrors((prev) => {
            if (Object.keys(prev).length === 0) return prev;
            let changed = false;
            const updated = { ...prev };
            for (const key of Object.keys(updated)) {
                const val = data[key as keyof typeof data];
                if (key === 'email') {
                    if (val && typeof val === 'string' && isValidEmail(val)) {
                        delete updated[key];
                        changed = true;
                    }
                } else if (key === 'jenis_layanan_tersedia') {
                    if (Array.isArray(val) && val.length > 0) {
                        delete updated[key];
                        changed = true;
                    }
                } else if (val !== null && val !== undefined && val !== '') {
                    delete updated[key];
                    changed = true;
                }
            }
            return changed ? updated : prev;
        });
    }, [data]);

    // Show success modal when success prop is available
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setShowSuccessModal(true);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleLayananChange = (layanan: string, checked: boolean) => {
        if (checked) {
            setSelectedLayanan([...selectedLayanan, layanan]);
            setData('jenis_layanan_tersedia', [...selectedLayanan, layanan]);
        } else {
            const newLayanan = selectedLayanan.filter(l => l !== layanan);
            setSelectedLayanan(newLayanan);
            setData('jenis_layanan_tersedia', newLayanan);
        }
    };

    const handleFileChange = (field: string, files: FileList | null) => {
        if (!files || files.length === 0) {
            if (field === 'logistik_non_medis_files' || field === 'logistik_medis_files') {
                setData(field as 'logistik_non_medis_files' | 'logistik_medis_files', []);
            } else {
                setData(field as 'surat_tugas_file' | 'scan_str_file' | 'daftar_nama_anggota_file', null);
            }
            return;
        }

        if (field === 'logistik_non_medis_files' || field === 'logistik_medis_files') {
            const fileArray = Array.from(files);
            const currentFiles = data[field as keyof typeof data] as File[];
            const existingFileNames = currentFiles.map(f => f.name);

            // Filter out duplicates
            const newFiles = fileArray.filter(file => !existingFileNames.includes(file.name));

            // Combine existing files with new files
            const combinedFiles = [...currentFiles, ...newFiles];

            if (combinedFiles.length > 5) {
                alert('Maksimum 5 file yang dapat diupload');
                return;
            }

            // Check file sizes
            const oversizedFiles = combinedFiles.filter(file => file.size > 5 * 1024 * 1024);
            if (oversizedFiles.length > 0) {
                alert('Beberapa file melebihi 5 MB. Silakan pilih file yang lebih kecil.');
                return;
            }
            setData(field as 'logistik_non_medis_files' | 'logistik_medis_files', combinedFiles);
            // Reset input file after selection
            if (field === 'logistik_non_medis_files' && logistikNonMedisInputRef.current) {
                logistikNonMedisInputRef.current.value = '';
            } else if (field === 'logistik_medis_files' && logistikMedisInputRef.current) {
                logistikMedisInputRef.current.value = '';
            }
        } else {
            const file = files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('File melebihi 5 MB. Silakan pilih file yang lebih kecil.');
                return;
            }
            setData(field as 'surat_tugas_file' | 'scan_str_file' | 'daftar_nama_anggota_file', file);
            // Reset input file after selection
            if (field === 'surat_tugas_file' && suratTugasInputRef.current) {
                suratTugasInputRef.current.value = '';
            } else if (field === 'scan_str_file' && scanStrInputRef.current) {
                scanStrInputRef.current.value = '';
            } else if (field === 'daftar_nama_anggota_file' && daftarNamaInputRef.current) {
                daftarNamaInputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = (field: string, index: number) => {
        if (field === 'logistik_non_medis_files' || field === 'logistik_medis_files') {
            const currentFiles = data[field as keyof typeof data] as File[];
            const updatedFiles = currentFiles.filter((_, i) => i !== index);
            setData(field as 'logistik_non_medis_files' | 'logistik_medis_files', updatedFiles);
        } else {
            setData(field as 'surat_tugas_file' | 'scan_str_file' | 'daftar_nama_anggota_file', null);
            // Reset input file after removal
            if (field === 'surat_tugas_file' && suratTugasInputRef.current) {
                suratTugasInputRef.current.value = '';
            } else if (field === 'scan_str_file' && scanStrInputRef.current) {
                scanStrInputRef.current.value = '';
            } else if (field === 'daftar_nama_anggota_file' && daftarNamaInputRef.current) {
                daftarNamaInputRef.current.value = '';
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    // Email validation helper
    const isValidEmail = (email: string): boolean => {
        if (!email || email.trim() === '') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    };

    // Validation for current step - returns field-specific errors
    const validateStepFields = (step: number): Record<string, string> => {
        const stepErrors: Record<string, string> = {};

        switch (step) {
            case 1: // Data Rincian Tim
                if (!data.nama_dmt || data.nama_dmt.trim() === '') {
                    stepErrors.nama_dmt = 'Nama DMT wajib diisi';
                }
                if (!data.nama_ketua_tim || data.nama_ketua_tim.trim() === '') {
                    stepErrors.nama_ketua_tim = 'Nama ketua tim wajib diisi';
                }
                if (!data.tanggal_kedatangan) {
                    stepErrors.tanggal_kedatangan = 'Tanggal kedatangan wajib diisi';
                }
                if (!data.masa_penugasan_hari || String(data.masa_penugasan_hari).trim() === '') {
                    stepErrors.masa_penugasan_hari = 'Masa penugasan wajib diisi';
                }
                if (!data.tanggal_pelayanan_dimulai) {
                    stepErrors.tanggal_pelayanan_dimulai = 'Tanggal pelayanan dimulai wajib diisi';
                }
                break;

            case 2: // Nara Hubung
                if (!data.nama_nara_hubung || data.nama_nara_hubung.trim() === '') {
                    stepErrors.nama_nara_hubung = 'Nama nara hubung wajib diisi';
                }
                if (!data.posisi_jabatan || data.posisi_jabatan.trim() === '') {
                    stepErrors.posisi_jabatan = 'Posisi / jabatan wajib diisi';
                }
                if (!data.email || data.email.trim() === '') {
                    stepErrors.email = 'Alamat email wajib diisi';
                } else if (!isValidEmail(data.email)) {
                    stepErrors.email = 'Format alamat email tidak valid (contoh: nama@example.com)';
                }
                if (!data.nomor_hp || data.nomor_hp.trim() === '') {
                    stepErrors.nomor_hp = 'Nomor HP / WhatsApp wajib diisi';
                }
                break;

            case 3: // Kapasitas Logistik
                if (!data.logistik_non_medis || data.logistik_non_medis.trim() === '') {
                    stepErrors.logistik_non_medis = 'Logistik non medis wajib diisi';
                }
                if (!data.logistik_medis || data.logistik_medis.trim() === '') {
                    stepErrors.logistik_medis = 'Logistik medis wajib diisi';
                }
                break;

            case 4: // Kapasitas Layanan
                if (!data.kapasitas_rawat_jalan || String(data.kapasitas_rawat_jalan).trim() === '') {
                    stepErrors.kapasitas_rawat_jalan = 'Kapasitas rawat jalan wajib diisi';
                }
                if (!data.kapasitas_rawat_inap || String(data.kapasitas_rawat_inap).trim() === '') {
                    stepErrors.kapasitas_rawat_inap = 'Kapasitas rawat inap wajib diisi';
                }
                if (!data.kapasitas_operasi_bedah_mayor || String(data.kapasitas_operasi_bedah_mayor).trim() === '') {
                    stepErrors.kapasitas_operasi_bedah_mayor = 'Kapasitas operasi bedah mayor wajib diisi';
                }
                if (!data.kapasitas_operasi_bedah_minor || String(data.kapasitas_operasi_bedah_minor).trim() === '') {
                    stepErrors.kapasitas_operasi_bedah_minor = 'Kapasitas operasi bedah minor wajib diisi';
                }
                if (!data.jenis_layanan_tersedia || data.jenis_layanan_tersedia.length === 0) {
                    stepErrors.jenis_layanan_tersedia = 'Pilih minimal satu jenis layanan yang tersedia';
                }
                break;

            case 5: // Komposisi Anggota Tim
                if (!data.jumlah_dokter_umum || String(data.jumlah_dokter_umum).trim() === '') {
                    stepErrors.jumlah_dokter_umum = 'Jumlah dokter umum wajib diisi';
                }
                if (!data.rincian_dokter_spesialis || data.rincian_dokter_spesialis.trim() === '') {
                    stepErrors.rincian_dokter_spesialis = 'Rincian dokter spesialis wajib diisi';
                }
                if (!data.jumlah_perawat || String(data.jumlah_perawat).trim() === '') {
                    stepErrors.jumlah_perawat = 'Jumlah perawat wajib diisi';
                }
                if (!data.jumlah_bidan || String(data.jumlah_bidan).trim() === '') {
                    stepErrors.jumlah_bidan = 'Jumlah bidan wajib diisi';
                }
                if (!data.jumlah_apoteker || String(data.jumlah_apoteker).trim() === '') {
                    stepErrors.jumlah_apoteker = 'Jumlah apoteker wajib diisi';
                }
                if (!data.jumlah_psikolog || String(data.jumlah_psikolog).trim() === '') {
                    stepErrors.jumlah_psikolog = 'Jumlah psikolog wajib diisi';
                }
                if (!data.jumlah_staf_logistik || String(data.jumlah_staf_logistik).trim() === '') {
                    stepErrors.jumlah_staf_logistik = 'Jumlah staf logistik wajib diisi';
                }
                if (!data.jumlah_staf_administrasi || String(data.jumlah_staf_administrasi).trim() === '') {
                    stepErrors.jumlah_staf_administrasi = 'Jumlah staf administrasi wajib diisi';
                }
                if (!data.jumlah_petugas_keamanan || String(data.jumlah_petugas_keamanan).trim() === '') {
                    stepErrors.jumlah_petugas_keamanan = 'Jumlah petugas keamanan wajib diisi';
                }
                break;

            case 6: // Lampiran Dokumen
                if (!data.surat_tugas_file) {
                    stepErrors.surat_tugas_file = 'Surat tugas wajib diupload';
                }
                if (!data.scan_str_file) {
                    stepErrors.scan_str_file = 'Scan STR anggota tim wajib diupload';
                }
                break;
        }

        return stepErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStepFields(currentStep);
        if (Object.keys(stepErrors).length === 0) {
            setFieldErrors({});
            setValidationError('');
            if (currentStep < totalSteps) {
                const nextStep = currentStep + 1;
                setCurrentStep(nextStep);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            setFieldErrors(stepErrors);
            const firstErrorField = Object.keys(stepErrors)[0];
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (element.tagName !== 'INPUT' || (element as HTMLInputElement).type !== 'hidden') {
                    element.focus();
                }
            }
        }
    };

    const handlePrevious = () => {
        setFieldErrors({});
        setValidationError('');
        if (currentStep > 1) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const stepErrors = validateStepFields(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setFieldErrors(stepErrors);
            const firstErrorField = Object.keys(stepErrors)[0];
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (element.tagName !== 'INPUT' || (element as HTMLInputElement).type !== 'hidden') {
                    element.focus();
                }
            }
            return;
        }

        post('/pendaftaran-dmt', {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedLayanan([]);
                setCurrentStep(1);
                setFieldErrors({});
                setValidationError('');
                clearSaved(); // Clear saved draft after successful submission
            },
            onError: (errors: Record<string, string | string[]>) => {
                // Show validation errors from backend
                const backendFieldErrors: Record<string, string> = {};
                for (const [key, msg] of Object.entries(errors)) {
                    backendFieldErrors[key] = Array.isArray(msg) ? msg[0] : msg;
                }
                setFieldErrors(backendFieldErrors);
            },
        });
    };

    // Calculate progress percentage
    const progressPercentage = (currentStep / totalSteps) * 100;

    const partners = [
        { name: 'Pemkab Agam', image: '/image/Logo_Agam_Regency.png' },
        { name: 'Universitas Andalas', image: '/image/Logo_Unand.png' },
        { name: 'Universitas Brawijaya', image: '/image/Logo_Universitas_Brawijaya.png' },
        { name: 'RS Khusus Kanker', image: '/image/RSKKA.png' },
        { name: 'Dinas Kesehatan', image: '/image/DKK.png' },
    ];

    return (
        <>
            <Head title="Pendaftaran DMT - HEOC" />
            <div className="min-h-screen bg-background flex flex-col">
                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-1">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Link href="/">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Kembali ke Beranda</span>
                                </Button>
                            </Link>
                        </div>
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Pendaftaran Disaster Medical Team (DMT)
                            </h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                {activeDisasterName ? `Formulir pendaftaran untuk ${activeDisasterName}` : 'Formulir pendaftaran DMT Kabupaten Agam'}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Field dengan tanda <span className="text-red-500">*</span> wajib diisi
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Langkah {currentStep} dari {totalSteps}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                                {steps.map((step) => {
                                    const StepIcon = step.icon;
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;

                                    return (
                                        <div
                                            key={step.id}
                                            className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                                                }`}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : isCompleted
                                                        ? 'border-green-600 bg-green-600 text-white'
                                                        : 'border-muted-foreground bg-background'
                                                    }`}
                                            >
                                                <StepIcon className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs text-center max-w-[80px] hidden sm:block">
                                                {step.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {/* Step 1: Data Rincian Tim */}
                            {currentStep === 1 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-primary" />
                                            <CardTitle>Data Rincian Tim (DMT)</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Informasi dasar tentang tim Disaster Medical Team
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_dmt">
                                                Nama Disaster Medical Team (DMT) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="nama_dmt"
                                                value={data.nama_dmt}
                                                onChange={(e) => setData('nama_dmt', e.target.value)}
                                                placeholder="Contoh: Tim DMT RS ABC"
                                                className={inputErrorClass('nama_dmt')}
                                            />
                                            <InputError message={getFieldError('nama_dmt')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nama_ketua_tim">
                                                Nama Ketua Tim <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="nama_ketua_tim"
                                                value={data.nama_ketua_tim}
                                                onChange={(e) => setData('nama_ketua_tim', e.target.value)}
                                                className={inputErrorClass('nama_ketua_tim')}
                                            />
                                            <InputError message={getFieldError('nama_ketua_tim')} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tanggal_kedatangan">
                                                    Tanggal Kedatangan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="tanggal_kedatangan"
                                                    type="date"
                                                    value={data.tanggal_kedatangan}
                                                    onChange={(e) => setData('tanggal_kedatangan', e.target.value)}
                                                    className={inputErrorClass('tanggal_kedatangan')}
                                                />
                                                <InputError message={getFieldError('tanggal_kedatangan')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="masa_penugasan_hari">
                                                    Masa Penugasan (hari) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="masa_penugasan_hari"
                                                    type="number"
                                                    min="1"
                                                    value={data.masa_penugasan_hari}
                                                    onChange={(e) => setData('masa_penugasan_hari', e.target.value)}
                                                    className={inputErrorClass('masa_penugasan_hari')}
                                                />
                                                <InputError message={getFieldError('masa_penugasan_hari')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="tanggal_pelayanan_dimulai">
                                                    Tanggal Pelayanan Dimulai <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="tanggal_pelayanan_dimulai"
                                                    type="date"
                                                    value={data.tanggal_pelayanan_dimulai}
                                                    onChange={(e) => setData('tanggal_pelayanan_dimulai', e.target.value)}
                                                    className={inputErrorClass('tanggal_pelayanan_dimulai')}
                                                />
                                                <InputError message={getFieldError('tanggal_pelayanan_dimulai')} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tanggal_pelayanan_diakhiri">
                                                    Tanggal Pelayanan Diakhiri
                                                </Label>
                                                <Input
                                                    id="tanggal_pelayanan_diakhiri"
                                                    type="date"
                                                    value={data.tanggal_pelayanan_diakhiri}
                                                    onChange={(e) => setData('tanggal_pelayanan_diakhiri', e.target.value)}
                                                    min={data.tanggal_pelayanan_dimulai}
                                                    className={inputErrorClass('tanggal_pelayanan_diakhiri')}
                                                />
                                                <InputError message={getFieldError('tanggal_pelayanan_diakhiri')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rencana_tanggal_kepulangan">
                                                    Rencana Tanggal Kepulangan
                                                </Label>
                                                <Input
                                                    id="rencana_tanggal_kepulangan"
                                                    type="date"
                                                    value={data.rencana_tanggal_kepulangan}
                                                    onChange={(e) => setData('rencana_tanggal_kepulangan', e.target.value)}
                                                    className={inputErrorClass('rencana_tanggal_kepulangan')}
                                                />
                                                <InputError message={getFieldError('rencana_tanggal_kepulangan')} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Nara Hubung */}
                            {currentStep === 2 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <CardTitle>Nara Hubung Paska Kepulangan</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Kontak person yang dapat dihubungi setelah tim kembali
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nama_nara_hubung">
                                                    Nama Nara Hubung <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="nama_nara_hubung"
                                                    value={data.nama_nara_hubung}
                                                    onChange={(e) => setData('nama_nara_hubung', e.target.value)}
                                                    className={inputErrorClass('nama_nara_hubung')}
                                                />
                                                <InputError message={getFieldError('nama_nara_hubung')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="posisi_jabatan">
                                                    Posisi / Jabatan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="posisi_jabatan"
                                                    value={data.posisi_jabatan}
                                                    onChange={(e) => setData('posisi_jabatan', e.target.value)}
                                                    className={inputErrorClass('posisi_jabatan')}
                                                />
                                                <InputError message={getFieldError('posisi_jabatan')} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Alamat Email <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={inputErrorClass('email')}
                                                />
                                                <InputError message={getFieldError('email')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nomor_hp">
                                                    Nomor HP / WhatsApp <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="nomor_hp"
                                                    type="tel"
                                                    value={data.nomor_hp}
                                                    onChange={(e) => setData('nomor_hp', e.target.value)}
                                                    className={inputErrorClass('nomor_hp')}
                                                />
                                                <InputError message={getFieldError('nomor_hp')} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 3: Kapasitas Logistik Tim */}
                            {currentStep === 3 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Package className="h-5 w-5 text-primary" />
                                            <CardTitle>Kapasitas Logistik Tim</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Informasi tentang logistik yang dibawa tim
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="logistik_non_medis">
                                                Logistik Non Medis <span className="text-red-500">*</span>
                                            </Label>
                                            <TagInput
                                                id="logistik_non_medis"
                                                value={data.logistik_non_medis}
                                                onChange={(csv) => setData('logistik_non_medis', csv)}
                                                placeholder="Contoh: tenda 10 unit (Enter), genset 3 unit (Enter), …"
                                                className={inputErrorClass('logistik_non_medis')}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Ketik setiap item lalu tekan <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Enter</kbd> atau <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">,</kbd> untuk menambahkan. Jika sudah ada dokumen, tulis <em>terlampir</em> dan upload di bawah.
                                            </p>
                                            <InputError message={getFieldError('logistik_non_medis')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="logistik_non_medis_files">
                                                Upload Dokumen Logistik Non Medis
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={logistikNonMedisInputRef}
                                                    id="logistik_non_medis_files"
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange('logistik_non_medis_files', e.target.files)}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => logistikNonMedisInputRef.current?.click()}
                                                >
                                                    Pilih File
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Upload maksimum 5 file. Maks 5 MB per file.
                                            </p>
                                            {data.logistik_non_medis_files.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        File yang dipilih ({data.logistik_non_medis_files.length}/5):
                                                    </p>
                                                    <div className="space-y-2">
                                                        {data.logistik_non_medis_files.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-2 bg-muted rounded-md border border-border"
                                                            >
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-foreground truncate">
                                                                            {file.name}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatFileSize(file.size)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                                    onClick={() => handleRemoveFile('logistik_non_medis_files', index)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <InputError message={getFieldError('logistik_non_medis_files')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="logistik_medis">
                                                Logistik Medis <span className="text-red-500">*</span>
                                            </Label>
                                            <TagInput
                                                id="logistik_medis"
                                                value={data.logistik_medis}
                                                onChange={(csv) => setData('logistik_medis', csv)}
                                                placeholder="Contoh: obat-obatan darurat, peralatan bedah minor, alat monitor vital, …"
                                                className={inputErrorClass('logistik_medis')}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Ketik setiap item lalu tekan <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Enter</kbd> atau <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">,</kbd> untuk menambahkan. Jika sudah ada dokumen, tulis <em>terlampir</em> dan upload di bawah.
                                            </p>
                                            <InputError message={getFieldError('logistik_medis')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="logistik_medis_files">
                                                Upload Dokumen Logistik Medis
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={logistikMedisInputRef}
                                                    id="logistik_medis_files"
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange('logistik_medis_files', e.target.files)}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => logistikMedisInputRef.current?.click()}
                                                >
                                                    Pilih File
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Upload maksimum 5 file. Maks 5 MB per file.
                                            </p>
                                            {data.logistik_medis_files.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        File yang dipilih ({data.logistik_medis_files.length}/5):
                                                    </p>
                                                    <div className="space-y-2">
                                                        {data.logistik_medis_files.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between p-2 bg-muted rounded-md border border-border"
                                                            >
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-foreground truncate">
                                                                            {file.name}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatFileSize(file.size)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                                    onClick={() => handleRemoveFile('logistik_medis_files', index)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <InputError message={getFieldError('logistik_medis_files')} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 4: Kapasitas Layanan */}
                            {currentStep === 4 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-primary" />
                                            <CardTitle>Kapasitas Layanan</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Informasi tentang kapasitas layanan yang dapat diberikan tim
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="kapasitas_rawat_jalan">
                                                    Kapasitas Rawat Jalan (pasien/hari) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="kapasitas_rawat_jalan"
                                                    type="number"
                                                    min="0"
                                                    value={data.kapasitas_rawat_jalan}
                                                    onChange={(e) => setData('kapasitas_rawat_jalan', e.target.value)}
                                                    className={inputErrorClass('kapasitas_rawat_jalan')}
                                                />
                                                <InputError message={getFieldError('kapasitas_rawat_jalan')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="kapasitas_rawat_inap">
                                                    Kapasitas Rawat Inap (pasien/hari) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="kapasitas_rawat_inap"
                                                    type="number"
                                                    min="0"
                                                    value={data.kapasitas_rawat_inap}
                                                    onChange={(e) => setData('kapasitas_rawat_inap', e.target.value)}
                                                    className={inputErrorClass('kapasitas_rawat_inap')}
                                                />
                                                <InputError message={getFieldError('kapasitas_rawat_inap')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="kapasitas_operasi_bedah_mayor">
                                                    Kapasitas Operasi Bedah Mayor (kasus/hari) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="kapasitas_operasi_bedah_mayor"
                                                    type="number"
                                                    min="0"
                                                    value={data.kapasitas_operasi_bedah_mayor}
                                                    onChange={(e) => setData('kapasitas_operasi_bedah_mayor', e.target.value)}
                                                    className={inputErrorClass('kapasitas_operasi_bedah_mayor')}
                                                />
                                                <InputError message={getFieldError('kapasitas_operasi_bedah_mayor')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="kapasitas_operasi_bedah_minor">
                                                    Kapasitas Operasi Bedah Minor (kasus/hari) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="kapasitas_operasi_bedah_minor"
                                                    type="number"
                                                    min="0"
                                                    value={data.kapasitas_operasi_bedah_minor}
                                                    onChange={(e) => setData('kapasitas_operasi_bedah_minor', e.target.value)}
                                                    className={inputErrorClass('kapasitas_operasi_bedah_minor')}
                                                />
                                                <InputError message={getFieldError('kapasitas_operasi_bedah_minor')} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                Jenis Layanan yang Tersedia (Pilih semua yang berlaku) <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                {jenisLayananOptions.map((layanan) => (
                                                    <div key={layanan} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`layanan-${layanan}`}
                                                            checked={selectedLayanan.includes(layanan)}
                                                            onCheckedChange={(checked) => handleLayananChange(layanan, checked as boolean)}
                                                        />
                                                        <Label
                                                            htmlFor={`layanan-${layanan}`}
                                                            className="font-normal cursor-pointer"
                                                        >
                                                            {layanan}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            <InputError message={getFieldError('jenis_layanan_tersedia')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="jenis_layanan_lainnya">
                                                Yang lain:
                                            </Label>
                                            <Input
                                                id="jenis_layanan_lainnya"
                                                value={data.jenis_layanan_lainnya}
                                                onChange={(e) => setData('jenis_layanan_lainnya', e.target.value)}
                                                placeholder="Tuliskan jenis layanan lainnya jika ada"
                                                className={inputErrorClass('jenis_layanan_lainnya')}
                                            />
                                            <InputError message={getFieldError('jenis_layanan_lainnya')} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 5: Komposisi Anggota Tim */}
                            {currentStep === 5 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Stethoscope className="h-5 w-5 text-primary" />
                                            <CardTitle>Komposisi Anggota Tim</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Jumlah dan rincian anggota tim medis
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_dokter_umum">
                                                    Jumlah Dokter Umum <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_dokter_umum"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_dokter_umum}
                                                    onChange={(e) => setData('jumlah_dokter_umum', e.target.value)}
                                                    className={inputErrorClass('jumlah_dokter_umum')}
                                                />
                                                <InputError message={getFieldError('jumlah_dokter_umum')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rincian_dokter_spesialis">
                                                    Rincian Dokter Spesialis <span className="text-red-500">*</span>
                                                </Label>
                                                <TagInput
                                                    id="rincian_dokter_spesialis"
                                                    value={data.rincian_dokter_spesialis}
                                                    onChange={(csv) => setData('rincian_dokter_spesialis', csv)}
                                                    placeholder="Contoh: Bedah - 1 (Enter), Anak - 1 (Enter), …"
                                                    className={inputErrorClass('rincian_dokter_spesialis')}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Ketik setiap spesialisasi lalu tekan <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">Enter</kbd> atau <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">,</kbd>.
                                                </p>
                                                <InputError message={getFieldError('rincian_dokter_spesialis')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_perawat">
                                                    Jumlah Perawat <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_perawat"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_perawat}
                                                    onChange={(e) => setData('jumlah_perawat', e.target.value)}
                                                    className={inputErrorClass('jumlah_perawat')}
                                                />
                                                <InputError message={getFieldError('jumlah_perawat')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_bidan">
                                                    Jumlah Bidan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_bidan"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_bidan}
                                                    onChange={(e) => setData('jumlah_bidan', e.target.value)}
                                                    className={inputErrorClass('jumlah_bidan')}
                                                />
                                                <InputError message={getFieldError('jumlah_bidan')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_apoteker">
                                                    Jumlah Apoteker / Asisten Apoteker <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_apoteker"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_apoteker}
                                                    onChange={(e) => setData('jumlah_apoteker', e.target.value)}
                                                    className={inputErrorClass('jumlah_apoteker')}
                                                />
                                                <InputError message={getFieldError('jumlah_apoteker')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_psikolog">
                                                    Jumlah Psikolog <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_psikolog"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_psikolog}
                                                    onChange={(e) => setData('jumlah_psikolog', e.target.value)}
                                                    className={inputErrorClass('jumlah_psikolog')}
                                                />
                                                <InputError message={getFieldError('jumlah_psikolog')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_staf_logistik">
                                                    Jumlah Staf Logistik <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_staf_logistik"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_staf_logistik}
                                                    onChange={(e) => setData('jumlah_staf_logistik', e.target.value)}
                                                    className={inputErrorClass('jumlah_staf_logistik')}
                                                />
                                                <InputError message={getFieldError('jumlah_staf_logistik')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_staf_administrasi">
                                                    Jumlah Staf Administrasi <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_staf_administrasi"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_staf_administrasi}
                                                    onChange={(e) => setData('jumlah_staf_administrasi', e.target.value)}
                                                    className={inputErrorClass('jumlah_staf_administrasi')}
                                                />
                                                <InputError message={getFieldError('jumlah_staf_administrasi')} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jumlah_petugas_keamanan">
                                                    Jumlah Petugas Keamanan (Security) <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="jumlah_petugas_keamanan"
                                                    type="number"
                                                    min="0"
                                                    value={data.jumlah_petugas_keamanan}
                                                    onChange={(e) => setData('jumlah_petugas_keamanan', e.target.value)}
                                                    className={inputErrorClass('jumlah_petugas_keamanan')}
                                                />
                                                <InputError message={getFieldError('jumlah_petugas_keamanan')} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 6: Lampiran Dokumen */}
                            {currentStep === 6 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <FileCheck className="h-5 w-5 text-primary" />
                                            <CardTitle>Lampiran Dokumen</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Upload dokumen pendukung pendaftaran
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="surat_tugas_file">
                                                Surat Tugas dari organisasi <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={suratTugasInputRef}
                                                    id="surat_tugas_file"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange('surat_tugas_file', e.target.files)}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={inputErrorClass('surat_tugas_file')}
                                                    onClick={() => suratTugasInputRef.current?.click()}
                                                >
                                                    Pilih File
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Upload 1 file. Maks 5 MB.
                                            </p>
                                            {data.surat_tugas_file && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        File yang dipilih:
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between p-2 bg-muted rounded-md border border-border">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-foreground truncate">
                                                                        {data.surat_tugas_file.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatFileSize(data.surat_tugas_file.size)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                                onClick={() => handleRemoveFile('surat_tugas_file', 0)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <InputError message={getFieldError('surat_tugas_file')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="scan_str_file">
                                                Scan STR Anggota Tim (Disatukan dalam 1 file) <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={scanStrInputRef}
                                                    id="scan_str_file"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange('scan_str_file', e.target.files)}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={inputErrorClass('scan_str_file')}
                                                    onClick={() => scanStrInputRef.current?.click()}
                                                >
                                                    Pilih File
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Upload 1 file. Maks 5 MB.
                                            </p>
                                            {data.scan_str_file && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        File yang dipilih:
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between p-2 bg-muted rounded-md border border-border">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-foreground truncate">
                                                                        {data.scan_str_file.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatFileSize(data.scan_str_file.size)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                                onClick={() => handleRemoveFile('scan_str_file', 0)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <InputError message={getFieldError('scan_str_file')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="daftar_nama_anggota_file">
                                                Daftar Nama Anggota Tim Lengkap
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={daftarNamaInputRef}
                                                    id="daftar_nama_anggota_file"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileChange('daftar_nama_anggota_file', e.target.files)}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={inputErrorClass('daftar_nama_anggota_file')}
                                                    onClick={() => daftarNamaInputRef.current?.click()}
                                                >
                                                    Pilih File
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Upload 1 file. Maks 5 MB.
                                            </p>
                                            {data.daftar_nama_anggota_file && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        File yang dipilih:
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between p-2 bg-muted rounded-md border border-border">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-foreground truncate">
                                                                        {data.daftar_nama_anggota_file.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatFileSize(data.daftar_nama_anggota_file.size)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                                onClick={() => handleRemoveFile('daftar_nama_anggota_file', 0)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <InputError message={getFieldError('daftar_nama_anggota_file')} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex justify-between gap-4">
                                <div className="flex gap-2">
                                    {currentStep > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handlePrevious}
                                            className="px-2 sm:px-4"
                                        >
                                            <ChevronLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </Button>
                                    )}
                                    {currentStep < totalSteps && (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="px-2 sm:px-4"
                                        >
                                            <span className="hidden sm:inline">Selanjutnya</span>
                                            <ChevronRight className="h-4 w-4 sm:ml-2" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            reset();
                                            setSelectedLayanan([]);
                                            setCurrentStep(1);
                                            setValidationError('');
                                        }}
                                    >
                                        Reset Form
                                    </Button>
                                    {currentStep === totalSteps && (
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Mengirim...' : 'Kirim Pendaftaran'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Partners / Didukung Oleh */}
                <section className="py-12 border-t border-border bg-background mt-auto">
                    <div className="container mx-auto px-4 text-center">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Didukung Oleh</h3>

                        <div className="overflow-hidden relative w-full group">
                            <div className="flex animate-scroll hover:pause-scroll gap-12 items-center w-max">
                                {[...partners, ...partners, ...partners].map((logo, index) => (
                                    <div
                                        key={`${logo.name}-${index}`}
                                        className="flex items-center justify-center h-16 w-32 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100"
                                    >
                                        <img
                                            src={logo.image}
                                            alt={logo.name}
                                            className="max-h-full max-w-full object-contain drop-shadow-sm"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Gradient Masks for carousel */}
                            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
                            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 bg-card border-t border-border">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Copyright © {new Date().getFullYear()} <span className="font-semibold text-primary">HEOC Kabupaten Agam</span>. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle>Pendaftaran Berhasil!</DialogTitle>
                        <DialogDescription>
                            {success || 'Pendaftaran DMT berhasil dikirim! Tim akan meninjau pendaftaran Anda.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                setShowSuccessModal(false);
                                router.visit('/');
                            }}
                        >
                            Kembali ke Beranda
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

