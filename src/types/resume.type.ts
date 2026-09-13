
export type TResume = {
    id:string;
    title: string;
    pdfUrl:string;
    publicId? : string;
    sortOrder?: number;
    createdAt:string;
    updatedAt:string;
    isActive: boolean
}