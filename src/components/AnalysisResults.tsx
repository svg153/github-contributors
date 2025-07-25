import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompanyCard } from './CompanyCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building, 
  Users, 
  GitCommit, 
  Star, 
  GitFork, 
  User,
  Calendar,
  Download
} from '@phosphor-icons/react';
import { AnalysisResult } from '@/lib/types';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const totalCompanyContributions = result.companies.reduce((sum, company) => sum + company.totalContributions, 0);
  const unknownContributions = result.unknownContributors.reduce((sum, contributor) => sum + contributor.contributions, 0);
  const companyContributorCount = result.companies.reduce((sum, company) => sum + company.employeeCount, 0);

  const exportResults = () => {
    const data = {
      repository: result.repository,
      analyzed_at: result.lastUpdated,
      summary: {
        total_contributors: result.totalContributors,
        company_contributors: companyContributorCount,
        individual_contributors: result.unknownContributors.length,
        companies_found: result.companies.length
      },
      companies: result.companies.map(company => ({
        name: company.name,
        employee_count: company.employeeCount,
        total_contributions: company.totalContributions,
        contributors: company.contributors.map(c => ({
          github_username: c.login,
          name: c.name,
          contributions: c.contributions,
          location: c.location
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.repository.replace('/', '-')}-company-analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground mt-1">
            Repository: <span className="font-medium">{result.repository}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults} size="sm">
            <Download className="mr-2" size={16} />
            Export
          </Button>
          <Button onClick={onReset} variant="outline" size="sm">
            New Analysis
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{result.totalContributors}</p>
                <p className="text-sm text-muted-foreground">Total Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{result.companies.length}</p>
                <p className="text-sm text-muted-foreground">Companies Found</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/50 rounded-lg">
                <GitCommit className="text-secondary-foreground" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCompanyContributions}</p>
                <p className="text-sm text-muted-foreground">Company Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <User className="text-muted-foreground" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{result.unknownContributors.length}</p>
                <p className="text-sm text-muted-foreground">Individual Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Section */}
      {result.companies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Contributing Companies</h2>
            <Badge variant="secondary">{result.companies.length} companies</Badge>
          </div>
          
          <div className="grid gap-4">
            {result.companies.map((company) => (
              <CompanyCard key={company.name} company={company} />
            ))}
          </div>
        </div>
      )}

      {/* Individual Contributors Section */}
      {result.unknownContributors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Individual Contributors</h2>
            <Badge variant="secondary">{result.unknownContributors.length} contributors</Badge>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {result.unknownContributors.slice(0, 20).map((contributor) => (
                  <div key={contributor.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
                      <AvatarFallback>
                        <User size={20} />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <a 
                          href={contributor.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {contributor.name || contributor.login}
                        </a>
                        {contributor.name && contributor.name !== contributor.login && (
                          <span className="text-sm text-muted-foreground">@{contributor.login}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <GitCommit size={14} />
                          <span>{contributor.contributions} commits</span>
                        </div>
                        {contributor.location && (
                          <span>📍 {contributor.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {result.unknownContributors.length > 20 && (
                  <div className="text-center py-4 text-muted-foreground">
                    And {result.unknownContributors.length - 20} more contributors...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>Analysis completed on {new Date(result.lastUpdated).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}