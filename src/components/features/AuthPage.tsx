import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function AuthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleAuth = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setSuccessMessage("Vérifiez votre boîte e-mail pour le lien de confirmation.");
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de l\'authentification.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mb-4">
                        B
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Bienvenue sur Budgy</CardTitle>
                    <CardDescription>
                        {isLogin ? 'Connectez-vous pour accéder à votre budget' : 'Créez un compte pour commencer à gérer vos finances'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm rounded bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-900">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-3 text-sm rounded bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900">
                                {successMessage}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Adresse e-mail</label>
                            <Input
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mot de passe</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? 'Chargement...' : isLogin ? 'Se connecter' : 'S\'inscrire'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-zinc-500">
                        {isLogin ? (
                            <>
                                Pas encore de compte ?{' '}
                                <button type="button" onClick={() => setIsLogin(false)} className="text-indigo-600 hover:underline font-medium">
                                    S'inscrire
                                </button>
                            </>
                        ) : (
                            <>
                                Déjà un compte ?{' '}
                                <button type="button" onClick={() => setIsLogin(true)} className="text-indigo-600 hover:underline font-medium">
                                    Se connecter
                                </button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
