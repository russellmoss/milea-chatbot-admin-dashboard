export interface WebSyncSettingUpdateRequest {
    baseurl?: string;
    urls?: string[];
    urlsChecked?: boolean[];
    itemCount?: number;
    status?: "Synced" | "Never Sync" | "Partial Synced";
    schedule?: "Never" | "Hourly" | "Daily" | "Weekly" | "Monthly" | "Manual";
    jobId?: string;
}

export interface WebSyncSetting {
    baseurl: string;
    urls: string[];
    urlsChecked: boolean[];
    selectedUrls: string[];
    lastSynced: string;
    itemCount: number;
    status: "Never Sync" | "Synced" | "Partial Synced";
    schedule: "Never" | "Hourly" | "Daily" | "Weekly" | "Monthly" | "Manual";
    jobId: string;
}

export interface C7SyncSetting {
    lastSynced: string;
    itemCount: number;
    status: "Never Sync" | "Synced" | "Partial Synced";
    schedule: "Never" | "Hourly" | "Daily" | "Weekly" | "Monthly" | "Manual";
}

export interface SyncSetting {
    id: string;
    webSyncSetting: WebSyncSetting;
    commerce7SyncSetting: C7SyncSetting;
}