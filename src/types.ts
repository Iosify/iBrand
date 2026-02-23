export interface BrandIdentity {
  name: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string[];
    neutral: string[];
  };
  typography: {
    fontFamily: string;
    headings: string;
    body: string;
  };
  narrative: string;
  logoSystem: {
    primary: string;
    logomark: string;
    wordmark: string;
    monochrome: string;
    appIcon: string;
  };
}

export interface Draft {
  id: number;
  name: string;
  description: string;
  logo_url: string | null;
  identity: BrandIdentity;
  created_at: string;
}
