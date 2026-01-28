"use client";
import React, { useState, useRef } from "react";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useBackup } from "@/hooks/useDatabase";
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Database,
  FileJson,
  Shield,
  Sparkles,
  HardDrive,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function BackupPage() {
  const { exportData, importData, clearData, seedDemo } = useBackup();
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `village-bank-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus("success");
        setStatusMessage(
          "Data imported successfully! Refresh the page to see changes.",
        );
      } else {
        setImportStatus("error");
        setStatusMessage(
          "Failed to import data. Please check the file format.",
        );
      }
      setTimeout(() => {
        setImportStatus("idle");
        setStatusMessage("");
      }, 5000);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (
      window.confirm(
        "⚠️ WARNING: This will permanently delete ALL data including members, transactions, loans, and settings. This action cannot be undone. Are you sure?",
      )
    ) {
      if (window.confirm("Please confirm again - DELETE ALL DATA?")) {
        clearData();
        window.location.reload();
      }
    }
  };

  const handleSeedDemo = () => {
    if (window.confirm("This will add demo data to your system. Continue?")) {
      seedDemo();
      window.location.reload();
    }
  };

  return (
    <>
      <Head>
        <title>Backup & Restore | Village Banking System</title>
      </Head>

      <Layout title="Backup & Restore">
        <div className="space-y-6 lg:space-y-8 animate-fade-in">
          {/* Header Section */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 p-8 lg:p-10 shadow-2xl shadow-blue-500/20">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10">
              <div className="w-full h-full bg-white rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
              <div className="w-full h-full bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-100" />
                    <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">
                      Data Protection Center
                    </p>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                    Backup & Restore
                  </h1>
                  <p className="text-blue-50 text-base lg:text-lg max-w-2xl leading-relaxed">
                    Protect your village banking data with secure backups. All
                    data is stored locally on your device for complete privacy.
                  </p>
                </div>
                <div className="hidden lg:flex w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/20">
                  <Database className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {importStatus !== "idle" && (
            <div
              className={`relative rounded-2xl p-5 border-2 shadow-lg animate-slide-up ${
                importStatus === "success"
                  ? "bg-gradient-to-r from-bank-50 to-green-50 border-bank-300"
                  : "bg-gradient-to-r from-red-50 to-orange-50 border-red-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    importStatus === "success" ? "bg-bank-600" : "bg-red-600"
                  }`}
                >
                  {importStatus === "success" ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-bold ${
                      importStatus === "success"
                        ? "text-bank-900"
                        : "text-red-900"
                    }`}
                  >
                    {importStatus === "success" ? "Success!" : "Error"}
                  </p>
                  <p
                    className={`text-sm ${
                      importStatus === "success"
                        ? "text-bank-700"
                        : "text-red-700"
                    }`}
                  >
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto space-y-6">
            {/* Export & Import Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Export Card */}
              <div className="group rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="p-6 bg-gradient-to-r from-bank-50 to-white border-b border-bank-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bank-600 to-bank-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">
                        Export Data
                      </h2>
                      <p className="text-sm text-forest-600">
                        Download a backup file
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-forest-700 leading-relaxed">
                    Creates a JSON file containing all your members,
                    transactions, loans, cycles, and settings. Store this file
                    safely for future restoration.
                  </p>

                  <div className="p-4 bg-bank-50 rounded-xl border border-bank-200">
                    <div className="flex items-center gap-2 mb-2">
                      <FileJson className="w-4 h-4 text-bank-600" />
                      <p className="text-sm font-semibold text-bank-800">
                        File Format
                      </p>
                    </div>
                    <p className="text-sm text-bank-700">
                      village-bank-backup-
                      {new Date().toISOString().split("T")[0]}.json
                    </p>
                  </div>

                  <button
                    onClick={handleExport}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 text-white font-bold hover:from-bank-700 hover:to-bank-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    Download Backup
                  </button>
                </div>
              </div>

              {/* Import Card */}
              <div className="group rounded-2xl bg-white border border-forest-100 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">
                        Import Data
                      </h2>
                      <p className="text-sm text-forest-600">
                        Restore from backup file
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-forest-700 leading-relaxed">
                    Upload a previously exported JSON backup file to restore
                    your data. This will replace all current data with the
                    backup contents.
                  </p>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Caution
                        </p>
                        <p className="text-sm text-amber-700 mt-0.5">
                          Current data will be replaced by the imported backup
                        </p>
                      </div>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-blue-300 text-blue-700 font-bold hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Backup File
                  </button>
                </div>
              </div>
            </div>

            {/* What Gets Backed Up */}
            <div className="rounded-2xl bg-white border border-forest-100 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-forest-900">
                  What Gets Backed Up
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="group p-5 bg-gradient-to-br from-bank-50 to-white rounded-xl border border-bank-200 hover:border-bank-300 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-bank-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-forest-900">Members</p>
                  <p className="text-xs text-forest-600 mt-1">
                    All member profiles
                  </p>
                </div>

                <div className="group p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-forest-900">Transactions</p>
                  <p className="text-xs text-forest-600 mt-1">
                    Complete history
                  </p>
                </div>

                <div className="group p-5 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-forest-900">Loans</p>
                  <p className="text-xs text-forest-600 mt-1">
                    All loan records
                  </p>
                </div>

                <div className="group p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-forest-900">Settings</p>
                  <p className="text-xs text-forest-600 mt-1">System config</p>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="rounded-2xl bg-gradient-to-br from-bank-50 to-green-50 border-2 border-bank-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-bank-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-bank-900">
                    Backup Best Practices
                  </h3>
                  <p className="text-sm text-bank-700">
                    Follow these guidelines to protect your data
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-bank-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">
                      Regular Backups
                    </p>
                    <p className="text-sm text-forest-600 mt-0.5">
                      Create a backup after every meeting day
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-bank-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">
                      Cloud Storage
                    </p>
                    <p className="text-sm text-forest-600 mt-0.5">
                      Store backups on Google Drive or Dropbox
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-bank-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">
                      Multiple Copies
                    </p>
                    <p className="text-sm text-forest-600 mt-0.5">
                      Keep at least 3 recent backup copies
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-bank-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">
                      Test Restores
                    </p>
                    <p className="text-sm text-forest-600 mt-0.5">
                      Test restore periodically to ensure it works
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-bank-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">USB Storage</p>
                    <p className="text-sm text-forest-600 mt-0.5">
                      Keep a backup copy on a USB drive
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-bank-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900">
                      Share with Leaders
                    </p>
                    <p className="text-sm text-forest-600 mt-0.5">
                      Give a copy to the group chairperson
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl bg-white border-2 border-red-300 overflow-hidden shadow-lg">
              <div className="p-6 bg-gradient-to-r from-red-50 to-white border-b border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-900">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700">
                      Proceed with extreme caution
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Load Demo Data */}
                <div className="group flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-white rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-forest-900">
                        Load Demo Data
                      </p>
                      <p className="text-sm text-forest-600">
                        Add sample members and transactions for testing
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSeedDemo}
                    className="px-6 py-2.5 rounded-xl border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 hover:border-amber-400 transition-all duration-200"
                  >
                    Load Demo
                  </button>
                </div>

                {/* Clear All Data */}
                <div className="group flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-white rounded-xl border-2 border-red-300 hover:border-red-400 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-red-900">Clear All Data</p>
                      <p className="text-sm text-red-700">
                        Permanently delete everything (cannot be undone)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-700 hover:to-red-600 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
