declare module 'glslify';
// Modified from https://github.com/DavidWells/analytics/issues/99#issuecomment-736153120
declare module '@analytics/mixpanel' {
  type MixpanelOptions = {
    token?: string;
    enabled?: boolean;
  };

  type AnalyticsPlugin = {
    /** Name of plugin */
    name: string;

    /** exposed events of plugin */
    EVENTS?: any;

    /** Configuration of plugin */
    config?: any;

    /** Load analytics scripts method */
    initialize?: (...params: any[]) => any;

    /** Page visit tracking method */
    page?: (...params: any[]) => any;

    /** Custom event tracking method */
    track?: (...params: any[]) => any;

    /** User identify method */
    identify?: (...params: any[]) => any;

    /** Function to determine if analytics script loaded */
    loaded?: (...params: any[]) => any;

    /** Fire function when plugin ready */
    ready?: (...params: any[]) => any;
  };

  function MixpanelAnalytics(options: MixpanelOptions): AnalyticsPlugin;
  export default MixpanelAnalytics;
}

declare module 'use-analytics';

declare interface Window {
  ethereum: any;
}
