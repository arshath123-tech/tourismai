import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Activity,
  Server,
  UserPlus,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  Lock,
  Globe,
  Database,
  Cpu,
  CloudSun,
  Newspaper
} from 'lucide-react';
import {
  fetchAdminDashboardApi,
  fetchAdminTravellersApi,
  adminCreateTravellerApi,
  adminDeleteTravellerApi,
  fetchActivitiesApi,
  fetchApiMonitorApi,
  runSyntheticHealthTestApi,
  updateUserRoleApi
} from '../services/api';
import {
  AdminDashboardData,
  User,
  ActivityLog,
  ServiceHealthItem,
  SyntheticTestResult
} from '../types';
import { COUNTRIES } from '../data/countries';

interface AdminDashboardTabProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export function AdminDashboardTab({ currentUser, onOpenAuth }: AdminDashboardTabProps) {
  const isAdmin = currentUser?.role === 'ROLE_ADMIN';

  const [activeSubTab, setActiveSubTab] = useState<'travellers' | 'activities' | 'health' | 'overview'>('overview');
  
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [travellers, setTravellers] = useState<User[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [healthServices, setHealthServices] = useState<ServiceHealthItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Traveller Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newNationality, setNewNationality] = useState('India');
  const [newTravelStyle, setNewTravelStyle] = useState('Solo');

  // Activities Filter State
  const [activitySearch, setActivitySearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [travellerFilter, setTravellerFilter] = useState('');

  // Synthetic Test State
  const [runningTest, setRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<SyntheticTestResult | null>(null);

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [data, travs, acts] = await Promise.all([
        fetchAdminDashboardApi(),
        fetchAdminTravellersApi(),
        fetchActivitiesApi({
          activityType: activityTypeFilter,
          travellerId: travellerFilter,
          search: activitySearch
        })
      ]);
      setDashboardData(data);
      setTravellers(travs);
      setActivities(acts);
      setHealthServices(data.services);
    } catch (err: any) {
      setError(err.message || 'Access denied or failed to load admin telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, activityTypeFilter, travellerFilter, activitySearch]);

  const handleAddTraveller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateTravellerApi({
        username: newUsername,
        password: newPassword,
        fullName: newFullName || newUsername,
        nationality: newNationality,
        travelStyle: newTravelStyle
      });
      setShowAddModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create traveller');
    }
  };

  const handleDeleteTraveller = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete traveller "${name}"?`)) return;
    try {
      await adminDeleteTravellerApi(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove traveller');
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_TRAVELLER' : 'ROLE_ADMIN';
    try {
      await updateUserRoleApi(userId, newRole);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Role modification failed');
    }
  };

  const handleRunSyntheticTest = async () => {
    setRunningTest(true);
    try {
      const res = await runSyntheticHealthTestApi();
      setTestResult(res);
      // Reload health data
      const health = await fetchApiMonitorApi();
      setHealthServices(health.services);
    } catch (err: any) {
      alert(err.message || 'Synthetic test execution failed');
    } finally {
      setRunningTest(false);
    }
  };

  // IF NOT ADMIN -> SHOW 403 FORBIDDEN INTERCEPTOR
  if (!isAdmin) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-red-900/40 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-3xl bg-red-900/40 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <div className="inline-block bg-red-950 text-red-300 font-bold text-xs px-3 py-1 rounded-full border border-red-800 uppercase">
          Restricted Access
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Administrator Privileges Required
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          This administration center is strictly reserved for Admin accounts. Please sign in with an administrator account to continue.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={onOpenAuth}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Control Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-purple-900/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Tourism AI Admin Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Traveller Management & System Dashboard
            </h1>
            <p className="text-xs text-slate-300">
              Admin Account: <strong className="text-white font-medium">{currentUser?.username}</strong> ({currentUser?.email})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl border border-slate-700 transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-purple-900/40">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'overview'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Overview & Summary</span>
          </button>

          <button
            onClick={() => setActiveSubTab('travellers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'travellers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Traveller Administration</span>
          </button>

          <button
            onClick={() => setActiveSubTab('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'activities'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveSubTab('health')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'health'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>API & AI Health Monitor</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB TAB 1: OVERVIEW & STATISTICS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Travellers</span>
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {dashboardData?.stats.totalTravellers || travellers.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Registered traveller directory</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Activities Today</span>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {dashboardData?.stats.totalActivitiesToday || activities.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Logged travel events & pings</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Safety Audits</span>
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {dashboardData?.stats.activeSafetyAssessments || 12}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Risk evaluations generated</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">System Health Score</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-600">
                {dashboardData?.stats.systemHealthScore || 99.8}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">4 Services Operational</p>
            </div>
          </div>

          {/* Quick Health Summary Grid */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              Service Status Snapshot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthServices.map((svc) => (
                <div key={svc.key} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800">{svc.name}</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{svc.endpoint}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                      {svc.status} ({svc.latencyMs}ms)
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Uptime: {svc.uptimePercent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB TAB 2: TRAVELLER ACCOUNT ADMINISTRATION (Add / Remove Only) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'travellers' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Traveller Account Administration
              </h2>
              <p className="text-xs text-slate-500">
                Admin-only account creation (<code className="font-mono">POST /api/admin/travellers</code>), removal (<code className="font-mono">DELETE /api/admin/travellers/:id</code>), and role modification (<code className="font-mono">PUT /api/admin/users/:userId/role</code>).
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Traveller</span>
            </button>
          </div>

          {/* Travellers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                  <th className="p-3">User Details</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Mandatory Nationality</th>
                  <th className="p-3">Travel Style</th>
                  <th className="p-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {travellers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{t.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{t.username} • {t.email}</div>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleRoleChange(t.id, t.role)}
                        title="Click to toggle Role"
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition ${
                          t.role === 'ROLE_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                        }`}
                      >
                        {t.role}
                      </button>
                    </td>

