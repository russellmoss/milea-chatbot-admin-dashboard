export interface DomainCreateRequest {
    name: string;
    description: string;
    icon?: string;
}

export interface Domain {
    id: string;
    name: string;
    description: string;
    icon?: string;
    filenames: DomainFile[];
    createdAt: string;
    updatedAt: string;
}

export interface DomainFile {
    filename: string;
    content: string;
    size: number;
    author: string;
    createdAt: string;
    updatedAt: string;
}