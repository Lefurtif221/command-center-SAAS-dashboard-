const mockPortfolio = [
  { id: '1', name: 'Apple Inc.', symbol: 'AAPL', type: 'Actions', quantity: 15, buyPrice: 178.50, currentPrice: 192.30 },
  { id: '2', name: 'Tesla Inc.', symbol: 'TSLA', type: 'Actions', quantity: 8, buyPrice: 245.00, currentPrice: 218.40 },
  { id: '3', name: 'Bitcoin', symbol: 'BTC', type: 'Crypto', quantity: 0.25, buyPrice: 42000, currentPrice: 48500 },
  { id: '4', name: 'Ethereum', symbol: 'ETH', type: 'Crypto', quantity: 2.5, buyPrice: 2200, currentPrice: 2580 },
  { id: '5', name: 'ETF S&P 500', symbol: 'SPY', type: 'ETF', quantity: 20, buyPrice: 450.00, currentPrice: 478.50 },
  { id: '6', name: 'Or', symbol: 'XAU', type: 'Métaux', quantity: 5, buyPrice: 1920, currentPrice: 2045 },
]

const mockPerf = [
  { month: 'Jan', value: 45200 }, { month: 'Fév', value: 47800 }, { month: 'Mar', value: 44500 },
  { month: 'Avr', value: 51200 }, { month: 'Mai', value: 49800 }, { month: 'Jun', value: 53400 },
]

export default function Investments() {
  const totalValue = mockPortfolio.reduce((a, x) => a + x.quantity * x.currentPrice, 0)
  const totalCost = mockPortfolio.reduce((a, x) => a + x.quantity * x.buyPrice, 0)
  const totalPnL = totalValue - totalCost
  const pct = ((totalPnL / totalCost) * 100).toFixed(2)
  const maxV = Math.max(...mockPerf.map(p => p.value))
  const minV = Math.min(...mockPerf.map(p => p.value))

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-lg">
          <div className="text-xs text-muted mb-1">Valeur totale</div>
          <div className="text-xl font-semibold tracking-tight">${totalValue.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${parseFloat(pct) >= 0 ? 'text-success' : 'text-accentSec'}`}>
            <span className="iconify" data-icon={parseFloat(pct) >= 0 ? "lucide:trending-up" : "lucide:trending-down"} data-width="12"></span>
            {parseFloat(pct) >= 0 ? '+' : ''}{pct}%
          </div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-lg">
          <div className="text-xs text-muted mb-1">Investi</div>
          <div className="text-xl font-semibold tracking-tight">${totalCost.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-muted mt-1">{mockPortfolio.length} actifs</div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-lg">
          <div className="text-xs text-muted mb-1">P&L Total</div>
          <div className={`text-xl font-semibold tracking-tight ${totalPnL >= 0 ? 'text-success' : 'text-accentSec'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted mt-1">Réalisé + Non-réalisé</div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-lg">
          <div className="text-xs text-muted mb-1">Meilleur actif</div>
          <div className="text-xl font-semibold tracking-tight text-success">ETH</div>
          <div className="text-xs text-success mt-1">+17.27%</div>
        </div>
      </div>

      {/* Chart + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Performance du portfolio</h3>
            <div className="flex gap-2">
              <span className="text-[10px] text-muted bg-bg px-2 py-1 rounded border border-border">1M</span>
              <span className="text-[10px] text-text bg-bg px-2 py-1 rounded border border-accent/30">6M</span>
              <span className="text-[10px] text-muted bg-bg px-2 py-1 rounded border border-border">1A</span>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 px-2 border-b border-l border-border/50 relative">
            {mockPerf.map((item, i) => {
              const h = ((item.value - minV) / (maxV - minV)) * 60 + 20
              return <div key={i} className="flex-1 bg-gradient-to-t from-accent/20 to-transparent rounded-t-sm hover:from-accent/30 transition-all" style={{ height: `${h}%` }} />
            })}
            <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none">
              <path d={`M${mockPerf.map((item, i) => { const x = (i / (mockPerf.length - 1)) * 100; const y = 100 - ((item.value - minV) / (maxV - minV)) * 60 - 20; return `${x}% ${y}%` }).join(' L')}`} fill="none" stroke="#00d1ff" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex justify-between mt-2">
            {mockPerf.map((item, i) => <span key={i} className="text-[10px] text-muted">{item.month}</span>)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-4">Répartition</h3>
          <div className="space-y-4">
            {[{ label: 'Actions', pct: 45, color: 'bg-accent' }, { label: 'Crypto', pct: 30, color: 'bg-warning' }, { label: 'ETF', pct: 15, color: 'bg-success' }, { label: 'Métaux', pct: 10, color: 'bg-accentSec' }].map((a, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{a.label}</span>
                  <span className="text-text font-medium">{a.pct}%</span>
                </div>
                <div className="w-full bg-bg h-1.5 rounded-full overflow-hidden">
                  <div className={`${a.color} h-full`} style={{ width: `${a.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-medium">Mes actifs</h3>
          <button className="text-xs text-accent hover:underline">+ Ajouter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg text-muted border-b border-border">
              <tr>
                <th className="p-3 font-medium">Actif</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium text-right">Quantité</th>
                <th className="p-3 font-medium text-right">Prix d'achat</th>
                <th className="p-3 font-medium text-right">Prix actuel</th>
                <th className="p-3 font-medium text-right">P&L</th>
                <th className="p-3 font-medium text-right">Valeur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockPortfolio.map((asset) => {
                const pnl = (asset.currentPrice - asset.buyPrice) * asset.quantity
                const pnlPct = ((asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100).toFixed(2)
                const val = asset.quantity * asset.currentPrice
                return (
                  <tr key={asset.id} className="hover:bg-bg/50 transition-colors">
                    <td className="p-3"><div className="font-medium">{asset.symbol}</div><div className="text-[10px] text-muted">{asset.name}</div></td>
                    <td className="p-3"><span className="bg-border px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">{asset.type}</span></td>
                    <td className="p-3 text-right">{asset.quantity}</td>
                    <td className="p-3 text-right text-muted">${asset.buyPrice.toLocaleString()}</td>
                    <td className="p-3 text-right font-medium">${asset.currentPrice.toLocaleString()}</td>
                    <td className={`p-3 text-right ${pnl >= 0 ? 'text-success' : 'text-accentSec'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      <div className="text-[10px]">{pnl >= 0 ? '+' : ''}{pnlPct}%</div>
                    </td>
                    <td className="p-3 text-right font-medium">${val.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}