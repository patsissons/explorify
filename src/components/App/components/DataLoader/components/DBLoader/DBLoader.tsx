import * as React from 'react';

import {Button, FormLayout, TextField} from '@shopify/polaris';
import {loader} from 'vega';

import env from '@app/env';
import {DataLoaderFunction, DataLoaderMountedProps} from '../shared';

const dbProxy = env.DB_PROXY || '';

export interface Props extends DataLoaderMountedProps {}

type ComposedProps = Props;

interface State {
  connection?: string;
  loading?: boolean;
  query?: string;
  result?: string;
}

export class DBLoader extends React.PureComponent<ComposedProps, State> {
  state: State = {
    connection: 'mysql://rfamro@mysql-rfam-public.ebi.ac.uk:4497/Rfam',
    query: 'select * from family',
  };

  render() {
    const {connection, loading, query, result} = this.state;

    return (
      <FormLayout>
        <TextField
          helpText="drivers: mssql, mysql, postgres, sqlite3"
          label="Connection"
          onChange={this.setConnection}
          placeholder="driver://user:pass@hostname:port/database"
          value={connection}
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

  componentDidMount() {
    const {onMounted} = this.props;

    onMounted(this.dataLoader);
  }

  dataLoader: DataLoaderFunction = async () => {
    const {connection, query} = this.state;

    if (!connection || !query) {
      throw new Error('Invalid connection or query');
    }

    const values = await dataLoader(connection, query);

    return {
      values,
    };
  };

  previewResult = async () => {
    const {connection, query} = this.state;

    try {
      if (!connection || !query) {
        throw new Error('Invalid connection or query');
      }

      this.setState({loading: true});

      const result = await dataLoader(connection, query);

      this.setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      this.setResult(error.toString());
    }
  };

  setConnection = (connection: string) => {
    this.setState({connection});
  };

  setQuery = (query: string) => {
    this.setState({query});
  };

  setResult = (result: string) => {
    this.setState({result, loading: false});
  };
}

export async function isEnabled() {
  const result = await loader().load(`${dbProxy}/db`);

  return JSON.parse(result) as boolean;
}

export async function dataLoader(connection: string, query: string) {
  const result = await loader().load(`${dbProxy}/db`, {
    body: JSON.stringify({connection, query}),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'post',
  });

  return JSON.parse(result) as {}[];
}

export default DBLoader;
