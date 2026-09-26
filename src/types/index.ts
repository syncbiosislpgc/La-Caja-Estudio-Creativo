export type ProjectCategory =
  | "branding"
  | "contenido"
  | "produccion"
  | "espacios"
  | "social"
  | "otros";

export type ShopCategory =
  | "la-caja"
  | "limited"
  | "collabs"
  | "prints"
  | "wear"
  | "objects";

export type ConfiguratorLayer =
  | {
      id: string;
      type: "image";
      src: string;
      transform: { x: number; y: number; scale: number; rotation: number };
    }
  | {
      id: string;
      type: "text";
      text: string;
      fontFamily: string;
      fill: string;
      transform: { x: number; y: number; scale: number; rotation: number };
    };

export type ConfiguratorDesign = {
  productId: string;
  variant: { size: string; color: string };
  faces: {
    front: { layers: ConfiguratorLayer[] };
    back: { layers: ConfiguratorLayer[] };
  };
  pricing: {
    faces: number;
    printSize: string;
    finish: string;
    quantity: number;
  };
};
