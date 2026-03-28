import { beforeEach, describe, expect, it } from "vitest";

import { useWaterAlertStore } from "./water-alert-store";

describe("useWaterAlertStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useWaterAlertStore.setState({
      alertThreshold: 10,
      dismissed: false,
    });
  });

  it("clears dismissal when the threshold changes", () => {
    useWaterAlertStore.getState().dismiss();

    useWaterAlertStore.getState().setAlertThreshold(0);

    expect(useWaterAlertStore.getState()).toMatchObject({
      alertThreshold: 0,
      dismissed: false,
    });
  });

  it("preserves dismissal when the threshold stays the same", () => {
    useWaterAlertStore.getState().dismiss();

    useWaterAlertStore.getState().setAlertThreshold(10);

    expect(useWaterAlertStore.getState()).toMatchObject({
      alertThreshold: 10,
      dismissed: true,
    });
  });
});
