"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Cpu,
  Layers,
  Search,
  Sparkles,
  BookOpen,
  Database,
  History,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Sun,
  Moon,
  FlaskConical,
  ExternalLink,
} from "lucide-react";

// Types for Prediction
interface PredictionResult {
  smiles: string;
  pIC50: number;
  ic50_um: number;
  fingerprint: number[];
  error?: string;
}

// Types for History Logs
interface LogEntry {
  id: number;
  smiles: string;
  pic50_pred: number;
  ic50_um_pred: number;
  timestamp: string;
}

// Preset SMILES for easy testing
const PRESET_SMILES = [
  {
    name: "Nifurtimox (Active Drug)",
    smiles: "CC1CCN(N1)N=CC2=CC=C(O2)[N+](=O)[O-]",
  },
  {
    name: "Benznidazole (Active Drug)",
    smiles: "C1=CC=C(C=C1)CNCC2=CN(C=N2)[N+](=O)[O-]",
  },
  {
    name: "High Potency Candidate",
    smiles: "COC1=CC=CC=C1C2=CC=C(C=C2)S(=O)(=O)NCC3=CC=C(C=C3)F",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"predict" | "dashboard">("predict");
  const [smilesInput, setSmilesInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize and check dark mode
  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Fetch prediction logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await fetch("/api/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchLogs();
    }
  }, [activeTab]);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!smilesInput.trim()) {
      setErrorMsg("Please enter a valid SMILES string.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ smiles: smilesInput }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setErrorMsg(data.detail || "Prediction failed. Ensure SMILES is valid.");
      }
    } catch (err) {
      setErrorMsg("Network error. Make sure the FastAPI server is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (smiles: string) => {
    setSmilesInput(smiles);
    setErrorMsg("");
  };

  // Fix scroll logic: Switch tab to predict first, then scroll smoothly to anchor element
  const handleNavClick = (e: React.MouseEvent, anchorId: string) => {
    e.preventDefault();
    setActiveTab("predict");
    setTimeout(() => {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const getPotencyBadge = (pic50: number) => {
    if (pic50 >= 6.0) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
          High Potency (pIC50 ≥ 6)
        </span>
      );
    } else if (pic50 >= 5.0) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-sm">
          {"Medium Potency (5 ≤ pIC50 < 6)"}
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm">
          {"Low Potency (pIC50 < 5)"}
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-apple-dark text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      
      {/* Sticky Glassmorphic Navbar */}
      <nav className="glass-navbar sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={(e) => handleNavClick(e, "hero")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/20">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            IC50 <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">FORGE</span>
          </span>
        </div>

        <div className="flex items-center space-x-8">
          <a
            href="#features"
            onClick={(e) => handleNavClick(e, "features")}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, "how-it-works")}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            How it Works
          </a>

          {/* Apple-style Light/Dark Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Rounded Biotech Green/Blue Button with White Text */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(activeTab === "predict" ? "dashboard" : "predict")}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white shadow-md flex items-center space-x-2 transition-colors cursor-pointer border border-emerald-400/20"
          >
            {activeTab === "predict" ? (
              <>
                <History className="w-4 h-4" />
                <span>Dashboard</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>Predictor</span>
              </>
            )}
          </motion.button>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === "predict" ? (
            <motion.div
              key="predict-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-24"
            >
              {/* Hero Prediction Section */}
              <section id="hero" className="flex flex-col items-center text-center max-w-3xl mx-auto pt-4 scroll-mt-24">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="space-y-4 mb-10"
                >
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
                    AI-Driven Potency Prediction
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                    Predict Chagas Disease <br />
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                      Drug Potency Instantly
                    </span>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    Enter a molecular SMILES representation. Our Keras neural network converts the compound to a 1024-bit Morgan Fingerprint and computes its \(pIC_{50}\) value.
                  </p>
                </motion.div>

                {/* Centralized Glassmorphic Input Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="w-full glass-card rounded-3xl p-6 md:p-8 space-y-6 text-left hover:border-emerald-500/30 transition-all duration-300"
                >
                  <form onSubmit={handlePredict} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Molecular SMILES String
                      </label>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5" /> input representation
                      </span>
                    </div>
                    <div className="relative flex flex-col md:flex-row gap-3">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          value={smilesInput}
                          onChange={(e) => setSmilesInput(e.target.value)}
                          placeholder="Paste SMILES (e.g. CC1CCN(N1)N=CC2=CC=C(O2)[N+](=O)[O-]...) or click preset"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/70 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all shadow-inner text-sm md:text-base font-mono"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-75"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-emerald-200" />
                        )}
                        <span>{isLoading ? "Predicting..." : "Predict IC50"}</span>
                      </motion.button>
                    </div>
                  </form>

                  {/* Preset SMILES Quick Tests */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="text-xs font-semibold text-gray-400">Presets:</span>
                    {PRESET_SMILES.map((preset) => (
                      <motion.button
                        whileHover={{ scale: 1.03, borderColor: "#10b981" }}
                        whileTap={{ scale: 0.97 }}
                        key={preset.name}
                        onClick={() => handlePresetClick(preset.smiles)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 shadow-sm transition-all cursor-pointer"
                      >
                        {preset.name}
                      </motion.button>
                    ))}
                  </div>

                  {/* Errors */}
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-rose-600 dark:text-rose-400 text-sm"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}

                  {/* Prediction Results Display */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="pt-6 border-t border-gray-200/50 dark:border-zinc-800 space-y-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                            Target Molecule SMILES
                          </span>
                          <span className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all select-all">
                            {result.smiles}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          {getPotencyBadge(result.pIC50)}
                        </div>
                      </div>

                      {/* Display Numbers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 dark:bg-zinc-900/20 p-6 rounded-2xl border border-white/60 dark:border-zinc-800/50">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Predicted pIC50 (-log₁₀ M)
                          </span>
                          <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
                            {result.pIC50.toFixed(4)}
                          </div>
                          <p className="text-xs text-gray-400">
                            Higher values indicate higher potency.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Predicted IC50 (µM)
                          </span>
                          <div className="text-4xl md:text-5xl font-black text-emerald-500 dark:text-emerald-400 font-mono tracking-tight">
                            {result.ic50_um.toFixed(4)} <span className="text-lg font-semibold text-gray-400">µM</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Inhibition concentration required for 50% response.
                          </p>
                        </div>
                      </div>

                      {/* Morgan Fingerprint Visualizer */}
                      {result.fingerprint && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                              1024-bit Morgan Fingerprint Vector
                            </span>
                            <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 font-mono">
                              Active Bits: {result.fingerprint.filter((bit) => bit === 1).length} / 1024
                            </span>
                          </div>
                          
                          {/* Grid layout for bits */}
                          <div className="grid grid-cols-32 gap-0.5 p-3 bg-gray-950 rounded-2xl overflow-hidden border border-gray-900 shadow-inner">
                            {result.fingerprint.map((bit, idx) => (
                              <div
                                key={idx}
                                title={`Bit ${idx}: ${bit}`}
                                className={`aspect-square w-full rounded-sm transition-all duration-300 ${
                                  bit === 1
                                    ? "bg-emerald-400 shadow-[0_0_6px_#10b981]"
                                    : "bg-gray-800/80 hover:bg-gray-700/60"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </section>

              {/* Features Section */}
              <section id="features" className="scroll-mt-24 space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Platform Features
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Highly optimized descriptors integrated with deep neural networks for state-of-the-art predictions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <Layers className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
                      title: "1024-bit Fingerprints",
                      description:
                        "Generates Morgan molecular fingerprints (radius 2) via RDKit to capture structural molecular subgraphs.",
                    },
                    {
                      icon: <Cpu className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
                      title: "Deep Neural Network",
                      description:
                        "Trained on Trypanosoma cruzi active screening bioassays using Keras sequential regression layers.",
                    },
                    {
                      icon: <Database className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
                      title: "SQLite Prediction Log",
                      description:
                        "Every successful inference is archived in a local SQLite datastore for review, diagnostics, and dashboarding.",
                    },
                  ].map((feat, index) => (
                    <motion.div
                      key={feat.title}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ 
                        y: -6, 
                        boxShadow: "0 12px 30px rgba(16, 185, 129, 0.08)",
                        borderColor: "rgba(16, 185, 129, 0.3)"
                      }}
                      className="bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-gray-150 dark:border-zinc-800/80 shadow-sm space-y-4 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        {feat.icon}
                      </div>
                      <h3 className="text-lg font-bold">{feat.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feat.description}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* How it Works Section */}
              <section id="how-it-works" className="scroll-mt-24 bg-white dark:bg-zinc-900/20 p-8 md:p-12 rounded-3xl border border-gray-150 dark:border-zinc-800/80 shadow-sm space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Predictive Pipeline
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    How IC50 FORGE maps chemical notations to quantitative bioactivity predictions.
                  </p>
                </div>

                {/* Pipeline Flowchart */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  {[
                    {
                      step: "01",
                      title: "SMILES String",
                      desc: "User inputs a compound's SMILES string, representing its molecular structure.",
                    },
                    {
                      step: "02",
                      title: "RDKit Descriptor",
                      desc: "Computes 1024-bit Morgan Fingerprint vector representing atom neighbor subgraphs.",
                    },
                    {
                      step: "03",
                      title: "Neural Network",
                      desc: "Runs fingerprint array through the saved Sequential Keras neural network model.",
                    },
                    {
                      step: "04",
                      title: "Potency Value",
                      desc: "Outputs computed pIC50 and calculates the corresponding value in micromolar (µM).",
                    },
                  ].map((pipe, index) => (
                    <motion.div
                      key={pipe.title}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -3 }}
                      className="space-y-3 relative z-10 p-4 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-zinc-800/25 transition-colors"
                    >
                      <div className="text-4xl font-black text-emerald-500/20 dark:text-emerald-500/10 font-mono">
                        {pipe.step}
                      </div>
                      <h4 className="text-base font-bold">{pipe.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{pipe.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            /* Dashboard Tab - Prediction History Audit Logs */
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8 pt-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    Prediction Logs Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    A secure repository logs all successful drug predictions written in the SQLite storage.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchLogs}
                  disabled={logsLoading}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? "animate-spin" : ""}`} />
                  <span>Refresh Logs</span>
                </motion.button>
              </div>

              {/* logs display */}
              <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {logsLoading && logs.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Retrieving logs from database...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                      <Database className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-base">No Predictions Logged Yet</p>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      Submit chemical SMILES strings on the Predictor tab to start logging records in the audit database.
                    </p>
                    <button
                      onClick={(e) => handleNavClick(e, "hero")}
                      className="mt-2 text-sm font-semibold text-emerald-500 dark:text-emerald-400 hover:underline flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                    >
                      <span>Go to Predictor</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <th className="py-4 px-6 w-16">ID</th>
                          <th className="py-4 px-6">SMILES Notation</th>
                          <th className="py-4 px-6 w-32 text-right">Predicted pIC50</th>
                          <th className="py-4 px-6 w-36 text-right">Predicted IC50 (µM)</th>
                          <th className="py-4 px-6 w-52 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80 text-sm">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                            <td className="py-4 px-6 font-mono text-gray-400">#{log.id}</td>
                            <td className="py-4 px-6">
                              <div className="max-w-[400px] md:max-w-[500px] truncate font-mono text-xs text-gray-700 dark:text-gray-300 select-all" title={log.smiles}>
                                {log.smiles}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-semibold">
                              {log.pic50_pred.toFixed(4)}
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-semibold text-emerald-500 dark:text-emerald-400">
                              {log.ic50_um_pred.toFixed(4)} µM
                            </td>
                            <td className="py-4 px-6 text-right text-xs text-gray-500 font-mono">
                              {log.timestamp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-8 mt-12 text-center text-xs text-gray-500 space-y-2 transition-colors">
        <div>
          <strong>IC50 FORGE</strong> — AI-driven Chagas disease drug potency predictor.
        </div>
        <div className="flex justify-center space-x-6">
          <span>Model: Keras Sequential (DNN)</span>
          <span>Descriptor: 1024-bit Morgan FP</span>
          <span>Database: SQLite3</span>
        </div>
      </footer>
    </div>
  );
}
