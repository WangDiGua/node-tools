import React, { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { APP_CONFIG } from '../config';

export const APIDocs: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Using a public Swagger UI demo as a placeholder since the backend isn't real.
  // In a real app, this would be `${APP_CONFIG.API_BASE_URL}/docs` or similar.
  const DOCS_URL = "https://petstore.swagger.io/?url=https://petstore.swagger.io/v2/swagger.json"; 

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-4 dark:border-slate-800 dark:bg-slate-800">
        <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-200">REST API Reference</span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-mono">v1.0</span>
        </div>
        <a 
            href={DOCS_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs flex items-center text-blue-600 hover:text-blue-700 hover:underline"
        >
            <ExternalLink size={12} className="mr-1" /> 新窗口打开
        </a>
      </div>
      
      <div className="flex-1 relative bg-white">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10 dark:bg-slate-900">
                <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">正在加载文档...</p>
                </div>
            </div>
        )}
        <iframe 
            src={DOCS_URL}
            className="w-full h-full border-none"
            title="API Documentation"
            onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
};