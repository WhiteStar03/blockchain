// api-env.ts

// Define available API environments
export enum API_ENV {
    local = 'local',
    customRPC = 'customRPC',
  }
  
  // Map API environments to their respective endpoints
  export const ENV_TO_API: Record<API_ENV, string | null> = {
    [API_ENV.customRPC]: null,
    [API_ENV.local]: 'http://0.0.0.0:9000',
  };
  