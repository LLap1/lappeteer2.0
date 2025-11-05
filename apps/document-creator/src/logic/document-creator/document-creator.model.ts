import { CreateDocumentInput, CreateDocumentOutput } from 'src/routers/documents/documents.router.schema';


export abstract class DocumentCreatorService {
  abstract createDocument(input: CreateDocumentInput): Promise<CreateDocumentOutput>;
}
