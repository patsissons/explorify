import { DocumentNode } from "graphql/language";

export declare function graphqlLodash(
  query: string,
  operationName?: string
): {
  query: string;
  transform<T = any>(data: any): T;
};

export declare function graphqlLodash(
  query: DocumentNode,
  operationName?: string
): {
  query: DocumentNode;
  transform<T = any>(data: any): T;
};

export declare const lodashDirectiveAST: DocumentNode;
