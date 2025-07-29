import { useState } from 'react';
import { Building } from '@phosphor-icons/react';

interface CompanyLogoProps {
  logoUrl?: string;
  companyName: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({ logoUrl, companyName, size = 24, className = "" }: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (!logoUrl || imageError) {
    return (
      <div className={`p-2 bg-primary/10 rounded-lg flex-shrink-0 ${className}`}>
        <Building className="text-primary" size={size} />
      </div>
    );
  }

  return (
    <div className={`p-2 bg-primary/10 rounded-lg flex-shrink-0 ${className}`}>
      <img 
        src={logoUrl}
        alt={`${companyName} logo`}
        className="object-contain"
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
        onLoad={(e) => {
          // Check if the image is a generic/default favicon
          const img = e.target as HTMLImageElement;
          if (img.naturalWidth <= 16 && img.naturalHeight <= 16) {
            setImageError(true);
          }
        }}
      />
    </div>
  );
}