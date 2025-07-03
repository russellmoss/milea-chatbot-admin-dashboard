export interface ResponseImprovements {
    impact: 'Low' | 'Medium' | 'High' | 'Very High';
    responseImprovements: ResponseImprovement[];
}

export interface ResponseImprovement {
    responseId: string;
    response: string;
    issueClassified: string;
    improvedResponse: string;
}