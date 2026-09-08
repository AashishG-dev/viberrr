import React from 'react';
import { RefreshCw, AlertOctagon, Terminal } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Viberr Security & Runtime Interceptor caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0d0e11] text-[#FAF8F5] flex items-center justify-center p-6 relative select-none">
          <div className="relative w-full max-w-lg p-8 rounded-[16px] bg-[#121316] border border-amber-500/30 flex flex-col items-center text-center gap-6 shadow-2xl">
            
            {/* CAD Corner Crosshairs */}
            <span className="cad-corner cad-tl !border-amber-400" />
            <span className="cad-corner cad-tr !border-amber-400" />
            <span className="cad-corner cad-bl !border-amber-400" />
            <span className="cad-corner cad-br !border-amber-400" />

            {/* Telemetry Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#1b1b1f] border border-amber-400/30 text-amber-400 font-mono text-[10px] tracking-[0.16em] uppercase">
              <AlertOctagon className="w-4 h-4" />
              <span>RUNTIME RECOVERY // FAULT INTERCEPTED</span>
            </div>

            <h1 className="display-monument text-2xl sm:text-3xl text-[#FAF8F5]">
              Relay Signal <span className="text-amber-400">Interrupted</span>
            </h1>

            <p className="font-mono text-xs text-[#8f918c] leading-relaxed max-w-sm">
              An unexpected memory or audio pipeline fault was isolated by the fault mitigation harness.
            </p>

            {/* Error Code Diagnostic (Sanitized in production to prevent sensitive information disclosure) */}
            {import.meta.env.DEV ? (
              <div className="w-full p-3 rounded-[8px] bg-[#0d0e11] border border-[#2b2f33] font-mono text-[11px] text-red-400/90 text-left overflow-x-auto custom-scroll">
                <div className="text-[9px] text-[#8f918c] uppercase mb-1">[DEV DIAGNOSTIC]</div>
                <code>{this.state.error?.message || 'ERR_MEMORY_FAULT_ISOLATED'}</code>
              </div>
            ) : (
              <div className="w-full p-2.5 rounded-[8px] bg-[#0d0e11] border border-[#2b2f33] font-mono text-[10px] text-[#8f918c] text-center">
                SIGNAL PROTOCOL: <span className="text-amber-400 font-bold">FAULT_ISOLATED // CODE_0x8F</span>
              </div>
            )}

            {/* Recovery Action */}
            <button
              onClick={this.handleReload}
              className="wireframe-btn-accent !w-full justify-center !py-2.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              <span>[ RE-INITIALIZE CARRIER MATRIX ]</span>
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
