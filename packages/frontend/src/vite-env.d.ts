/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declarations for direct lucide-react icon imports (optimized bundle size)
declare module 'lucide-react/dist/esm/icons/*' {
  import { LucideIcon } from 'lucide-react';
  const icon: LucideIcon;
  export default icon;
}
