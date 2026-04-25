const fs = require('fs');

const sourcePath = 'frontend/src/pages/Dashboard.tsx';
const destPath = 'frontend/src/components/dashboard/Modals.tsx';

if (!fs.existsSync('frontend/src/components/dashboard')) {
    fs.mkdirSync('frontend/src/components/dashboard', { recursive: true });
}

const content = fs.readFileSync(sourcePath, 'utf8');
const lines = content.split('\n');

const splitIndex = lines.findIndex(l => l.startsWith('interface ModalProps {'));

if (splitIndex === -1) {
    console.error("Could not find split point");
    process.exit(1);
}

const dashboardLines = lines.slice(0, splitIndex);
const modalsLines = lines.slice(splitIndex);

// Find the export default Dashboard at the end of modalsLines
const exportIndex = modalsLines.findIndex(l => l.startsWith('export default Dashboard;'));
if (exportIndex !== -1) {
    modalsLines.splice(exportIndex, 1);
}

// Ensure Dashboard exports itself
dashboardLines.push('export default Dashboard;');

// We need imports for Modals
const modalImports = `import React, { useState, useEffect } from 'react';
import { Wallet, Users, TrendingUp, CreditCard, FileText, LogOut, Search, Bell, Plus, Download, ChevronRight, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2, MoreVertical, Filter, Printer, FileCheck, Lock, Upload, Megaphone, Trash2, Calendar, X, Vote, CheckSquare, Layers, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';
import api from '../../api/instance';\n\n`;

const modalsContent = modalImports + modalsLines.join('\n');

// We need to add imports to Dashboard
const newImports = `import { GoalModal, ChangePasswordModal, RecordContributionModal, AddMemberModal, LoanRequestModal, WithdrawalRequestModal, AnnouncementModal, MeetingModal, PollModal, LoanCalculator, FinanceChart } from '../components/dashboard/Modals';\n`;

const dashboardContent = dashboardLines.join('\n').replace(
    `import NotificationCenter from '../components/NotificationCenter';`,
    `import NotificationCenter from '../components/NotificationCenter';\n${newImports}`
);

// We need to add exports to Modals
const exportedModalsContent = modalsContent
    .replace('const GoalModal:', 'export const GoalModal:')
    .replace('const ChangePasswordModal:', 'export const ChangePasswordModal:')
    .replace('const RecordContributionModal:', 'export const RecordContributionModal:')
    .replace('const AddMemberModal:', 'export const AddMemberModal:')
    .replace('const LoanRequestModal:', 'export const LoanRequestModal:')
    .replace('const WithdrawalRequestModal:', 'export const WithdrawalRequestModal:')
    .replace('const FinanceChart =', 'export const FinanceChart =')
    .replace('const LoanCalculator:', 'export const LoanCalculator:')
    .replace('const AnnouncementModal:', 'export const AnnouncementModal:')
    .replace('const MeetingModal:', 'export const MeetingModal:')
    .replace('const PollModal:', 'export const PollModal:');

fs.writeFileSync(destPath, exportedModalsContent);
fs.writeFileSync(sourcePath, dashboardContent);

console.log('Successfully split Dashboard.tsx');
