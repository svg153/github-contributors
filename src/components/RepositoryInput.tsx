import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { GitBranch, AlertCircle } from '@phosphor-icons/react';
import { parseGitHubUrl } from '@/lib/github-analyzer';

interface RepositoryInputProps {
  onSubmit: (owner: string, repo: string) => void;
  isLoading: boolean;
}

export function RepositoryInput({ onSubmit, isLoading }: RepositoryInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a repository URL');
      return;
    }
    
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError('Invalid GitHub repository URL. Try: https://github.com/owner/repo');
      return;
    }
    
    onSubmit(parsed.owner, parsed.repo);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repo-url" className="text-sm font-medium">
            GitHub Repository URL
          </Label>
          <div className="relative">
            <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              id="repo-url"
              type="text"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Repository'}
        </Button>
      </form>
    </Card>
  );
}