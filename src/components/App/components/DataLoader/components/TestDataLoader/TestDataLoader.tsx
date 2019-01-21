import * as React from 'react';

import env from '@app/env';
import {DataLoaderFunction, DataLoaderMountedProps} from '../shared';

export interface Props extends DataLoaderMountedProps {}

type ComposedProps = Props;

export class TestDataLoader extends React.PureComponent<ComposedProps> {
  render() {
    return (
      <div>
        <p>This loader loads simple testing data</p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  componentDidMount() {
    const {onMounted} = this.props;

    onMounted(this.dataLoader);
  }

  dataLoader: DataLoaderFunction = async () => {
    const values = await dataLoader();

    return {
      values,
    };
  };
}

export function isEnabled() {
  return Boolean(env.SHOW_TEST_LOADER);
}

export const data = [{id: 1, title: 'a'}, {id: 2, title: 'b'}];

export async function dataLoader() {
  const values = await Promise.resolve(data);

  return values;
}

export default TestDataLoader;