                    <td className="p-3 font-semibold text-slate-800">
                      🌐 {t.nationality}
                    </td>

                    <td className="p-3 font-medium">
                      {t.travelStyle}
                    </td>

                    <td className="p-3 text-right">
                      {t.role !== 'ROLE_ADMIN' ? (
                        <button
                          onClick={() => handleDeleteTraveller(t.id, t.username)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] rounded-lg border border-red-200 transition flex items-center justify-end gap-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">Protected Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB TAB 3: ACTIVITY AUDIT MONITORING */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'activities' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Comprehensive Traveller Activity Monitoring Log Feed
              </h2>
              <p className="text-xs text-slate-500">
                Real-time audit log tracking logins, travel research, safety assessments, chat prompts, and saved destinations.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
              />
            </div>

            <select
              value={activityTypeFilter}
              onChange={(e) => setActivityTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-slate-700"
            >
              <option value="">All Activity Types</option>
              <option value="LOGIN">LOGIN</option>
              <option value="RESEARCH">RESEARCH</option>
              <option value="ASSESSMENT">ASSESSMENT</option>
              <option value="CHAT_MESSAGE">CHAT_MESSAGE</option>
              <option value="SAVE_DESTINATION">SAVE_DESTINATION</option>
              <option value="ADMIN_ACTION">ADMIN_ACTION</option>
            </select>

            <select
              value={travellerFilter}
              onChange={(e) => setTravellerFilter(e.target.value)}
              className="px-3 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold text-slate-700"
            >
              <option value="">All Travellers</option>
              {travellers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.username} ({t.nationality})
                </option>
              ))}
            </select>
          </div>

          {/* Activity Log Feed Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Traveller</th>
                  <th className="p-3">Activity Type</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 font-mono">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {activities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(a.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {a.username}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono border ${
                        a.activityType === 'LOGIN' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        a.activityType === 'RESEARCH' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                        a.activityType === 'ASSESSMENT' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        a.activityType === 'ADMIN_ACTION' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {a.activityType}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {a.details}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {a.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB TAB 4: SYSTEM, API & AI FUNCTIONALITY HEALTH MONITOR */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'health' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                System, API & AI Functionality Health Monitor
              </h2>
              <p className="text-xs text-slate-500">
                Live latency, status code (`HEALTHY`, `DEGRADED`, `OFFLINE`), and synthetic testing (`POST /api/admin/api-monitor/test`).
              </p>
            </div>

            <button
              onClick={handleRunSyntheticTest}
              disabled={runningTest}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {runningTest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Synthetic Pings...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Synthetic Health Test</span>
                </>
              )}
            </button>
          </div>

          {/* Health Monitor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthServices.map((svc) => (
              <div key={svc.key} className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {svc.key === 'spring_ai' && <Cpu className="w-5 h-5 text-purple-400" />}
                    {svc.key === 'weather_api' && <CloudSun className="w-5 h-5 text-amber-400" />}
                    {svc.key === 'news_api' && <Newspaper className="w-5 h-5 text-indigo-400" />}
                    {svc.key === 'postgres_db' && <Database className="w-5 h-5 text-emerald-400" />}
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{svc.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{svc.endpoint}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                    {svc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Response Latency:</span>
                    <div className="font-mono font-bold text-emerald-400">{svc.latencyMs} ms</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Uptime Ratio:</span>
                    <div className="font-mono font-bold text-indigo-300">{svc.uptimePercent}%</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono">
                  {svc.details}
                </p>
              </div>
            ))}
          </div>

          {/* Synthetic Test Output Log */}
          {testResult && (
            <div className="bg-slate-950 text-white rounded-2xl p-6 border border-purple-900/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-100">
                    Synthetic Health Test Results (ID: {testResult.testId})
                  </span>
                </div>
                <span className="bg-emerald-900/80 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded font-bold border border-emerald-700">
                  Status: {testResult.overallStatus} ({testResult.totalDurationMs}ms)
                </span>
              </div>

              <div className="space-y-2">
                {testResult.servicesTested.map((st, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-200">{st.name}</div>
                      <p className="text-[11px] text-slate-400">{st.message}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold">{st.status}</span>
                      <div className="text-[10px] text-slate-500">{st.latencyMs}ms ping</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD TRAVELLER MODAL (Admin Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Admin: Create New Traveller Account
            </h3>
            <form onSubmit={handleAddTraveller} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  placeholder="e.g. Kenji Sato"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  placeholder="Password"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-900 mb-1">Mandatory Nationality</label>
                <select
                  required
                  value={newNationality}
                  onChange={(e) => setNewNationality(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-sm font-semibold"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Travel Style</label>
                <select
                  value={newTravelStyle}
                  onChange={(e) => setNewTravelStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                >
                  <option value="Solo">Solo</option>
                  <option value="Family">Family</option>
                  <option value="Business">Business</option>
                  <option value="Backpacker">Backpacker</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
                >
                  Create Traveller Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
