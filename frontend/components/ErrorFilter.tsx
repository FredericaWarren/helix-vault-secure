"use client";

import { useEffect } from "react";

/**
 * Filters out known console errors that don't affect functionality
 * - Base Account SDK COOP warnings
 * - Coinbase metrics fetch errors
 * - Zama relayer connection errors
 */
export function ErrorFilter() {
  useEffect(() => {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Filter function for errors
    const filterError = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Filter Base Account SDK COOP warnings
      if (
        message.includes("Base Account SDK requires the Cross-Origin-Opener-Policy") ||
        message.includes("Cross-Origin-Opener-Policy header to not be set to 'same-origin'")
      ) {
        return; // Suppress this error
      }

      // Filter Coinbase metrics errors
      if (
        message.includes("Failed to fetch") ||
        message.includes("Analytics SDK") ||
        message.includes("cca-lite.coinbase.com") ||
        message.includes("NotSameOriginAfterDefaultedToSameOriginByCoep") ||
        message.includes("ERR_BLOCKED_BY_RESPONSE")
      ) {
        return; // Suppress this error
      }

      // Filter Zama relayer connection errors (non-critical)
      if (
        message.includes("relayer.testnet.zama.cloud") ||
        message.includes("ERR_CONNECTION_CLOSED") ||
        message.includes("relayer-sdk-js.umd.cjs")
      ) {
        return; // Suppress this error
      }

      // Allow other errors through
      originalError.apply(console, args);
    };

    // Filter function for warnings
    const filterWarn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Filter Base Account SDK warnings
      if (
        message.includes("Base Account SDK requires the Cross-Origin-Opener-Policy") ||
        message.includes("Cross-Origin-Opener-Policy header to not be set to 'same-origin'")
      ) {
        return; // Suppress this warning
      }

      // Allow other warnings through
      originalWarn.apply(console, args);
    };

    // Filter console.log for network errors
    const filterLog = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Filter network error logs
      if (
        message.includes("Failed to load resource") ||
        message.includes("ERR_BLOCKED_BY_RESPONSE") ||
        message.includes("ERR_CONNECTION_CLOSED") ||
        message.includes("cca-lite.coinbase.com") ||
        message.includes("relayer.testnet.zama.cloud") ||
        message.includes("NotSameOriginAfterDefaultedToSameOriginByCoep")
      ) {
        return; // Suppress this log
      }

      // Allow other logs through
      originalLog.apply(console, args);
    };

    // Override console methods
    console.error = filterError;
    console.warn = filterWarn;
    console.log = filterLog;

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);

  // Also filter network errors via window error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message = event.message || "";
      const source = event.filename || "";
      const target = (event.target as any)?.src || (event.target as any)?.href || "";
      
      // Filter known network errors
      if (
        message.includes("Failed to fetch") ||
        message.includes("Failed to load resource") ||
        message.includes("Analytics SDK") ||
        message.includes("cca-lite.coinbase.com") ||
        message.includes("NotSameOriginAfterDefaultedToSameOriginByCoep") ||
        message.includes("ERR_BLOCKED_BY_RESPONSE") ||
        message.includes("relayer.testnet.zama.cloud") ||
        message.includes("ERR_CONNECTION_CLOSED") ||
        source.includes("cca-lite.coinbase.com") ||
        source.includes("relayer.testnet.zama.cloud") ||
        source.includes("relayer-sdk-js.umd.cjs") ||
        target.includes("cca-lite.coinbase.com") ||
        target.includes("relayer.testnet.zama.cloud")
      ) {
        event.preventDefault(); // Suppress this error
        return false;
      }
    };

    // Filter unhandled promise rejections (network errors)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || "";
      
      if (
        reason.includes("cca-lite.coinbase.com") ||
        reason.includes("NotSameOriginAfterDefaultedToSameOriginByCoep") ||
        reason.includes("ERR_BLOCKED_BY_RESPONSE") ||
        reason.includes("relayer.testnet.zama.cloud") ||
        reason.includes("ERR_CONNECTION_CLOSED")
      ) {
        event.preventDefault(); // Suppress this error
        return false;
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}

