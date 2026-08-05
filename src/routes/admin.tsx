import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Check, ImagePlus, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/catalog";
import type { ProductRow } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { compressImage, formatBytes } from "@/lib/image";
import { removeStorageObjects } from "@/lib/storage";
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

type SpecRow = { label: string; value: string };

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
  is_new: false,
  featured: false,
  in_stock: true,
  condition: "new" as "new" | "certified-pre-owned",
  specs: [] as SpecRow[],
};

type FormState = typeof emptyForm;

/** Turns a stored row back into form state for editing. */
const formFromRow = (p: ProductRow): FormState => ({
  name: p.name,
  slug: p.slug,
  category: p.category,
  brand: p.brand ?? "",
  price: Number(p.price),
  original_price: p.original_price === null ? null : Number(p.original_price),
  images: (p.images ?? []).join(", "),
  short_description: p.short_description ?? "",
  description: p.description ?? "",
  is_new: p.is_new ?? false,
  featured: p.featured ?? false,
  in_stock: p.in_stock ?? true,
  condition: p.condition === "certified-pre-owned" ? "certified-pre-owned" : "new",
  specs: Array.isArray(p.specs) ? p.specs : [],
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Dashboard() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploadingImages, setUploadingImages] = useState(false);

  /** Row being edited; null means the form creates a new product. */
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * Image bookkeeping, so a cancelled edit neither strands files nor destroys
   * ones the product still uses.
   *
   * sessionUploads — uploaded since the form was opened. Not yet referenced by
   * any saved row, so removing one can delete it immediately, and abandoning
   * the form should delete whatever is left.
   *
   * pendingDeletes — images already saved on the product that the user removed.
   * Deleting these on click would break the live product if the edit is then
   * cancelled, so they are held until the save succeeds.
   */
  const [sessionUploads, setSessionUploads] = useState<string[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

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

  /**
   * Returns the form to its empty state.
   *
   * keepUploads is set after a successful save: those files are now referenced
   * by a stored row. Everywhere else — cancelling, switching products — the
   * uploads were never persisted, so they are deleted rather than stranded.
   */
  const resetForm = ({ keepUploads = false } = {}) => {
    if (!keepUploads && sessionUploads.length) void removeStorageObjects(sessionUploads);
    setForm(emptyForm);
    setEditingId(null);
    setSessionUploads([]);
    setPendingDeletes([]);
  };

  const startEdit = (p: ProductRow) => {
    // Anything uploaded into the form so far belongs to the abandoned draft.
    if (sessionUploads.length) void removeStorageObjects(sessionUploads);
    setForm(formFromRow(p));
    setEditingId(p.id);
    setSessionUploads([]);
    setPendingDeletes([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveProduct = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        category: form.category,
        brand: form.brand || null,
        price: form.price,
        original_price: form.original_price,
        images: currentImages,
        short_description: form.short_description || null,
        description: form.description || null,
        is_new: form.is_new,
        featured: form.featured,
        in_stock: form.in_stock,
        condition: form.condition,
        // Drop half-filled rows rather than storing blanks the product page
        // would render as empty table cells.
        specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
      };

      const { error } = editingId
        ? await supabase.from("products").update(payload).eq("id", editingId)
        : await supabase.from("products").insert(payload);
      if (error) throw error;

      // Only once the row is safely written — until then the product still
      // references these files.
      if (pendingDeletes.length) await removeStorageObjects(pendingDeletes);
    },
    onSuccess: () => {
      toast.success(editingId ? "Product updated" : "Product added");
      resetForm({ keepUploads: true });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["storefront-products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save product"),
  });

  const deleteProduct = useMutation({
    // Takes the whole row rather than an id so its images can be cleaned up.
    // Storage objects are not cascade-deleted with the row that referenced them.
    mutationFn: async (product: ProductRow) => {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      // Only after the row is gone — deleting files first would leave a live
      // product pointing at missing images if the row delete then failed.
      await removeStorageObjects(product.images ?? []);
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

    // Hoisted out of the try so the catch can reach anything already stored.
    // Uploads happen one at a time, but the URLs only reach form state after
    // the whole batch succeeds — so a failure on image three would otherwise
    // strand images one and two in the bucket with no reference to them.
    const uploaded: string[] = [];

    try {
      let savedBytes = 0;

      for (const file of Array.from(files)) {
        // Downscale before upload — a 2.4 MB phone photo becomes a few hundred
        // KB, and the original never crosses the network. Falls back to the
        // untouched file if compression is inapplicable or fails.
        const img = await compressImage(file);
        savedBytes += img.originalBytes - img.bytes;

        const path = `${crypto.randomUUID()}.${img.ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, img.blob, { contentType: img.contentType });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      setForm((f) => {
        const existing = f.images.split(",").map((s) => s.trim()).filter(Boolean);
        return { ...f, images: [...existing, ...uploaded].join(", ") };
      });
      setSessionUploads((prev) => [...prev, ...uploaded]);

      const noun = uploaded.length > 1 ? `${uploaded.length} images uploaded` : "Image uploaded";
      toast.success(noun, {
        description: savedBytes > 0 ? `Compressed, saving ${formatBytes(savedBytes)}` : undefined,
      });
    } catch (err) {
      void removeStorageObjects(uploaded);
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

    if (sessionUploads.includes(url)) {
      // Never saved anywhere, so nothing can reference it — delete now.
      // Not awaited: the thumbnail should vanish regardless of Storage.
      setSessionUploads((prev) => prev.filter((u) => u !== url));
      void removeStorageObjects([url]);
    } else {
      // Still referenced by the stored product. Deleting now would break the
      // live listing if the edit is cancelled, so hold it until save.
      setPendingDeletes((prev) => (prev.includes(url) ? prev : [...prev, url]));
    }
  };

  const setSpec = (i: number, patch: Partial<SpecRow>) =>
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, n) => (n === i ? { ...s, ...patch } : s)),
    }));

  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] }));

  const removeSpec = (i: number) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, n) => n !== i) }));

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
            saveProduct.mutate();
          }}
          className={`rounded-2xl border bg-[var(--color-surface)] p-7 transition-colors ${
            editingId ? "border-[var(--color-accent)]" : "border-[var(--color-hairline)]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg tracking-[-0.02em]">
              {editingId ? "Edit product" : "Add a product"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline-strong)] px-4 py-2 text-[12px] font-medium transition-colors hover:bg-white/[0.04]"
              >
                <X className="size-3.5" />
                Cancel edit
              </button>
            )}
          </div>
          {editingId && (
            <p className="mt-2 text-[12px] text-[var(--color-ink-faint)]">
              Editing <span className="text-[var(--color-ink-dim)]">{form.name || "product"}</span>.
              Removed images are kept until you save.
            </p>
          )}

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
                  Multiple allowed · resized and compressed automatically
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

            <div className="sm:col-span-2">
              <label htmlFor="p-condition" className={label}>
                Condition
              </label>
              <select
                id="p-condition"
                className={field}
                value={form.condition}
                onChange={(e) =>
                  setForm({
                    ...form,
                    condition: e.target.value as "new" | "certified-pre-owned",
                  })
                }
              >
                <option value="new" className="bg-[var(--color-canvas)]">
                  New
                </option>
                <option value="certified-pre-owned" className="bg-[var(--color-canvas)]">
                  Certified pre-owned
                </option>
              </select>
            </div>

            {/* Placement flags. These drive real storefront sections — without
                them an added product can never reach the hero or New arrivals. */}
            <fieldset className="sm:col-span-2">
              <legend className={label}>Placement</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["featured", "Featured", "Eligible for the homepage hero"],
                    ["is_new", "New arrival", "Shows in New arrivals"],
                    ["in_stock", "In stock", "Shows the in-stock badge"],
                  ] as const
                ).map(([key, title, hint]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                      form[key]
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/8"
                        : "border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                      className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
                    />
                    <span>
                      <span className="block text-[13px] font-medium">{title}</span>
                      <span className="mt-0.5 block text-[11px] text-[var(--color-ink-faint)]">
                        {hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className={label}>Specifications</span>
                <button
                  type="button"
                  onClick={addSpec}
                  className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline-strong)] px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/[0.04]"
                >
                  <Plus className="size-3.5" />
                  Add row
                </button>
              </div>

              {form.specs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--color-hairline)] px-4 py-5 text-center text-[12px] text-[var(--color-ink-faint)]">
                  No specifications. The product page hides the table when empty.
                </p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {form.specs.map((s, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={springSoft}
                        className="flex gap-2"
                      >
                        <input
                          aria-label={`Specification ${i + 1} label`}
                          placeholder="Storage"
                          className={`${field} flex-1`}
                          value={s.label}
                          onChange={(e) => setSpec(i, { label: e.target.value })}
                        />
                        <input
                          aria-label={`Specification ${i + 1} value`}
                          placeholder="512GB SSD"
                          className={`${field} flex-1`}
                          value={s.value}
                          onChange={(e) => setSpec(i, { value: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => removeSpec(i)}
                          aria-label={`Remove specification ${i + 1}`}
                          className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--color-hairline)] text-[var(--color-ink-faint)] transition-colors hover:border-[var(--color-sale)] hover:text-[var(--color-sale)]"
                        >
                          <X className="size-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={saveProduct.isPending || uploadingImages}
            whileHover={saveProduct.isPending ? undefined : { scale: 1.01 }}
            whileTap={saveProduct.isPending ? undefined : { scale: 0.99 }}
            transition={springSoft}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3.5 text-[14px] font-semibold text-[#08090a] transition-colors hover:bg-white disabled:opacity-50"
          >
            {editingId ? <Check className="size-4" /> : <Plus className="size-4" />}
            {saveProduct.isPending
              ? "Saving…"
              : editingId
                ? "Save changes"
                : "Add product"}
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
                    className={`flex items-center gap-3 rounded-lg py-3 transition-colors ${
                      editingId === p.id ? "bg-[var(--color-accent)]/8" : ""
                    }`}
                  >
                    <img
                      src={p.images?.[0] ?? "/brand/nexa-wordmark-dark.png"}
                      alt=""
                      className="size-11 shrink-0 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-tile)] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{p.name}</p>
                      <p className="tabular mt-0.5 text-[12px] text-[var(--color-ink-faint)]">
                        {p.brand} · {formatPrice(p.price)}
                        {p.featured && <span className="ml-1.5">· Featured</span>}
                        {p.is_new && <span className="ml-1.5">· New</span>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      aria-label={`Edit ${p.name}`}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-[var(--color-ink-faint)] transition-colors hover:bg-white/[0.06] hover:text-[var(--color-ink)]"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct.mutate(p)}
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
