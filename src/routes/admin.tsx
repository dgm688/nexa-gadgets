import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ImagePlus, LogOut, Plus, Trash2, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/catalog";
import type { ProductRow } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";
import { EASE_OUT, springSoft } from "@/lib/motion";

export const Route = createFileRoute("/admin")({ component: Admin });

const field =
  "w-full rounded-xl border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[14px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]";

const label = "mb-2 block text-[12px] font-medium text-[var(--color-ink-dim)]";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--color-hairline)]">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex min-h-[44px] items-center" aria-label={SITE.name}>
            <img
              src="/brand/nexa-wordmark-dark.png"
              alt={SITE.name}
              width={1395}
              height={383}
              className="h-7 w-auto"
            />
          </Link>
          <span className="eyebrow">Admin</span>
        </div>
      </header>
      <div className="container-page py-12 md:py-16">{children}</div>
    </div>
  );
}

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <Shell>
        <p className="text-center text-[14px] text-[var(--color-ink-faint)]">Loading…</p>
      </Shell>
    );
  }

  return session ? <Dashboard /> : <SignIn />;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured. Add VITE_SUPABASE_URL and the publishable key.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  const google = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Supabase is not configured. Add VITE_SUPABASE_URL and the publishable key.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) toast.error(error.message);
  };

  return (
    <Shell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="mx-auto max-w-md rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-8"
      >
        <h1 className="text-2xl tracking-[-0.02em]">Staff sign in</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-dim)]">
          Only {SITE.name} staff accounts can manage the catalogue.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-email" className={label}>
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@nexagadgets.com"
              className={field}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className={label}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={field}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <motion.button
            type="submit"
            disabled={busy}
            whileHover={busy ? undefined : { scale: 1.01 }}
            whileTap={busy ? undefined : { scale: 0.99 }}
            transition={springSoft}
            className="w-full rounded-full bg-[var(--color-ink)] py-3.5 text-[14px] font-semibold text-[#08090a] transition-colors hover:bg-white disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>

        <button
          type="button"
          onClick={google}
          className="mt-3 w-full rounded-full border border-[var(--color-hairline-strong)] py-3.5 text-[14px] font-medium transition-colors hover:bg-white/[0.04]"
        >
          Continue with Google
        </button>
      </motion.div>
    </Shell>
  );
}

const emptyForm = {
  name: "",
  slug: "",
  category: CATEGORIES[0].slug as string,
  brand: "",
  price: 0,
  original_price: null as number | null,
  images: "",
  short_description: "",
  description: "",
};

