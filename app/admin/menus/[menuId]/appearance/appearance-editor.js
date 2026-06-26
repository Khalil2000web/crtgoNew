"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { revalidatePublicMenu } from "@/lib/revalidate-public-menu";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  Check,
  Circle,
  Eye,
  ImageIcon,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Palette,
  RotateCcw,
  Save,
  Trash2,
  Type,
  Upload,
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
      description: "واضح ومناسب لمعظم المطاعم.",
      image: "/template-previews/classic.gif",
    },
    {
      id: "luxury",
      name: "Luxury",
      description: "فاخر أكثر للمطاعم والكافيهات الراقية.",
      image: "/template-previews/luxury.gif",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "بسيط ونظيف وسريع القراءة.",
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

  const currentLogoPreview = logoPreview || form.logo_url;
  const mainCoverPreview = form.cover_url || coverPreviewImages[0] || "";

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

      await revalidatePublicMenu(menu.id);

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
    <main dir="rtl" className="min-h-screen px-4 pb-32 pt-4 sm:px-5 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href={`/admin/menus/${menu.id}`}
                className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-xs font-black text-[#1b1712]/65 transition hover:bg-[#d1c5b4] hover:text-[#1b1712] active:scale-[0.98]"
              >
                <ArrowRight size={15} />
                الرجوع للقائمة
              </Link>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Appearance
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#1b1712] sm:text-3xl">
                المظهر والتصميم
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1b1712]/58">
                عدّل الشعار، الغلاف، الألوان، الخطوط، وطريقة عرض القائمة العامة.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <SaveBadge hasChanges={hasChanges} />
            </div>
          </div>
        </header>

        {(message || error) && (
          <div className="mt-3 grid gap-2">
            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="error">{error}</Alert>}
          </div>
        )}

        <section className="mt-3 grid gap-3 sm:grid-cols-3">
          <MetricBox
            icon={<ImageIcon size={18} />}
            label="صور الغلاف"
            value={`${coverPreviewImages.length}/${MAX_COVER_IMAGES}`}
            hint="الصور المحفوظة والجديدة"
          />

          <MetricBox
            icon={<LayoutGrid size={18} />}
            label="القالب"
            value={form.template_id}
            hint="التصميم العام"
          />

          <MetricBox
            icon={<Type size={18} />}
            label="الخط"
            value={form.font_family}
            hint="خط القائمة العامة"
          />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5">
            <Panel
              eyebrow="Brand media"
              title="الشعار والغلاف"
              description="ارفع الشعار وصور الغلاف. لن يتم حفظ الملفات نهائياً إلا بعد الضغط على حفظ."
            >
              <div className="grid gap-3 md:grid-cols-[240px_minmax(0,1fr)]">
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
            </Panel>

            <Panel
              eyebrow="Cover behavior"
              title="طريقة عرض الغلاف"
              description="اختر هل يظهر الغلاف كصورة واحدة أو حركة بسيطة."
            >
              <SettingGroup title="نوع الغلاف">
                <ChoiceButton
                  title="صورة واحدة"
                  description="أول صورة فقط"
                  active={form.cover_settings.type === "single"}
                  onClick={() => updateCoverSettings("type", "single")}
                />

                <ChoiceButton
                  title="تبديل ناعم"
                  description="Fade بين الصور"
                  active={form.cover_settings.type === "fade"}
                  onClick={() => updateCoverSettings("type", "fade")}
                />

                <ChoiceButton
                  title="سلايدر"
                  description="انتقال جانبي"
                  active={form.cover_settings.type === "carousel"}
                  onClick={() => updateCoverSettings("type", "carousel")}
                />

                <ChoiceButton
                  title="Stack"
                  description="صور متحركة"
                  active={form.cover_settings.type === "stack"}
                  onClick={() => updateCoverSettings("type", "stack")}
                />
              </SettingGroup>

              <SettingGroup title="سرعة الحركة">
                <ChoiceButton
                  title="بطيء جداً"
                  active={form.cover_settings.speed === "verySlow"}
                  onClick={() => updateCoverSettings("speed", "verySlow")}
                />

                <ChoiceButton
                  title="بطيء"
                  active={form.cover_settings.speed === "slow"}
                  onClick={() => updateCoverSettings("speed", "slow")}
                />

                <ChoiceButton
                  title="عادي"
                  active={form.cover_settings.speed === "normal"}
                  onClick={() => updateCoverSettings("speed", "normal")}
                />

                <ChoiceButton
                  title="سريع"
                  active={form.cover_settings.speed === "fast"}
                  onClick={() => updateCoverSettings("speed", "fast")}
                />
              </SettingGroup>
            </Panel>

            <Panel
              eyebrow="Template"
              title="القالب"
              description="اختر الشكل العام للقائمة."
            >
              <div className="grid gap-3 md:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    active={form.template_id === template.id}
                    onChoose={() => updateField("template_id", template.id)}
                  />
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Colors"
              title="الألوان"
              description="استخدم مجموعة جاهزة أو عدّل الألوان يدوياً."
            >
              <div className="grid gap-2 md:grid-cols-4">
                {colorPresets.map((preset) => (
                  <PresetButton
                    key={preset.name}
                    preset={preset}
                    onClick={() => applyPreset(preset)}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
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
            </Panel>

            <Panel
              eyebrow="Typography"
              title="الخط"
              description="اختر الخط المناسب لهوية المطعم."
            >
              <div className="grid gap-2 md:grid-cols-3">
                {fonts.map((font) => (
                  <FontButton
                    key={font.id}
                    font={font}
                    active={form.font_family === font.id}
                    onClick={() => updateField("font_family", font.id)}
                  />
                ))}
              </div>
            </Panel>

            <Panel
              eyebrow="Layout"
              title="طريقة عرض القائمة"
              description="تحكم بطريقة ظهور الأقسام والأصناف."
            >
              <SettingGroup title="طريقة عرض القائمة">
                <ChoiceButton
                  title="كلاسيكي"
                  active={form.layout_style === "classic"}
                  onClick={() => updateField("layout_style", "classic")}
                />

                <ChoiceButton
                  title="بطاقات"
                  active={form.layout_style === "cards"}
                  onClick={() => updateField("layout_style", "cards")}
                />

                <ChoiceButton
                  title="بسيط"
                  active={form.layout_style === "minimal"}
                  onClick={() => updateField("layout_style", "minimal")}
                />
              </SettingGroup>

              <SettingGroup title="شكل الأقسام">
                <ChoiceButton
                  title="عادي"
                  active={form.section_style === "normal"}
                  onClick={() => updateField("section_style", "normal")}
                />

                <ChoiceButton
                  title="أكورديون"
                  active={form.section_style === "accordion"}
                  onClick={() => updateField("section_style", "accordion")}
                />

                <ChoiceButton
                  title="تبويبات"
                  active={form.section_style === "tabs"}
                  onClick={() => updateField("section_style", "tabs")}
                />
              </SettingGroup>

              <SettingGroup title="شكل الأصناف">
                <ChoiceButton
                  title="صورة بالأعلى"
                  active={form.item_style === "image-top"}
                  onClick={() => updateField("item_style", "image-top")}
                />

                <ChoiceButton
                  title="صورة جانبية"
                  active={form.item_style === "image-side"}
                  onClick={() => updateField("item_style", "image-side")}
                />

                <ChoiceButton
                  title="بدون صور"
                  active={form.item_style === "no-image"}
                  onClick={() => updateField("item_style", "no-image")}
                />
              </SettingGroup>
            </Panel>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24 lg:h-fit">
            <PreviewCard
              menu={menu}
              mainCoverPreview={mainCoverPreview}
              currentLogoPreview={currentLogoPreview}
              form={form}
            />

            <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d1c5b4] p-4 shadow-sm shadow-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
                Save status
              </p>

              <h2 className="mt-1 text-lg font-black text-[#1b1712]">
                حالة التعديلات
              </h2>

              <div className="mt-4">
                <SaveBadge hasChanges={hasChanges} large />
              </div>
            </section>
          </aside>
        </section>
      </section>

      <SaveBar
        hasChanges={hasChanges}
        saving={savingKey === "save-appearance"}
        onDiscard={discardChanges}
        onSave={saveAppearance}
      />
    </main>
  );
}

