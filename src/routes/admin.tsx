import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { ImagePlus, LogOut, Plus, Trash2, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/catalog";
import type { ProductRow } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/admin")({ component: Admin });

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sky/40">
      <header className="bg-navy text-white">
        <div className="container-page flex items-center justify-between py-4">
          <Link to="/" className="rounded-xl bg-white p-1.5">
            <img src="/brand/nexa-logo.png" alt={SITE.name} className="size-8 object-contain" />
          </Link>
          <span className="font-display font-bold text-gold">Admin</span>
        </div>
      </header>
      <div className="container-page py-10">{children}</div>
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
        <p className="text-center text-muted-foreground">Loading…</p>
      </Shell>
    );
  }

  return session ? <Dashboard /> : <SignIn />;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const field =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-electric";

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
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl text-navy">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only {SITE.name} staff accounts can manage the catalogue.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className={field}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-navy py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={google}
          className="mt-3 w-full rounded-xl border border-border py-3 font-semibold text-navy transition hover:border-electric"
        >
          Continue with Google
        </button>
      </div>
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
      toast.success(
        uploaded.length > 1 ? `${uploaded.length} images uploaded` : "Image uploaded",
      );
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

  const field = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-navy">Product catalogue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, photograph and remove the products shown on the storefront.
          </p>
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-electric"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createProduct.mutate();
        }}
        className="mt-8 rounded-3xl border border-border bg-card p-6"
      >
        <h2 className="font-display text-lg text-navy-deep">Add a product</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            required
            placeholder="Product name"
            className={field}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Slug (optional — generated from the name)"
            className={field}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <select
            className={field}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Brand"
            className={field}
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
          <input
            type="number"
            min={0}
            required
            placeholder="Price (USD)"
            className={field}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          <input
            type="number"
            min={0}
            placeholder="Original price (optional)"
            className={field}
            value={form.original_price ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                original_price: e.target.value ? Number(e.target.value) : null,
              })
            }
          />

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Product images
            </label>
            <label
              htmlFor="product-image-upload"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground hover:border-electric hover:text-electric ${
                uploadingImages ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <ImagePlus className="size-4" />
              {uploadingImages ? "Uploading..." : "Click to upload image(s)"}
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
            {currentImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {currentImages.map((url) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt=""
                      className="size-16 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            placeholder="Short description"
            className={`${field} md:col-span-2`}
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          />
          <textarea
            placeholder="Full description"
            rows={3}
            className={`${field} md:col-span-2`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={createProduct.isPending || uploadingImages}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          <Plus className="size-4" />
          {createProduct.isPending ? "Saving…" : "Add product"}
        </button>
      </form>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg text-navy-deep">
          Products {products.length > 0 && `(${products.length})`}
        </h2>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : products.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No products in the database yet — the storefront is showing the seed catalogue.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                <img
                  src={p.images?.[0] ?? "/brand/nexa-logo.png"}
                  alt=""
                  className="size-12 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.brand} · {formatPrice(p.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteProduct.mutate(p.id)}
                  aria-label={`Delete ${p.name}`}
                  className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}
