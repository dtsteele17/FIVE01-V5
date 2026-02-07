import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Database, Wifi, XCircle } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export function SupabaseDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([
    { name: 'Connection', status: 'pending', message: 'Checking...' },
    { name: 'Authentication', status: 'pending', message: 'Checking...' },
    { name: 'Profiles Table', status: 'pending', message: 'Checking...' },
    { name: 'Matches Table', status: 'pending', message: 'Checking...' },
    { name: 'Visits Table', status: 'pending', message: 'Checking...' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults = [...results];

    // Test 1: Basic Connection
    try {
      const { error } = await supabase.from('profiles').select('count', { count: 'exact' });
      if (error) throw error;
      newResults[0] = { name: 'Connection', status: 'success', message: 'Connected successfully' };
    } catch (err: any) {
      newResults[0] = { name: 'Connection', status: 'error', message: err.message };
    }
    setResults([...newResults]);

    // Test 2: Authentication
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      newResults[1] = {
        name: 'Authentication',
        status: 'success',
        message: session ? `Logged in as ${session.user.email}` : 'No active session (not logged in)'
      };
    } catch (err: any) {
      newResults[1] = { name: 'Authentication', status: 'error', message: err.message };
    }
    setResults([...newResults]);

    // Test 3: Profiles Table
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      newResults[2] = { name: 'Profiles Table', status: 'success', message: 'Table exists and accessible' };
    } catch (err: any) {
      newResults[2] = { name: 'Profiles Table', status: 'error', message: err.message };
    }
    setResults([...newResults]);

    // Test 4: Matches Table
    try {
      const { error } = await supabase.from('matches').select('id').limit(1);
      if (error) throw error;
      newResults[3] = { name: 'Matches Table', status: 'success', message: 'Table exists and accessible' };
    } catch (err: any) {
      newResults[3] = { name: 'Matches Table', status: 'error', message: err.message };
    }
    setResults([...newResults]);

    // Test 5: Visits Table
    try {
      const { error } = await supabase.from('visits').select('id').limit(1);
      if (error) throw error;
      newResults[4] = { name: 'Visits Table', status: 'success', message: 'Table exists and accessible' };
    } catch (err: any) {
      newResults[4] = { name: 'Visits Table', status: 'error', message: err.message };
    }
    setResults([...newResults]);

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const allSuccess = results.every(r => r.status === 'success');
  const hasErrors = results.some(r => r.status === 'error');

  return (
    <Card className="bg-[#111827] border-gray-800 p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Database Diagnostics</h3>
            <p className="text-gray-400 text-sm">Checking Supabase connection</p>
          </div>
        </div>
        <Button
          onClick={runDiagnostics}
          disabled={isRunning}
          variant="outline"
          size="sm"
          className="border-gray-600"
        >
          <Wifi className={`w-4 h-4 mr-2 ${isRunning ? 'animate-pulse' : ''}`} />
          {isRunning ? 'Testing...' : 'Retest'}
        </Button>
      </div>

      <div className="space-y-3">
        {results.map((result, i) => (
          <div 
            key={i}
            className={`flex items-center justify-between p-3 rounded-lg ${
              result.status === 'success' ? 'bg-emerald-500/10' :
              result.status === 'error' ? 'bg-red-500/10' :
              'bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(result.status)}
              <span className="text-white font-medium">{result.name}</span>
            </div>
            <span className={`text-sm ${
              result.status === 'success' ? 'text-emerald-400' :
              result.status === 'error' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {result.message}
            </span>
          </div>
        ))}
      </div>

      {allSuccess && (
        <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All systems operational!</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Your Supabase database is properly configured and ready to use.
          </p>
        </div>
      )}

      {hasErrors && (
        <div className="mt-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Configuration issues detected</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Some tests failed. Check the error messages above and ensure you've run all SQL migrations.
          </p>
          <a 
            href="https://github.com/supabase/supabase/blob/master/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 text-sm hover:underline mt-2 inline-block"
          >
            View setup guide →
          </a>
        </div>
      )}
    </Card>
  );
}
