/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AWS_LOCATION_API_KEY: string
  readonly VITE_AWS_LOCATION_REGION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
