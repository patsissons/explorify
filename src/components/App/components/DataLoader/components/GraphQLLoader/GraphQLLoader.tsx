import * as React from "react";

import { FormLayout, Select, TextField } from "@shopify/polaris";
import { request } from "graphql-request";

import { DataLoaderFunction, DataLoaderMountedProps } from "../shared";
import apis from "./apis.json";
import { GraphQLApi } from "apis.json";

export interface Props extends DataLoaderMountedProps {}

type ComposedProps = Props;

interface State {
  query: string;
  source: string;
}

export class GraphQLLoader extends React.PureComponent<ComposedProps, State> {
  private readonly options = apis.map(
    ({ info: { title: label }, url: value }) => ({ label, value })
  );

  state: State = {
    query: "",
    source: ""
  };

  componentDidMount() {
    const { onMounted } = this.props;

    onMounted(this.dataLoader);
  }

  render() {
    const { query, source } = this.state;

    return (
      <FormLayout>
        <Select
          label="Data Source"
          options={this.options}
          onChange={this.setSource}
          value={source}
        />
        <TextField
          label="Query"
          multiline={5}
          onChange={this.setQuery}
          value={query}
        />
      </FormLayout>
    );
  }

  dataLoader: DataLoaderFunction = async () => {
    const { query, source } = this.state;
    const values = await dataLoader(query, apis
      .filter(({ url }) => url === source)
      .shift() as any);

    return {
      name: source,
      values
    };
  };

  setQuery = (query: string) => {
    this.setState({ query });
  };

  setSource = (source: string) => {
    this.setState({ source });
  };
}

function findDataset(response: {} | undefined): {}[] | undefined {
  if (!response) {
    return undefined;
  }

  for (const item in response) {
    if (Array.isArray(response[item])) {
      return response[item];
    }
  }
  for (const item in response) {
    if (typeof response[item] === "object") {
      const dataSet = findDataset(response[item]);

      if (dataSet) {
        return dataSet;
      }
    }
  }

  return undefined;
}

export async function dataLoader(
  query: string,
  source: GraphQLApi | undefined
) {
  if (!source) {
    throw new Error("Invalid data source");
  }

  const response = await request(source.url, query);

  const data = findDataset(response);

  if (!data) {
    throw new Error("Invalid data response");
  }

  return data;
}

// https://github.com/APIs-guru/graphql-apis

export default GraphQLLoader;
