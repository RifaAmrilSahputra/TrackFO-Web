export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-900">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          {action}
        </div>
      )}

      {children}
    </section>
  );
}