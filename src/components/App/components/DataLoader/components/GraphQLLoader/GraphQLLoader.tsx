import * as React from 'react';

import {Button, FormLayout, Select, TextField} from '@shopify/polaris';
import {request} from 'graphql-request';
import {graphqlLodash} from 'graphql-lodash';

import {DataLoaderFunction, DataLoaderMountedProps} from '../shared';
import apis from './apis.json';

export interface Props extends DataLoaderMountedProps {}

type ComposedProps = Props;

interface State {
  apiName?: string;
  endpoint?: string;
  loading?: boolean;
  query?: string;
  result?: string;
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
    const {apiName, loading, query, endpoint, result} = this.state;

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
        <Button onClick={this.previewResult} loading={loading}>
          Preview
        </Button>
        {result && <pre>{result}</pre>}
      </FormLayout>
    );
  }

  dataLoader: DataLoaderFunction = async () => {
    const {query, endpoint} = this.state;

    if (!query || !endpoint) {
      throw new Error('Invalid query or endpoint');
    }

    const api = apis.filter(({url}) => url === endpoint).shift();
    const values = await dataLoader(query, endpoint);

    return {
      name: api && api.info.title,
      values,
    };
  };

  previewResult = async () => {
    const {query, endpoint} = this.state;

    try {
      if (!query || !endpoint) {
        throw new Error('Invalid query or endpoint');
      }

      this.setState({loading: true});

      const result = await dataLoader(query, endpoint);

      this.setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      this.setResult(error.toString());
    }
  };

  setApiName = (apiName: string) => {
    const api = apis.filter(({info: {title}}) => title === apiName).shift();

    if (api) {
      const {url: endpoint = '', sampleQuery: query = ''} = api;

      this.setState({apiName, endpoint, query});
    } else {
      this.setState({apiName, endpoint: '', query: ''});
    }
  };

  setQuery = (query: string) => {
    this.setState({query});
  };

  setEndpoint = (endpoint: string) => {
    this.setState({endpoint});

    const api = apis.filter(({url}) => url === endpoint).shift();

    if (api && api.sampleQuery) {
      this.setQuery(api.sampleQuery);
    }
  };

  setResult = (result: string) => {
    this.setState({result, loading: false});
  };
}

interface Result {
  values: any;
}

export async function dataLoader(
  lodashQuery: string,
  endpoint: string | undefined,
) {
  if (!endpoint) {
    throw new Error('Invalid endpoint');
  }

  const {query, transform} = graphqlLodash(lodashQuery);

  const data = await request<Result>(endpoint, query);

  const {values} = transform<Result>(data);

  return values;
}

export default GraphQLLoader;
