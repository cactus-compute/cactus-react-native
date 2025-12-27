import { CactusIndex as NativeCactusIndex, CactusFileSystem } from '../native';
import type {
  CactusIndexAddParams,
  CactusIndexGetParams,
  CactusIndexGetResult,
  CactusIndexQueryParams,
  CactusIndexQueryResult,
  CactusIndexDeleteParams,
} from '../types/CactusIndex';

export class CactusIndex {
  private readonly cactusIndex = new NativeCactusIndex();

  private readonly name: string;
  private readonly embeddingDim: number;

  constructor(name: string, embeddingDim: number) {
    this.name = name;
    this.embeddingDim = embeddingDim;
  }

  public async init(): Promise<void> {
    const indexPath = await CactusFileSystem.getIndexPath(this.name);
    return this.cactusIndex.init(indexPath, this.embeddingDim);
  }

  public add({
    ids,
    documents,
    embeddings,
    metadatas,
  }: CactusIndexAddParams): Promise<void> {
    return this.cactusIndex.add(ids, documents, embeddings, metadatas);
  }

  public delete({ ids }: CactusIndexDeleteParams): Promise<void> {
    return this.cactusIndex.delete(ids);
  }

  public get({ ids }: CactusIndexGetParams): Promise<CactusIndexGetResult> {
    return this.cactusIndex.get(ids);
  }

  public query({
    embeddings,
    options,
  }: CactusIndexQueryParams): Promise<CactusIndexQueryResult> {
    return this.cactusIndex.query(embeddings, options);
  }

  public compact(): Promise<void> {
    return this.cactusIndex.compact();
  }

  public destroy(): Promise<void> {
    return this.cactusIndex.destroy();
  }
}
