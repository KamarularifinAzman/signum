import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart, ReferenceLine, ComposedChart, Bar, Scatter
} from 'recharts';
import { 
  Settings, Play, Pause, RotateCcw, AlertCircle, Battery, Zap, 
  TrendingUp, Thermometer, DollarSign, Activity, Factory, Info, 
  UploadCloud, FileText, CheckCircle, Sun, Moon, Atom, Sliders, TrendingDown, Clock,
  Tractor, Wind, Globe, Shield, Power, Gauge, Database, ToggleLeft, ToggleRight, Layers, ChevronDown, ChevronRight,
  Target, Brain, Cpu, BookOpen, BarChart3, ChartBar, Download, AlertTriangle, Settings2, ActivitySquare,
  Award, ChartLine, GitBranch, CloudLightning, X, ExternalLink, Eye
} from 'lucide-react';
import Papa from 'papaparse';

// --- Utility Components ---
const StatBox = ({ title, value, unit, icon: Icon, colorClass, highlight = false, theme }) => (
  <div className={`p-3 rounded-lg border ${theme.cardBg} ${highlight ? 'shadow-lg ring-1 ring-red-500/50' : ''}`}>
    <div className="flex items-center justify-between mb-1">
      <h4 className={`text-xs font-medium flex items-center gap-1 ${theme.subText}`}>
        <Icon size={12} className={colorClass} /> {title}
      </h4>
    </div>
    <div className="flex items-baseline gap-1">
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
      <span className={`text-[10px] font-mono uppercase ${theme.subText}`}>{unit}</span>
    </div>
  </div>
);

const SettingSection = ({ title, children, icon: Icon, defaultOpen = false, theme }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-lg mb-3 overflow-hidden ${theme.cardBg} transition-all duration-200`}>
      <button 
        className={`w-full flex justify-between items-center p-3 ${isOpen ? 'bg-slate-700/50' : ''} hover:bg-slate-700/30 transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-400">
          <Icon size={16} /> {title}
        </h4>
        {isOpen ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 p-3 border-t border-slate-700/50' : 'max-h-0 opacity-0'}`}
      >
        <div className="grid grid-cols-1 gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};

const SettingToggle = ({ label, value, onChange }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-slate-400 text-xs">{label}</span>
    <button 
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-slate-600'}`}
    >
      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SettingInput = ({ label, value, onChange, type = "number", step = "1", suffix = "" }) => (
  <div className="flex justify-between items-center gap-2 py-1">
    <label className="text-slate-400 text-xs truncate flex-1">{label}</label>
    <div className="relative w-28 shrink-0">
      <input 
        type={type} 
        step={step}
        value={value} 
        onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)} 
        className="w-full bg-slate-900 border border-slate-600 text-white rounded px-3 py-1 text-xs text-right focus:border-blue-500 focus:outline-none transition-colors pr-8" 
      />
      {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">{suffix}</span>}
    </div>
  </div>
);
const PdfViewerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
      <div className="relative w-full max-w-6xl h-[90vh] rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/30 to-slate-900/50 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Technical Paper</h2>
              <p className="text-xs text-slate-400">Peer-Reviewed Publication - SMR Dispatch Optimisation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href="/251205_TechnicalPaper.pdf"
              download="SMR_Technical_Paper.pdf"
              className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 transition-colors"
              title="Download PDF"
            >
              <Download size={18} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      
        {/* PDF Viewer */}
        <div className="h-[calc(90vh-80px)] p-4">
          <iframe
            src="/251205_TechnicalPaper.pdf"
            className="w-full h-full rounded-lg border border-slate-700/50 bg-white"
            title="Technical Paper PDF"
            loading="lazy"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/50 bg-slate-900/50 text-center">
          <p className="text-xs text-slate-400">
            Scroll to navigate • Use Ctrl+P to print • <span className="text-blue-400">CPS Framework for SMR Dispatch Optimisation</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Easter Egg Modal Component
const EasterEggModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl border border-purple-500/50 bg-gradient-to-br from-purple-900/90 to-slate-900/95 p-8 shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Atom size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Fusion Bros
            </h2>
          </div>
          <p className="text-sm text-slate-400">The future of nuclear energy integration</p>
        </div>

        <div className="mb-8">
          <img 
            src="/easter_egg.png" 
            alt="Fusion Bros Easter Egg"
            className="w-full h-auto rounded-xl border-4 border-purple-500/30 shadow-2xl"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop';
              e.target.alt = 'Placeholder for Fusion Energy';
            }}
          />
          <p className="text-center text-slate-400 text-sm mt-3">
            The next frontier in nuclear energy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        

          <div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/10">
            <h3 className="text-lg font-bold text-cyan-300 mb-2">Technical Note</h3>
            <p className="text-sm text-slate-300">
              The CPS framework developed for SMR dispatch optimisation can be adapted 
              for future fusion power plants, enabling market-responsive dispatch of 
              both fission and fusion assets in a unified energy system with carbon pricing as catalyst.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Back to SMR Simulator
          </button>
          <p className="text-xs text-slate-500 mt-4">
            Git Gud
          </p>
        </div>
      </div>
    </div>
  );
};

