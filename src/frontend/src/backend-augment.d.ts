// Augments Backend class and backendInterface with internal Caffeine authorization method
// used by useActor.ts to initialize access control.
export {};

declare module "./backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
  interface Backend {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
  }
}
