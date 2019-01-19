export interface GraphQLApiExternalDocs {
  description: string;
  url: string;
}

export interface GraphQLApiSecurity {
  title: string;
  description: string;
  type: string;
  prefix: string;
  name: string;
  in: string;
}

export interface GraphQLApiSample {
  headers?: string;
  query: string;
  variables?: string;
}

export interface GraphQLApi {
  url: string;
  info: {
    title: string;
    description: string;
    logo?: {
      url: string;
      backgroundColor?: string;
    };
  };
  samples?: GraphQLApiSample[];
  externalDocs: GraphQLApiExternalDocs[];
  security?: GraphQLApiSecurity[];
}
