export type Overlay = {
  id: string;
  streamingUrl: string;

};


export type GetOverlayByIdInput = {
  id: string;
};

export type GetOverlayByIdOutput = Overlay;

export type GetOverlaysOutput = Overlay