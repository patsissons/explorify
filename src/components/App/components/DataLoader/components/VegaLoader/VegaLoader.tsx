import * as React from 'react';

import * as vega from 'vega';

import {FormLayout, Select, TextField} from '@shopify/polaris';
import {DataLoaderFunction, DataLoaderMountedProps} from '../shared';

export interface Props extends DataLoaderMountedProps {}

type ComposedProps = Props;

interface State {
  uri?: string;
  sourceName?: string;
  type?: string;
}

export class VegaLoader extends React.PureComponent<ComposedProps, State> {
  state: State = {};

  private readonly dataSourceMap = dataSourceMap();
  private readonly options = Array.from(this.dataSourceMap.keys()).map(
    (value) => ({label: value, value}),
  );

  componentDidMount() {
    const {onMounted} = this.props;

    onMounted(this.dataLoader);
  }

  render() {
    const {uri, sourceName, type} = this.state;
    return (
      <FormLayout>
        <Select
          label="Data Source"
          options={this.options}
          onChange={this.setSource}
          value={sourceName}
        />
        <TextField label="URI" value={uri} onChange={this.setUri} />
        <TextField
          label="type"
          value={type}
          onChange={this.setType}
          placeholder="json, csv, or tsv"
          helpText="leave blank to auto-detect based on URI"
        />
      </FormLayout>
    );
  }

  dataLoader: DataLoaderFunction = async () => {
    const {type, uri} = this.state;

    if (!uri) {
      throw new Error('Invalid data source selected');
    }

    const [sourceName = undefined, source = undefined] =
      Array.from(this.dataSourceMap.entries())
        .filter(([sourceName, source]) => source.uri === uri)
        .shift() || [];

    const values = await dataLoader(
      source || ({uri, format: {type}} as DataSource),
    );

    return {
      name: sourceName,
      values,
    };
  };

  setSource = (sourceName: string) => {
    const {uri = undefined} = this.dataSourceMap.get(sourceName) || {};

    if (uri) {
      this.setState({sourceName, uri});
    } else {
      this.setState({sourceName});
    }
  };

  setType = (type: string) => {
    this.setState({type});
  };

  setUri = (uri: string) => {
    this.setState({uri});
  };
}

export interface DataSource {
  uri: string;
  format?: vega.Format;
}

export interface Dataset {
  baseUri: string;
  datasetName: string;
  sources: {[key: string]: string | DataSource};
}

function dataSourceMap() {
  return allDataSources().reduce((map, dataSource) => {
    return map.set(dataSource.sourceName, {
      format: dataSource.format,
      uri: dataSource.uri,
    });
  }, new Map<string, DataSource>([['Custom', {uri: ''}]]));
}

function allDataSources() {
  return allDatasets().flatMap(({datasetName, dataset}) =>
    dataSourcesForDataset(datasetName, dataset),
  );
}

function allDatasets() {
  return Object.keys(datasets).map((datasetName) => ({
    datasetName,
    dataset: datasets[datasetName],
  }));
}

function dataSourcesForDataset(datasetName: string, dataset: Dataset) {
  return Object.keys(dataset.sources).map((dataSourceName) => {
    const source = dataset.sources[dataSourceName];

    const {format, uri} = getUriAndFormat(source);

    return {
      format,
      sourceName: `${dataSourceName} (${datasetName})`,
      uri: `${dataset.baseUri}/${uri}`,
    };
  });
}

export const datasets: {[key: string]: Dataset} = {
  vega: {
    baseUri:
      'https://raw.githubusercontent.com/vega/vega-datasets/gh-pages/data',
    datasetName: 'Vega Datasets',
    sources: {
      airports: 'airports.csv',
      anscombe: 'anscombe.json',
      barley: 'barley.json',
      'bird strikes': 'birdstrikes.json',
      budget: 'budget.json',
      budgets: 'budgets.json',
      burtin: 'burtin.json',
      cars: 'cars.json',
      climate: 'climate.json',
      'CO2 concentration': 'co2-concentration.csv',
      countries: 'countries.json',
      crimea: 'crimea.json',
      disasters: 'disasters.csv',
      driving: 'driving.json',
      earthquakes: 'earthquakes.json',
      'flare dependencies': 'flare-dependencies.json',
      flare: 'flare.json',
      'flights (10k)': 'flights-10k.json',
      'flights (200k)': 'flights-200k.json',
      'flights (20k)': 'flights-20k.json',
      'flights (2k)': 'flights-2k.json',
      'flights (3m)': 'flights-3m.json',
      'flights (5m)': 'flights-5m.json',
      'flights airport': 'flights-airport.csv',
      'gapminder-health-income.csv': '',
      gapminder: 'gapminder.json',
      github: 'github.csv',
      graticule: 'graticule.json',
      income: 'income.json',
      'iowa electricity': 'iowa-electricity.csv',
      iris: 'iris.json',
      jobs: 'jobs.json',
      'LA riots': 'la-riots.csv',
      'london boroughs': 'londonBoroughs.json',
      'london centroids': 'londonCentroids.json',
      'london tube lines': 'londonTubeLines.json',
      'lookup groups': 'lookup_groups.csv',
      'lookup people': 'lookup_people.csv',
      miserables: 'miserables.json',
      monarchs: 'monarchs.json',
      movies: 'movies.json',
      'normal 2D': 'normal-2d.json',
      obesity: 'obesity.json',
      points: 'points.json',
      population: 'population.json',
      'population engineers hurricanes': 'population_engineers_hurricanes.csv',
      'seattle temps': 'seattle-temps.csv',
      'seattle weather': 'seattle-weather.csv',
      'sf temps': 'sf-temps.csv',
      'S&P 500': 'sp500.csv',
      stocks: 'stocks.csv',
      'u district': 'udistrict.json',
      'unemployment across industries': 'unemployment-across-industries.json',
      unemployment: 'unemployment.tsv',
      'US 10m': 'us-10m.json',
      'US unemployment': 'us-unemployment.csv',
      'US state capitals': 'us-state-capitals.json',
      'weather (CSV)': 'weather.csv',
      weather: 'weather.json',
      weball26: 'weball26.json',
      wheat: 'wheat.json',
      'world 110m': 'world-110m.json',
      zipcodes: 'zipcodes.csv',
    },
  },
};

export function getUriAndFormat(source: DataSource | string) {
  if (typeof source === 'object') {
    if (source.format) {
      return source;
    }

    return {
      uri: source.uri,
      format: formatForUri(source.uri),
    };
  }

  return {
    uri: source,
    format: formatForUri(source),
  };
}

export function formatForUri(uri: string): vega.Format | undefined {
  if (uri.endsWith('.json')) {
    return {type: 'json'};
  }

  if (uri.endsWith('.csv')) {
    return {type: 'csv'};
  }

  if (uri.endsWith('.tsv')) {
    return {type: 'tsv'};
  }

  return undefined;
}

export async function dataLoader(source: DataSource | string) {
  const {format, uri} = getUriAndFormat(source);

  if (!format) {
    throw new Error('Invalid data source format');
  }

  const content = await vega.loader().load(uri);

  return vega.read(content, format);
}

export default VegaLoader;
