type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverse = false,
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

  return (
    <div className={alignment}>
      <p className={inverse ? "eyebrow !text-[#b8d2c8]" : "eyebrow"}>
        {eyebrow}
      </p>
      <h2
        className={`display-title mt-4 text-4xl leading-[0.98] sm:text-5xl ${
          inverse ? "text-paper" : "text-forest"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-5 text-base leading-7 ${
          inverse ? "text-[#c8d7d2]" : "text-muted"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
