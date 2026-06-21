"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  ImagePlus,
  Trash2,
  Check,
  Palette,
  Type,
  LayoutGrid,
  Upload,
  Save,
  Loader2,
  RotateCcw,
  ImageIcon,
  Eye,
  Circle,
} from "lucide-react";

const MAX_COVER_IMAGES = 6;

function normalizeCoverImages(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeCoverSettings(value) {
  return {
    type: value?.type || "single",
    speed: value?.speed || "normal",
  };
}

function getInitialForm(menu) {
  return {
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
    cover_images: normalizeCoverImages(menu.cover_images),
    cover_settings: normalizeCoverSettings(menu.cover_settings),
  };
}

export default function AppearanceEditor({ menu }) {
  const router = useRouter();
  const supabase = createClient();

  const [initialForm, setInitialForm] = useState(() => getInitialForm(menu));
  const [form, setForm] = useState(() => getInitialForm(menu));

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [coverUploads, setCoverUploads] = useState([]);

  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const coverPreviewImages = useMemo(() => {
    return [
      ...form.cover_images,
      ...coverUploads.map((upload) => upload.preview),
    ].filter(Boolean);
  }, [form.cover_images, coverUploads]);

  const mainCoverPreview =
    logoPreview || form.logo_url
      ? coverPreviewImages[0] || form.cover_url
      : coverPreviewImages[0] || form.cover_url;

  const currentLogoPreview = logoPreview || form.logo_url;

  const hasChanges = useMemo(() => {
    if (JSON.stringify(form) !== JSON.stringify(initialForm)) return true;
    if (logoFile) return true;
    if (coverUploads.length > 0) return true;

    return false;
  }, [form, initialForm, logoFile, coverUploads]);

  function clearAlerts() {
    setMessage("");
    setError("");
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    clearAlerts();
  }

  function updateCoverSettings(key, value) {
    setForm((current) => ({
      ...current,
      cover_settings: {
        ...current.cover_settings,
        [key]: value,
      },
    }));

    clearAlerts();
  }

  function applyPreset(preset) {
    setForm((current) => ({
      ...current,
      primary_color: preset.primary,
      background_color: preset.background,
      text_color: preset.text,
    }));

    clearAlerts();
  }

  function selectLogo(file) {
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    updateField("logo_url", "");
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoPreview("");
    updateField("logo_url", "");
  }

function addCoverImages(files) {
  const fileList = Array.from(files || []);
  if (!fileList.length) return;

  const currentCount = form.cover_images.length + coverUploads.length;
  const remainingSlots = MAX_COVER_IMAGES - currentCount;

  if (remainingSlots <= 0) {
    setError(`يمكنك رفع ${MAX_COVER_IMAGES} صور غلاف كحد أقصى.`);
    return;
  }

  const allowedFiles = fileList.slice(0, remainingSlots);

  if (fileList.length > remainingSlots) {
    setError(`تم اختيار صور كثيرة. يمكنك إضافة ${remainingSlots} صور فقط الآن.`);
  } else {
    clearAlerts();
  }

  const uploads = allowedFiles.map((file) => ({
    id: `cover-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    file,
    preview: URL.createObjectURL(file),
  }));

  setCoverUploads((current) => [...current, ...uploads]);
}

  function removeExistingCoverImage(index) {
    const nextImages = form.cover_images.filter((_, i) => i !== index);

    setForm((current) => ({
      ...current,
      cover_images: nextImages,
      cover_url: nextImages.includes(current.cover_url)
        ? current.cover_url
        : nextImages[0] || "",
    }));

    clearAlerts();
  }

  function removePendingCoverImage(uploadId) {
    setCoverUploads((current) =>
      current.filter((upload) => upload.id !== uploadId)
    );

    clearAlerts();
  }

  function setMainCover(imageUrl) {
    updateField("cover_url", imageUrl);
  }

  function discardChanges() {
    if (!hasChanges) return;

    const sure = confirm("هل تريد التراجع عن التغييرات غير المحفوظة؟");
    if (!sure) return;

    setForm(initialForm);
    setLogoFile(null);
    setLogoPreview("");
    setCoverUploads([]);
    setMessage("تم التراجع عن التغييرات.");
    setError("");
  }

  async function uploadFile(prefix, file) {
    const fileExt = file.name.split(".").pop();
    const filePath = `menus/${menu.id}/${prefix}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("menu-images").getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveAppearance() {
    setSavingKey("save-appearance");
    clearAlerts();

    try {
      let finalLogoUrl = form.logo_url || null;

      if (form.cover_images.length + coverUploads.length > MAX_COVER_IMAGES) {
  throw new Error(`يمكنك حفظ ${MAX_COVER_IMAGES} صور غلاف كحد أقصى.`);
}

      if (logoFile) {
        finalLogoUrl = await uploadFile("logo", logoFile);
      }

      const uploadedCoverUrls = [];

      for (const upload of coverUploads) {
        const publicUrl = await uploadFile("cover", upload.file);
        uploadedCoverUrls.push(publicUrl);
      }

      const finalCoverImages = [
        ...form.cover_images,
        ...uploadedCoverUrls,
      ].filter(Boolean);

      const finalCoverUrl =
        form.cover_url && finalCoverImages.includes(form.cover_url)
          ? form.cover_url
          : finalCoverImages[0] || null;

      const nextForm = {
        template_id: form.template_id,
        primary_color: form.primary_color,
        background_color: form.background_color,
        text_color: form.text_color,
        layout_style: form.layout_style,
        section_style: form.section_style,
        item_style: form.item_style,
        font_family: form.font_family,
        logo_url: finalLogoUrl,
        cover_url: finalCoverUrl,
        cover_images: finalCoverImages,
        cover_settings: form.cover_settings,
      };

      const { error } = await supabase
        .from("menus")
        .update(nextForm)
        .eq("id", menu.id)
        .eq("owner_id", menu.owner_id);

      if (error) throw error;

      setForm(nextForm);
      setInitialForm(nextForm);
      setLogoFile(null);
      setLogoPreview("");
      setCoverUploads([]);

      setMessage("تم حفظ المظهر.");
      router.refresh();
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء حفظ المظهر.");
    }

    setSavingKey("");
  }

  return (
    <main dir="rtl" className="min-h-screen px-5 py-8 pb-36 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href={`/admin/menus/${menu.id}`}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowRight size={18} />
          الرجوع للقائمة
        </Link>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/45">المظهر</p>

                <h1 className="mt-2 text-5xl font-black text-white">
                  تصميم القائمة
                </h1>

                <p className="mt-3 max-w-2xl text-white/45">
                  عدّل الصور، القالب، الألوان، الخطوط، وطريقة عرض القائمة العامة.
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                  hasChanges
                    ? "bg-yellow-500/15 text-yellow-300"
                    : "bg-green-500/15 text-green-300"
                }`}
              >
                <Circle size={9} fill="currentColor" />
                {hasChanges ? "تغييرات غير محفوظة" : "كل شيء محفوظ"}
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            <StatusCard
              icon={<ImageIcon size={20} />}
              label="صور الغلاف"
              value={coverPreviewImages.length}
            />

            <StatusCard
              icon={<LayoutGrid size={20} />}
              label="القالب"
              value={form.template_id}
            />

            <StatusCard
              icon={<Type size={20} />}
              label="الخط"
              value={form.font_family}
            />
          </section>
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <SettingsCard
              icon={<ImagePlus size={20} />}
              title="الصور"
              description="ارفع الشعار وصور الغلاف. الصور لن تُحفظ نهائياً إلا بعد الضغط على حفظ المظهر."
            >
              <div className="grid gap-4 md:grid-cols-[280px_1fr]">
                <LogoBox
                  imageUrl={currentLogoPreview}
                  hasPendingFile={Boolean(logoFile)}
                  onUpload={selectLogo}
                  onRemove={removeLogo}
                />

<CoverGallery
  existingImages={form.cover_images}
  pendingImages={coverUploads}
  mainCover={form.cover_url}
  maxImages={MAX_COVER_IMAGES}
  onUpload={addCoverImages}
  onRemoveExisting={removeExistingCoverImage}
  onRemovePending={removePendingCoverImage}
  onSetMainCover={setMainCover}
/>
              </div>
            </SettingsCard>

            <SettingsCard
              icon={<LayoutGrid size={20} />}
              title="حركة الغلاف"
              description="اختر كيف تظهر صور الغلاف في الصفحة العامة."
            >
              <div className="grid gap-3 md:grid-cols-4">
                <ChoiceCard
                  title="صورة واحدة"
                  description="أول صورة فقط"
                  active={form.cover_settings.type === "single"}
                  onClick={() => updateCoverSettings("type", "single")}
                />

                <ChoiceCard
                  title="تبديل ناعم"
                  description="Fade بين الصور"
                  active={form.cover_settings.type === "fade"}
                  onClick={() => updateCoverSettings("type", "fade")}
                />

                <ChoiceCard
                  title="سلايدر"
                  description="انتقال جانبي"
                  active={form.cover_settings.type === "carousel"}
                  onClick={() => updateCoverSettings("type", "carousel")}
                />

                <ChoiceCard
                  title="صور متحركة"
                  description="Stack متحرك"
                  active={form.cover_settings.type === "stack"}
                  onClick={() => updateCoverSettings("type", "stack")}
                />
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-bold text-white/45">
                  سرعة الحركة
                </p>

                <div className="grid gap-3 md:grid-cols-4">
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
              </div>
            </SettingsCard>

            <SettingsCard
              icon={<Eye size={20} />}
              title="القالب"
              description="اختر تصميم القائمة العامة."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    active={form.template_id === template.id}
                    onChoose={() => updateField("template_id", template.id)}
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
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-right transition hover:bg-white/[0.07]"
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

                    <p className="mt-3 text-sm font-bold text-white">
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
                        : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    <p className="text-sm font-bold opacity-60">
                      {font.name}
                    </p>

                    <p className="mt-3 text-xl font-bold">{font.sample}</p>
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
          </section>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-4 shadow-xl shadow-black/10">
              <p className="text-sm font-bold text-white/45">معاينة سريعة</p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                <div className="relative h-56 bg-black/30">
                  {mainCoverPreview ? (
                    <img
                      src={mainCoverPreview}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/25">
                      <ImageIcon size={44} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  <div className="absolute bottom-4 right-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#0f0f0f]">
                      {currentLogoPreview ? (
                        <img
                          src={currentLogoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-white/30" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="p-5"
                  style={{
                    background: form.background_color,
                    color: form.text_color,
                  }}
                >
                  <h3 className="text-2xl font-black">{menu.name}</h3>

                  <p className="mt-2 text-sm opacity-70">
                    معاينة بسيطة لشكل القائمة بعد التعديل.
                  </p>

                  <button
                    type="button"
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

      <div className="fixed bottom-24 left-4 right-4 z-[80] md:left-[22rem]">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#0f0f0f]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className={`text-sm font-bold ${
                  hasChanges ? "text-yellow-300" : "text-green-300"
                }`}
              >
                {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
              </p>

              <p className="mt-1 text-xs text-white/40">
                احفظ التغييرات لتطبيق الصور، القالب، الألوان، وطريقة العرض.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 md:flex">
              <button
                type="button"
                onClick={discardChanges}
                disabled={!hasChanges || savingKey === "save-appearance"}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-extrabold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={18} />
                تراجع
              </button>

              <button
                type="button"
                onClick={saveAppearance}
                disabled={!hasChanges || savingKey === "save-appearance"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingKey === "save-appearance" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}

                {savingKey === "save-appearance"
                  ? "جارٍ الحفظ..."
                  : "حفظ المظهر"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SettingsCard({ icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 shadow-xl shadow-black/10 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-white/45">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function LogoBox({ imageUrl, hasPendingFile, onUpload, onRemove }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div>
        <h3 className="text-xl font-black text-white">الشعار</h3>

        <p className="mt-1 text-xs text-white/40">
          صورة صغيرة تظهر كهوية للقائمة.
        </p>
      </div>

      <div className="mt-4 aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/25">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Logo"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/35">
            لا يوجد شعار
          </div>
        )}
      </div>

      {hasPendingFile && (
        <p className="mt-3 rounded-xl bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-300">
          شعار جديد بانتظار الحفظ
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-black transition hover:bg-white/90">
          <Upload size={16} />
          {imageUrl ? "تغيير" : "رفع"}

          <input
            type="file"
            accept="image/*"
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
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 size={16} />
          حذف
        </button>
      </div>
    </div>
  );
}

function CoverGallery({
  existingImages,
  pendingImages,
  mainCover,
  maxImages,
  onUpload,
  onRemoveExisting,
  onRemovePending,
  onSetMainCover,
}) {

const totalImages = existingImages.length + pendingImages.length;
const reachedLimit = totalImages >= maxImages;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">صور الغلاف</h3>

<p className="mt-1 text-xs text-white/40">
  يمكنك رفع حتى {maxImages} صور غلاف. لديك الآن {totalImages} / {maxImages}.
</p>
        </div>

<label
  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
    reachedLimit
      ? "cursor-not-allowed bg-white/10 text-white/30"
      : "cursor-pointer bg-white text-black hover:bg-white/90"
  }`}
>
  <ImagePlus size={16} />
  {reachedLimit ? "وصلت للحد الأقصى" : "إضافة صور"}

  <input
    type="file"
    accept="image/*"
    multiple
    disabled={reachedLimit}
    className="hidden"
    onChange={(e) => {
      onUpload(e.target.files);
      e.target.value = "";
    }}
  />
</label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {existingImages.map((image, index) => (
          <CoverImageCard
            key={`${image}-${index}`}
            image={image}
            isMain={mainCover === image}
            pending={false}
            onMakeMain={() => onSetMainCover(image)}
            onRemove={() => onRemoveExisting(index)}
          />
        ))}

        {pendingImages.map((upload) => (
          <CoverImageCard
            key={upload.id}
            image={upload.preview}
            isMain={false}
            pending
            onMakeMain={null}
            onRemove={() => onRemovePending(upload.id)}
          />
        ))}

        {!existingImages.length && !pendingImages.length && (
          <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 text-sm text-white/35 sm:col-span-2 lg:col-span-3">
            لا توجد صور غلاف بعد.
          </div>
        )}
      </div>
    </div>
  );
}

function CoverImageCard({ image, isMain, pending, onMakeMain, onRemove }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
      <div className="relative aspect-square">
        <img src={image} alt="Cover" className="h-full w-full object-cover" />

        <div className="absolute right-2 top-2 flex flex-wrap gap-2">
          {isMain && (
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
              الرئيسية
            </span>
          )}

          {pending && (
            <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
              بانتظار الحفظ
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2">
        <button
          type="button"
          onClick={onMakeMain}
          disabled={pending || isMain}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
        >
          جعلها الرئيسية
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl bg-red-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-red-700"
        >
          حذف
        </button>
      </div>
    </div>
  );
}

function TemplateCard({ template, active, onChoose }) {
  return (
    <button
      type="button"
      onClick={onChoose}
      className={`overflow-hidden rounded-2xl border text-right transition ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
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
            <h3 className="text-xl font-black">{template.name}</h3>

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

        <p
          className={`mt-4 rounded-xl px-4 py-3 text-center text-sm font-black ${
            active ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          {active ? "مختار" : "اختيار القالب"}
        </p>
      </div>
    </button>
  );
}

function SettingBlock({ title, children }) {
  return (
    <div className="mt-5 first:mt-0">
      <h3 className="mb-3 text-sm font-bold text-white/45">{title}</h3>
      <div className="grid gap-3 md:grid-cols-3">{children}</div>
    </div>
  );
}

function ChoiceCard({ title, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-right text-sm font-bold transition ${
        active
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
      }`}
    >
      <p>{title}</p>

      {description && (
        <p className="mt-1 text-xs font-normal opacity-60">
          {description}
        </p>
      )}
    </button>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-bold text-white/45">{label}</p>

      <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
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

function StatusCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-3 text-white/45">
        <span>{label}</span>
        {icon}
      </div>

      <p className="mt-3 break-all text-2xl font-black text-white">
        {value}
      </p>
    </div>
  );
}