function Panel({ eyebrow, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] shadow-sm shadow-black/5">
      <div className="border-b border-[#8f806c]/45 bg-[#d1c5b4] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
          {eyebrow}
        </p>

        <h2 className="mt-0.5 text-lg font-black text-[#1b1712]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#1b1712]/52">
            {description}
          </p>
        )}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function MetricBox({ icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-3 shadow-sm shadow-black/5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8f806c]/45 bg-[#ded4c5] text-[#1b1712]/70">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black text-[#1b1712]/45">{label}</p>
        <p className="truncate text-xl font-black text-[#1b1712]">{value}</p>
        <p className="truncate text-xs font-bold text-[#1b1712]/42">{hint}</p>
      </div>
    </div>
  );
}

function SaveBadge({ hasChanges, large }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
        hasChanges
          ? "border-yellow-900/25 bg-yellow-700/15 text-yellow-950"
          : "border-green-900/25 bg-green-800/12 text-green-950"
      } ${large ? "w-full justify-center py-3" : ""}`}
    >
      <Circle size={8} fill="currentColor" />
      {hasChanges ? "تغييرات غير محفوظة" : "كل شيء محفوظ"}
    </div>
  );
}

function Alert({ type, children }) {
  const styles =
    type === "success"
      ? "border-green-900/25 bg-green-800/12 text-green-950"
      : "border-red-900/25 bg-red-700/12 text-red-950";

  return (
    <p className={`rounded-xl border p-3 text-sm font-bold leading-6 ${styles}`}>
      {children}
    </p>
  );
}

function LogoBox({ imageUrl, hasPendingFile, onUpload, onRemove }) {
  return (
    <div className="rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-[#1b1712]">الشعار</h3>
          <p className="mt-1 text-xs font-bold text-[#1b1712]/45">
            صورة صغيرة لهوية القائمة.
          </p>
        </div>

        {hasPendingFile && (
          <span className="rounded-full border border-yellow-900/25 bg-yellow-700/15 px-2.5 py-1 text-xs font-black text-yellow-950">
            جديد
          </span>
        )}
      </div>

      <div className="mt-3 aspect-square overflow-hidden rounded-xl border border-[#8f806c]/45 bg-[#d1c5b4]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Logo"
            className="pointer-events-none h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-[#1b1712]/35">
            لا يوجد شعار
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-3 py-2.5 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] active:scale-[0.98]">
          <Upload size={15} />
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
          className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#d1c5b4] px-3 py-2.5 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} />
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
    <div className="rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-black text-[#1b1712]">صور الغلاف</h3>

          <p className="mt-1 text-xs font-bold text-[#1b1712]/45">
            {totalImages} / {maxImages} صور
          </p>
        </div>

        <label
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black transition ${
            reachedLimit
              ? "cursor-not-allowed border border-[#8f806c]/45 bg-[#d1c5b4] text-[#1b1712]/35"
              : "cursor-pointer bg-[#1b1712] text-[#efe7da] hover:bg-[#332a22] active:scale-[0.98]"
          }`}
        >
          <ImagePlus size={15} />
          {reachedLimit ? "وصلت للحد" : "إضافة صور"}

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

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-[#8f806c]/65 bg-[#d1c5b4] text-sm font-bold text-[#1b1712]/35 sm:col-span-2 lg:col-span-3">
            لا توجد صور غلاف بعد.
          </div>
        )}
      </div>
    </div>
  );
}

