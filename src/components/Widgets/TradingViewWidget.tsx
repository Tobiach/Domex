import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  scriptSrc: string;
  config: any;
  height?: number | string;
  className?: string;
}

export function TradingViewWidget({ scriptSrc, config, height = 400, className }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove existing content
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    
    const widgetContent = document.createElement('div');
    widgetContent.className = 'tradingview-widget-container__widget';
    
    widgetContainer.appendChild(widgetContent);
    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [scriptSrc, JSON.stringify(config)]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ height }}
    />
  );
}
