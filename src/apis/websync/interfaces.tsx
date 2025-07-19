export interface WebSyncCreateRequest {
    baseurl: string;
    urls: string[];
}

export interface WebSyncUpdateRequest {
    baseurl?: string;
    urls?: string[];
    urlsChecked?: boolean[];
}

export interface WebSyncModel {
    id: string;
    baseurl: string;
    urls: string[];
    urlsChecked: boolean[];
    lastSynced: Date;
}