"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, GitFork, Sparkles, FileCode2, RefreshCw, Cpu } from "lucide-react";

interface HeaderProps {
  isSupabaseLive: boolean;
  onOpenSqlModal: () => void;
  onOpenMermaidModal: () => void;
  onResetSamples: () => void;
  isResetting?: boolean;
}

export function EngineHeader({
  isSupabaseLive,
  onOpenSqlModal,
  onOpenMermaidModal,
  onResetSamples,
  isResetting,
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Brand & Engine Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-sm ring-1 ring-indigo-700/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-zinc-900 tracking-tight">
                AI Automation Engine
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                v2.0
              </span>
              {isSupabaseLive ? (
                <Badge variant="success" className="gap-1 font-medium text-[11px] py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 font-medium text-[11px] text-zinc-600 py-0.5">
                  <Database className="h-3 w-3 text-zinc-500" />
                  Sandbox Local
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Pipeline corporativo de extração estruturada (Zod + Gemini 3.8 Flash), validação FinOps e webhooks
            </p>
          </div>
        </div>

        {/* Right: Technical Docs & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMermaidModal}
            className="text-xs font-medium h-8 border-zinc-200 text-zinc-700 hover:bg-zinc-50 gap-1.5"
            id="btn-open-mermaid"
          >
            <GitFork className="h-3.5 w-3.5 text-indigo-600" />
            Arquitetura Mermaid
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSqlModal}
            className="text-xs font-medium h-8 border-zinc-200 text-zinc-700 hover:bg-zinc-50 gap-1.5"
            id="btn-open-sql-schema"
          >
            <FileCode2 className="h-3.5 w-3.5 text-emerald-600" />
            Esquema Supabase SQL
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetSamples}
            disabled={isResetting}
            className="text-xs font-medium h-8 text-zinc-600 hover:text-zinc-900 gap-1.5 px-2"
            title="Recarregar jobs de demonstração"
            id="btn-reset-samples"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Restaurar Exemplos</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
