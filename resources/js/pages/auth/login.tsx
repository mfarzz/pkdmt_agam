import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Form, Head } from '@inertiajs/react';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { home } from '@/routes';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <>
            <Head title="Login - BECARES" />
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header dengan tombol kembali */}
                <div className="container mx-auto px-4 py-6">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        <Card className="p-8">
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Lock className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h1 className="text-2xl font-bold text-foreground">
                                        Masuk ke BECARES
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Masukkan email dan password Anda untuk masuk
                                    </p>
                                </div>
                            </div>

                            {status && (
                                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm font-medium text-green-700 text-center">
                                    {status}
                                </div>
                            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                                        placeholder="nama@example.com"
                                                        className="pl-10"
                                />
                                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password">
                                                        Password
                                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                                            className="text-sm"
                                            tabIndex={5}
                                        >
                                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                                        placeholder="Masukkan password"
                                                        className="pl-10"
                                />
                                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                                <Label htmlFor="remember" className="text-sm cursor-pointer">
                                                    Ingat saya
                                                </Label>
                            </div>

                            <Button
                                type="submit"
                                                className="w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                                size="lg"
                            >
                                                {processing ? (
                                                    <>
                                                        <Spinner />
                                                        Memproses...
                                                    </>
                                                ) : (
                                                    'Masuk'
                                                )}
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                                Belum punya akun?{' '}
                                                <a
                                                    href="https://wa.me/62895623378313"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    tabIndex={5}
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
                                                >
                                                    Hubungi Admin
                                                </a>
                            </div>
                        )}
                    </>
                )}
            </Form>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
