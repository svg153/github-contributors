import { useState } from 'react';
import { RepositoryInput } from './components/RepositoryInput';
import { AnalysisProgress } from './components/AnalysisProgress';
import { AnalysisResults } from './components/AnalysisResults';
import { GitHubAnalyzer } from './lib/github-analyzer';
import { AnalysisResult } from './lib/types';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Building, Github } from '@phosphor-icons/react';

type AppState = 'input' | 'analyzing' | 'results' | 'error';

function App() {
  const [state, setState] = useState<AppState>('input');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [analysisHistory, setAnalysisHistory] = useKV<AnalysisResult[]>('analysis-history', []);

  const analyzer = new GitHubAnalyzer();

  const handleAnalyze = async (owner: string, repo: string) => {
    setState('analyzing');
    setProgress(0);
    setError('');

    try {
      const analysisResult = await analyzer.analyzeRepository(
        owner, 
        repo, 
        (progress, status) => {
          setProgress(progress);
          setStatus(status);
        }
      );

      setResult(analysisResult);
      
      // Save to history
      setAnalysisHistory(currentHistory => {
        const updated = [analysisResult, ...currentHistory.slice(0, 9)]; // Keep last 10
        return updated;
      });
      
      setState('results');
      toast.success(`Analysis complete! Found ${analysisResult.companies.length} companies and ${analysisResult.totalContributors} contributors.`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setState('error');
      toast.error(`Analysis failed: ${errorMessage}`);
    }
  };

  const handleReset = () => {
    setState('input');
    setResult(null);
    setError('');
    setProgress(0);
    setStatus('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="text-primary" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GitHub Company Analyzer</h1>
              <p className="text-sm text-muted-foreground">
                Discover which companies contribute to open source projects
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {state === 'input' && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Analyze Repository Contributors</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Enter a GitHub repository URL to analyze contributor affiliations and discover 
                  which companies are actively contributing to the project.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <RepositoryInput onSubmit={handleAnalyze} isLoading={false} />
              </div>

              {/* Recent Analyses */}
              {analysisHistory.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Recent Analyses</h3>
                  <div className="grid gap-4">
                    {analysisHistory.slice(0, 3).map((analysis, index) => (
                      <div 
                        key={index}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setResult(analysis);
                          setState('results');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Github size={20} className="text-muted-foreground" />
                            <div>
                              <p className="font-medium">{analysis.repository}</p>
                              <p className="text-sm text-muted-foreground">
                                {analysis.companies.length} companies • {analysis.totalContributors} contributors
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(analysis.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {state === 'analyzing' && (
            <div className="max-w-2xl mx-auto">
              <AnalysisProgress progress={progress} status={status} />
            </div>
          )}

          {state === 'results' && result && (
            <AnalysisResults result={result} onReset={handleReset} onReprocess={handleAnalyze} />
          )}

          {state === 'error' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-4 p-8">
                <div className="text-6xl">⚠️</div>
                <h2 className="text-2xl font-bold text-destructive">Analysis Failed</h2>
                <p className="text-muted-foreground">{error}</p>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Powered by GitHub API • Data analysis may take a few minutes for large repositories
            </p>
            <p>
              Rate limits may apply based on repository size and GitHub API quotas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App