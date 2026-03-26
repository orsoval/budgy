import { useState, useEffect, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { useBudgetStore } from '../../store/budgetStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function ProfilePage() {
    const { user, signOut } = useAuth();
    const updateProfile = useBudgetStore((state) => state.updateProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [displayName, setDisplayName] = useState('');
    const [currency, setCurrency] = useState('€');
    const [locale, setLocale] = useState('fr-FR');
    const [threshold, setThreshold] = useState('2000');
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('display_name, currency, locale, global_monthly_threshold')
                .eq('id', user!.id)
                .single();

            if (data) {
                setDisplayName(data.display_name || '');
                setCurrency(data.currency || '€');
                setLocale(data.locale || 'fr-FR');
                setThreshold(data.global_monthly_threshold?.toString() || '2000');
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handleSaveProfile = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        const thresholdValue = parseFloat(threshold) || 2000;

        await supabase
            .from('profiles')
            .update({
                display_name: displayName,
                currency,
                locale,
                global_monthly_threshold: thresholdValue,
            })
            .eq('id', user!.id);

        updateProfile({ displayName, currency, locale, globalMonthlyThreshold: thresholdValue });

        setSaving(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setPasswordMsg('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }
        setPasswordMsg(null);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setPasswordMsg(error.message);
        } else {
            setPasswordMsg('Mot de passe modifié avec succès !');
            setNewPassword('');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations du Profil</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Adresse e-mail</label>
                            <Input type="email" value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
                            <p className="text-xs text-zinc-400">L'adresse e-mail ne peut pas être modifiée ici.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom d'affichage</label>
                            <Input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="ex: Jean Dupont"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Devise</label>
                                <Input
                                    type="text"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    placeholder="€"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Langue / Locale</label>
                                <Input
                                    type="text"
                                    value={locale}
                                    onChange={(e) => setLocale(e.target.value)}
                                    placeholder="fr-FR"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Plafond de dépenses mensuel global ({currency})</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                            {success && <span className="text-sm text-emerald-500 font-medium">✓ Profil mis à jour</span>}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle>Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nouveau mot de passe</label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    {passwordMsg && (
                        <p className={`text-sm ${passwordMsg.includes('succès') ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {passwordMsg}
                        </p>
                    )}
                    <Button variant="outline" onClick={handleChangePassword}>
                        Modifier le mot de passe
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-rose-200 dark:border-rose-900">
                <CardHeader>
                    <CardTitle className="text-rose-500">Zone Danger</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-zinc-500">Se déconnecter de votre compte sur cet appareil.</p>
                    <Button variant="destructive" onClick={signOut}>
                        Se déconnecter
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
