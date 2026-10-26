type Choice = string | { value: string; label: string };

/** Native radio inputs provide keyboard navigation; labels are the touch targets. */
export function IntakeChoices({ name, label, value, options, onChange, required = false, numeric = false, clearable = !required }: {
  name: string; label: string; value: string; options: Choice[]; onChange: (value: string) => void;
  required?: boolean; numeric?: boolean; clearable?: boolean;
}) {
  return <fieldset className="min-w-0">
    <legend id={`${name}-legend`} className="mb-3 text-sm font-medium leading-6">{label}{" "}{required && <span className="ml-1 font-normal text-muted-foreground">(required)</span>}</legend>
    <div role="radiogroup" aria-labelledby={`${name}-legend`} aria-required={required} className={numeric ? "grid grid-cols-4 gap-2 min-[420px]:grid-cols-6 sm:grid-cols-11" : "grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"}>
      {options.map(option=>{
        const choice=typeof option === "string" ? {value:option,label:option} : option;
        return <label key={choice.value} className="min-w-0 cursor-pointer">
          <input type="radio" className="peer sr-only" name={name} value={choice.value} checked={value===choice.value} onChange={()=>onChange(choice.value)}/>
          <span className={`flex min-h-12 items-center justify-center rounded-xl border px-3 py-3 text-center text-sm leading-5 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:cursor-wait peer-disabled:opacity-50 ${numeric ? "font-semibold tabular-nums" : "sm:px-5"} ${value===choice.value ? "border-primary bg-primary font-semibold text-white shadow-sm" : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary/40"}`}>{choice.label}</span>
        </label>;
      })}
    </div>
    {clearable && value && <button type="button" className="mt-1 min-h-11 text-xs text-muted-foreground underline underline-offset-4 hover:text-primary" onClick={()=>onChange("")}>Clear answer</button>}
  </fieldset>;
}


