import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TerminalLine {
  text: string;
  type?: 'command' | 'output' | 'success' | 'error' | 'warning' | 'info';
  delay?: number;
}

interface AnimatedTerminalProps {
  lines: TerminalLine[];
  title?: string;
  typingSpeed?: number;
  className?: string;
}

const lineColors: Record<string, string> = {
  command: 'text-accent',
  output: 'text-text-2',
  success: 'text-brand-green',
  error: 'text-brand-red',
  warning: 'text-brand-amber',
  info: 'text-brand-purple',
};

const AnimatedTerminal: React.FC<AnimatedTerminalProps> = ({
  lines,
  title = 'hexashield@soc:~',
  typingSpeed = 30,
  className = '',
}) => {
  const [displayedLines, setDisplayedLines] = useState<Array<{ text: string; type: string }>>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to trigger animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          setIsTyping(true);
        }
      },
      { threshold: 0.3 }
    );

    const el = containerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasStarted]);

  // Typing effect
  useEffect(() => {
    if (!isTyping || currentLine >= lines.length) {
      if (currentLine >= lines.length) setIsTyping(false);
      return;
    }

    const line = lines[currentLine];
    const delay = line.delay ?? typingSpeed;

    if (line.type !== 'command') {
      // Non-command lines appear instantly
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, { text: line.text, type: line.type || 'output' }]);
        setCurrentLine(prev => prev + 1);
        setCurrentChar(0);
      }, 150);
      return () => clearTimeout(timer);
    }

    // Type command character by character
    if (currentChar < line.text.length) {
      const timer = setTimeout(() => {
        setCurrentChar(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }

    // Line complete, move to next
    const timer = setTimeout(() => {
      setDisplayedLines(prev => [...prev, { text: line.text, type: 'command' }]);
      setCurrentLine(prev => prev + 1);
      setCurrentChar(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [isTyping, currentLine, currentChar, lines, typingSpeed]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines, currentChar]);

  const renderPrompt = useCallback(() => (
    <span className="text-text-3">
      <span className="text-brand-green">➜</span>{' '}
      <span className="text-accent">~</span>{' '}
    </span>
  ), []);

  return (
    <div ref={containerRef} className={`rounded-xl overflow-hidden border border-border ${className}`}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-brand-red/80" />
          <div className="w-3 h-3 rounded-full bg-brand-amber/80" />
          <div className="w-3 h-3 rounded-full bg-brand-green/80" />
        </div>
        <span className="font-mono text-xs text-text-3 ml-2">{title}</span>
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        className="bg-bg p-4 font-mono text-sm leading-relaxed h-72 overflow-y-auto"
      >
        {displayedLines.map((line, i) => (
          <div key={i} className={`${lineColors[line.type] || 'text-text-2'} whitespace-pre-wrap`}>
            {line.type === 'command' && renderPrompt()}
            {line.text}
          </div>
        ))}

        {/* Currently typing line */}
        {isTyping && currentLine < lines.length && lines[currentLine].type === 'command' && (
          <div className="text-accent whitespace-pre-wrap">
            {renderPrompt()}
            {lines[currentLine].text.substring(0, currentChar)}
            <span className="animate-blink text-accent">▊</span>
          </div>
        )}

        {/* Idle cursor */}
        {!isTyping && currentLine >= lines.length && (
          <div>
            {renderPrompt()}
            <span className="animate-blink text-accent">▊</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedTerminal;
