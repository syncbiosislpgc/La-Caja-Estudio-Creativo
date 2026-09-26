"use client";

import { useMemo, useState } from "react";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { CTA } from "@/components/ui/CTA";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/cn";

const MODELS = [
  { id: "tee", name: "Camiseta", base: 32 },
  { id: "hoodie", name: "Sudadera", base: 58 },
  { id: "tote", name: "Tote", base: 22 },
] as const;

const COLORS = [
  { id: "black", name: "Negro", hex: "#0B0B0B" },
  { id: "off", name: "Blanco roto", hex: "#F4F2EE" },
  { id: "lilac", name: "Lila", hex: "#C3A6D9" },
] as const;

const SIZES = ["S", "M", "L", "XL"] as const;
const FONTS = ["Inter", "Impacto", "Mono"] as const;

export default function PersonalizaPage() {
  const [model, setModel] = useState<(typeof MODELS)[number]["id"]>("tee");
  const [color, setColor] = useState<(typeof COLORS)[number]["id"]>("black");
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [face, setFace] = useState<"front" | "back">("front");
  const [text, setText] = useState("TODO CABE");
  const [font, setFont] = useState<(typeof FONTS)[number]>("Inter");
  const [ink, setInk] = useState("#C3A6D9");
  const [qty, setQty] = useState(1);
  const [facesPrinted, setFacesPrinted] = useState(1);
  const [saved, setSaved] = useState<string | null>(null);

  const base = MODELS.find((m) => m.id === model)?.base ?? 32;
  const colorHex = COLORS.find((c) => c.id === color)?.hex ?? "#0B0B0B";
  const textColor = color === "off" ? "#0B0B0B" : ink;

  const price = useMemo(() => {
    const faceCost = facesPrinted > 1 ? 8 : 0;
    const qtyDiscount = qty >= 10 ? 0.9 : qty >= 5 ? 0.95 : 1;
    return Math.round((base + faceCost) * qty * qtyDiscount);
  }, [base, facesPrinted, qty]);

  const designJson = {
    productId: model,
    variant: { size, color },
    faces: {
      front: {
        layers: face === "front" || facesPrinted > 1
          ? [{ type: "text", text, fontFamily: font, fill: ink }]
          : [],
      },
      back:
        facesPrinted > 1
          ? { layers: [{ type: "text", text, fontFamily: font, fill: ink }] }
          : { layers: [] },
    },
    pricing: {
      faces: facesPrinted,
      printSize: "A4",
      finish: "standard",
      quantity: qty,
      total: price,
    },
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
      <p className="text-micro text-lc-lilac">MÉTELO EN LA CAJA</p>
      <h1 className="display-lg mt-4 max-w-3xl text-lc-offwhite">
        PERSONALIZA.
        <br />
        METE TU IDEA
        <br />
        DENTRO.
      </h1>
      <BrushStroke variant="underline" className="mt-2 h-6 w-40" />
      <p className="mt-6 max-w-2xl text-lg text-lc-gray">
        MVP del personalizador: modelo, color, talla, texto, tipografía y
        mockup en tiempo real. Subida de archivos y Konva completo llegan
        después — esto ya calcula precio y guarda JSON.
      </p>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        {/* Mockup */}
        <div className="lg:col-span-6">
          <div className="relative mx-auto flex aspect-[4/5] max-w-md items-center justify-center border border-lc-offwhite/10 bg-lc-dark">
            <div
              className="relative flex h-[70%] w-[55%] items-center justify-center shadow-2xl"
              style={{ background: colorHex }}
            >
              {/* printable area */}
              <div className="flex h-[45%] w-[70%] items-center justify-center border border-dashed border-lc-lilac/40 p-3">
                <p
                  className="text-center text-lg font-bold uppercase leading-tight md:text-2xl"
                  style={{
                    color: textColor,
                    fontFamily:
                      font === "Mono"
                        ? "ui-monospace, monospace"
                        : font === "Impacto"
                          ? "Impact, Haettenschweiler, sans-serif"
                          : "var(--font-inter), sans-serif",
                  }}
                >
                  {text || " "}
                </p>
              </div>
              <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-widest text-lc-gray">
                {face === "front" ? "Frontal" : "Trasera"} · área imprimible
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {(["front", "back"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFace(f)}
                className={cn(
                  "border px-4 py-2 text-micro",
                  face === f
                    ? "border-lc-lilac text-lc-lilac"
                    : "border-lc-offwhite/20 text-lc-gray",
                )}
              >
                {f === "front" ? "FRONTAL" : "TRASERA"}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-8 lg:col-span-6">
          <Fieldset label="Modelo">
            <div className="flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <Chip
                  key={m.id}
                  active={model === m.id}
                  onClick={() => setModel(m.id)}
                >
                  {m.name} · {formatPrice(m.base)}
                </Chip>
              ))}
            </div>
          </Fieldset>

          <Fieldset label="Color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <Chip
                  key={c.id}
                  active={color === c.id}
                  onClick={() => setColor(c.id)}
                >
                  <span
                    className="mr-2 inline-block h-3 w-3 border border-lc-offwhite/30"
                    style={{ background: c.hex }}
                  />
                  {c.name}
                </Chip>
              ))}
            </div>
          </Fieldset>

          <Fieldset label="Talla">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <Chip key={s} active={size === s} onClick={() => setSize(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </Fieldset>

          <Fieldset label="Texto">
            <input
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 40))}
              className="w-full border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite focus:border-lc-lilac focus:outline-none"
            />
          </Fieldset>

          <Fieldset label="Tipografía">
            <div className="flex flex-wrap gap-2">
              {FONTS.map((f) => (
                <Chip key={f} active={font === f} onClick={() => setFont(f)}>
                  {f}
                </Chip>
              ))}
            </div>
          </Fieldset>

          <Fieldset label="Color de impresión">
            <input
              type="color"
              value={ink}
              onChange={(e) => setInk(e.target.value)}
              className="h-12 w-20 cursor-pointer border border-lc-offwhite/20 bg-transparent"
            />
          </Fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <Fieldset label="Caras impresas">
              <div className="flex gap-2">
                {[1, 2].map((n) => (
                  <Chip
                    key={n}
                    active={facesPrinted === n}
                    onClick={() => setFacesPrinted(n)}
                  >
                    {n}
                  </Chip>
                ))}
              </div>
            </Fieldset>
            <Fieldset label="Cantidad">
              <input
                type="number"
                min={1}
                max={100}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 border border-lc-offwhite/20 bg-transparent px-3 py-2 text-sm text-lc-offwhite"
              />
            </Fieldset>
          </div>

          <div className="border-t border-lc-offwhite/10 pt-6">
            <p className="text-micro text-lc-gray">PRECIO ESTIMADO</p>
            <p className="display-md mt-2 text-lc-lilac">{formatPrice(price)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <CTA
                type="button"
                variant="lilac"
                size="lg"
                onClick={() => {
                  const json = JSON.stringify(designJson, null, 2);
                  setSaved(json);
                  void navigator.clipboard?.writeText(json);
                }}
              >
                GUARDAR DISEÑO JSON
              </CTA>
              <CTA href="/contacto" variant="secondary" size="lg">
                PEDIR PRODUCCIÓN
              </CTA>
            </div>
            {saved ? (
              <pre className="mt-6 max-h-48 overflow-auto border border-lc-offwhite/10 bg-lc-black p-4 text-xs text-lc-gray">
                {saved}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Fieldset({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-micro text-lc-gray">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center border px-3 py-2 text-micro transition-colors",
        active
          ? "border-lc-lilac text-lc-lilac"
          : "border-lc-offwhite/20 text-lc-offwhite hover:border-lc-lilac",
      )}
    >
      {children}
    </button>
  );
}
