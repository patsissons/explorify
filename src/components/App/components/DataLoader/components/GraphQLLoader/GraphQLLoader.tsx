import * as React from 'react';

import {Button, FormLayout, Select, TextField} from '@shopify/polaris';
import {parse, OperationDefinitionNode} from 'graphql';
import {GraphQLClient} from 'graphql-request';
import {graphqlLodash} from 'graphql-lodash';

import env from '@app/env';
import {DataLoaderFunction, DataLoaderMountedProps} from '../shared';
import {GraphQLApi} from './types';

import apis from './apis.json';

export interface Props extends DataLoaderMountedProps {}

type ComposedProps = Props;

interface State {
  apiName?: string;
  endpoint?: string;
  headers?: string;
  loading?: boolean;
  query?: string;
  result?: string;
  variables?: string;
}

const CustomApiName = 'Custom';

export class GraphQLLoader extends React.PureComponent<ComposedProps, State> {
  state: State = {
    apiName: CustomApiName,
  };

  private readonly options = [
    {label: CustomApiName, value: CustomApiName},
    ...apis.map(({info: {title: value}}) => ({
      label: value,
      value,
    })),
  ];

  componentDidMount() {
    const {onMounted} = this.props;

    onMounted(this.dataLoader);
  }

  render() {
    const {
      apiName,
      endpoint,
      headers,
      loading,
      query,
      result,
      variables,
    } = this.state;

    return (
      <FormLayout>
        <Select
          label="Data Source"
          options={this.options}
          onChange={this.setApiName}
          value={apiName}
        />
        <TextField
          label="Endpoint"
          value={endpoint}
          onChange={this.setEndpoint}
        />
        <TextField
          label="Query"
          multiline={5}
          onChange={this.setQuery}
          value={query}
        />
        <TextField
          label="Variables"
          placeholder="JSON format"
          value={variables}
          onChange={this.setVariables}
        />
        <TextField
          label="Headers"
          placeholder="JSON format"
          value={headers}
          onChange={this.setHeaders}
        />
        <Button onClick={this.previewResult} loading={loading}>
          Preview
        </Button>
        {result && <pre>{result}</pre>}
      </FormLayout>
    );
  }

  dataLoader: DataLoaderFunction = async () => {
    const {query, endpoint, headers, variables} = this.state;

    if (!query || !endpoint) {
      throw new Error('Invalid query or endpoint');
    }

    const api = apis.filter(({url}) => url === endpoint).shift();
    const values = await dataLoader(query, endpoint, headers, variables);

    return {
      name: api && api.info.title,
      values,
    };
  };

  previewResult = async () => {
    const {query, endpoint, headers, variables} = this.state;

    try {
      if (!query || !endpoint) {
        throw new Error('Invalid query or endpoint');
      }

      this.setState({loading: true});

      const result = await graphQLResult(
        query,
        endpoint,
        headers && JSON.parse(headers),
        variables && JSON.parse(variables),
        graphQLOperations(query).shift(),
      );

      this.setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      this.setResult(error.toString());
    }
  };

  setApiName = (apiName: string) => {
    const api = apis.filter(({info: {title}}) => title === apiName).shift() as
      | GraphQLApi
      | undefined;

    if (api) {
      const {
        url: endpoint = '',
        samples: [
          {headers = undefined, query = undefined, variables = undefined},
        ] = [{}],
      } = api;

      const token = env[`${apiName.toUpperCase()}_TOKEN`];

      this.setState({
        apiName,
        endpoint,
        headers: (token && `{"Authorization": "bearer ${token}"}`) || headers,
        query,
        variables,
      });
    } else {
      this.setState({apiName, endpoint: '', query: ''});
    }
  };

  setQuery = (query: string) => {
    this.setState({query});
  };

  setEndpoint = (endpoint: string) => {
    this.setState({endpoint});

    const api = apis.filter(({url}) => url === endpoint).shift() as
      | GraphQLApi
      | undefined;

    if (api) {
      const {
        info: {title},
        samples: [
          {headers = undefined, query = undefined, variables = undefined},
        ] = [{}],
      } = api;

      // eslint-disable-next-line no-process-env
      const token = process.env[`${title.toUpperCase()}_TOKEN`];

      if (headers) {
        this.setHeaders(
          (token && `{"Authorization": "bearer ${token}"}`) || headers,
        );
      }

      if (query) {
        this.setQuery(query);
      }

      if (variables) {
        this.setVariables(variables);
      }
    }
  };

  setHeaders = (headers: string) => {
    this.setState({headers});
  };

  setResult = (result: string) => {
    this.setState({result, loading: false});
  };

  setVariables = (variables: string) => {
    this.setState({variables});
  };
}

interface PagedData<T = any> {
  pageInfo: any;
  nodes: T[];
}

interface Result<T = any> {
  values: T[] | PagedData<T>;
}

export function graphQLOperations(query: string) {
  const document = parse(query);

  return document.definitions
    .filter(
      (def): def is OperationDefinitionNode =>
        def.kind === 'OperationDefinition',
    )
    .map(({name}) => name && name.value)
    .filter((name) => Boolean(name));
}

export async function graphQLResult<T = any>(
  query: string,
  endpoint: string,
  headers: any,
  variables: any,
  operationName?: string,
) {
  const {query: transformedQuery, transform} = graphqlLodash(
    query,
    operationName,
  );

  const data = await new GraphQLClient(endpoint, {
    headers,
  }).request(transformedQuery, variables);

  return transform<T>(data);
}

export async function dataLoader(
  query: string,
  endpoint: string | undefined,
  headers: string | undefined,
  variables: string | undefined,
  maxPages = 10,
) {
  if (!endpoint) {
    throw new Error('Invalid endpoint');
  }

  const operations = graphQLOperations(query);
  const staticHeaders = headers && JSON.parse(headers);
  const staticVariables = (variables && JSON.parse(variables)) || {};

  let values: any[] = [];
  let dynamicVariables = staticVariables;
  let page = 0;

  if (!operations.length) {
    operations.push(undefined);
  }

  while (operations.length) {
    const operationName = operations.shift();

    const result = await graphQLResult<Result>(
      query,
      endpoint,
      staticHeaders,
      dynamicVariables,
      operationName,
    );

    if (Array.isArray(result.values)) {
      values = values.concat(result.values);
      page = 0;
    } else if (Array.isArray(result.values.nodes) && result.values.pageInfo) {
      // eslint-disable-next-line prefer-object-spread
      dynamicVariables = Object.assign(
        {},
        staticVariables,
        result.values.pageInfo,
      );

      values = values.concat(result.values.nodes);

      if (result.values.pageInfo.repeat && page++ < maxPages) {
        operations.unshift(operationName);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  return values;
}

export default GraphQLLoader;
