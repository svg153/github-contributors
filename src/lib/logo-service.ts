export class LogoService {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static cache = new Map<string, { url: string | null; timestamp: number }>();

  private static extractDomain(company: string): string {
    // Clean company name and try to extract/guess domain
    const cleaned = company.toLowerCase()
      .replace(/\s+(inc|llc|ltd|corp|corporation|company|co)\.?$/i, '')
      .replace(/[^a-z0-9]/g, '');
    
    // Common domain mappings for well-known companies
    const domainMappings: Record<string, string> = {
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'apple': 'apple.com',
      'amazon': 'amazon.com',
      'meta': 'meta.com',
      'facebook': 'meta.com',
      'netflix': 'netflix.com',
      'spotify': 'spotify.com',
      'uber': 'uber.com',
      'airbnb': 'airbnb.com',
      'tesla': 'tesla.com',
      'nvidia': 'nvidia.com',
      'intel': 'intel.com',
      'amd': 'amd.com',
      'ibm': 'ibm.com',
      'oracle': 'oracle.com',
      'salesforce': 'salesforce.com',
      'adobe': 'adobe.com',
      'vmware': 'vmware.com',
      'redhat': 'redhat.com',
      'twitter': 'x.com',
      'linkedin': 'linkedin.com',
      'github': 'github.com',
      'gitlab': 'gitlab.com',
      'atlassian': 'atlassian.com',
      'shopify': 'shopify.com',
      'stripe': 'stripe.com',
      'paypal': 'paypal.com',
      'dropbox': 'dropbox.com',
      'slack': 'slack.com',
      'zoom': 'zoom.us',
      'cloudflare': 'cloudflare.com',
      'mongodb': 'mongodb.com',
      'elastic': 'elastic.co',
      'docker': 'docker.com',
      'kubernetes': 'kubernetes.io',
      'jenkins': 'jenkins.io',
      'hashicorp': 'hashicorp.com',
      'databricks': 'databricks.com',
      'snowflake': 'snowflake.com',
      'palantir': 'palantir.com',
      'twillio': 'twilio.com',
      'twilio': 'twilio.com',
      'square': 'squareup.com',
      'airbus': 'airbus.com',
      'boeing': 'boeing.com',
      'volkswagen': 'volkswagen.com',
      'toyota': 'toyota.com',
      'ford': 'ford.com',
      'bmw': 'bmw.com',
      'mercedes': 'mercedes-benz.com',
      'cocacola': 'coca-cola.com',
      'pepsi': 'pepsi.com',
      'mcdonalds': 'mcdonalds.com',
      'starbucks': 'starbucks.com',
    };

    return domainMappings[cleaned] || `${cleaned}.com`;
  }

  private static async testImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
    } catch {
      return false;
    }
  }

  static getCachedLogo(companyName: string): string | null | undefined {
    const cached = this.cache.get(companyName);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url;
    }
    return undefined;
  }

  static async fetchCompanyLogo(companyName: string): Promise<string | null> {
    if (!companyName || companyName.trim() === '') {
      return null;
    }

    // Check cache first
    const cached = this.getCachedLogo(companyName);
    if (cached !== undefined) {
      return cached;
    }

    let logoUrl: string | null = null;

    // Try Clearbit first (most reliable)
    try {
      const domain = this.extractDomain(companyName);
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      
      if (await this.testImageUrl(clearbitUrl)) {
        logoUrl = clearbitUrl;
      }
    } catch (error) {
      console.log(`Clearbit failed for ${companyName}:`, error);
    }

    // Fallback to favicon if Clearbit fails
    if (!logoUrl) {
      try {
        const domain = this.extractDomain(companyName);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        
        if (await this.testImageUrl(faviconUrl)) {
          logoUrl = faviconUrl;
        }
      } catch (error) {
        console.log(`Favicon fallback failed for ${companyName}:`, error);
      }
    }

    // Cache the result
    this.cache.set(companyName, {
      url: logoUrl,
      timestamp: Date.now()
    });

    return logoUrl;
  }

  static async fetchMultipleLogos(companies: string[]): Promise<Record<string, string | null>> {
    const logoPromises = companies.map(async (company) => {
      try {
        const logo = await this.fetchCompanyLogo(company);
        return { company, logo };
      } catch (error) {
        console.log(`Failed to fetch logo for ${company}:`, error);
        return { company, logo: null };
      }
    });

    const results = await Promise.allSettled(logoPromises);
    const logoMap: Record<string, string | null> = {};

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        logoMap[companies[index]] = result.value.logo;
      } else {
        logoMap[companies[index]] = null;
      }
    });

    return logoMap;
  }
}