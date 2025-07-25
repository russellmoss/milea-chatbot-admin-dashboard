export interface SyncStatus {
    job_id: string;
    status: 'pending' | 'complete';
    progress: number;
    total: number;
    completed: number;
    failed: number;
}