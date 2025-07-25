import { Contributor, CompanyData, AnalysisResult, RepositoryInfo } from './types';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubAnalyzer {
  private async fetchWithAuth(url: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Company-Analyzer'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found');
      }
      if (response.status === 403) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    return response;
  }

  async getRepositoryInfo(owner: string, repo: string): Promise<RepositoryInfo> {
    const response = await this.fetchWithAuth(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
    const data = await response.json();
    
    return {
      owner: data.owner.login,
      repo: data.name,
      full_name: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count
    };
  }

  async getContributors(owner: string, repo: string): Promise<Contributor[]> {
    const contributors: Contributor[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const response = await this.fetchWithAuth(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?page=${page}&per_page=${perPage}`
      );
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) break;
      
      contributors.push(...data.map(contributor => ({
        id: contributor.id,
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url,
        contributions: contributor.contributions
      })));
      
      if (data.length < perPage) break;
      page++;
      
      // Limit to prevent excessive API calls
      if (page > 10) break;
    }

    return contributors;
  }

  async enrichContributorData(contributor: Contributor): Promise<Contributor> {
    try {
      const response = await this.fetchWithAuth(`${GITHUB_API_BASE}/users/${contributor.login}`);
      const userData = await response.json();
      
      return {
        ...contributor,
        name: userData.name,
        email: userData.email,
        company: userData.company,
        blog: userData.blog,
        location: userData.location
      };
    } catch (error) {
      console.warn(`Could not fetch data for ${contributor.login}:`, error);
      return contributor;
    }
  }

  private extractCompanyFromEmail(email: string): string | null {
    if (!email || email.includes('noreply') || email.includes('users.noreply')) {
      return null;
    }
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    
    // Skip common personal email providers
    const personalProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'protonmail.com', 'tutanota.com'
    ];
    
    if (personalProviders.includes(domain)) {
      return null;
    }
    
    // Convert domain to company name
    return domain.split('.')[0]
      .split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private normalizeCompanyName(company: string): string {
    if (!company) return company;
    
    return company
      .replace(/^@/, '') // Remove @ prefix
      .replace(/\s*\(.*?\)\s*/, '') // Remove parenthetical info
      .replace(/,.*$/, '') // Remove everything after comma
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private determineCompany(contributor: Contributor): string | null {
    // Priority 1: GitHub profile company field
    if (contributor.company) {
      const normalized = this.normalizeCompanyName(contributor.company);
      if (normalized && normalized.length > 1) {
        return normalized;
      }
    }
    
    // Priority 2: Email domain
    if (contributor.email) {
      const emailCompany = this.extractCompanyFromEmail(contributor.email);
      if (emailCompany) {
        return emailCompany;
      }
    }
    
    return null;
  }

  async analyzeRepository(owner: string, repo: string, onProgress?: (progress: number, status: string) => void): Promise<AnalysisResult> {
    try {
      onProgress?.(10, 'Fetching repository information...');
      const repoInfo = await this.getRepositoryInfo(owner, repo);
      
      onProgress?.(20, 'Getting contributors...');
      const contributors = await this.getContributors(owner, repo);
      
      onProgress?.(40, `Enriching contributor data (${contributors.length} contributors)...`);
      
      const enrichedContributors: Contributor[] = [];
      for (let i = 0; i < contributors.length; i++) {
        const enriched = await this.enrichContributorData(contributors[i]);
        enrichedContributors.push(enriched);
        
        const progress = 40 + Math.floor((i / contributors.length) * 40);
        onProgress?.(progress, `Analyzing contributor ${i + 1}/${contributors.length}...`);
        
        // Small delay to avoid rate limiting
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onProgress?.(85, 'Grouping by companies...');
      
      const companyMap = new Map<string, Contributor[]>();
      const unknownContributors: Contributor[] = [];
      
      for (const contributor of enrichedContributors) {
        const company = this.determineCompany(contributor);
        
        if (company) {
          if (!companyMap.has(company)) {
            companyMap.set(company, []);
          }
          companyMap.get(company)!.push(contributor);
        } else {
          unknownContributors.push(contributor);
        }
      }
      
      const companies: CompanyData[] = Array.from(companyMap.entries())
        .map(([name, contributors]) => ({
          name,
          contributors: contributors.sort((a, b) => b.contributions - a.contributions),
          totalContributions: contributors.reduce((sum, c) => sum + c.contributions, 0),
          employeeCount: contributors.length
        }))
        .sort((a, b) => b.totalContributions - a.totalContributions);

      onProgress?.(100, 'Analysis complete!');

      return {
        repository: repoInfo.full_name,
        totalContributors: enrichedContributors.length,
        companies,
        unknownContributors: unknownContributors.sort((a, b) => b.contributions - a.contributions),
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, ''); // Remove trailing slashes
    
    // Handle various GitHub URL formats
    const patterns = [
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/,
      /^github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        const [, owner, repo] = match;
        // Remove .git suffix if present
        const cleanRepo = repo.replace(/\.git$/, '');
        return { owner, repo: cleanRepo };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}