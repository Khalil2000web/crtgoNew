import Link from "next/link";

export default function CommercePage() {
  const features = [
    "Custom Next.js storefront",
    "Shopify products, orders, and checkout",
    "Fast mobile shopping experience",
    "Product pages and collections",
    "Cart and checkout flow",
    "SEO and deployment setup",
  ];

  const steps = [
    "You contact us",
    "We design the store",
    "We connect Shopify",
    "You manage products from Shopify",
  ];

  const packages = [
    {
      name: "Starter Store",
      price: "From ₪2,000",
      text: "A clean custom storefront for small brands starting online.",
    },
    {
      name: "Premium Store",
      price: "From ₪4,500",
      text: "A more advanced store with stronger design and better sections.",
    },
    {
      name: "Custom Store",
      price: "Custom quote",
      text: "For brands that need a unique shopping experience.",
    },
  ];

  return (
    <main>
      <section className="mx-auto grid min-h-[80vh] max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-bold uppercase text-black/50">
            CRTGO Commerce
          </p>

          <h1 className="mt-4 max-w-4xl text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
            Custom Shopify stores, built faster.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-black/60">
            We build custom Next.js storefronts powered by Shopify, so your
            store gets Shopify’s backend with a unique, fast, custom design.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#contact"
              className="rounded-full bg-black px-7 py-4 font-bold text-white"
            >
              Request a store
            </Link>

            <Link
              href="#how"
              className="rounded-full border border-black/20 px-7 py-4 font-bold"
            >
              How it works
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl">
          <div className="rounded-[1.5rem] bg-black p-5 text-white">
            <p className="text-sm text-white/50">Example Store</p>
            <h2 className="mt-2 text-4xl font-black">Luxury Jewelry</h2>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="h-40 rounded-3xl bg-white/15" />
              <div className="h-40 rounded-3xl bg-white/10" />
              <div className="h-40 rounded-3xl bg-white/10" />
              <div className="h-40 rounded-3xl bg-white/15" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-4xl font-black">What you get</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-3xl bg-white p-6">
              <p className="text-2xl font-black">✓</p>
              <h3 className="mt-4 text-xl font-bold">{feature}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-4xl font-black">How it works</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-3xl border border-black/10 bg-white p-6">
              <p className="text-sm text-black/40">STEP {index + 1}</p>
              <h3 className="mt-4 text-2xl font-black">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="text-4xl font-black">Packages</h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {packages.map((pack) => (
            <div key={pack.name} className="rounded-[2rem] bg-white p-6">
              <h3 className="text-3xl font-black">{pack.name}</h3>
              <p className="mt-4 text-2xl font-black">{pack.price}</p>
              <p className="mt-4 text-black/60">{pack.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="px-5 py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-black p-8 text-center text-white md:p-14">
          <h2 className="text-5xl font-black">Ready to build your store?</h2>

          <p className="mx-auto mt-5 max-w-xl text-white/60">
            Tell us about your brand, products, and style. We’ll help you build
            a custom Shopify-powered storefront.
          </p>

          <a
            href="mailto:hello@crtgo.com"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-bold text-black"
          >
            Contact CRTGO
          </a>
        </div>
      </section>
    </main>
  );
}