// Journal Header Component
const JournalHeader = () => {
  const [showPdfModal, setShowPdfModal] = useState(false);

  return (
    <>
      <div className={`p-4 mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-500/20">
            <BookOpen size={24} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <Award size={18} />
                Peer-Reviewed Publication
              </h2>
              <div className="flex gap-2">
                <a 
                  href="https://press.utp.edu.my" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors group"
                >
                  <span className="text-sm font-bold">Journal Website</span>
                  <ExternalLink size={14} className="group-hover:scale-110 transition-transform" />
                </a>
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition-colors group"
                >
                  <Eye size={14} />
                  <span className="text-sm font-bold">View Full Paper</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="text-amber-300 font-semibold">Abstract:</span> This paper proposes and validates a Cyber-Physical System (CPS) framework for predictive optimisation of SMR operations, minimising operational costs and carbon liabilities while maximising revenue from carbon-credit arbitrage. The methodology integrates machine learning forecasting with Mixed-Integer Linear Programming (MILP) optimisation, incorporating xenon poisoning dynamics. Results demonstrate performance improvements up to 193.74% over static baseload operations.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">SMR</span>
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">CPS</span>
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">MILP</span>
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">MPC</span>
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">Digital Twin</span>
                <span className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300 border border-slate-600">Carbon Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Render PDF Modal */}
      <PdfViewerModal 
        isOpen={showPdfModal} 
        onClose={() => setShowPdfModal(false)} 
      />
    </>
  );
};

// Footer Component with Golden Ratio
const Footer = ({ theme, onShowEasterEgg, isDarkMode, onShowCopyright }) => (
  <footer className={`mt-12 pt-8 pb-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      {/* Golden Ratio Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <GitBranch size={18} />
          Mathematical Foundation
        </h3>
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-400 bg-amber-50'}`}>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="text-2xl font-serif italic font-bold text-amber-300">
              φ = 
              <span className="mx-2 text-white">
                <span className="text-lg">(1 + √5)</span>
                <span className="text-amber-400 mx-1">/</span>
                <span className="text-lg">2</span>
              </span>
            </div>
            <div className="text-sm text-slate-300">
              <span className="font-bold">Golden Ratio φ</span> ≈ 1.6180339887...
            </div>
            <p className="text-xs text-slate-400 mt-2">
              The mathematical constant appears in CPS optimisation boundaries, 
              reactor efficiency patterns, and energy distribution harmonics.
            </p>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
          <BookOpen size={18} />
          Academic Context
        </h3>
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-400 bg-blue-50'}`}>
          <div className="space-y-2">
            <p className="text-sm font-bold text-blue-300">
              Master of Science in Applied Computing
            </p>
            <p className="text-xs text-slate-300">
              This research and dashboard framework were developed as part of postgraduate 
              research in applied computing, focusing on CPS for energy systems.
            </p>
            <div className="pt-2 mt-2 border-t border-slate-700/50">
              <button 
              onClick={onShowCopyright} 
              className="text-xs text-slate-400 text-center"
              >
                Copyright © 2025 KAMARULARIFIN BIN AZMAN @ Institute of Technology PETRONAS Sdn Bhd. All rights reserved.
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Easter Egg Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          <Atom size={18} />
          NotaBene
        </h3>
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-purple-500/30 bg-purple-500/10' : 'border-purple-400 bg-purple-50'}`}>
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Discover the intersection of fission and fusion technologies.
            </p>
            <button
              onClick={onShowEasterEgg}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
              <Atom size={18} />
              Fusion Bros
            </button>
            <p className="text-xs text-slate-400 text-center">
              for TOKAMAK, STEP, ITER, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Paper Reference */}
    <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-100'} text-center`}>
      <p className="text-sm text-slate-400">
        <span className="font-bold">Reference Paper:</span> "SMR Φ*: Cyber-Physical System Framework for Market-Responsive SMR Dispatch Optimisation" • 
        <span className="mx-2">Submitted to: Platform: A Journal of Science and Technology</span> • 
        <span className="text-amber-300 ml-2">Performance Improvement: 193.74%</span>
      </p>
    </div>
  </footer>
);
// Cookie Consent Banner Component
const CookieConsent = ({ onAccept, isDarkMode }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 animate-slide-up">
      <div className={`max-w-4xl mx-auto p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} shadow-2xl`}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Shield size={20} className="text-blue-400" />
              Data Privacy Notice
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              This web application processes all data locally in your browser. No personal information, 
              simulation data, or usage patterns are transmitted to external servers or stored for any purpose 
              beyond your current session. All computations and visualisations occur entirely on your device, 
              ensuring complete data privacy and security.
            </p>
          </div>
          <button
            onClick={onAccept}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
// Copyright Modal Component
const CopyrightModal = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`relative max-w-3xl max-h-[85vh] overflow-auto rounded-2xl border ${isDarkMode ? 'border-blue-500/30 bg-gradient-to-br from-slate-900 to-slate-950' : 'border-slate-300 bg-white'} p-8 shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="space-y-6">
          <div className="text-center pb-4 border-b border-slate-700/50">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-3 rounded-full bg-blue-500/20">
                <BookOpen size={28} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-300">Legal Information & Copyright</h2>
            </div>
            <p className="text-sm text-slate-400">Academic Research Web Application</p>
          </div>

          <div className="space-y-5">
            <div className={`p-5 rounded-lg border ${isDarkMode ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-300 bg-blue-50'}`}>
              <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                <Info size={18} />
                Web Application Owner
              </h3>
              <p className="text-slate-300 font-semibold text-lg mb-1">KAMARULARIFIN BIN AZMAN</p>
              <p className="text-slate-400 text-sm">
                <span className="font-semibold">Contact:</span> kamarularifin.azman[@]iCloud.com
              </p>
            </div>

            <div className={`p-5 rounded-lg border ${isDarkMode ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-300 bg-amber-50'}`}>
              <h3 className="font-bold text-amber-300 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Liability for Content
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                This web application has been developed as part of academic research and designed with utmost care 
                for educational and research purposes. While we strive for accuracy in all simulations, models, 
                and information presented, we cannot guarantee absolute precision of all services and computational 
                results. The application is provided "as-is" for research and educational use.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed mt-3">
                We assume no liability of any kind for direct or indirect consequences resulting from the use of 
                this web application, unless such liability is compulsory under applicable statute law. Users are 
                advised that simulation results should be validated independently before any practical application.
              </p>
            </div>

            <div className={`p-5 rounded-lg border ${isDarkMode ? 'border-purple-500/20 bg-purple-500/5' : 'border-purple-300 bg-purple-50'}`}>
              <h3 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
                <ExternalLink size={18} />
                Liability for External Links
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                This web application may contain hyperlinks to third-party websites. The application owner has 
                no influence on the contents of such external sites and does not assume any responsibility for 
                their contents. The owner expressly distances itself from any unlawful, inaccurate, or ambiguous 
                third-party content. If you become aware of any problematic external content, please contact us.
              </p>
            </div>

            <div className={`p-5 rounded-lg border ${isDarkMode ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-300 bg-emerald-50'}`}>
              <h3 className="font-bold text-emerald-300 mb-3 flex items-center gap-2">
                <Shield size={18} />
                Copyright Notice
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                All content on this website, including text, images, graphics, source code, simulation models, 
                algorithms, research methodologies, and other materials, is the intellectual property of the 
                application owner and is protected by international copyright laws.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Unauthorised reproduction, modification, distribution, or commercial use of any content from 
                this website is strictly prohibited without prior written permission. This application is 
                intended for academic research, educational purposes, and non-commercial use only.
              </p>
            </div>

            <div className={`p-5 rounded-lg border-2 ${isDarkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-400 bg-slate-100'} text-center`}>
              <p className="text-sm font-bold text-slate-300 mb-1">
                Copyright © 2025 KAMARULARIFIN BIN AZMAN
              </p>
              <p className="text-xs text-slate-400">
                @ Institute of Technology PETRONAS Sdn Bhd
              </p>
              <p className="text-xs text-slate-400 mt-2 font-semibold">
                All rights reserved.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Initial Simulation Constants (Matching Python Parameters) ---
const initialSimParams = {
  // SMR Parameters
  horizon: 10000, 
  smr1Enabled: true,
  smr2Enabled: true,
  MAX_OUTPUT: 470, // MW (470,000 kW converted)
  MIN_LOAD_FRAC: 0.01,
  
  // Operational Constraints
  MAX_UP_TIME: 40,
  MIN_UP_TIME: 4,
  MIN_DOWN_TIME: 8,
  
  // Xenon/Safe Operation Parameters (from Python)
  XENON_UPTIME_THRESHOLDS: [0, 8, 40, 72],
  XENON_DOWNTIME_VALUES: [11, 24, 72, 72],
  
  // Cost Parameters (€)
  STARTUP_COST: 2000,
  SHUTDOWN_COST: 1000,
  GENERATION_COST: 152, // €/MWh
  
  // Battery Parameters (from Python)
  STORAGE_CAPACITY: 1000, // MWh (1,000,000 kWh converted)
  MAX_CHARGE_RATE: 100, // MW
  MAX_DISCHARGE_RATE: 100, // MW
  BATTERY_EFFICIENCY: 0.9,
  INITIAL_BATTERY_SOC_SIMULATION_START: 500, // MWh (50% of 1000 MWh)
  
  // Penalty Costs (€/MWh) - ML Objective Function Only
  PENALTY_UNMET_DEMAND: 10000,
  PENALTY_EXCESS_GENERATION: 50000,
  PENALTY_LOW_BATTERY_SOC_FAVORABLE: 2000,
  PENALTY_BATTERY_FULL_FAVORABLE: 10000,
  PENALTY_CRITICAL_BATTERY_SOC_UNFAVORABLE: 3000,
  REWARD_BATTERY_DISCHARGE_FAVORABLE: 1000,
  PENALTY_SMR_ON_AND_BATTERY_DISCHARGING: 0,
  
  // Battery SOC Limits (fractions)
  MIN_BATTERY_RESERVE_FRAC_FAVORABLE: 0.2,
  MAX_BATTERY_SOC_TARGET_FAVORABLE: 0.8,
  CRITICAL_BATTERY_LEVEL_FRAC_UNFAVORABLE: 0.05,
  MAX_BATTERY_SOC_TARGET_UNFAVORABLE: 0.8,
  
  // Market Parameters
  TIERED_DISPATCH_BASELINE: 65.0, // €/tCO2
  EMISSION_FACTOR: 0.001, // tCO2/kWh
  
  // Initial Charge Target
  INITIAL_CHARGE_TARGET_FRAC: 1.0,
  INITIAL_CHARGE_PERIOD_HOURS: 40,
  PENALTY_INITIAL_CHARGE_DEFICIT: 5000,
};

// --- Helper Functions ---
const calculateRequiredDowntime = (uptime, XENON_UPTIME_THRESHOLDS, XENON_DOWNTIME_VALUES) => {
  if (uptime <= XENON_UPTIME_THRESHOLDS[1]) return XENON_DOWNTIME_VALUES[0];
  if (uptime <= XENON_UPTIME_THRESHOLDS[2]) return XENON_DOWNTIME_VALUES[1];
  if (uptime <= XENON_UPTIME_THRESHOLDS[3]) return XENON_DOWNTIME_VALUES[2];
  return XENON_DOWNTIME_VALUES[3];
};

const isFavorablePeriod = (carbonPrice, baseline) => carbonPrice >= baseline;

// --- Generate Synthetic Data ---
const generateSimulatedData = (params, hours) => {
  const data = [];
  const initialCarbon = params.TIERED_DISPATCH_BASELINE;
  const baseDemand = 400;

  for (let i = 0; i < hours; i++) {
    const demand_mwh = baseDemand + Math.floor(Math.sin(i * 0.2) * 200 + Math.random() * 50);
    const carbon_price_eur_t = initialCarbon + Math.sin(i * 0.05) * 20 + Math.random() * 5;
    
    data.push({
      time: i,
      demand_mwh,
      carbon_price_eur_t,
      smr1_power: 0,
      smr2_power: 0,
      smr1_status: 0,
      smr2_status: 0,
      battery_soc: params.INITIAL_BATTERY_SOC_SIMULATION_START,
      battery_charge: 0,
      battery_discharge: 0,
      net_revenue_eur: 0,
      grid_balance_mwh: demand_mwh,
      isFavorable: isFavorablePeriod(carbon_price_eur_t, params.TIERED_DISPATCH_BASELINE) ? 1 : 0,
      datetime: `2025-05-${Math.floor(i/24) + 22} ${String(i%24).padStart(2, '0')}:00:00`
    });
  }
  return data;
};

// --- Main Component ---
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [params, setParams] = useState(initialSimParams);
  const [simData, setSimData] = useState(() => generateSimulatedData(initialSimParams, 10000));
  const [currentHour, setCurrentHour] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [alerts, setAlerts] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(true);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  // SMR States
  const [smrStates, setSMRStates] = useState({
    SMR1: { 
      online: false, 
      uptime: 0, 
      downtime: 72, 
      powerOutput: 0, 
      temperature: 293, 
      requiredDowntime: 0, 
      canStartup: true,
      startupViolation: 0,
      minDowntimeViolation: 0,
      maxUptimeViolation: 0,
      isUptimeTier1: 0,
      isUptimeTier2: 0,
      isUptimeTier3: 0,
      isUptimeTier4: 0,
      downtimeReq: 0,
      isDowntimeMet: 1,
      isStayingOff: 1,
      requiredDowntimeFromLastShutdown: 0
    },
    SMR2: { 
      online: false, 
      uptime: 0, 
      downtime: 72, 
      powerOutput: 0, 
      temperature: 293, 
      requiredDowntime: 0, 
      canStartup: true,
      startupViolation: 0,
      minDowntimeViolation: 0,
      maxUptimeViolation: 0,
      isUptimeTier1: 0,
      isUptimeTier2: 0,
      isUptimeTier3: 0,
      isUptimeTier4: 0,
      downtimeReq: 0,
      isDowntimeMet: 1,
      isStayingOff: 1,
      requiredDowntimeFromLastShutdown: 0
    }
  });
  
  // Battery State
  const [batteryState, setBatteryState] = useState({
    soc: initialSimParams.INITIAL_BATTERY_SOC_SIMULATION_START,
    socPercentage: 50,
    chargeRate: 0,
    dischargeRate: 0,
    isDischarging: 0,
    socDeficitFavorable: 0,
    socExcessFavorable: 0,
    socDeficitUnfavorable: 0,
    chargeExcessUnfavorable: 0,
    initialChargeDeficit: 0
  });
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalSMRGeneration: 0,
    totalBatteryCharge: 0,
    totalBatteryDischarge: 0,
    operationalCost: 0,
    carbonCredits: 0,
    penaltyCosts: 0, // ML Objective only
    netProfit: 0,
    totalStartups: 0,
    totalShutdowns: 0,
    violationCosts: 0,
    mlObjectiveValue: 0 // Combined ML objective
  });
  
  // File Upload States
  const [uploadedData, setUploadedData] = useState(null);
  const [csvContent, setCsvContent] = useState('');
  const [fileMode, setFileMode] = useState(false);
  const [demandComparisonData, setDemandComparisonData] = useState([]);
  const [demandFileMode, setDemandFileMode] = useState(false);

  const mainContainerRef = useRef(null);
  
  // Theme Management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const theme = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-slate-50',
    text: isDarkMode ? 'text-white' : 'text-slate-900',
    cardBg: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm',
    accentText: 'text-blue-500',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    gridColor: isDarkMode ? '#475569' : '#e2e8f0',
  };

  // Add Alert Function
  const addAlert = (message, type = 'info', timestamp) => {
    setAlerts(prev => [...prev.slice(-49), { 
      id: Date.now() + Math.random(), 
      message, 
      type, 
      timestamp: timestamp || currentHour 
    }]);
  };

  // CSV File Handler for Optimisation Results
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      complete: (results) => {
        if (results.data.length > 0) {
          setUploadedData(results.data);
          setCsvContent(JSON.stringify(results.data, null, 2));
          
          // Parse the CSV data - using the provided CSV structure
          const headers = results.data[0];
          const dataRows = results.data.slice(1).filter(row => row.length === headers.length);
          
          const parsedData = dataRows.map((row, index) => {
            const obj = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            
            // Convert numeric values
            const datetime = obj.datetime || `T+${index}`;
            const demand_mw = parseFloat(obj.demand_mw) || 0;
            const carbon_price_eur_t = parseFloat(obj.carbon_price_hourly) || params.TIERED_DISPATCH_BASELINE;
            const smr1_power = parseFloat(obj.power_output_SMR1) || 0;
            const smr2_power = parseFloat(obj.power_output_SMR2) || 0;
            const smr1_status = parseFloat(obj.on_SMR1) || 0;
            const smr2_status = parseFloat(obj.on_SMR2) || 0;
            const battery_soc = parseFloat(obj.battery_soc) || params.INITIAL_BATTERY_SOC_SIMULATION_START;
            const battery_charge = parseFloat(obj.battery_charge) || 0;
            const battery_discharge = parseFloat(obj.battery_discharge) || 0;
            const net_revenue_eur = parseFloat(obj.net_cost_step) ? -parseFloat(obj.net_cost_step) : 0;
            
            return {
              time: index,
              datetime,
              demand_mwh: demand_mw,
              carbon_price_eur_t,
              smr1_power,
              smr2_power,
              smr1_status,
              smr2_status,
              battery_soc,
              battery_charge,
              battery_discharge,
              net_revenue_eur,
              grid_balance_mwh: (smr1_power + smr2_power + battery_discharge - battery_charge) - demand_mw,
              isFavorable: isFavorablePeriod(carbon_price_eur_t, params.TIERED_DISPATCH_BASELINE) ? 1 : 0,
              total_power_output: (parseFloat(obj.total_power_output) || 0),
              gen_cost: (parseFloat(obj.gen_cost) || 0),
              carbon_credit: (parseFloat(obj.carbon_credit) || 0)
            };
          });
          
          // Update SMR states from first data point
          if (parsedData.length > 0) {
            const firstData = parsedData[0];
            setSMRStates({
              SMR1: { 
                ...smrStates.SMR1,
                online: firstData.smr1_status === 1,
                powerOutput: firstData.smr1_power,
                uptime: firstData.smr1_status === 1 ? 1 : 0,
                downtime: firstData.smr1_status === 1 ? 0 : 1
              },
              SMR2: { 
                ...smrStates.SMR2,
                online: firstData.smr2_status === 1,
                powerOutput: firstData.smr2_power,
                uptime: firstData.smr2_status === 1 ? 1 : 0,
                downtime: firstData.smr2_status === 1 ? 0 : 1
              }
            });
            
            setBatteryState({
              ...batteryState,
              soc: firstData.battery_soc,
              socPercentage: (firstData.battery_soc / params.STORAGE_CAPACITY) * 100,
              chargeRate: firstData.battery_charge,
              dischargeRate: firstData.battery_discharge,
              isDischarging: firstData.battery_discharge > 0 ? 1 : 0
            });
          }
          
          setSimData(parsedData);
          setFileMode(true);
          setCurrentHour(0);
          addAlert(`Optimisation results loaded: ${parsedData.length} hours of data`, 'success');
        }
      },
      error: (error) => {
        addAlert(`Error parsing CSV: ${error.message}`, 'error');
      }
    });
  };

  // CSV Handler for Demand Comparison Data
  const handleDemandCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      complete: (results) => {
        if (results.data.length > 0) {
          const headers = results.data[0];
          const dataRows = results.data.slice(1).filter(row => row.length === headers.length);
          
          // Process demand comparison data (scheduled, real, forecasted)
          const demandData = {};
          
          dataRows.forEach((row, index) => {
            const obj = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            
            const datetime = obj.datetime || `T+${Math.floor(index/3)}`;
            const name = obj.name || '';
            const value = parseFloat(obj.values) || 0;
            const hour = parseInt(datetime.split(' ')[1].split(':')[0]) || index % 24;
            
            if (!demandData[hour]) {
              demandData[hour] = {
                time: hour,
                scheduled_demand: 0,
                real_demand: 0,
                forecasted_demand: 0
              };
            }
            
            if (name.includes('Scheduled')) {
              demandData[hour].scheduled_demand = value / 1000; // Convert kW to MW
            } else if (name.includes('Real')) {
              demandData[hour].real_demand = value / 1000; // Convert kW to MW
            } else if (name.includes('Forecasted')) {
              demandData[hour].forecasted_demand = value / 1000; // Convert kW to MW
            }
          });
          
          const comparisonData = Object.values(demandData).sort((a, b) => a.time - b.time);
          setDemandComparisonData(comparisonData);
          setDemandFileMode(true);
          
          // Update simulation data with real demand if available
          if (comparisonData.length > 0 && !fileMode) {
            const updatedSimData = simData.map((item, idx) => {
              const demandPoint = comparisonData[idx % comparisonData.length];
              return {
                ...item,
                demand_mwh: demandPoint.real_demand || item.demand_mwh
              };
            });
            setSimData(updatedSimData);
          }
          
          addAlert(`Demand comparison data loaded: ${comparisonData.length} hours`, 'success');
        }
      },
      error: (error) => {
        addAlert(`Error parsing demand CSV: ${error.message}`, 'error');
      }
    });
  };

  // Optimisation Logic (Improved - Respects constraints better)
  const runOptimisationStep = useCallback((hourIndex) => {
    if (!simData[hourIndex]) return null;
    
    const currentData = simData[hourIndex];
    const isFavorable = isFavorablePeriod(currentData.carbon_price_eur_t, params.TIERED_DISPATCH_BASELINE);
    const demand = currentData.demand_mwh;
    
    // Initialize variables
    let smr1Power = 0;
    let smr2Power = 0;
    let smr1Online = smrStates.SMR1.online;
    let smr2Online = smrStates.SMR2.online;
    let batteryCharge = 0;
    let batteryDischarge = 0;
    let newSoc = batteryState.soc;
    let unmetDemand = 0;
    let excessGeneration = 0;
    
    // --- SMR Dispatch Logic with Improved Constraints ---
    let smr1CanStart = smrStates.SMR1.canStartup && 
                        smrStates.SMR1.downtime >= smrStates.SMR1.requiredDowntime &&
                        smrStates.SMR1.downtime >= params.MIN_DOWN_TIME;
    
    let smr2CanStart = smrStates.SMR2.canStartup && 
                        smrStates.SMR2.downtime >= smrStates.SMR2.requiredDowntime &&
                        smrStates.SMR2.downtime >= params.MIN_DOWN_TIME;
    
    // Check if SMRs should be shut down due to max uptime
    if (smrStates.SMR1.uptime >= params.MAX_UP_TIME && smr1Online) {
      smr1Online = false;
      addAlert(`SMR1 reached max uptime (${params.MAX_UP_TIME}h), shutting down`, 'warning', hourIndex);
    }
    
    if (smrStates.SMR2.uptime >= params.MAX_UP_TIME && smr2Online) {
      smr2Online = false;
      addAlert(`SMR2 reached max uptime (${params.MAX_UP_TIME}h), shutting down`, 'warning', hourIndex);
    }
    
    // Check if SMRs can't be started due to min downtime
    if (!smr1Online && smrStates.SMR1.downtime < params.MIN_DOWN_TIME) {
      smr1CanStart = false;
    }
    
    if (!smr2Online && smrStates.SMR2.downtime < params.MIN_DOWN_TIME) {
      smr2CanStart = false;
    }
    
    // Calculate required power
    const requiredPower = demand;
    
    // Strategy: Try to keep one SMR online when possible
    // Dispatch logic: Start SMR1 first if needed and available
    if (requiredPower > 0 && smr1CanStart && !smr1Online && !smr2Online) {
      smr1Online = true;
      smr1Power = Math.min(params.MAX_OUTPUT, Math.max(requiredPower, params.MAX_OUTPUT * params.MIN_LOAD_FRAC));
      addAlert(`SMR1 started: ${smr1Power.toFixed(1)} MW`, 'success', hourIndex);
    } else if (smr1Online) {
      smr1Power = Math.min(params.MAX_OUTPUT, Math.max(requiredPower, params.MAX_OUTPUT * params.MIN_LOAD_FRAC));
    }
    
    // Start SMR2 only if needed and SMR1 is at max or unavailable
    const remainingAfterSMR1 = Math.max(0, requiredPower - smr1Power);
    if (remainingAfterSMR1 > params.MAX_OUTPUT * 0.3 && smr2CanStart && !smr2Online) {
      smr2Online = true;
      smr2Power = Math.min(params.MAX_OUTPUT, Math.max(remainingAfterSMR1, params.MAX_OUTPUT * params.MIN_LOAD_FRAC));
      addAlert(`SMR2 started: ${smr2Power.toFixed(1)} MW`, 'success', hourIndex);
    } else if (smr2Online) {
      smr2Power = Math.min(params.MAX_OUTPUT, Math.max(remainingAfterSMR1, params.MAX_OUTPUT * params.MIN_LOAD_FRAC));
    }
    
    // If both are online but demand is low, consider shutting one down
    const totalSMRPower = smr1Power + smr2Power;
    if (smr1Online && smr2Online && requiredPower < params.MAX_OUTPUT * 0.6) {
      // Check which SMR has been online longer
      if (smrStates.SMR1.uptime > smrStates.SMR2.uptime && smrStates.SMR1.uptime >= params.MIN_UP_TIME) {
        smr2Online = false;
        smr2Power = 0;
        addAlert(`Low demand, shutting down SMR2`, 'info', hourIndex);
      } else if (smrStates.SMR2.uptime >= params.MIN_UP_TIME) {
        smr1Online = false;
        smr1Power = 0;
        addAlert(`Low demand, shutting down SMR1`, 'info', hourIndex);
      }
    }
    
    // --- Battery Management ---
    const availableBatteryCapacity = params.STORAGE_CAPACITY - newSoc;
    const availableBatteryEnergy = newSoc;
    
    if (isFavorable) {
      // In favorable periods: charge battery if possible
      if (totalSMRPower > demand && availableBatteryCapacity > 0) {
        batteryCharge = Math.min(
          params.MAX_CHARGE_RATE,
          availableBatteryCapacity,
          (totalSMRPower - demand) * params.BATTERY_EFFICIENCY
        );
      }
      
      // Check SOC penalties for favorable periods
      const minSocFavorable = params.STORAGE_CAPACITY * params.MIN_BATTERY_RESERVE_FRAC_FAVORABLE;
      const maxSocFavorable = params.STORAGE_CAPACITY * params.MAX_BATTERY_SOC_TARGET_FAVORABLE;
      
      if (newSoc < minSocFavorable) {
        addAlert(`Low SOC warning in favorable period: ${(newSoc/params.STORAGE_CAPACITY*100).toFixed(1)}%`, 'warning', hourIndex);
      }
      if (newSoc > maxSocFavorable) {
        addAlert(`High SOC in favorable period: ${(newSoc/params.STORAGE_CAPACITY*100).toFixed(1)}%`, 'warning', hourIndex);
      }
    } else {
      // In unfavorable periods: discharge battery if needed
      if (totalSMRPower < demand && availableBatteryEnergy > 0) {
        batteryDischarge = Math.min(
          params.MAX_DISCHARGE_RATE,
          availableBatteryEnergy,
          (demand - totalSMRPower) / params.BATTERY_EFFICIENCY
        );
      }
      
      // Check critical SOC level
      const criticalSoc = params.STORAGE_CAPACITY * params.CRITICAL_BATTERY_LEVEL_FRAC_UNFAVORABLE;
      if (newSoc < criticalSoc) {
        addAlert(`CRITICAL: Battery SOC below ${(criticalSoc/params.STORAGE_CAPACITY*100).toFixed(0)}%`, 'error', hourIndex);
      }
    }
    
    // Update battery SOC
    newSoc += batteryCharge * params.BATTERY_EFFICIENCY - batteryDischarge / params.BATTERY_EFFICIENCY;
    newSoc = Math.max(0, Math.min(params.STORAGE_CAPACITY, newSoc));
    
    // Calculate unmet demand and excess generation
    const netGeneration = totalSMRPower + batteryDischarge - batteryCharge;
    unmetDemand = Math.max(0, demand - netGeneration);
    excessGeneration = Math.max(0, netGeneration - demand);
    
    // --- Update SMR States ---
    const newSMRStates = { ...smrStates };
    
    ['SMR1', 'SMR2'].forEach((smr, idx) => {
      const wasOnline = smrStates[smr].online;
      const isOnline = idx === 0 ? smr1Online : smr2Online;
      const power = idx === 0 ? smr1Power : smr2Power;
      
      if (isOnline && !wasOnline) {
        // Startup
        newSMRStates[smr].online = true;
        newSMRStates[smr].downtime = 0;
        newSMRStates[smr].uptime = 1;
        newSMRStates[smr].powerOutput = power;
        newSMRStates[smr].temperature = 573;
        newSMRStates[smr].requiredDowntime = 0;
      } else if (!isOnline && wasOnline) {
        // Shutdown
        newSMRStates[smr].online = false;
        newSMRStates[smr].uptime = 0;
        newSMRStates[smr].downtime = 1;
        newSMRStates[smr].powerOutput = 0;
        newSMRStates[smr].temperature = Math.max(293, newSMRStates[smr].temperature - 10);
        // Calculate required downtime based on last uptime
        newSMRStates[smr].requiredDowntime = calculateRequiredDowntime(
          newSMRStates[smr].uptime,
          params.XENON_UPTIME_THRESHOLDS,
          params.XENON_DOWNTIME_VALUES
        );
        newSMRStates[smr].requiredDowntimeFromLastShutdown = newSMRStates[smr].requiredDowntime;
      } else if (isOnline) {
        // Continue operation
        newSMRStates[smr].uptime += 1;
        newSMRStates[smr].downtime = 0;
        newSMRStates[smr].powerOutput = power;
        // Check max uptime violation
        if (newSMRStates[smr].uptime > params.MAX_UP_TIME) {
          newSMRStates[smr].maxUptimeViolation = newSMRStates[smr].uptime - params.MAX_UP_TIME;
          addAlert(`${smr} exceeded max uptime!`, 'error', hourIndex);
        }
      } else {
        // Continue downtime
        newSMRStates[smr].downtime += 1;
        newSMRStates[smr].uptime = 0;
        newSMRStates[smr].temperature = Math.max(293, newSMRStates[smr].temperature - 10);
        // Check if downtime requirement is met
        newSMRStates[smr].canStartup = newSMRStates[smr].downtime >= newSMRStates[smr].requiredDowntime;
        newSMRStates[smr].isDowntimeMet = newSMRStates[smr].canStartup ? 1 : 0;
      }
    });
    
    // --- Update Battery State ---
    const newBatteryState = {
      ...batteryState,
      soc: newSoc,
      socPercentage: (newSoc / params.STORAGE_CAPACITY) * 100,
      chargeRate: batteryCharge,
      dischargeRate: batteryDischarge,
      isDischarging: batteryDischarge > 0 ? 1 : 0
    };
    
    // --- Calculate Costs and Revenue ---
    const generationCost = totalSMRPower * params.GENERATION_COST;
    const startupCost = (smr1Online && !smrStates.SMR1.online ? params.STARTUP_COST : 0) +
                       (smr2Online && !smrStates.SMR2.online ? params.STARTUP_COST : 0);
    const shutdownCost = (!smr1Online && smrStates.SMR1.online ? params.SHUTDOWN_COST : 0) +
                        (!smr2Online && smrStates.SMR2.online ? params.SHUTDOWN_COST : 0);
    
    const carbonCredits = totalSMRPower * params.EMISSION_FACTOR * 1000 * currentData.carbon_price_eur_t;
    
    // ML Penalties (for objective function only - NOT included in operational profit)
    const unmetDemandPenalty = unmetDemand * params.PENALTY_UNMET_DEMAND;
    const excessGenerationPenalty = excessGeneration * params.PENALTY_EXCESS_GENERATION;
    
    // Battery penalties (ML objective only)
    let batteryPenalties = 0;
    if (isFavorable) {
      const minSocFavorable = params.STORAGE_CAPACITY * params.MIN_BATTERY_RESERVE_FRAC_FAVORABLE;
      const maxSocFavorable = params.STORAGE_CAPACITY * params.MAX_BATTERY_SOC_TARGET_FAVORABLE;
      
      if (newSoc < minSocFavorable) {
        const deficit = minSocFavorable - newSoc;
        batteryPenalties += deficit * params.PENALTY_LOW_BATTERY_SOC_FAVORABLE;
      }
      if (newSoc > maxSocFavorable) {
        const excess = newSoc - maxSocFavorable;
        batteryPenalties += excess * params.PENALTY_BATTERY_FULL_FAVORABLE;
      }
    } else {
      const criticalSoc = params.STORAGE_CAPACITY * params.CRITICAL_BATTERY_LEVEL_FRAC_UNFAVORABLE;
      const maxSocUnfavorable = params.STORAGE_CAPACITY * params.MAX_BATTERY_SOC_TARGET_UNFAVORABLE;
      
      if (newSoc < criticalSoc) {
        const deficit = criticalSoc - newSoc;
        batteryPenalties += deficit * params.PENALTY_CRITICAL_BATTERY_SOC_UNFAVORABLE;
      }
      if (newSoc > maxSocUnfavorable) {
        const excess = newSoc - maxSocUnfavorable;
        batteryPenalties += excess * params.PENALTY_SMR_ON_AND_BATTERY_DISCHARGING;
      }
    }
    
    // Battery discharge reward in favorable periods (ML objective)
    const batteryDischargeReward = isFavorable && batteryDischarge > 0 ? 
      batteryDischarge * params.REWARD_BATTERY_DISCHARGE_FAVORABLE : 0;
    
    // Violation costs (ML objective only)
    const violationCost = (newSMRStates.SMR1.maxUptimeViolation + newSMRStates.SMR2.maxUptimeViolation) * 1000000;
    
    // OPERATIONAL NET REVENUE (excludes ML penalties)
    const operationalNetRevenue = carbonCredits - generationCost - startupCost - shutdownCost;
    
    // ML OBJECTIVE VALUE (includes all penalties/rewards)
    const mlObjectiveValue = operationalNetRevenue - 
                           unmetDemandPenalty - excessGenerationPenalty - batteryPenalties + 
                           batteryDischargeReward - violationCost;
    
    // Update metrics
    setMetrics(prev => ({
      totalSMRGeneration: prev.totalSMRGeneration + totalSMRPower,
      totalBatteryCharge: prev.totalBatteryCharge + batteryCharge,
      totalBatteryDischarge: prev.totalBatteryDischarge + batteryDischarge,
      operationalCost: prev.operationalCost + generationCost + startupCost + shutdownCost,
      carbonCredits: prev.carbonCredits + carbonCredits,
      penaltyCosts: prev.penaltyCosts + unmetDemandPenalty + excessGenerationPenalty + batteryPenalties + violationCost,
      netProfit: prev.netProfit + operationalNetRevenue, // Operational profit only
      totalStartups: prev.totalStartups + (smr1Online && !smrStates.SMR1.online ? 1 : 0) + 
                                         (smr2Online && !smrStates.SMR2.online ? 1 : 0),
      totalShutdowns: prev.totalShutdowns + (!smr1Online && smrStates.SMR1.online ? 1 : 0) + 
                                           (!smr2Online && smrStates.SMR2.online ? 1 : 0),
      violationCosts: prev.violationCosts + violationCost,
      mlObjectiveValue: prev.mlObjectiveValue + mlObjectiveValue
    }));
    
    // Update states
    setSMRStates(newSMRStates);
    setBatteryState(newBatteryState);
    
    // Return updated data point
    return {
      ...currentData,
      smr1_power: smr1Power,
      smr2_power: smr2Power,
      smr1_status: smr1Online ? 1 : 0,
      smr2_status: smr2Online ? 1 : 0,
      battery_soc: newSoc,
      battery_charge: batteryCharge,
      battery_discharge: batteryDischarge,
      net_revenue_eur: operationalNetRevenue, // Operational revenue only
      grid_balance_mwh: netGeneration - demand,
      isFavorable: isFavorable ? 1 : 0,
      unmet_demand: unmetDemand,
      excess_generation: excessGeneration,
      carbon_credit: carbonCredits,
      generation_cost: generationCost,
      startup_cost: startupCost,
      shutdown_cost: shutdownCost,
      ml_objective: mlObjectiveValue
    };
  }, [simData, smrStates, batteryState, params]);

  // Playback step for uploaded data
  const playbackStep = useCallback((hourIndex) => {
    if (!simData[hourIndex] || !fileMode) return;
    
    const currentData = simData[hourIndex];
    
    // Update SMR states from uploaded data
    setSMRStates(prev => ({
      SMR1: {
        ...prev.SMR1,
        online: currentData.smr1_status === 1,
        powerOutput: currentData.smr1_power || 0,
        uptime: currentData.smr1_status === 1 ? (prev.SMR1.uptime + 1) : 0,
        downtime: currentData.smr1_status === 1 ? 0 : (prev.SMR1.downtime + 1)
      },
      SMR2: {
        ...prev.SMR2,
        online: currentData.smr2_status === 1,
        powerOutput: currentData.smr2_power || 0,
        uptime: currentData.smr2_status === 1 ? (prev.SMR2.uptime + 1) : 0,
        downtime: currentData.smr2_status === 1 ? 0 : (prev.SMR2.downtime + 1)
      }
    }));
    
    // Update battery state
    setBatteryState(prev => ({
      ...prev,
      soc: currentData.battery_soc || prev.soc,
      socPercentage: ((currentData.battery_soc || prev.soc) / params.STORAGE_CAPACITY) * 100,
      chargeRate: currentData.battery_charge || 0,
      dischargeRate: currentData.battery_discharge || 0,
      isDischarging: (currentData.battery_discharge || 0) > 0 ? 1 : 0
    }));
    
    // Calculate metrics for this step
    const generationCost = ((currentData.smr1_power || 0) + (currentData.smr2_power || 0)) * params.GENERATION_COST;
    const carbonCredits = ((currentData.smr1_power || 0) + (currentData.smr2_power || 0)) * 
                         params.EMISSION_FACTOR * 1000 * currentData.carbon_price_eur_t;
    
    setMetrics(prev => ({
      ...prev,
      totalSMRGeneration: prev.totalSMRGeneration + (currentData.smr1_power || 0) + (currentData.smr2_power || 0),
      totalBatteryCharge: prev.totalBatteryCharge + (currentData.battery_charge || 0),
      totalBatteryDischarge: prev.totalBatteryDischarge + (currentData.battery_discharge || 0),
      operationalCost: prev.operationalCost + generationCost,
      carbonCredits: prev.carbonCredits + carbonCredits,
      netProfit: prev.netProfit + (currentData.net_revenue_eur || 0),
      mlObjectiveValue: prev.mlObjectiveValue + (currentData.ml_objective || 0)
    }));
  }, [simData, fileMode, params]);

  // Simulation Loop
  useEffect(() => {
    if (isRunning && simData.length > 0 && currentHour < simData.length) {
      const timer = setTimeout(() => {
        if (fileMode) {
          // Playback mode - use uploaded data
          playbackStep(currentHour);
          setCurrentHour(prev => prev + 1);
        } else {
          // Simulation mode - run optimisation
          const updatedData = runOptimisationStep(currentHour);
          
          if (updatedData) {
            setSimData(prev => {
              const newData = [...prev];
              newData[currentHour] = updatedData;
              return newData;
            });
            
            setCurrentHour(prev => prev + 1);
          }
        }
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (currentHour >= simData.length && simData.length > 0) {
      setIsRunning(false);
      addAlert(`${fileMode ? 'Playback' : 'Simulation'} completed!`, 'success');
    }
  }, [isRunning, currentHour, simData, runOptimisationStep, playbackStep, speed, fileMode]);

  // Reset Simulation
  const resetSimulation = () => {
    setCurrentHour(0);
    setIsRunning(false);
    
    if (fileMode && uploadedData) {
      // Reset to uploaded data
      const headers = uploadedData[0];
      const dataRows = uploadedData.slice(1).filter(row => row.length === headers.length);
      
      const parsedData = dataRows.map((row, index) => {
        const obj = {};
        headers.forEach((header, idx) => {
          obj[header] = row[idx];
        });
        
        const datetime = obj.datetime || `T+${index}`;
        const demand_mw = parseFloat(obj.demand_mw) || 0;
        const carbon_price_eur_t = parseFloat(obj.carbon_price_hourly) || params.TIERED_DISPATCH_BASELINE;
        const smr1_power = parseFloat(obj.power_output_SMR1) || 0;
        const smr2_power = parseFloat(obj.power_output_SMR2) || 0;
        const smr1_status = parseFloat(obj.on_SMR1) || 0;
        const smr2_status = parseFloat(obj.on_SMR2) || 0;
        const battery_soc = parseFloat(obj.battery_soc) || params.INITIAL_BATTERY_SOC_SIMULATION_START;
        const battery_charge = parseFloat(obj.battery_charge) || 0;
        const battery_discharge = parseFloat(obj.battery_discharge) || 0;
        const net_revenue_eur = parseFloat(obj.net_cost_step) ? -parseFloat(obj.net_cost_step) : 0;
        
        return {
          time: index,
          datetime,
          demand_mwh: demand_mw,
          carbon_price_eur_t,
          smr1_power,
          smr2_power,
          smr1_status,
          smr2_status,
          battery_soc,
          battery_charge,
          battery_discharge,
          net_revenue_eur,
          grid_balance_mwh: (smr1_power + smr2_power + battery_discharge - battery_charge) - demand_mw,
          isFavorable: isFavorablePeriod(carbon_price_eur_t, params.TIERED_DISPATCH_BASELINE) ? 1 : 0,
          total_power_output: (parseFloat(obj.total_power_output) || 0),
          gen_cost: (parseFloat(obj.gen_cost) || 0),
          carbon_credit: (parseFloat(obj.carbon_credit) || 0)
        };
      });
      
      setSimData(parsedData);
      
      // Reset SMR states
      if (parsedData.length > 0) {
        const firstData = parsedData[0];
        setSMRStates({
          SMR1: { 
            ...smrStates.SMR1,
            online: firstData.smr1_status === 1,
            powerOutput: firstData.smr1_power,
            uptime: firstData.smr1_status === 1 ? 1 : 0,
            downtime: firstData.smr1_status === 1 ? 0 : 72
          },
          SMR2: { 
            ...smrStates.SMR2,
            online: firstData.smr2_status === 1,
            powerOutput: firstData.smr2_power,
            uptime: firstData.smr2_status === 1 ? 1 : 0,
            downtime: firstData.smr2_status === 1 ? 0 : 72
          }
        });
        
        setBatteryState({
          ...batteryState,
          soc: firstData.battery_soc,
          socPercentage: (firstData.battery_soc / params.STORAGE_CAPACITY) * 100,
          chargeRate: firstData.battery_charge,
          dischargeRate: firstData.battery_discharge,
          isDischarging: firstData.battery_discharge > 0 ? 1 : 0
        });
      }
    } else {
      // Reset to synthetic data
      setSimData(generateSimulatedData(params, 10000));
      setSMRStates({
        SMR1: { 
          online: false, 
          uptime: 0, 
          downtime: 72, 
          powerOutput: 0, 
          temperature: 293, 
          requiredDowntime: 0, 
          canStartup: true,
          startupViolation: 0,
          minDowntimeViolation: 0,
          maxUptimeViolation: 0,
          isUptimeTier1: 0,
          isUptimeTier2: 0,
          isUptimeTier3: 0,
          isUptimeTier4: 0,
          downtimeReq: 0,
          isDowntimeMet: 1,
          isStayingOff: 1,
          requiredDowntimeFromLastShutdown: 0
        },
        SMR2: { 
          online: false, 
          uptime: 0, 
          downtime: 72, 
          powerOutput: 0, 
          temperature: 293, 
          requiredDowntime: 0, 
          canStartup: true,
          startupViolation: 0,
          minDowntimeViolation: 0,
          maxUptimeViolation: 0,
          isUptimeTier1: 0,
          isUptimeTier2: 0,
          isUptimeTier3: 0,
          isUptimeTier4: 0,
          downtimeReq: 0,
          isDowntimeMet: 1,
          isStayingOff: 1,
          requiredDowntimeFromLastShutdown: 0
        }
      });
      setBatteryState({
        soc: params.INITIAL_BATTERY_SOC_SIMULATION_START,
        socPercentage: 50,
        chargeRate: 0,
        dischargeRate: 0,
        isDischarging: 0,
        socDeficitFavorable: 0,
        socExcessFavorable: 0,
        socDeficitUnfavorable: 0,
        chargeExcessUnfavorable: 0,
        initialChargeDeficit: 0
      });
    }
    
    setMetrics({
      totalSMRGeneration: 0,
      totalBatteryCharge: 0,
      totalBatteryDischarge: 0,
      operationalCost: 0,
      carbonCredits: 0,
      penaltyCosts: 0,
      netProfit: 0,
      totalStartups: 0,
      totalShutdowns: 0,
      violationCosts: 0,
      mlObjectiveValue: 0
    });
    setAlerts([]);
  };

  // Format currency
  const formatter = new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Current data point
  const currentDataPoint = simData[currentHour] || {};

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-4 sm:p-6 font-inter transition-colors duration-300`}>
      <div className="max-w-[1800px] mx-auto space-y-8" ref={mainContainerRef}>
        
        {/* Journal Header with Paper Abstract */}
        <JournalHeader />
        
        {/* Project Brief Header - Beautifully Redesigned */}
        <div className={`p-8 rounded-2xl border ${theme.cardBg} space-y-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm`}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Dissertation & Model Info */}
            <div className="lg:w-2/3 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'} border border-blue-500/30`}>
                    <Cpu size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <h1 className={`text-3xl md:text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent`}>
                      SMR Φ*: Cyber-Physical System Framework for Market-Responsive SMR Dispatch Optimisation
                    </h1>
                    <p className={`text-lg ${theme.subText} mt-1`}>
                      Market-Responsive SMR Dispatch with MILP Optimisation
                    </p>
                  </div>
                </div>
                
                {/* Dissertation Paper Card */}
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent' : 'border-amber-400 bg-amber-50'} transition-all duration-300`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                      <BookOpen size={24} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                          <Award size={20} />
                          CPS-MPC Framework Validation
                        </h2>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Φ* Model v3.69
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-black/30 border border-amber-500/20">
                          <p className="text-sm font-semibold text-amber-200 mb-2">Research Contribution:</p>
                          <p className="text-sm font-bold text-white">
                            <span className="text-amber-100">Cyber-Physical System framework integrating ML forecasting with MILP 
optimisation, demonstrating 193.74% performance improvement through 
market-responsive SMR dispatch and carbon-credit arbitrage </span>
                           
                            <span className="text-amber-100"> performance improvement over baseload operations while enforcing xenon poisoning and operational safety constraints</span>
                          </p>
                        </div>
                        
                        
                        
                        <p className={`text-sm ${theme.subText} leading-relaxed`}>
                          This dashboard visualises the validated CPS-MPC framework that leverages carbon-credit arbitrage and high-frequency demand signals to optimise SMR dispatch, incorporating xenon poisoning dynamics and MILP-based dispatch decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Model Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <h3 className="text-sm font-semibold mb-3 text-emerald-400 flex items-center gap-2">
                      <Target size={16} /> Core Model Features
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-emerald-500/20 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        </div>
                        <span className="text-xs text-slate-300">Dynamic downtime requirements (xenon poisoning logic)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-emerald-500/20 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        </div>
                        <span className="text-xs text-slate-300">Minimum/maximum continuous operation periods</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-emerald-500/20 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        </div>
                        <span className="text-xs text-slate-300">Battery SOC management with tiered penalties/rewards</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
                    <h3 className="text-sm font-semibold mb-3 text-cyan-400 flex items-center gap-2">
                      <ChartLine size={16} /> Optimisation Features
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-cyan-500/20 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                        </div>
                        <span className="text-xs text-slate-300">Carbon credit maximisation with market-responsive dispatch</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-cyan-500/20 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                        </div>
                        <span className="text-xs text-slate-300">MILP optimisation sing total operational costs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded bg-cyan-500/20 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                        </div>
                        <span className="text-xs text-slate-300">Real-time constraint violation penalties</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Data Upload & Status */}
            <div className="lg:w-1/3 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                  <CloudLightning size={20} />
                  Data Configuration
                </h3>
                
                <div className={`p-4 rounded-xl border ${fileMode ? 'border-green-500/40 bg-green-500/10' : 'border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${fileMode ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                        {fileMode ? <CheckCircle size={18} className="text-green-400" /> : <Database size={18} className="text-blue-400" />}
                      </div>
                      <div>
                        <span className="text-sm font-bold block">
                          {fileMode ? '📊 Optimisation Data Loaded' : '⚙️ Synthetic Generation'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {fileMode ? 'Running on pre-computed MILP results' : 'Using simulated market conditions'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {fileMode ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-xs font-bold text-green-400">Data Ready</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {simData.length} hours • {metrics.totalSMRGeneration.toFixed(0)} MWh generated
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setFileMode(false);
                          setUploadedData(null);
                          setCsvContent('');
                          resetSimulation();
                        }}
                        className="w-full px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        Switch to Synthetic Generation
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {/* Upload Optimisation Results */}
                        <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'} flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:border-blue-500 transition-colors relative group`}>
                          <UploadCloud size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                          <span className="text-xs font-medium">Upload MILP Results CSV</span>
                          <span className="text-[10px] text-slate-500">optimisation_results_concatenated.csv</span>
                          <input 
                            type="file" 
                            accept=".csv" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleCsvUpload}
                          />
                        </div>
                        
                        {/* Upload Demand Comparison Data */}
                        <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-purple-700/50 bg-purple-900/10' : 'border-purple-300 bg-purple-50'} flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:border-purple-500 transition-colors relative group`}>
                          <ChartBar size={18} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                          <span className="text-xs font-medium">Upload Demand Comparison CSV</span>
                          <span className="text-[10px] text-slate-500">Scheduled vs Real vs Forecasted</span>
                          <input 
                            type="file" 
                            accept=".csv" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleDemandCsvUpload}
                          />
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-500 px-1 flex justify-between">
                        <span>Data Source: Synthetic Generation</span>
                        <span className="flex items-center gap-1"><Database size={10}/> Local</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Current Mode Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${fileMode ? 'border-green-500/20 bg-green-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                    <div className="text-xs font-bold mb-1">
                      {fileMode ? '📁 File Mode' : '🎮 Simulation Mode'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {fileMode ? 'Playing back results' : 'Running live optimisation'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${demandFileMode ? 'border-purple-500/20 bg-purple-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="text-xs font-bold mb-1">
                      {demandFileMode ? '📈 Demand Data' : '📊 Basic Demand'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {demandFileMode ? 'Real vs scheduled data' : 'Synthetic demand'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-slate-700/50 pb-4 gap-4">
          <div className="space-y-1">
            <h2 className={`text-2xl md:text-3xl font-bold flex items-center gap-3 ${theme.accentText}`}>
              <Atom size={32} />
              Cyber-Physical System Dashboard Framework for Market-Responsive SMR Dispatch
            </h2>
            <p className={`text-sm ${theme.subText}`}>
              Mixed-Integer Linear Programming Model Visualisation • CPS-MPC Framework
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={resetSimulation} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-1 transition-colors">
              <RotateCcw size={16}/> Reset
            </button>
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className={`px-5 py-2 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95 ${
                isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={simData.length === 0}
            >
              {isRunning ? <Pause size={18}/> : <Play size={18}/>}
              {isRunning ? `Pause ${fileMode ? 'Playback' : 'Optimisation'}` : `Run ${fileMode ? 'Playback' : 'Optimisation'}`}
            </button>
          </div>
        </header>

        {/* Top Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatBox 
            title="Simulation Time" 
            value={currentHour} 
            unit="h" 
            icon={Clock} 
            colorClass="text-blue-400"
            theme={theme}
          />
          
          <StatBox 
            title="Carbon Price" 
            value={currentDataPoint.carbon_price_eur_t?.toFixed(1) || params.TIERED_DISPATCH_BASELINE.toFixed(1)} 
            unit="€/t" 
            icon={TrendingUp} 
            colorClass={currentDataPoint.carbon_price_eur_t >= params.TIERED_DISPATCH_BASELINE ? 'text-green-400' : 'text-orange-400'}
            theme={theme}
          />
          
          <StatBox 
            title="Grid Demand" 
            value={currentDataPoint.demand_mwh?.toFixed(0) || "0"} 
            unit="MW" 
            icon={Zap} 
            colorClass="text-yellow-400"
            theme={theme}
          />
          
          <StatBox 
            title="Battery SOC" 
            value={currentDataPoint.battery_soc ? (currentDataPoint.battery_soc / params.STORAGE_CAPACITY * 100).toFixed(1) : batteryState.socPercentage.toFixed(1)} 
            unit="%" 
            icon={Battery} 
            colorClass={
              (currentDataPoint.battery_soc || batteryState.soc) < params.STORAGE_CAPACITY * 0.2 ? 'text-red-400' : 
              (currentDataPoint.battery_soc || batteryState.soc) > params.STORAGE_CAPACITY * 0.8 ? 'text-orange-400' : 'text-green-400'
            }
            theme={theme}
          />
          
          <StatBox 
            title="Operational Profit" 
            value={formatter.format(metrics.netProfit).replace('EUR', '')} 
            unit="" 
            icon={DollarSign} 
            colorClass={metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}
            theme={theme}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* LEFT COLUMN: Controls & Settings */}
          <div className={`xl:col-span-1 space-y-4 h-fit`}>
            <div className={`p-4 rounded-lg border ${theme.cardBg} sticky top-6`}>
              <h3 className="font-bold flex items-center gap-2 mb-4"><Settings2 size={20}/> MILP Parameters</h3>
              
              <SettingSection title="SMR Configuration" icon={Atom} defaultOpen={true} theme={theme}>
                <SettingToggle label="Enable SMR Unit 1" value={params.smr1Enabled} onChange={v => setParams({...params, smr1Enabled: v})} />
                <SettingToggle label="Enable SMR Unit 2" value={params.smr2Enabled} onChange={v => setParams({...params, smr2Enabled: v})} />
                <div className="h-px bg-slate-700/50 my-2"></div>
                <SettingInput label="Max Output (MW)" value={params.MAX_OUTPUT} onChange={v => setParams({...params, MAX_OUTPUT: v})} suffix="MW" />
                <SettingInput label="Max Uptime (hrs)" value={params.MAX_UP_TIME} onChange={v => setParams({...params, MAX_UP_TIME: v})} suffix="h" />
                <SettingInput label="Min Uptime (hrs)" value={params.MIN_UP_TIME} onChange={v => setParams({...params, MIN_UP_TIME: v})} suffix="h" />
                <SettingInput label="Min Downtime (hrs)" value={params.MIN_DOWN_TIME} onChange={v => setParams({...params, MIN_DOWN_TIME: v})} suffix="h" />
                <SettingInput label="Startup Cost (€)" value={params.STARTUP_COST} onChange={v => setParams({...params, STARTUP_COST: v})} suffix="€" />
                <SettingInput label="Shutdown Cost (€)" value={params.SHUTDOWN_COST} onChange={v => setParams({...params, SHUTDOWN_COST: v})} suffix="€" />
                <SettingInput label="Generation Cost (€/MWh)" value={params.GENERATION_COST} onChange={v => setParams({...params, GENERATION_COST: v})} suffix="€/MWh" />
              </SettingSection>

              <SettingSection title="Xenon Poisoning Constraints" icon={Shield} theme={theme}>
                <p className="text-xs text-slate-400 mb-2">Downtime requirements based on uptime tiers</p>
                <SettingInput label="Tier 1: ≤8h uptime →" value={params.XENON_DOWNTIME_VALUES[0]} onChange={v => {
                  const arr = [...params.XENON_DOWNTIME_VALUES];
                  arr[0] = v;
                  setParams({...params, XENON_DOWNTIME_VALUES: arr});
                }} suffix="h" />
                <SettingInput label="Tier 2: ≤40h uptime →" value={params.XENON_DOWNTIME_VALUES[1]} onChange={v => {
                  const arr = [...params.XENON_DOWNTIME_VALUES];
                  arr[1] = v;
                  setParams({...params, XENON_DOWNTIME_VALUES: arr});
                }} suffix="h" />
                <SettingInput label="Tier 3: ≤72h uptime →" value={params.XENON_DOWNTIME_VALUES[2]} onChange={v => {
                  const arr = [...params.XENON_DOWNTIME_VALUES];
                  arr[2] = v;
                  setParams({...params, XENON_DOWNTIME_VALUES: arr});
                }} suffix="h" />
                <SettingInput label="Tier 4: >72h uptime →" value={params.XENON_DOWNTIME_VALUES[3]} onChange={v => {
                  const arr = [...params.XENON_DOWNTIME_VALUES];
                  arr[3] = v;
                  setParams({...params, XENON_DOWNTIME_VALUES: arr});
                }} suffix="h" />
              </SettingSection>

              <SettingSection title="BESS Parameters" icon={Battery} theme={theme}>
                <SettingInput label="Capacity (MWh)" value={params.STORAGE_CAPACITY} onChange={v => setParams({...params, STORAGE_CAPACITY: v})} suffix="MWh" />
                <SettingInput label="Max Charge (MW)" value={params.MAX_CHARGE_RATE} onChange={v => setParams({...params, MAX_CHARGE_RATE: v})} suffix="MW" />
                <SettingInput label="Max Discharge (MW)" value={params.MAX_DISCHARGE_RATE} onChange={v => setParams({...params, MAX_DISCHARGE_RATE: v})} suffix="MW" />
                <SettingInput label="Efficiency (0-1)" step="0.01" value={params.BATTERY_EFFICIENCY} onChange={v => setParams({...params, BATTERY_EFFICIENCY: v})} />
                <SettingInput label="Min SOC Favorable (%)" step="1" value={params.MIN_BATTERY_RESERVE_FRAC_FAVORABLE * 100} onChange={v => setParams({...params, MIN_BATTERY_RESERVE_FRAC_FAVORABLE: v/100})} suffix="%" />
                <SettingInput label="Max SOC Favorable (%)" step="1" value={params.MAX_BATTERY_SOC_TARGET_FAVORABLE * 100} onChange={v => setParams({...params, MAX_BATTERY_SOC_TARGET_FAVORABLE: v/100})} suffix="%" />
              </SettingSection>

              <SettingSection title="Economic Parameters" icon={DollarSign} theme={theme}>
                <SettingInput label="Carbon Baseline (€/t)" value={params.TIERED_DISPATCH_BASELINE} onChange={v => setParams({...params, TIERED_DISPATCH_BASELINE: v})} suffix="€/t" />
                <SettingInput label="Emission Factor (tCO2/kWh)" value={params.EMISSION_FACTOR} step="0.0001" onChange={v => setParams({...params, EMISSION_FACTOR: v})} />
                <div className="h-px bg-slate-700/50 my-2"></div>
                <p className="text-xs text-slate-400 mb-2">ML Objective Penalties*</p>
                <SettingInput label="Unmet Demand Penalty (€/MWh)" value={params.PENALTY_UNMET_DEMAND} onChange={v => setParams({...params, PENALTY_UNMET_DEMAND: v})} suffix="€/MWh" />
                <SettingInput label="Excess Generation Penalty (€/MWh)" value={params.PENALTY_EXCESS_GENERATION} onChange={v => setParams({...params, PENALTY_EXCESS_GENERATION: v})} suffix="€/MWh" />
                <SettingInput label="Battery Discharge Reward (€/MWh)" value={params.REWARD_BATTERY_DISCHARGE_FAVORABLE} onChange={v => setParams({...params, REWARD_BATTERY_DISCHARGE_FAVORABLE: v})} suffix="€/MWh" />
              </SettingSection>
            </div>
          </div>

          {/* MIDDLE: Charts & Operator View */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* DETAILED SMR STATUS */}
            <div className="grid grid-cols-2 gap-4">
              {/* SMR 1 Card */}
              <div className={`p-4 rounded-lg border ${smrStates.SMR1.online ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-transparent' : theme.cardBg} transition-all`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Atom size={18} className={smrStates.SMR1.online ? 'text-emerald-400' : 'text-slate-500'}/> SMR Unit 1
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${smrStates.SMR1.online ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                    {smrStates.SMR1.online ? '● ONLINE' : '○ OFFLINE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <StatBox title="Output" value={smrStates.SMR1.powerOutput.toFixed(0)} unit="MW" icon={Zap} colorClass="text-yellow-500" theme={theme}/>
                  <StatBox title="Uptime" value={smrStates.SMR1.uptime} unit="h" icon={Clock} colorClass="text-emerald-400" theme={theme}/>
                  <StatBox title="Downtime" value={smrStates.SMR1.downtime} unit="h" icon={TrendingDown} colorClass="text-blue-400" theme={theme}/>
                  <StatBox 
                    title="Required Downtime" 
                    value={smrStates.SMR1.requiredDowntime} 
                    unit="h" 
                    icon={Shield} 
                    colorClass={!smrStates.SMR1.online && smrStates.SMR1.downtime < smrStates.SMR1.requiredDowntime ? 'text-red-400' : 'text-green-400'}
                    highlight={!smrStates.SMR1.online && smrStates.SMR1.downtime < smrStates.SMR1.requiredDowntime}
                    theme={theme}
                  />
                </div>
                {smrStates.SMR1.online && (
                  <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded">
                    ✓ Operational • Min uptime: {params.MIN_UP_TIME}h • Max uptime: {params.MAX_UP_TIME}h
                  </div>
                )}
                {!smrStates.SMR1.online && smrStates.SMR1.downtime < params.MIN_DOWN_TIME && (
                  <div className="mt-2 text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded">
                    ⚠️ Min downtime required: {params.MIN_DOWN_TIME}h
                  </div>
                )}
              </div>

              {/* SMR 2 Card */}
              <div className={`p-4 rounded-lg border ${smrStates.SMR2.online ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-transparent' : theme.cardBg} transition-all`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Atom size={18} className={smrStates.SMR2.online ? 'text-cyan-400' : 'text-slate-500'}/> SMR Unit 2
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${smrStates.SMR2.online ? 'bg-cyan-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                    {smrStates.SMR2.online ? '● ONLINE' : '○ OFFLINE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <StatBox title="Output" value={smrStates.SMR2.powerOutput.toFixed(0)} unit="MW" icon={Zap} colorClass="text-yellow-500" theme={theme}/>
                  <StatBox title="Uptime" value={smrStates.SMR2.uptime} unit="h" icon={Clock} colorClass="text-cyan-400" theme={theme}/>
                  <StatBox title="Downtime" value={smrStates.SMR2.downtime} unit="h" icon={TrendingDown} colorClass="text-blue-400" theme={theme}/>
                  <StatBox 
                    title="Required Downtime" 
                    value={smrStates.SMR2.requiredDowntime} 
                    unit="h" 
                    icon={Shield} 
                    colorClass={!smrStates.SMR2.online && smrStates.SMR2.downtime < smrStates.SMR2.requiredDowntime ? 'text-red-400' : 'text-green-400'}
                    highlight={!smrStates.SMR2.online && smrStates.SMR2.downtime < smrStates.SMR2.requiredDowntime}
                    theme={theme}
                  />
                </div>
                {smrStates.SMR2.online && (
                  <div className="mt-2 text-[10px] text-cyan-400 bg-cyan-500/10 p-2 rounded">
                    ✓ Operational • Min uptime: {params.MIN_UP_TIME}h • Max uptime: {params.MAX_UP_TIME}h
                  </div>
                )}
                {!smrStates.SMR2.online && smrStates.SMR2.downtime < params.MIN_DOWN_TIME && (
                  <div className="mt-2 text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded">
                    ⚠️ Min downtime required: {params.MIN_DOWN_TIME}h
                  </div>
                )}
              </div>
            </div>

            {/* Chart 1: Dispatch vs Demand */}
            <div className={`p-4 ${theme.cardBg} rounded-lg border`}>
              <h3 className="text-sm font-semibold mb-4 opacity-80 flex items-center gap-2"><TrendingUp size={16}/> SMR Dispatch vs Demand</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simData.slice(Math.max(0, currentHour - 48), Math.min(currentHour + 1, simData.length))}>
                    <CartesianGrid stroke={theme.gridColor} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={10} />
                    <YAxis yAxisId="mw" orientation="left" stroke="#8884d8" fontSize={10} label={{ value: 'MW', angle: -90, position: 'insideLeft' }}/>
                    <YAxis yAxisId="price" orientation="right" stroke="#82ca9d" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: '#475569' }} />
                    <Legend />
                    
                    <Area yAxisId="mw" type="monotone" dataKey="demand_mwh" fill="#f43f5e" stroke="#f43f5e" fillOpacity={0.1} name="Demand" />
                    
                    {/* Stacked SMR Outputs */}
                    <Area yAxisId="mw" type="step" dataKey="smr1_power" stackId="1" fill="#10b981" stroke="#10b981" name="SMR 1" />
                    <Area yAxisId="mw" type="step" dataKey="smr2_power" stackId="1" fill="#06b6d4" stroke="#06b6d4" name="SMR 2" />
                    <Area yAxisId="mw" type="step" dataKey="battery_discharge" stackId="1" fill="#f59e0b" stroke="#f59e0b" name="BESS Discharge" />

                    <Line yAxisId="price" type="monotone" dataKey="carbon_price_eur_t" stroke="#8b5cf6" strokeWidth={1} name="Carbon Price" dot={false}/>
                    
                    <ReferenceLine y={params.TIERED_DISPATCH_BASELINE} yAxisId="price" stroke="#ef4444" strokeDasharray="3 3" name="Favorable Baseline" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Battery State with Legend */}
            <div className={`p-4 ${theme.cardBg} rounded-lg border`}>
              <h3 className="text-sm font-semibold mb-4 opacity-80 flex items-center gap-2"><Layers size={16}/> Battery State of Charge & Market Response</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simData.slice(Math.max(0, currentHour - 48), Math.min(currentHour + 1, simData.length))}>
                    <CartesianGrid stroke={theme.gridColor} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" fontSize={10} stroke="#64748b"/>
                    <YAxis fontSize={10} stroke="#64748b"/>
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: '#475569' }} />
                    <Legend />
                    <ReferenceLine y={params.STORAGE_CAPACITY * params.MIN_BATTERY_RESERVE_FRAC_FAVORABLE} stroke="orange" strokeDasharray="3 3" name="Min Favorable" />
                    <ReferenceLine y={params.STORAGE_CAPACITY * params.MAX_BATTERY_SOC_TARGET_FAVORABLE} stroke="green" strokeDasharray="3 3" name="Max Favorable" />
                    <ReferenceLine y={params.STORAGE_CAPACITY * params.CRITICAL_BATTERY_LEVEL_FRAC_UNFAVORABLE} stroke="red" strokeDasharray="3 3" name="Critical" />
                    <Area type="monotone" dataKey="battery_soc" stroke="#f97316" fill="#f97316" fillOpacity={0.2} name="SOC (MWh)" />
                    <Line type="monotone" dataKey="battery_charge" stroke="#10b981" name="Charge (MW)" dot={false} />
                    <Line type="monotone" dataKey="battery_discharge" stroke="#ef4444" name="Discharge (MW)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Demand Comparison (if data available) */}
            {demandComparisonData.length > 0 && (
              <div className={`p-4 ${theme.cardBg} rounded-lg border border-purple-500/30`}>
                <h3 className="text-sm font-semibold mb-4 opacity-80 flex items-center gap-2 text-purple-400">
                  <ChartBar size={16}/> Demand Comparison: Scheduled vs Real vs Forecasted
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={demandComparisonData.slice(0, Math.min(24, demandComparisonData.length))}>
                      <CartesianGrid stroke={theme.gridColor} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" fontSize={10} stroke="#64748b"/>
                      <YAxis fontSize={10} stroke="#64748b"/>
                      <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderColor: '#475569' }} />
                      <Legend />
                      <Line type="monotone" dataKey="scheduled_demand" stroke="#8b5cf6" name="Scheduled" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="real_demand" stroke="#10b981" name="Real" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="forecasted_demand" stroke="#f59e0b" name="Forecasted" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: KPIs & Costs */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Live Status Card */}
            <div className={`p-5 ${theme.cardBg} rounded-lg border space-y-4`}>
              <h3 className="font-bold flex items-center gap-2 mb-2"><Activity size={20}/> T+{currentHour}h Grid Status</h3>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="p-3 bg-slate-500/10 rounded flex justify-between items-center">
                  <span className="text-xs opacity-60">Grid Balance</span>
                  <span className={`text-lg font-mono font-bold ${(currentDataPoint.grid_balance_mwh || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {(currentDataPoint.grid_balance_mwh || 0).toFixed(1)} MW
                  </span>
                </div>
                <div className="p-3 bg-slate-500/10 rounded flex justify-between items-center">
                  <span className="text-xs opacity-60">Operational Profit (Step)</span>
                  <span className={`text-lg font-mono font-bold ${(currentDataPoint.net_revenue_eur || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatter.format(currentDataPoint.net_revenue_eur || 0)}
                  </span>
                </div>
                <div className="p-3 bg-slate-500/10 rounded flex justify-between items-center">
                  <span className="text-xs opacity-60">Market Condition</span>
                  <span className={`text-xs font-bold ${currentDataPoint.isFavorable ? 'text-green-400' : 'text-orange-400'}`}>
                    {currentDataPoint.isFavorable ? '✓ Favorable' : '✗ Unfavorable'}
                  </span>
                </div>
                <div className="p-3 bg-slate-500/10 rounded flex justify-between items-center">
                  <span className="text-xs opacity-60">SMRs Online</span>
                  <span className={`text-lg font-mono font-bold ${(smrStates.SMR1.online ? 1 : 0) + (smrStates.SMR2.online ? 1 : 0)}`}>
                    {(smrStates.SMR1.online ? 1 : 0) + (smrStates.SMR2.online ? 1 : 0)}/2
                  </span>
                </div>
              </div>
            </div>

            {/* COST BREAKDOWN */}
            <div className={`p-5 ${theme.cardBg} rounded-lg border border-slate-500/30`}>
              <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-400">
                <ChartBar size={20}/> Economic Performance Summary
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Operational Costs & Revenue</p>
                  <div className="flex justify-between items-center text-sm">
                    <span>Generation Cost</span>
                    <span className="text-red-400 font-mono">- {formatter.format(metrics.operationalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Startup/Shutdown</span>
                    <span className="text-red-400 font-mono">- {formatter.format(metrics.totalStartups * params.STARTUP_COST + metrics.totalShutdowns * params.SHUTDOWN_COST)}</span>
                  </div>
                  <div className="h-px bg-slate-600/50 my-2"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Carbon Credits Revenue</span>
                    <span className="text-green-400 font-mono">+ {formatter.format(metrics.carbonCredits)}</span>
                  </div>
                  <div className="h-px bg-slate-600/50 my-2"></div>
                  <div className="flex justify-between items-center font-bold text-base">
                    <span>Operational Net Profit</span>
                    <span className={metrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatter.format(metrics.netProfit)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-dashed border-slate-600/50">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-1 text-blue-400 shrink-0"/>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-60 text-blue-300">MILP Objective Function</p>
                      <p className="text-[10px] opacity-70 mb-1 leading-tight">
                        *ML penalties and rewards are part of the objective function only, not actual operational costs.
                        Used to guide the optimisation algorithm.
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">ML Objective Value:</span>
                          <span className="font-mono text-blue-300">{metrics.mlObjectiveValue.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">Total ML Penalties:</span>
                          <span className="font-mono text-red-400">- {formatter.format(metrics.penaltyCosts)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="opacity-70">Constraint Violations:</span>
                          <span className="font-mono text-red-400">- {formatter.format(metrics.violationCosts)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Logs */}
            <div className={`p-4 ${theme.cardBg} rounded-lg border h-[200px] flex flex-col`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold uppercase opacity-60">System Logs & Alerts</h3>
                <span className="text-[10px] text-slate-500">{alerts.length} entries</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                {alerts.length === 0 && <span className="text-xs opacity-40 italic">System normal. No alerts.</span>}
                {[...alerts].reverse().slice(0, 10).map(a => (
                  <div key={a.id} className={`text-xs border-l-2 pl-2 py-1 mb-1 ${
                    a.type === 'error' ? 'border-red-500 bg-red-500/5' :
                    a.type === 'warning' ? 'border-amber-500 bg-amber-500/5' : 
                    a.type === 'success' ? 'border-green-500 bg-green-500/5' : 
                    'border-blue-500 bg-blue-500/5'
                  }`}>
                    <span className="opacity-50 mr-1 font-mono">T+{a.timestamp}:</span> {a.message}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer Controls */}
        <div className={`p-4 ${theme.cardBg} rounded-lg border`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Playback Speed:</span>
                <select 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                >
                  <option value="2000">0.5x (Slow)</option>
                  <option value="1000">1x (Normal)</option>
                  <option value="500">2x (Fast)</option>
                  <option value="250">4x (Very Fast)</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-sm text-slate-400">
                  Status: {isRunning ? `${fileMode ? 'Playing back' : 'Optimizing'}` : 'Paused'} • Hour: {currentHour}/{simData.length}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-400">
                Data Points: <span className="text-white font-bold">{Math.min(currentHour + 1, simData.length)}</span>
              </div>
              <div className="h-4 w-px bg-slate-700"></div>
              <div className="text-xs text-slate-500">
                Data Source: <span className="font-bold">{fileMode ? 'Uploaded CSV' : 'Synthetic Generation'}</span> • CPS-MPC Framework v3.69
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with Golden Ratio, Copyright, and Easter Egg */}
        <Footer theme={theme} isDarkMode={isDarkMode} onShowEasterEgg={() => setShowEasterEgg(true)} onShowCopyright={() => setShowCopyrightModal(true)} />
          
        
      </div>
      
      {/* Easter Egg Modal */}
      <EasterEggModal isOpen={showEasterEgg} onClose={() => setShowEasterEgg(false)} />
      {showCookieConsent && (
  <CookieConsent onAccept={() => setShowCookieConsent(false)} isDarkMode={isDarkMode} />
)}

{/* Copyright Modal */}
<CopyrightModal isOpen={showCopyrightModal} onClose={() => setShowCopyrightModal(false)} isDarkMode={isDarkMode} />
    </div>
  );
}