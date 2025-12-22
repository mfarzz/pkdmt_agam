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
import { landing } from '@/routes';
import { Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

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
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title="Login - HEOC" />
            <div className="relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
                {/* Left Side - Image */}
                <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
                    <div className="absolute inset-0">
                        <img
                            src="/image/login.jpg"
                            alt="Login Background"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                    <Link
                        href={landing()}
                        className="relative z-20 flex items-center gap-2 text-lg font-medium mb-auto"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                    <div className="relative z-20 mt-auto">
                        <h2 className="text-3xl font-bold mb-4">HEOC Kabupaten Agam</h2>
                        <p className="text-lg text-white/90">
                            Health Emergency Operation Center
                        </p>
                        <p className="text-sm text-white/70 mt-2">
                            Pusat kendali dan koordinasi penanggulangan krisis kesehatan
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:p-8 flex items-center justify-center min-h-screen lg:min-h-0">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] px-4 py-8 lg:px-0">
                        {/* Mobile: Back Button */}
                        <div className="lg:hidden">
                            <Link
                                href={landing()}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Beranda
                            </Link>
                        </div>

                        <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                            <h1 className="text-2xl font-bold text-foreground">
                                Masuk ke HEOC
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Masukkan email dan password Anda untuk masuk
                            </p>
                        </div>

                        <Card className="p-8 shadow-lg">
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
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                                        placeholder="Masukkan password"
                                                        className="pl-10 pr-10"
                                />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        tabIndex={-1}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
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
