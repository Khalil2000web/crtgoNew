"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ImagePlus,
  Trash2,
  Eye,
  Check,
  Palette,
  Type,
  LayoutGrid,
  Upload,
} from "lucide-react";
import MenuCover from "@/components/MenuCover";

export default function AppearanceEditor({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    template_id: menu.template_id || "classic",
    primary_color: menu.primary_color || "#000000",
    background_color: menu.background_color || "#ffffff",
    text_color: menu.text_color || "#000000",
    layout_style: menu.layout_style || "classic",
    section_style: menu.section_style || "normal",
    item_style: menu.item_style || "image-top",
    font_family: menu.font_family || "tajawal",
    logo_url: menu.logo_url || "",
    cover_url: menu.cover_url || "",
    cover_images: menu.cover_images || [],
    cover_settings: menu.cover_settings || {
      type: "single",
      speed: "normal",
    },
  });

  const previewMenu = {
    ...menu,
    ...form,
  };

  const templates = [
    {
      id: "classic",
      name: "Classic",
      description: "تصميم واضح ومناسب لمعظم المطاعم.",
      image: "/template-previews/classic.gif",
    },
    {
      id: "luxury",
      name: "Luxury",
      description: "تصميم فاخر للمطاعم والكافيهات الراقية.",
      image: "/template-previews/luxury.gif",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "تصميم بسيط ونظيف وسريع القراءة.",
      image: "/template-previews/minimal.gif",
    },
  ];

  const colorPresets = [
    {
      name: "Classic Black",
      primary: "#000000",
      background: "#ffffff",
      text: "#000000",
    },
    {
      name: "Coffee",
      primary: "#7c4a24",
      background: "#f5eee7",
      text: "#1f130c",
    },
    {
      name: "Olive",
      primary: "#4f6f52",
      background: "#f4f7f1",
      text: "#172015",
    },
    {
      name: "Orange",
      primary: "#c76124",
      background: "#fff6ed",
      text: "#22140a",
    },
  ];

  const fonts = [
    {
      id: "tajawal",
      name: "Tajawal",
      sample: "مرحبا بكم في مطعمنا",
    },
    {
      id: "ibm",
      name: "IBM Plex Arabic",
      sample: "مرحبا بكم في مطعمنا",
    },
    {
      id: "baloo",
      name: "Baloo Bhaijaan",
      sample: "مرحبا بكم في مطعمنا",
    },
  ];

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateCoverSettings(key, value) {
    setForm((current) => ({
      ...current,
      cover_settings: {
        ...current.cover_settings,
        [key]: value,
      },
    }));
  }

  function applyPreset(preset) {
    setForm((current) => ({
      ...current,
      primary_color: preset.primary,
      background_color: preset.background,
      text_color: preset.text,
    }));
  }

  async function saveAppearance() {
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("menus")
      .update(form)
      .eq("id", menu.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  async function uploadImage(field, file) {
    if (!file) return;

    setUploading(field);
    setError("");

    const fileExt = file.name.split(".").pop();
    const filePath = `menus/${menu.id}/${field}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (uploadError) {
      setUploading("");
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    if (field === "cover_images") {
      const nextImages = [...form.cover_images, data.publicUrl];

      updateField("cover_images", nextImages);
      updateField("cover_url", form.cover_url || data.publicUrl);
    } else {
      updateField(field, data.publicUrl);
    }

    setUploading("");
  }

  function removeCoverImage(index) {
    const nextImages = form.cover_images.filter((_, i) => i !== index);

    updateField("cover_images", nextImages);
    updateField("cover_url", nextImages[0] || "");
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/50">المظهر</p>

            <h1 className="mt-2 text-5xl font-bold">
              تصميم القائمة
            </h1>

            <p className="mt-3 max-w-2xl text-white/50">
              عدّل الصور، القالب، الألوان، الخطوط، وطريقة عرض القائمة.
            </p>
          </div>

          <button
            onClick={saveAppearance}
            disabled={saving}
            className="rounded-xl bg-white px-6 py-4 font-bold text-black disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ المظهر"}
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <SettingsCard
              icon={<ImagePlus size={20} />}
              title="الصور"
              description="ارفع شعار القائمة وصور الغلاف التي تظهر في أعلى الصفحة العامة."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <SquareImageBox
                  title="الشعار"
                  description="صورة صغيرة تظهر كهوية للقائمة."
                  imageUrl={form.logo_url}
                  loading={uploading === "logo_url"}
                  onUpload={(file) => uploadImage("logo_url", file)}
                  onRemove={() => updateField("logo_url", "")}
                />

                <CoverGallery
                  images={form.cover_images}
                  uploading={uploading === "cover_images"}
                  onUpload={(file) => uploadImage("cover_images", file)}
                  onRemove={removeCoverImage}
                />
              </div>
            </SettingsCard>

            <SettingsCard
              icon={<LayoutGrid size={20} />}
              title="طريقة عرض الغلاف"
              description="اختر كيف تتحرك صور الغلاف في الصفحة العامة."
            >
              <div className="grid gap-3 md:grid-cols-4">
                <ChoiceCard
                  title="صورة واحدة"
                  active={form.cover_settings.type === "single"}
                  onClick={() => updateCoverSettings("type", "single")}
                />

                <ChoiceCard
                  title="تبديل ناعم"
                  active={form.cover_settings.type === "fade"}
                  onClick={() => updateCoverSettings("type", "fade")}
                />

                <ChoiceCard
                  title="سلايدر"
                  active={form.cover_settings.type === "carousel"}
                  onClick={() => updateCoverSettings("type", "carousel")}
                />

                <ChoiceCard
                  title="صور متحركة"
                  active={form.cover_settings.type === "stack"}
                  onClick={() => updateCoverSettings("type", "stack")}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <ChoiceCard
                  title="بطيء جداً"
                  active={form.cover_settings.speed === "verySlow"}
                  onClick={() => updateCoverSettings("speed", "verySlow")}
                />

                <ChoiceCard
                  title="بطيء"
                  active={form.cover_settings.speed === "slow"}
                  onClick={() => updateCoverSettings("speed", "slow")}
                />

                <ChoiceCard
                  title="عادي"
                  active={form.cover_settings.speed === "normal"}
                  onClick={() => updateCoverSettings("speed", "normal")}
                />

                <ChoiceCard
                  title="سريع"
                  active={form.cover_settings.speed === "fast"}
                  onClick={() => updateCoverSettings("speed", "fast")}
                />
              </div>
            </SettingsCard>

            <SettingsCard
              icon={<Eye size={20} />}
              title="القالب"
              description="اختر شكل القائمة العام. لاحقاً يمكن إضافة GIF لكل قالب."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    active={form.template_id === template.id}
                    onChoose={() => updateField("template_id", template.id)}
                    menuId={menu.id}
                  />
                ))}
              </div>
            </SettingsCard>

            <SettingsCard
              icon={<Palette size={20} />}
              title="الألوان"
              description="اختر ألوان القائمة أو استخدم مجموعة جاهزة."
            >
              <div className="grid gap-3 md:grid-cols-4">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-right transition hover:bg-white/10"
                  >
                    <div className="flex gap-1">
                      <span
                        className="h-7 w-7 rounded-full border border-white/20"
                        style={{ background: preset.primary }}
                      />
                      <span
                        className="h-7 w-7 rounded-full border border-white/20"
                        style={{ background: preset.background }}
                      />
                      <span
                        className="h-7 w-7 rounded-full border border-white/20"
                        style={{ background: preset.text }}
                      />
                    </div>

                    <p className="mt-3 text-sm font-bold">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <ColorField
                  label="اللون الأساسي"
                  value={form.primary_color}
                  onChange={(value) => updateField("primary_color", value)}
                />

                <ColorField
                  label="لون الخلفية"
                  value={form.background_color}
                  onChange={(value) => updateField("background_color", value)}
                />

                <ColorField
                  label="لون النص"
                  value={form.text_color}
                  onChange={(value) => updateField("text_color", value)}
                />
              </div>
            </SettingsCard>

            <SettingsCard
              icon={<Type size={20} />}
              title="الخط"
              description="اختر الخط الذي يناسب هوية المطعم أو الكافيه."
            >
              <div className="grid gap-3 md:grid-cols-3">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateField("font_family", font.id)}
                    className={`rounded-xl border p-5 text-right transition ${
                      form.font_family === font.id
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <p className="text-sm font-bold opacity-60">
                      {font.name}
                    </p>

                    <p className="mt-3 text-xl font-bold">
                      {font.sample}
                    </p>
                  </button>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard
              icon={<LayoutGrid size={20} />}
              title="طريقة عرض القائمة"
              description="تحكم بطريقة ظهور الأقسام والأصناف داخل القائمة."
            >
              <SettingBlock title="طريقة عرض القائمة">
                <ChoiceCard
                  title="كلاسيكي"
                  active={form.layout_style === "classic"}
                  onClick={() => updateField("layout_style", "classic")}
                />

                <ChoiceCard
                  title="بطاقات"
                  active={form.layout_style === "cards"}
                  onClick={() => updateField("layout_style", "cards")}
                />

                <ChoiceCard
                  title="بسيط"
                  active={form.layout_style === "minimal"}
                  onClick={() => updateField("layout_style", "minimal")}
                />
              </SettingBlock>

              <SettingBlock title="شكل الأقسام">
                <ChoiceCard
                  title="عادي"
                  active={form.section_style === "normal"}
                  onClick={() => updateField("section_style", "normal")}
                />

                <ChoiceCard
                  title="أكورديون"
                  active={form.section_style === "accordion"}
                  onClick={() => updateField("section_style", "accordion")}
                />

                <ChoiceCard
                  title="تبويبات"
                  active={form.section_style === "tabs"}
                  onClick={() => updateField("section_style", "tabs")}
                />
              </SettingBlock>

              <SettingBlock title="شكل الأصناف">
                <ChoiceCard
                  title="صورة بالأعلى"
                  active={form.item_style === "image-top"}
                  onClick={() => updateField("item_style", "image-top")}
                />

                <ChoiceCard
                  title="صورة جانبية"
                  active={form.item_style === "image-side"}
                  onClick={() => updateField("item_style", "image-side")}
                />

                <ChoiceCard
                  title="بدون صور"
                  active={form.item_style === "no-image"}
                  onClick={() => updateField("item_style", "no-image")}
                />
              </SettingBlock>
            </SettingsCard>
          </div>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-xl bg-black p-4">
              <p className="text-sm font-bold text-white/50">
                معاينة مباشرة
              </p>

              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="h-56 overflow-hidden">
                  <MenuCover menu={previewMenu} />
                </div>

                <div
                  className="p-4"
                  style={{
                    background: form.background_color,
                    color: form.text_color,
                  }}
                >
                  <h3 className="text-2xl font-bold">
                    {menu.name}
                  </h3>

                  <p className="mt-2 text-sm opacity-70">
                    معاينة بسيطة لشكل القائمة بعد التعديل.
                  </p>

                  <button
                    className="mt-4 rounded-xl px-4 py-3 text-sm font-bold"
                    style={{
                      background: form.primary_color,
                      color: "#ffffff",
                    }}
                  >
                    تصفح القائمة
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SettingsCard({ icon, title, description, children }) {
  return (
    <section className="rounded-xl bg-black p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-bold">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-white/50">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function SquareImageBox({ title, description, imageUrl, loading, onUpload, onRemove }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-xs text-white/40">{description}</p>
        </div>
      </div>

      <div className="mt-4 aspect-square overflow-hidden rounded-xl bg-white/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            لا توجد صورة
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-black">
          <Upload size={16} />
          {loading ? "جارٍ..." : imageUrl ? "تغيير" : "رفع"}

          <input
            type="file"
            accept="image/*"
            disabled={loading}
            className="hidden"
            onChange={(e) => {
              onUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>

        <button
          type="button"
          onClick={onRemove}
          disabled={!imageUrl}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm font-bold text-white disabled:opacity-30"
        >
          <Trash2 size={16} />
          حذف
        </button>
      </div>
    </div>
  );
}

function CoverGallery({ images, uploading, onUpload, onRemove }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div>
        <h3 className="font-bold">صور الغلاف</h3>
        <p className="mt-1 text-xs text-white/40">
          يمكنك رفع أكثر من صورة للغلاف.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-white/5"
          >
            <img
              src={image}
              alt={`Cover ${index + 1}`}
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-center transition hover:bg-white/10">
          <ImagePlus size={24} />

          <span className="mt-2 text-sm font-bold">
            {uploading ? "جارٍ الرفع..." : "إضافة"}
          </span>

          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              onUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

function TemplateCard({ template, active, onChoose, menuId }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/5 text-white"
      }`}
    >
      <div className="aspect-square bg-white/10">
        <img
          src={template.image}
          alt={template.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">{template.name}</h3>
            <p className="mt-1 text-xs opacity-60">
              {template.description}
            </p>
          </div>

          {active && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
              <Check size={16} />
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={onChoose}
            className={`rounded-xl px-4 py-3 font-bold ${
              active ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {active ? "مختار" : "اختيار القالب"}
          </button>

          <Link
            href={`/admin/menus/${menuId}/appearance/preview/${template.id}`}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center font-bold ${
              active
                ? "border-black/20 text-black"
                : "border-white/10 text-white"
            }`}
          >
            <Eye size={16} />
            معاينة
          </Link>
        </div>
      </div>
    </div>
  );
}

function SettingBlock({ title, children }) {
  return (
    <div className="mt-5 first:mt-0">
      <h3 className="mb-3 text-sm font-bold text-white/50">{title}</h3>
      <div className="grid gap-3 md:grid-cols-3">{children}</div>
    </div>
  );
}

function ChoiceCard({ title, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-right text-sm font-bold transition ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
      }`}
    >
      {title}
    </button>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-white/50">{label}</p>

      <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-16 cursor-pointer bg-transparent"
        />

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          className="min-w-0 flex-1 bg-transparent px-4 text-left text-white outline-none"
        />
      </div>
    </label>
  );
}