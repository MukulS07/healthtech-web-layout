export type Dict = Record<string, string>;

/** Values substituted into `{name}` placeholders: `t("list.found", { n: 12 })`. */
export type TVars = Record<string, string | number>;
