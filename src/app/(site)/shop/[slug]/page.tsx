import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/shop/ShopProductCard";
import { getProduct, products } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Producto" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-14 md:grid-cols-2 md:gap-14 md:px-8 md:py-20 lg:px-12">
      <div className="space-y-4">
        {product.images.map((src, i) => (
          <div key={src} className="relative aspect-[4/5] overflow-hidden bg-lc-dark">
            <Image
              src={src}
              alt={`${product.name} ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>
      <div className="md:sticky md:top-28 md:self-start">
        <p className="text-micro text-lc-lilac">
          {product.category.toUpperCase()}
          {product.collection ? ` · ${product.collection}` : ""}
        </p>
        <h1 className="display-md mt-3 text-lc-offwhite">{product.name}</h1>
        <p className="mt-6 text-base leading-relaxed text-lc-gray">
          {product.description}
        </p>
        <div className="mt-10">
          <ProductPurchase product={product} />
        </div>
      </div>
    </div>
  );
}
