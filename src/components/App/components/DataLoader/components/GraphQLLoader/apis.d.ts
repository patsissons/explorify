declare module 'apis.json' {
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
    sampleQuery?: string;
    externalDocs: GraphQLApiExternalDocs[];
    security?: GraphQLApiSecurity[];
  }

  const apis: GraphQLApi[];

  export default apis;
}
