import {VoyagerConfig} from 'datavoyager/build/models/config';
import {Data} from 'vega-lite';

export {VoyagerConfig};

export declare type Container = string | HTMLElement;

/**
 * The Voyager class encapsulates the voyager application and allows for easy
 * instantiation and interaction from non-react projects.
 */
export declare class Voyager {
  constructor(container: Container, config: VoyagerConfig, data: Data);
  /**
   * Update the dataset currently loaded into voyager
   *
   * @param {VoyagerData} data
   *
   * @memberof Voyager
   */
  updateData(data: Data): void;
  /**
   * Update state to reflect the previous state
   *
   * @memberof Voyager
   */
  undo(): void;
  /**
   * Update state to reflect the future state
   *
   * @memberof Voyager
   */
  redo(): void;
  /**
   * Update the configuration of the voyager application.
   *
   * @param {VoyagerConfig} config
   *
   * @memberof Voyager
   */
  updateConfig(config: VoyagerConfig): void;
  setFilename(filename: string): void;
  /**
   * Apply a vega-lite spec to voyager.
   *
   * @param {VoyagerConfig} config
   *
   * @memberof Voyager
   */
  setSpec(spec: Object): void;
  /**
   *
   * Gets Vega-Lite spec of current specified view
   *
   * @returns {Readonly<Spec>}
   *
   * @memberof Voyager
   */
  getSpec(includeData: boolean): Object;
  /**
   *
   * Gets the current bookmarked vega-lite specs.
   *
   * @returns {string[]}
   *
   * @memberof Voyager
   */
  getBookmarkedSpecs(): string[];
}

/**
 * Create an instance of the voyager application.
 *
 * @param {Container} container css selector or HTMLElement that will be the parent
 *                              element of the application
 * @param {Object}    config    configuration options
 * @param {Array}     data      data object. Can be a string or an array of objects.
 */
export declare function CreateVoyager(
  container: Container,
  config?: VoyagerConfig | null,
  data?: Data | null,
): Voyager;
