import React, { useEffect, useRef, useState } from 'react';

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const m = (window as any).mermaid;
    if (m) {
      try {
        m.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          suppressErrorRendering: true,
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        });
      } catch (e) {
        console.warn('Failed to initialize mermaid:', e);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const cleanupErrorDivs = () => {
      // Remove any error divs Mermaid injects into document body
      document.querySelectorAll('[id^="dmermaid-svg"], [id^="dmermaid"], svg[id^="mermaid-svg"][height="100%"]').forEach(el => {
        if (!containerRef.current?.contains(el)) {
          el.remove();
        }
      });
    };

    cleanupErrorDivs();

    const meaningfulLines = chart
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('%%') && l !== 'classDiagram');

    if (meaningfulLines.length === 0) {
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div style="color: #64748b; font-size: 0.825rem; font-style: italic; padding: 2rem 1rem; text-align: center;">Enter your classes and relationships in Mermaid format to render the UML diagram.</div>';
      }
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (!isMounted) return;

      const m = (window as any).mermaid;
      if (!m) {
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `<pre style="font-family:monospace;color:#94a3b8;font-size:0.8rem;white-space:pre-wrap;">${chart}</pre>`;
        }
        return;
      }

      try {
        // Validate diagram syntax first
        const isValid = await m.parse(chart).catch((parseErr: any) => {
          cleanupErrorDivs();
          return false;
        });

        if (!isValid) {
          cleanupErrorDivs();
          if (isMounted) {
            setError('Incomplete or invalid Mermaid syntax. Check class names, arrows (e.g. *--, o--, <|--), and syntax.');
          }
          return;
        }

        const id = `mermaid-svg-${Date.now()}`;
        const { svg } = await m.render(id, chart);
        cleanupErrorDivs();

        if (isMounted && containerRef.current) {
          setError(null);
          containerRef.current.innerHTML = svg;
        }
      } catch (err: any) {
        cleanupErrorDivs();
        if (isMounted) {
          setError('Syntax error in Mermaid diagram. Please verify relationships and entity definitions.');
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      cleanupErrorDivs();
    };
  }, [chart]);

  return (
    <div style={{ width: '100%', minHeight: '200px' }}>
      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '8px', color: '#f43f5e', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
          <strong>Diagram Syntax Note:</strong> {error}
          <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            Example: <code>ParkingLot *-- ParkingFloor</code> or <code>Vehicle &lt;|-- Car</code>
          </div>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }} />
    </div>
  );
};
