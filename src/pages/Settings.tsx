import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTradeStore } from '../store/tradeStore'
import { useAuthStore } from '../store/authStore'
import { signOut, fetchTrades, saveTrade } from '../lib/supabaseService'
import { isSupabaseConfigured } from '../lib/supabase'
import { exportCsv } from '../utils/exportCsv'
import { Cloud, CloudOff, Download, LogOut, Upload, CheckCircle, XCircle, DollarSign } from 'lucide-react'

export default function Settings() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<'success' | 'error' | null>(null)
  const [capitalInput, setCapitalInput] = useState('')
  const [capitalSaved, setCapitalSaved] = useState(false)
  const navigate = useNavigate()
  const trades = useTradeStore(s => s.trades)
  const capital = useTradeStore(s => s.capital)
  const setCapital = useTradeStore(s => s.setCapital)
  const { userId, email, clearUser } = useAuthStore()
  const configured = isSupabaseConfigured()

  const handleSync = async () => {
    if (!userId) return
    setSyncing(true)
    setSyncResult(null)
    try {
      for (const trade of trades) {
        await saveTrade(trade, userId)
      }
      setSyncResult('success')
    } catch {
      setSyncResult('error')
    } finally {
      setSyncing(false)
    }
  }

  const handlePull = async () => {
    if (!userId) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const remote = await fetchTrades(userId)
      if (remote.length > 0) {
        useTradeStore.setState({ trades: remote })
      }
      setSyncResult('success')
    } catch {
      setSyncResult('error')
    } finally {
      setSyncing(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    clearUser()
    navigate('/login')
  }

  const handleSaveCapital = () => {
    const val = parseFloat(capitalInput)
    if (!isNaN(val) && val >= 0) {
      setCapital(val)
      setCapitalSaved(true)
      setTimeout(() => setCapitalSaved(false), 2000)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6 max-w-lg">
        <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400 mb-3">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Account Capital
          </h3>
          <p className="text-xs text-neutral-500 mb-3">
            Set your account capital to calculate ROI on each trade.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="any"
              placeholder={capital > 0 ? String(capital) : 'e.g. 10000'}
              value={capitalInput}
              onChange={e => setCapitalInput(e.target.value)}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
            />
            <button onClick={handleSaveCapital}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
              {capitalSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
          {capital > 0 && (
            <p className="text-xs text-green-500 mt-2">Current capital: ${capital.toLocaleString()}</p>
          )}
        </div>

        <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400 mb-3">Cloud Sync</h3>
          {configured ? (
            <div className="flex items-center gap-2 text-sm text-green-500 mb-4">
              <CheckCircle className="w-4 h-4" />
              Supabase configured
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-yellow-500 mb-4">
              <XCircle className="w-4 h-4" />
              Supabase not configured — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
            </div>
          )}

          {email && (
            <div className="flex items-center justify-between mb-4 p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-green-500" />
                <span className="text-sm text-neutral-300">{email}</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-500 transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}

          {configured && (
            <div className="flex gap-2">
              {!email ? (
                <button onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                  <Cloud className="w-4 h-4" />
                  Sign in to sync
                </button>
              ) : (
                <>
                  <button onClick={handleSync} disabled={syncing}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {syncing ? 'Syncing...' : 'Push trades'}
                  </button>
                  <button onClick={handlePull} disabled={syncing}
                    className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <CloudOff className="w-4 h-4" />
                    Pull from cloud
                  </button>
                </>
              )}
            </div>
          )}

          {syncResult === 'success' && (
            <p className="text-sm text-green-500 mt-3">Sync completed successfully!</p>
          )}
          {syncResult === 'error' && (
            <p className="text-sm text-red-500 mt-3">Sync failed. Check your Supabase config.</p>
          )}
        </div>

        <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400 mb-3">Data</h3>
          <p className="text-xs text-neutral-500 mb-3">All trades are stored in your browser (localStorage). Use CSV export for backup.</p>
          <button onClick={() => exportCsv(trades, capital)}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Export all trades as CSV
          </button>
        </div>

        <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-400 mb-3">SQL Schema (Supabase)</h3>
          <p className="text-xs text-neutral-500 mb-3">Create this table in your Supabase SQL editor to use cloud sync:</p>
          <pre className="text-xs text-neutral-400 bg-neutral-950 p-3 rounded-lg overflow-x-auto">
{`create table trades (
  id text primary key,
  user_id uuid references auth.users not null,
  pair text not null,
  exchange text,
  side text not null,
  entry_date timestamptz not null,
  exit_date timestamptz not null,
  entry_price numeric not null,
  exit_price numeric not null,
  quantity numeric not null,
  stop_loss numeric,
  take_profit numeric,
  fees numeric default 0,
  funding_fees numeric default 0,
  setup text,
  tags text[] default '{}',
  notes text default '',
  result numeric not null,
  r_multiple numeric default 0,
  emotion text default 'neutral',
  rule_adherence boolean default true,
  revenge_trade boolean default false,
  mistake_type text default ''
);

alter table trades enable row level security;

create policy "Users can manage own trades"
  on trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`}
          </pre>
        </div>
      </div>
    </div>
  )
}
