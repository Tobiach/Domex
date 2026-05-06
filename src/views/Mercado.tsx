import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, BarChart3, Globe, Activity } from 'lucide-react';
import { TradingViewWidget } from '../components/Widgets/TradingViewWidget';
import { cn } from '../lib/utils';

type TabType = 'CRIPTO' | 'ACCIONES' | 'FOREX';

export default function Mercado() {
  const [activeTab, setActiveTab] = useState<TabType>('CRIPTO');

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'CRIPTO', label: 'Cripto', icon: Activity },
    { id: 'ACCIONES', label: 'Acciones', icon: BarChart3 },
    { id: 'FOREX', label: 'Forex', icon: Globe },
  ];

  const getChartSymbol = () => {
    switch (activeTab) {
      case 'CRIPTO': return 'BINANCE:BTCUSDT';
      case 'ACCIONES': return 'INDEX:SPX';
      case 'FOREX': return 'FX:EURUSD';
      default: return 'BINANCE:BTCUSDT';
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Ticker Tape */}
      <div className="w-full bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/5">
        <TradingViewWidget
          height={46}
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
          config={{
            "symbols": [
              {"proName": "BINANCE:BTCUSDT", "title": "Bitcoin"},
              {"proName": "BINANCE:ETHUSDT", "title": "Ethereum"},
              {"proName": "BINANCE:SOLUSDT", "title": "Solana"},
              {"proName": "NASDAQ:TSLA", "title": "Tesla"},
              {"proName": "NASDAQ:AAPL", "title": "Apple"},
              {"proName": "NASDAQ:NVDA", "title": "NVIDIA"},
              {"proName": "INDEX:SPX", "title": "S&P 500"},
              {"proName": "FX:EURUSD", "title": "EUR/USD"},
              {"proName": "FX:USDJPY", "title": "USD/JPY"}
            ],
            "colorTheme": "dark",
            "isTransparent": true,
            "displayMode": "adaptive",
            "locale": "es"
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Mercados en Vivo • REAL TIME</p>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            Mercado <span className="text-primary italic">Global</span>
          </h1>
        </div>
        <TrendingUp className="text-white/20" size={32} />
      </div>

      {/* 2. Tabs Selector */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden",
              activeTab === tab.id ? "text-white" : "text-white/40 hover:bg-white/5"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabMercado"
                className="absolute inset-0 bg-primary/20 border border-primary/50 rounded-xl"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon size={14} className={cn("relative z-10", activeTab === tab.id && "text-primary")} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Category Widget */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl overflow-hidden glass-card border border-white/10"
          >
            {activeTab === 'CRIPTO' && (
              <TradingViewWidget
                height={500}
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js"
                config={{
                  "dataSource": "Crypto",
                  "blockSize": "market_cap_calc",
                  "blockColor": "change",
                  "locale": "es",
                  "colorTheme": "dark",
                  "isTransparent": true
                }}
              />
            )}
            {activeTab === 'ACCIONES' && (
              <TradingViewWidget
                height={500}
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
                config={{
                  "colorTheme": "dark",
                  "dateRange": "1D",
                  "showChart": true,
                  "locale": "es",
                  "isTransparent": true,
                  "tabs": [
                    {
                      "title": "Índices",
                      "symbols": [
                        {"s": "INDEX:SPX"},
                        {"s": "INDEX:NDX"},
                        {"s": "INDEX:DJI"}
                      ]
                    },
                    {
                      "title": "Tech",
                      "symbols": [
                        {"s": "NASDAQ:NVDA"},
                        {"s": "NASDAQ:TSLA"},
                        {"s": "NASDAQ:AAPL"},
                        {"s": "NASDAQ:MSFT"}
                      ]
                    }
                  ]
                }}
              />
            )}
            {activeTab === 'FOREX' && (
              <TradingViewWidget
                height={500}
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-forex-rates.js"
                config={{
                  "base": "USD",
                  "colorTheme": "dark",
                  "isTransparent": true,
                  "locale": "es"
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Interactive Chart */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 ml-1 flex items-center gap-2">
          Análisis Técnico <span className="text-primary tracking-normal font-bold">({getChartSymbol()})</span>
        </h3>
        <div className="rounded-2xl overflow-hidden glass-card border border-white/10">
          <TradingViewWidget
            height={500}
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
            config={{
              "symbol": getChartSymbol(),
              "interval": "D",
              "timezone": "Etc/UTC",
              "theme": "dark",
              "style": "1",
              "locale": "es",
              "enable_publishing": false,
              "allow_symbol_change": true,
              "container_id": "tradingview_chart",
              "backgroundColor": "rgba(10, 10, 15, 0)",
              "gridColor": "rgba(255,255,255,0.05)",
              "hide_top_toolbar": false,
              "hide_legend": false,
              "save_image": false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