function Dashboard() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async (): Promise<ProductRow[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductRow[];
    },
  });

  const currentImages = form.images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const createProduct = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("products").insert({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        category: form.category,
        brand: form.brand || null,
        price: form.price,
        original_price: form.original_price,
        images: currentImages,
        short_description: form.short_description || null,
        description: form.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product added");
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add product"),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product removed");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not remove product"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setForm((f) => {
        const existing = f.images.split(",").map((s) => s.trim()).filter(Boolean);
        return { ...f, images: [...existing, ...uploaded].join(", ") };
      });
      toast.success(uploaded.length > 1 ? `${uploaded.length} images uploaded` : "Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => {
      const existing = f.images.split(",").map((s) => s.trim()).filter(Boolean);
      return { ...f, images: existing.filter((img) => img !== url).join(", ") };
    });
  };

  return (
    <Shell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-[-0.03em]">Product catalogue</h1>
          <p className="mt-2 text-[14px] text-[var(--color-ink-dim)]">
            Add, photograph and remove the products shown on the storefront.
          </p>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline-strong)] px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-white/[0.04]"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createProduct.mutate();
          }}
          className="rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-7"
        >
          <h2 className="text-lg tracking-[-0.02em]">Add a product</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="p-name" className={label}>
                Product name
              </label>
              <input
                id="p-name"
                required
                placeholder="MacBook Air 13&quot; M3"
                className={field}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="p-slug" className={label}>
                Slug
              </label>
              <input
                id="p-slug"
                placeholder="Generated from the name"
                className={field}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="p-category" className={label}>
                Category
              </label>
              <select
                id="p-category"
                className={field}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-[var(--color-canvas)]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="p-brand" className={label}>
                Brand
              </label>
              <input
                id="p-brand"
                placeholder="Apple"
                className={field}
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="p-price" className={label}>
                  Price (USD)
                </label>
                <input
                  id="p-price"
                  type="number"
                  min={0}
                  required
                  className={`${field} tabular`}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label htmlFor="p-was" className={label}>
                  Was
                </label>
                <input
                  id="p-was"
                  type="number"
                  min={0}
                  placeholder="Optional"
                  className={`${field} tabular`}
                  value={form.original_price ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      original_price: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className={label}>Product images</span>
              <label
                htmlFor="product-image-upload"
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-canvas)] px-4 py-8 text-center text-[13px] text-[var(--color-ink-dim)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-ink)] ${
                  uploadingImages ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <ImagePlus className="size-5" />
                {uploadingImages ? "Uploading…" : "Click to upload image(s)"}
                <span className="text-[11px] text-[var(--color-ink-faint)]">
                  PNG or JPG, multiple allowed
                </span>
              </label>
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingImages}
                onChange={handleImageUpload}
                className="hidden"
              />

              <AnimatePresence mode="popLayout">
                {currentImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex flex-wrap gap-3"
                  >
                    {currentImages.map((url) => (
                      <motion.div
                        key={url}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={springSoft}
                        className="relative"
                      >
                        <img
                          src={url}
                          alt=""
                          className="size-20 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-tile)] object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          aria-label="Remove image"
                          className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-[var(--color-sale)] text-[#08090a] transition-transform hover:scale-110"
                        >
                          <X className="size-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="p-short" className={label}>
                Short description
              </label>
              <input
                id="p-short"
                placeholder="One line shown on the product card"
                className={field}
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="p-desc" className={label}>
                Full description
              </label>
              <textarea
                id="p-desc"
                rows={4}
                placeholder="Shown on the product page"
                className={field}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={createProduct.isPending || uploadingImages}
            whileHover={createProduct.isPending ? undefined : { scale: 1.01 }}
            whileTap={createProduct.isPending ? undefined : { scale: 0.99 }}
            transition={springSoft}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3.5 text-[14px] font-semibold text-[#08090a] transition-colors hover:bg-white disabled:opacity-50"
          >
            <Plus className="size-4" />
            {createProduct.isPending ? "Saving…" : "Add product"}
          </motion.button>
        </form>

        <div className="rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-7 lg:sticky lg:top-8">
          <h2 className="text-lg tracking-[-0.02em]">
            Products{" "}
            {products.length > 0 && (
              <span className="tabular text-[var(--color-ink-faint)]">({products.length})</span>
            )}
          </h2>

          {isLoading ? (
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-[var(--color-surface-2)]"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="mt-6 text-[13px] leading-relaxed text-[var(--color-ink-faint)]">
              No products in the database yet — the storefront is showing the seed catalogue.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-[var(--color-hairline)]">
              <AnimatePresence initial={false}>
                {products.map((p) => (
                  <motion.li
                    key={p.id}
                    layout
                    exit={{ opacity: 0, x: -12 }}
                    transition={springSoft}
                    className="flex items-center gap-4 py-3"
                  >
                    <img
                      src={p.images?.[0] ?? "/brand/nexa-logo.png"}
                      alt=""
                      className="size-11 shrink-0 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-tile)] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{p.name}</p>
                      <p className="tabular mt-0.5 text-[12px] text-[var(--color-ink-faint)]">
                        {p.brand} · {formatPrice(p.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteProduct.mutate(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-sale)]/12 hover:text-[var(--color-sale)]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </Shell>
  );
}
