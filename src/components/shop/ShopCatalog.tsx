"use client";

import { useMemo, useState } from "react";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { filterProducts } from "@/data/products";
import { SHOP_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/cn";

const FILTERS = ["TODOS", ...SHOP_CATEGORIES] as const;

export function ShopCatalog() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("TODOS");
  const list = useMemo(() => filterProducts(filter), [filter]);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 border px-4 py-2 text-micro transition-colors",
              filter === f
                ? "border-lc-lilac text-lc-lilac"
                : "border-lc-offwhite/15 text-lc-gray hover:text-lc-offwhite",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <ShopProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
