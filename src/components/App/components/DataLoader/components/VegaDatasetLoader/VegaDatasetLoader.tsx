import * as React from "react";

import * as vega from "vega";

import { DataLoaderFunction, DataLoaderMountedProps } from "../shared";
import { FormLayout, Select } from "@shopify/polaris";

export interface Props extends DataLoaderMountedProps {}

type ComposedProps = Props;

interface State {
  source?: string;
}

export class VegaDatasetLoader extends React.PureComponent<
  ComposedProps,
  State
> {
  private readonly options = Object.keys(dataSources).map(value => ({
    label: value,
    value
  }));

  state: State = { source: this.options[0].value };

  render() {
    const { source } = this.state;

    return (
      <FormLayout>
        <Select
          label="Data Source"
          options={this.options}
          onChange={this.setSource}
          value={source}
        />
      </FormLayout>
    );
  }

  componentDidMount() {
    const { onMounted } = this.props;

    onMounted(this.dataLoader);
  }

  dataLoader: DataLoaderFunction = async () => {
    const { source } = this.state;

    if (!source) {
      throw new Error("No data source selected");
    }

    const uri = dataSources[source];

    if (!uri) {
      throw new Error("Invalid data source selected");
    }

    const values = await dataLoader(`${baseUri}/${uri}`);

    return {
      name: source,
      values
    };
  };

  setSource = (source: string) => {
    this.setState({ source });
  };
}

export const baseUri =
  "https://raw.githubusercontent.com/vega/vega-datasets/gh-pages/data";

export const dataSources = {
  airports: "airports.csv",
  anscombe: "anscombe.json",
  barley: "barley.json",
  "bird strikes": "birdstrikes.json",
  budget: "budget.json",
  budgets: "budgets.json",
  burtin: "burtin.json",
  cars: "cars.json",
  climate: "climate.json",
  "CO2 concentration": "co2-concentration.csv",
  countries: "countries.json",
  crimea: "crimea.json",
  disasters: "disasters.csv",
  driving: "driving.json",
  earthquakes: "earthquakes.json",
  "flare dependencies": "flare-dependencies.json",
  flare: "flare.json",
  "flights (10k)": "flights-10k.json",
  "flights (200k)": "flights-200k.json",
  "flights (20k)": "flights-20k.json",
  "flights (2k)": "flights-2k.json",
  "flights (3m)": "flights-3m.json",
  "flights (5m)": "flights-5m.json",
  "flights airport": "flights-airport.csv",
  "gapminder-health-income.csv": "",
  gapminder: "gapminder.json",
  github: "github.csv",
  graticule: "graticule.json",
  income: "income.json",
  "iowa electricity": "iowa-electricity.csv",
  iris: "iris.json",
  jobs: "jobs.json",
  "LA riots": "la-riots.csv",
  "london boroughs": "londonBoroughs.json",
  "london centroids": "londonCentroids.json",
  "london tube lines": "londonTubeLines.json",
  "lookup groups": "lookup_groups.csv",
  "lookup people": "lookup_people.csv",
  miserables: "miserables.json",
  monarchs: "monarchs.json",
  movies: "movies.json",
  "normal 2D": "normal-2d.json",
  obesity: "obesity.json",
  points: "points.json",
  population: "population.json",
  "population engineers hurricanes": "population_engineers_hurricanes.csv",
  "seattle temps": "seattle-temps.csv",
  "seattle weather": "seattle-weather.csv",
  "sf temps": "sf-temps.csv",
  "S&P 500": "sp500.csv",
  stocks: "stocks.csv",
  "u district": "udistrict.json",
  "unemployment across industries": "unemployment-across-industries.json",
  unemployment: "unemployment.tsv",
  "US 10m": "us-10m.json",
  "US unemployment": "us-unemployment.csv",
  "US state capitals": "us-state-capitals.json",
  "weather (CSV)": "weather.csv",
  weather: "weather.json",
  weball26: "weball26.json",
  wheat: "wheat.json",
  "world 110m": "world-110m.json",
  zipcodes: "zipcodes.csv"
};

export function schemaForUri(uri: string): vega.Format {
  if (uri.endsWith(".json")) {
    return { type: "json" };
  }

  if (uri.endsWith(".csv")) {
    return { type: "csv" };
  }

  if (uri.endsWith(".tsv")) {
    return { type: "tsv" };
  }

  throw new Error("Invalid data format");
}

export async function dataLoader(uri: string) {
  const schema = schemaForUri(uri);
  const content = await vega.loader().load(uri);

  return vega.read(content, schema);
}

export default VegaDatasetLoader;
