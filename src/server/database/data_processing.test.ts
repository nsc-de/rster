import { DataProcessingLayer } from "./data_processing";
const layer0 = new DataProcessingLayer(undefined, {
  test: {
    test2(number: number) {
      return 1 + number;
    },
  },
});

const layer1 = new DataProcessingLayer(layer0.functions, {
  test: {
    test2() {
      this.nextLayer.test.test2;
    },
  },
});
