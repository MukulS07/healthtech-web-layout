import { Fragment, type ReactNode } from "react";

/**
 * Word order differs by language, so a sentence with a highlighted word or an inline link can't be
 * built from fixed pieces in JSX ("Book a" + <em>consultation</em> is wrong in Hindi, where the
 * highlighted word comes first). These helpers let each translation place the markup itself:
 *
 *   <Emph text={t("consult.title")} />                 "Book a *consultation*"
 *   <WithLink text={t("form.consent")} link={<A/>} />  "…described in the {link}."
 */

/** Wraps every `*marked*` segment in a span. */
export function Emph({ text, className = "text-primary" }: { text: string; className?: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={className}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Puts `link` where `{link}` appears in the text. */
export function WithLink({ text, link }: { text: string; link: ReactNode }) {
  const [before = "", ...rest] = text.split("{link}");
  if (rest.length === 0) return <>{text}</>;
  return (
    <>
      {before}
      {link}
      {rest.join("{link}")}
    </>
  );
}