function CoverImageCard({ image, isMain, pending, onMakeMain, onRemove }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#8f806c]/50 bg-[#d1c5b4]">
      <div className="relative aspect-square">
        <img
          src={image}
          alt="Cover"
          className="pointer-events-none h-full w-full object-cover"
        />

        <div className="absolute right-2 top-2 flex flex-wrap gap-1">
          {isMain && (
            <span className="rounded-full bg-green-800 px-2.5 py-1 text-xs font-black text-[#efe7da]">
              الرئيسية
            </span>
          )}

          {pending && (
            <span className="rounded-full bg-yellow-700 px-2.5 py-1 text-xs font-black text-[#fff7d8]">
              بانتظار الحفظ
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2">
        <button
          type="button"
          onClick={onMakeMain}
          disabled={pending || isMain || !onMakeMain}
          className="cursor-pointer rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-2 py-2 text-xs font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          رئيسية
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer rounded-xl bg-red-700 px-2 py-2 text-xs font-black text-white transition hover:bg-red-800 active:scale-[0.98]"
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
      className={`cursor-pointer overflow-hidden rounded-xl border text-right transition active:scale-[0.99] ${
        active
          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
      }`}
    >
      <div className="aspect-video bg-[#cfc3b2]">
        <img
          src={template.image}
          alt={template.name}
          className="pointer-events-none h-full w-full object-cover"
        />
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-black">{template.name}</h3>

            <p
              className={`mt-1 text-xs leading-5 ${
                active ? "text-[#efe7da]/60" : "text-[#1b1712]/50"
              }`}
            >
              {template.description}
            </p>
          </div>

          {active && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#efe7da] text-[#1b1712]">
              <Check size={15} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function SettingGroup({ title, children }) {
  return (
    <div className="mt-4 first:mt-0">
      <h3 className="mb-2 text-sm font-black text-[#1b1712]/55">{title}</h3>
      <div className="grid gap-2 md:grid-cols-4">{children}</div>
    </div>
  );
}

function ChoiceButton({ title, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3 text-right transition active:scale-[0.99] ${
        active
          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
      }`}
    >
      <p className="text-sm font-black">{title}</p>

      {description && (
        <p
          className={`mt-1 text-xs leading-5 ${
            active ? "text-[#efe7da]/60" : "text-[#1b1712]/50"
          }`}
        >
          {description}
        </p>
      )}
    </button>
  );
}

function PresetButton({ preset, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-[#8f806c]/50 bg-[#ded4c5] p-3 text-right transition hover:border-[#796a58]/75 hover:bg-[#d1c5b4] active:scale-[0.99]"
    >
      <div className="flex gap-1">
        <span
          className="h-7 w-7 rounded-full border border-[#8f806c]/55"
          style={{ background: preset.primary }}
        />

        <span
          className="h-7 w-7 rounded-full border border-[#8f806c]/55"
          style={{ background: preset.background }}
        />

        <span
          className="h-7 w-7 rounded-full border border-[#8f806c]/55"
          style={{ background: preset.text }}
        />
      </div>

      <p className="mt-3 text-sm font-black text-[#1b1712]">
        {preset.name}
      </p>
    </button>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="block">
      <p className="mb-2 text-sm font-black text-[#1b1712]/55">{label}</p>

      <div className="flex overflow-hidden rounded-xl border border-[#8f806c]/50 bg-[#ded4c5]">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-14 cursor-pointer bg-transparent"
        />

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          className="min-w-0 flex-1 bg-transparent px-3 text-left text-sm font-bold text-[#1b1712] outline-none"
        />
      </div>
    </label>
  );
}

function FontButton({ font, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3 text-right transition active:scale-[0.99] ${
        active
          ? "border-[#1b1712] bg-[#1b1712] text-[#efe7da]"
          : "border-[#8f806c]/50 bg-[#ded4c5] text-[#1b1712] hover:border-[#796a58]/75 hover:bg-[#d1c5b4]"
      }`}
    >
      <p
        className={`text-xs font-black ${
          active ? "text-[#efe7da]/55" : "text-[#1b1712]/45"
        }`}
      >
        {font.name}
      </p>

      <p className="mt-2 text-lg font-black">{font.sample}</p>
    </button>
  );
}

function PreviewCard({ menu, mainCoverPreview, currentLogoPreview, form }) {
  return (
    <section className="rounded-2xl border border-[#8f806c]/55 bg-[#d8cebe] p-4 shadow-sm shadow-black/5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1b1712]/45">
        Preview
      </p>

      <h2 className="mt-1 text-lg font-black text-[#1b1712]">
        معاينة سريعة
      </h2>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#8f806c]/55 bg-[#ded4c5]">
        <div className="relative h-48 bg-[#cfc3b2]">
          {mainCoverPreview ? (
            <img
              src={mainCoverPreview}
              alt="Cover preview"
              className="pointer-events-none h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#1b1712]/30">
              <ImageIcon size={38} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

          <div className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#efe7da]/60 bg-[#ded4c5]">
            {currentLogoPreview ? (
              <img
                src={currentLogoPreview}
                alt="Logo preview"
                className="pointer-events-none h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={22} className="text-[#1b1712]/35" />
            )}
          </div>
        </div>

        <div
          className="p-4"
          style={{
            background: form.background_color,
            color: form.text_color,
          }}
        >
          <h3 className="text-xl font-black">
            {menu.name || "اسم القائمة"}
          </h3>

          <p className="mt-2 text-sm opacity-70">
            معاينة بسيطة لشكل القائمة بعد التعديل.
          </p>

          <button
            type="button"
            className="mt-4 rounded-xl px-4 py-2.5 text-sm font-black"
            style={{
              background: form.primary_color,
              color: "#ffffff",
            }}
          >
            تصفح القائمة
          </button>
        </div>
      </div>
    </section>
  );
}

function SaveBar({ hasChanges, saving, onDiscard, onSave }) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[80]">
      <div className="mx-auto max-w-7xl rounded-2xl border border-[#8f806c]/60 bg-[#d8cebe]/95 p-3 shadow-2xl shadow-black/25 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={`text-sm font-black ${
                hasChanges ? "text-yellow-950" : "text-green-950"
              }`}
            >
              {hasChanges ? "لديك تغييرات غير محفوظة" : "كل شيء محفوظ"}
            </p>

            <p className="mt-1 text-xs font-bold text-[#1b1712]/45">
              احفظ التغييرات لتطبيق الصور، القالب، الألوان، وطريقة العرض.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={onDiscard}
              disabled={!hasChanges || saving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#8f806c]/55 bg-[#ded4c5] px-3 py-2 text-sm font-black text-[#1b1712]/70 transition hover:bg-[#cfc3b2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={17} />
              تراجع
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={!hasChanges || saving}
              className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1b1712] px-3 py-2 text-sm font-black text-[#efe7da] transition hover:bg-[#332a22] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}

              {saving ? "جارٍ الحفظ..." : "حفظ المظهر"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}