export interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  name?: string;
  email?: string;
  company?: string;
  blog?: string;
  location?: string;
}

export interface CompanyData {
  name: string;
  contributors: Contributor[];
  totalContributions: number;
  employeeCount: number;
}

export interface AnalysisResult {
  repository: string;
  totalContributors: number;
  companies: CompanyData[];
  unknownContributors: Contributor[];
  lastUpdated: string;
}

export interface RepositoryInfo {
  owner: string;
  repo: string;
  full_name: string;
  description?: string;
  stars: number;
  forks: number;
}