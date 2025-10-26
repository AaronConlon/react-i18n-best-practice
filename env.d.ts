/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly PUBLIC_I18N_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface RsbuildTypeOptions {
  strictImportMetaEnv: true;
}
