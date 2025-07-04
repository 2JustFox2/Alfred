export interface IClapDetector{
    // start: (next: (promt: string) => Promise<string>) => Promise<string>,
    start: (next: (promt: string) => void) => Promise<void>,
    stop: () => string,
}