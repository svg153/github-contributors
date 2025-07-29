import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, GitCommit, ChevronDown, ChevronUp, User } from '@phosphor-icons/react';
import { CompanyData } from '@/lib/types';
import { CompanyLogo } from './CompanyLogo';

interface CompanyCardProps {
  company: CompanyData;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CompanyLogo logoUrl={company.logo} companyName={company.name} />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl truncate">{company.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{company.employeeCount} contributor{company.employeeCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitCommit size={16} />
                  <span>{company.totalContributions} contribution{company.totalContributions !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground self-start sm:self-center text-xs sm:text-sm whitespace-nowrap">
            {Math.round((company.totalContributions / company.contributors.reduce((sum, c) => sum + c.contributions, 0)) * 100) || 0}% of total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">View Contributors</span>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="space-y-3">
              {company.contributors.map((contributor) => (
                <div key={contributor.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
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
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}