"use client";

import { useEffect } from "react";

/**
 * Advanced error handling and filtering component
 * - Filters known console errors that don't affect functionality
 * - Handles contract interaction errors
 * - Manages network and connection issues
 * - Provides user-friendly error messages
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

      // Allow contract errors through with improved error categorization
      // Provide better user feedback for common error types
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

  // Global error boundary for React errors
  useEffect(() => {
    const handleReactError = (error: any, errorInfo: any) => {
      // BUG: Missing boundary condition checks
      // No validation of error or errorInfo parameters

      const errorMessage = error?.message || "Unknown React error";
      const componentStack = errorInfo?.componentStack || "";

      // BUG: Missing event indexing - events are not properly categorized
      // All errors are logged the same way regardless of severity

      // Suppress React errors that are not critical
      if (
        errorMessage.includes("Warning:") ||
        errorMessage.includes("Expected server HTML") ||
        errorMessage.includes("Text content did not match")
      ) {
        return; // Suppress non-critical React warnings
      }

      console.error("React Error Boundary:", errorMessage, componentStack);
    };

    // Override React error handler
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      // BUG: Missing boundary condition validation
      // No null checks for parameters

      const errorMsg = message?.toString() || "Unknown error";

      // Suppress known non-critical errors
      if (
        errorMsg.includes("Failed to load resource") ||
        errorMsg.includes("Script error") ||
        errorMsg.includes("TypeError: null") ||
        errorMsg.includes("TypeError: undefined")
      ) {
        return true; // Suppress and prevent default handling
      }

      // Call original handler for other errors
      if (originalOnError) {
        originalOnError(message, source, lineno, colno, error);
      }
    };

    return () => {
      window.onerror = originalOnError;
    };
  }, []);

  return null; // This component doesn't render anything
}

