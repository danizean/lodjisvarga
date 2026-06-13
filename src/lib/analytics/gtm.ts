type DataLayerValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | Array<unknown>;

type DataLayerEvent = {
  event: string;
  [key: string]: DataLayerValue;
};

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function pushToDataLayer(payload: DataLayerEvent) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

export function trackEvent(
  event: string,
  parameters: Record<string, DataLayerValue> = {}
) {
  pushToDataLayer({
    event,
    ...parameters,
  });
}
