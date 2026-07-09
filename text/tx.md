<section className="relative mx-auto flex min-h-[470px] w-full max-w-6xl flex-col justify-between px-4 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div
              className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/75 backdrop-blur-xl"
              dir="ltr"
            >
              CRTGO
            </div>

            <LanguageSwitcher
              enabledLanguages={enabledLanguages}
              language={lang}
              setLanguage={changeLanguage}
              theme={theme}
            />
          </div>

          <div className="pb-4 pt-20">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[36px] border border-white/15 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {logo ? (
                  <TemplateImage
                    src={logo}
                    alt={businessName}
                    priority
                    sizes="112px"
                  />
                ) : (
                  <Store size={38} />
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: `${theme.primary}22`,
                    color: theme.primary,
                  }}
                >
                  {t(lang, "digitalMenu")}
                </p>

                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.08em] text-white sm:text-7xl">
                  {businessName}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-black text-white/70">
                  <span>{branchName}</span>

                  {branchAddress && (
                    <>
                      <span className="text-white/25">•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={15} />
                        {branchAddress}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {description && (
              <p className="mt-6 max-w-2xl text-lg font-bold leading-8 text-white/75">
                {description}
              </p>
            )}

            <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <TodayStatusCard today={today} lang={lang} theme={theme} />

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {socialLinks.slice(0, 4).map((link) => (
                    <HeroSocialLink key={link.key} link={link} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>





      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}