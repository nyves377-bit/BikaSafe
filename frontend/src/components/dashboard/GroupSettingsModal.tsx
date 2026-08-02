import React, { useState, useEffect } from 'react';
import { Settings, X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/instance';
import { cn } from '../../utils/cn';

interface GroupSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentStats: {
        groupName: string;
        contributionAmt?: number;
        frequency?: string;
        penaltyRules?: string;
    };
}

const FREQUENCIES = [
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Bi-Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
];

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
    isOpen, onClose, onSuccess, currentStats
}) => {
    const [name, setName] = useState('');
    const [contributionAmt, setContributionAmt] = useState('');
    const [frequency, setFrequency] = useState('MONTHLY');
    const [penaltyLateFee, setPenaltyLateFee] = useState('');
    const [penaltyGraceDays, setPenaltyGraceDays] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && currentStats) {
            setName(currentStats.groupName || '');
            setContributionAmt(currentStats.contributionAmt?.toString() || '');
            setFrequency(currentStats.frequency || 'MONTHLY');
            try {
                const rules = currentStats.penaltyRules
                    ? JSON.parse(currentStats.penaltyRules)
                    : { lateFee: 500, gracePeriodDays: 2 };
                setPenaltyLateFee(rules.lateFee?.toString() || '500');
                setPenaltyGraceDays(rules.gracePeriodDays?.toString() || '2');
            } catch {
                setPenaltyLateFee('500');
                setPenaltyGraceDays('2');
            }
            setError('');
            setSuccess(false);
        }
    }, [isOpen, currentStats]);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.patch('/api/groups/settings', {
                name: name.trim() || undefined,
                contributionAmt: contributionAmt ? parseFloat(contributionAmt) : undefined,
                frequency,
                penaltyLateFee: penaltyLateFee ? parseFloat(penaltyLateFee) : undefined,
                penaltyGraceDays: penaltyGraceDays ? parseInt(penaltyGraceDays) : undefined,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 800);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card border border-white/10 rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-500/10 p-2.5 rounded-2xl">
                            <Settings className="w-5 h-5 text-brand-400" />
                        </div>
                        <h2 className="text-xl font-black text-white">Group Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <p className="text-sm text-emerald-300 font-bold">Settings saved successfully!</p>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Group Identity */}
                    <div>
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.15em] mb-4">
                            Group Identity
                        </p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Inkingi y'Amahoro"
                                className="input-dark w-full rounded-2xl px-5 py-3.5 text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Contribution Rules */}
                    <div>
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.15em] mb-4">
                            Contribution Rules
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                    Amount (RWF)
                                </label>
                                <input
                                    type="number"
                                    value={contributionAmt}
                                    onChange={e => setContributionAmt(e.target.value)}
                                    placeholder="e.g. 10000"
                                    min="1"
                                    className="input-dark w-full rounded-2xl px-5 py-3.5 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                    Frequency
                                </label>
                                <select
                                    value={frequency}
                                    onChange={e => setFrequency(e.target.value)}
                                    className="input-dark w-full rounded-2xl px-5 py-3.5 text-sm font-medium"
                                >
                                    {FREQUENCIES.map(f => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Penalty Rules */}
                    <div>
                        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.15em] mb-4">
                            Penalty Rules
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                    Late Fee (RWF)
                                </label>
                                <input
                                    type="number"
                                    value={penaltyLateFee}
                                    onChange={e => setPenaltyLateFee(e.target.value)}
                                    placeholder="e.g. 500"
                                    min="0"
                                    className="input-dark w-full rounded-2xl px-5 py-3.5 text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                    Grace Period (days)
                                </label>
                                <input
                                    type="number"
                                    value={penaltyGraceDays}
                                    onChange={e => setPenaltyGraceDays(e.target.value)}
                                    placeholder="e.g. 2"
                                    min="0"
                                    max="30"
                                    className="input-dark w-full rounded-2xl px-5 py-3.5 text-sm font-medium"
                                />
                            </div>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-600 font-medium px-1">
                            Members who pay after the grace period will be charged the late fee automatically.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className={cn(
                            "w-full py-4 rounded-[20px] font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]",
                            success
                                ? "bg-emerald-500 text-white"
                                : "bg-brand-600 text-white hover:bg-brand-500 shadow-xl shadow-brand-500/20 disabled:opacity-50"
                        )}
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : success ? (
                            <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Settings</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GroupSettingsModal;
