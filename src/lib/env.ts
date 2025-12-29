const ensureEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but was not provided.`);
  }
  return value;
};

export const publicEnv = {
  NEXT_PUBLIC_WOREDA_ID: process.env.NEXT_PUBLIC_WOREDA_ID ?? "woreda-9",
  NEXT_PUBLIC_WOREDA_NAME: process.env.NEXT_PUBLIC_WOREDA_NAME ?? "የብልጽግና ፓርቲ የኢንስፔክሽንና የሥነምግባር ኮሚሽን",
  NEXT_PUBLIC_WOREDA_LOGO_PATH:
    process.env.NEXT_PUBLIC_WOREDA_LOGO_PATH ?? "/logo.jpg",
  NEXT_PUBLIC_WOREDA_IMAGES_PREFIX:
    process.env.NEXT_PUBLIC_WOREDA_IMAGES_PREFIX ?? "/assets",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const requiredEnv = {
  SUPABASE_URL: () => ensureEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: () => ensureEnv("SUPABASE_SERVICE_ROLE_KEY"),
};


