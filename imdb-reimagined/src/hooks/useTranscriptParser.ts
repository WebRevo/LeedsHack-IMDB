"use client";

import { useState, useRef, useCallback } from "react";

/* =========================================================
   Transcript → Form parser hook
   - Calls POST /api/parse with cooldown
   - Returns { parsing, error, parsedData, assumptions, parse }
   ========================================================= */

const COOLDOWN_MS = 10_000;

export interface VoiceParsedData {
  core?: {
    title?: string;
    type?: string;
    subtype?: string;
    status?: string;
    year?: number | null;
    contributorRole?: string;
  };
  identity?: {
    countriesOfOrigin?: string[];
    languages?: string[];
    genres?: string[];
  };
  mandatory?: {
    releaseDates?: {
      country: string;
      day: string;
      month: string;
      year: string;
      releaseType: string;
      note: string;
    }[];
  };
  production?: {
    budget?: {
      currency?: string;
      amount?: number | null;
    };
    directors?: {
      name: string;
      role: string;
      attribute: string;
    }[];
  };
}

export function useTranscriptParser() {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<VoiceParsedData | null>(null);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const lastParseRef = useRef(0);

  const parse = useCallback(async (transcript: string) => {
    const now = Date.now();
    const elapsed = now - lastParseRef.current;
    if (elapsed < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      setError(`Please wait ${wait}s before parsing again`);
      return;
    }

    if (!transcript.trim() || transcript.trim().length < 5) {
      setError("Transcript is too short to parse");
      return;
    }

    setParsing(true);
    setError(null);
    setParsedData(null);
    setAssumptions([]);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Parsing failed");
        return;
      }

      setParsedData(data.parsed ?? null);
      setAssumptions(data.assumptions ?? []);
      lastParseRef.current = Date.now();
    } catch {
      setError("Network error — could not reach server");
    } finally {
      setParsing(false);
    }
  }, []);

  const clearParsed = useCallback(() => {
    setParsedData(null);
    setAssumptions([]);
    setError(null);
  }, []);

  return { parsing, error, parsedData, assumptions, parse, clearParsed };
}
